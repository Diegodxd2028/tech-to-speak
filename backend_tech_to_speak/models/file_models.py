from pydantic import BaseModel

class FileExplainResponse(BaseModel):
    nombre_archivo: str
    mime_type: str
    texto_extraido: str
    explicacion_clara: str
    acciones_sugeridas: list[str]
    nivel_urgencia: str