from pydantic import BaseModel

class ImageExplainResponse(BaseModel):
    texto_extraido: str
    explicacion_clara: str
    acciones_sugeridas: list[str]
    nivel_urgencia: str