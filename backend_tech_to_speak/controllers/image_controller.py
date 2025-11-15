from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from models.image_models import ImageExplainResponse
from services.gemini_service import analizar_imagen

router = APIRouter()

@router.post("/traducir", response_model=ImageExplainResponse)
async def traducir_imagen(
    file: UploadFile = File(...),
    area_oficio: str = Form("TI")
):
    """
    Endpoint para analizar imágenes, extraer texto y explicar la jerga técnica.
    
    - **file**: Archivo de imagen (PNG, JPG, JPEG, etc.)
    - **area_oficio**: Área técnica para contextualizar (default: "TI")
    
    Devuelve:
    - texto_extraido: Texto detectado en la imagen
    - explicacion_clara: Explicación en lenguaje simple
    - acciones_sugeridas: Pasos concretos recomendados
    - nivel_urgencia: baja / media / alta
    """
    try:
        # Validar que sea una imagen
        if not file.content_type.startswith("image/"):
            raise HTTPException(
                status_code=400,
                detail="El archivo debe ser una imagen (PNG, JPG, JPEG, etc.)"
            )
        
        # Leer contenido de la imagen
        imagen_bytes = await file.read()

        if not imagen_bytes:
            raise HTTPException(
                status_code=400,
                detail="El archivo de imagen está vacío"
            )

        # Analizar imagen con Gemini
        resultado = analizar_imagen(
            imagen_bytes,
            file.filename or "imagen",
            area_oficio
        )

        return ImageExplainResponse(
            texto_extraido=resultado.get("texto_extraido", ""),
            explicacion_clara=resultado.get("explicacion_clara", ""),
            acciones_sugeridas=resultado.get("acciones_sugeridas", []),
            nivel_urgencia=resultado.get("nivel_urgencia", "media"),
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al traducir imagen: {str(e)}"
        )