from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from services.gemini_service import transcribir_audio, explicar_jerga
import time
router = APIRouter()

# ==========================
# 1) AUDIO → TEXTO (STT)
# ==========================
@router.post("/stt")
async def audio_to_text(file: UploadFile = File(...)):
    """
    Recibe un archivo de audio y devuelve el texto transcrito usando Gemini.
    """
    start_time = time.time()
    try:
        audio_bytes = await file.read()
        if not audio_bytes:
            raise HTTPException(status_code=400, detail="El archivo de audio está vacío.")

        mime_type = file.content_type or "audio/wav"

        texto = transcribir_audio(audio_bytes, mime_type)
        elapsed_time = round(time.time() - start_time, 3)

        return {
            "nombre_archivo": file.filename,
            "mime_type": mime_type,
            "texto": texto,
            "tiempo_procesamiento_segundos": elapsed_time,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al transcribir audio: {e}")


# ==========================
# 2) AUDIO → TEXTO → JERGA EXPLICADA
# ==========================
@router.post("/explicar")
async def audio_to_explained_jargon(
    file: UploadFile = File(...),
    area_oficio: str | None = Form(
        default=None, description="mecanica, medicina, derecho, TI, etc."
    ),
):
    """
    Recibe un archivo de audio con jerga técnica,
    lo transcribe y luego traduce esa jerga a lenguaje humano
    con lista de acciones y nivel de urgencia.
    """
    try:
        audio_bytes = await file.read()
        if not audio_bytes:
            raise HTTPException(status_code=400, detail="El archivo de audio está vacío.")

        mime_type = file.content_type or "audio/wav"

        # 1) AUDIO → TEXTO
        texto = transcribir_audio(audio_bytes, mime_type)

        # 2) TEXTO → EXPLICACIÓN + ACCIONES
        resultado = explicar_jerga(texto, area_oficio)

        return {
            "nombre_archivo": file.filename,
            "mime_type": mime_type,
            "texto_transcrito": texto,
            "explicacion_clara": resultado.get("explicacion_clara", ""),
            "acciones_sugeridas": resultado.get("acciones_sugeridas", []),
            "nivel_urgencia": resultado.get("nivel_urgencia", "media"),
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al procesar audio y explicar jerga: {e}")
