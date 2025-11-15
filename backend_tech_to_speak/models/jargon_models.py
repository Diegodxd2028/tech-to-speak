from pydantic import BaseModel, Field
from typing import List, Optional

class JargonRequest(BaseModel):
    texto: str = Field(
        ...,
        description="Texto con jerga técnica (puede venir del STT)."
    )
    area_oficio: Optional[str] = Field(
        None,
        description="Área del experto: mecanica, medicina, derecho, banca, TI, etc."
    )

class JargonResponse(BaseModel):
    texto_original: str
    explicacion_clara: str
    acciones_sugeridas: List[str]
    nivel_urgencia: str = Field(
        description="baja / media / alta"
    )
