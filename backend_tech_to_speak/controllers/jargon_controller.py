from fastapi import APIRouter, HTTPException
from models.jargon_models import JargonRequest, JargonResponse
from services.gemini_service import explicar_jerga

router = APIRouter()

@router.post("/traducir", response_model=JargonResponse)
async def traducir_jerga(payload: JargonRequest):
    """
    Recibe texto técnico (posiblemente salido del audio) y devuelve:
    - explicación en lenguaje cotidiano
    - lista de acciones concretas
    - nivel de urgencia
    """
    try:
        resultado = explicar_jerga(payload.texto, payload.area_oficio)

        return JargonResponse(
            texto_original=payload.texto,
            explicacion_clara=resultado.get("explicacion_clara", ""),
            acciones_sugeridas=resultado.get("acciones_sugeridas", []),
            nivel_urgencia=resultado.get("nivel_urgencia", "media"),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al traducir jerga: {e}")
