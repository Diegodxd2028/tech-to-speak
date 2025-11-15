from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from models.file_models import FileExplainResponse
from services.gemini_service import analizar_archivo

router = APIRouter()

# Tipos de archivo soportados
ALLOWED_EXTENSIONS = {
    '.pdf', '.docx', '.doc', '.xlsx', '.xls', '.txt', '.pptx', '.ppt',
    '.rtf', '.odt', '.csv', '.html', '.xml', '.json'
}

@router.post("/traducir", response_model=FileExplainResponse)
async def traducir_archivo(
    file: UploadFile = File(...),
    area_oficio: str = Form("TI")
):
    """
    Endpoint para analizar archivos (PDF, Word, Excel, TXT, etc.), 
    extraer texto y explicar la jerga técnica.
    
    - **file**: Archivo a analizar (PDF, DOCX, XLSX, TXT, PPTX, etc.)
    - **area_oficio**: Área técnica para contextualizar (default: "TI")
    
    Devuelve:
    - nombre_archivo: Nombre del archivo procesado
    - mime_type: Tipo MIME del archivo
    - texto_extraido: Contenido extraído del archivo
    - explicacion_clara: Explicación en lenguaje simple
    - acciones_sugeridas: Pasos concretos recomendados
    - nivel_urgencia: baja / media / alta
    """
    try:
        # Validar que tenga nombre
        if not file.filename:
            raise HTTPException(
                status_code=400,
                detail="El archivo debe tener un nombre"
            )
        
        # Validar extensión
        file_ext = None
        if '.' in file.filename:
            file_ext = '.' + file.filename.split('.')[-1].lower()
        
        if file_ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=f"Tipo de archivo no soportado. Soportados: {', '.join(ALLOWED_EXTENSIONS)}"
            )
        
        # Leer contenido del archivo
        archivo_bytes = await file.read()

        if not archivo_bytes:
            raise HTTPException(
                status_code=400,
                detail="El archivo está vacío"
            )

        # Analizar archivo con Gemini
        resultado = analizar_archivo(
            archivo_bytes,
            file.filename,
            area_oficio
        )

        return FileExplainResponse(
            nombre_archivo=file.filename,
            mime_type=file.content_type or "application/octet-stream",
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
            detail=f"Error al analizar archivo: {str(e)}"
        )