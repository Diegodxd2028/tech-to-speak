import json
import re
import os
from dotenv import load_dotenv
import google.generativeai as genai

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
