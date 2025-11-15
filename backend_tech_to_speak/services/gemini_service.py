import json
import re
import os
from dotenv import load_dotenv
import google.generativeai as genai
import mimetypes
import tempfile

# ==========================
# CONFIGURACIÓN GEMINI
# ==========================
load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    raise RuntimeError("❌ Falta GEMINI_API_KEY en el archivo .env")

genai.configure(api_key=API_KEY)
MODEL_NAME = "gemini-2.5-flash-lite"


# ==========================
# 1) AUDIO → TEXTO
# ==========================
def transcribir_audio(audio_bytes: bytes, mime_type: str = "audio/wav") -> str:
    model = genai.GenerativeModel(MODEL_NAME)

    prompt = (
        "Transcribe el siguiente audio EXACTAMENTE al español. "
        "No agregues explicaciones, ni resúmenes, ni comentarios. "
        "Devuelve SOLO el texto transcrito."
    )

    response = model.generate_content(
        [
            prompt,
            {
                "mime_type": mime_type,
                "data": audio_bytes,
            },
        ]
    )

    return response.text.strip()


# ==========================
# HELPER PARA PARSEAR JSON
# ==========================
def _intentar_parsear_json(raw: str) -> dict | None:
    """
    Intenta extraer JSON válido aunque Gemini devuelva ```json ... ``` o texto alrededor.
    """
    # 1) Intento directo
    try:
        return json.loads(raw)
    except Exception:
        pass

    # 2) Quitar fences tipo ```json ... ```
    if "```" in raw:
        limpio = raw.strip()

        if limpio.startswith("```"):
            limpio = re.sub(r"^```[a-zA-Z0-9_-]*\s*", "", limpio)

        if limpio.endswith("```"):
            limpio = limpio[:-3].strip()

        try:
            return json.loads(limpio)
        except Exception:
            pass

    # 3) Tomar desde el primer '{' al último '}'
    inicio = raw.find("{")
    fin = raw.rfind("}")
    if inicio != -1 and fin != -1 and fin > inicio:
        posible_json = raw[inicio:fin + 1]
        try:
            return json.loads(posible_json)
        except Exception:
            pass

    return None


# ==========================
# 2) TEXTO TÉCNICO → EXPLICACIÓN + ACCIONES
# ==========================
def explicar_jerga(texto: str, area_oficio: str | None = None) -> dict:
    """
    Recibe texto con jerga técnica y devuelve:
    - explicacion_clara: mensaje listo para usuario
    - acciones_sugeridas: pasos concretos
    - nivel_urgencia: baja / media / alta
    """

    model = genai.GenerativeModel(MODEL_NAME)
    area = area_oficio or "general"

    system_prompt = f"""
Eres un traductor profesional de lenguaje técnico a lenguaje común.
Tu tarea es convertir explicaciones complejas en un mensaje sencillo,
amable y profesional, listo para que yo se lo lea o envíe a un usuario promedio.

Instrucciones IMPORTANTES:
1. Responde SIEMPRE en español.
2. Mantén un tono tranquilo, empático y profesional.
3. Devuelve SOLO un JSON válido, sin texto extra, sin bloques ```json.
4. El JSON debe tener exactamente estas claves:
   - "explicacion_clara": string
   - "acciones_sugeridas": lista de strings (entre 2 y 5 elementos)
   - "nivel_urgencia": string ("baja", "media" o "alta")

La clave "explicacion_clara" debe ser un texto que yo pueda leerle directamente al usuario,
explicándole qué está pasando de forma simple.

La clave "acciones_sugeridas" debe contener cosas concretas que el usuario puede hacer o preguntar.

TEXTO TÉCNICO ORIGINAL:
\"\"\"{texto}\"\"\"

ÁREA DEL OFICIO: {area}
"""

    response = model.generate_content(system_prompt)
    raw = response.text.strip()

    data = _intentar_parsear_json(raw)

    if not data:
        # Fallback por si Gemini no respeta el formato
        data = {
            "explicacion_clara": raw,
            "acciones_sugeridas": [],
            "nivel_urgencia": "media",
        }

    return data


# ==========================
# 3) ARCHIVO → TEXTO → EXPLICACIÓN
# ==========================
def analizar_archivo(archivo_bytes: bytes, nombre_archivo: str, area_oficio: str | None = None) -> dict:
    """
    Recibe un archivo (PDF, imagen, Word, etc.) y devuelve:
    - texto_extraido: contenido del archivo
    - explicacion_clara: explicación en lenguaje común
    - acciones_sugeridas: pasos concretos
    - nivel_urgencia: baja / media / alta
    """
    
    model = genai.GenerativeModel(MODEL_NAME)
    area = area_oficio or "general"
    
    # Determinar MIME type
    mime_type, _ = mimetypes.guess_type(nombre_archivo)
    if not mime_type:
        mime_type = "application/octet-stream"
    
    # Guardar el archivo en una ubicación temporal
    temp_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(nombre_archivo)[1]) as temp_file:
            temp_path = temp_file.name
            temp_file.write(archivo_bytes)
        
        # Subir archivo a Gemini usando el path temporal
        archivo_temp = genai.upload_file(
            path=temp_path,
            mime_type=mime_type,
            display_name=nombre_archivo
        )
    except Exception as e:
        raise RuntimeError(f"Error al subir archivo a Gemini: {e}")
    finally:
        # Limpiar archivo temporal si existe
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception as e:
                print(f"⚠️ Error al limpiar archivo temporal: {e}")
    
    # Prompt para extraer y explicar
    system_prompt = f"""
Eres un analizador profesional de documentos técnicos.
Tu tarea es:
1. Extraer el contenido/texto del archivo
2. Convertir las explicaciones complejas en lenguaje común
3. Identificar acciones sugeridas
4. Determinar el nivel de urgencia

Instrucciones IMPORTANTES:
1. Responde SIEMPRE en español.
2. Mantén un tono tranquilo, empático y profesional.
3. Devuelve SOLO un JSON válido, sin texto extra, sin bloques ```json.
4. El JSON debe tener exactamente estas claves:
   - "texto_extraido": string (contenido del archivo)
   - "explicacion_clara": string
   - "acciones_sugeridas": lista de strings (entre 2 y 5 elementos)
   - "nivel_urgencia": string ("baja", "media" o "alta")

ÁREA DEL OFICIO: {area}

Analiza el archivo adjunto y extrae la información según las instrucciones anteriores.
"""

    response = model.generate_content(
        [system_prompt, archivo_temp]
    )
    
    raw = response.text.strip()
    data = _intentar_parsear_json(raw)

    if not data:
        # Fallback si Gemini no respeta el formato
        data = {
            "texto_extraido": raw,
            "explicacion_clara": raw,
            "acciones_sugeridas": [],
            "nivel_urgencia": "media",
        }

    # Limpiar archivo temporal de Gemini
    try:
        genai.delete_file(archivo_temp.name)
    except Exception as e:
        print(f"⚠️ Error al limpiar archivo de Gemini: {e}")

    return data


# ==========================
# 4) IMAGEN → TEXTO → EXPLICACIÓN
# ==========================
def analizar_imagen(imagen_bytes: bytes, nombre_imagen: str, area_oficio: str | None = None) -> dict:
    """
    Recibe una imagen y devuelve:
    - texto_extraido: texto detectado en la imagen (OCR)
    - explicacion_clara: explicación en lenguaje común
    - acciones_sugeridas: pasos concretos
    - nivel_urgencia: baja / media / alta
    """
    
    model = genai.GenerativeModel(MODEL_NAME)
    area = area_oficio or "general"
    
    # Determinar MIME type para imagen
    mime_type, _ = mimetypes.guess_type(nombre_imagen)
    if not mime_type or not mime_type.startswith("image/"):
        # Fallback a JPEG si no se detecta
        mime_type = "image/jpeg"
    
    # Primer paso: Extraer texto de la imagen
    prompt_extraccion = """
Extrae TODO el texto visible en esta imagen. 
Responde SOLO con el texto extraído, sin explicaciones ni comentarios adicionales.
Si no hay texto, responde con "No hay texto visible".
"""
    
    response_extraccion = model.generate_content(
        [
            prompt_extraccion,
            {
                "mime_type": mime_type,
                "data": imagen_bytes,
            },
        ]
    )
    
    texto_extraido = response_extraccion.text.strip()
    
    # Segundo paso: Explicar el texto extraído
    system_prompt = f"""
Eres un traductor profesional de lenguaje técnico a lenguaje común.
Tu tarea es convertir explicaciones complejas en un mensaje sencillo,
amable y profesional, listo para que yo se lo lea o envíe a un usuario promedio.

Instrucciones IMPORTANTES:
1. Responde SIEMPRE en español.
2. Mantén un tono tranquilo, empático y profesional.
3. Devuelve SOLO un JSON válido, sin texto extra, sin bloques ```json.
4. El JSON debe tener exactamente estas claves:
   - "explicacion_clara": string
   - "acciones_sugeridas": lista de strings (entre 2 y 5 elementos)
   - "nivel_urgencia": string ("baja", "media" o "alta")

La clave "explicacion_clara" debe ser un texto que yo pueda leerle directamente al usuario,
explicándole qué está pasando de forma simple.

La clave "acciones_sugeridas" debe contener cosas concretas que el usuario puede hacer o preguntar.

TEXTO EXTRAÍDO DE LA IMAGEN:
\"\"\"{texto_extraido}\"\"\"

ÁREA DEL OFICIO: {area}
"""

    response_explicacion = model.generate_content(system_prompt)
    raw = response_explicacion.text.strip()
    
    data = _intentar_parsear_json(raw)

    if not data:
        # Fallback si Gemini no respeta el formato
        data = {
            "explicacion_clara": raw,
            "acciones_sugeridas": [],
            "nivel_urgencia": "media",
        }
    
    # Agregar el texto extraído a la respuesta
    data["texto_extraido"] = texto_extraido

    return data