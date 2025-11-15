export interface JargonResponse {
  texto_original: string;
  explicacion_clara: string;
  acciones_sugeridas: string[];
  nivel_urgencia: 'baja' | 'media' | 'alta';
}

const API_BASE_URL = 'http://localhost:8000';

export const textService = {
  async traducirJargon(texto: string, areaOficio: string = 'TI'): Promise<JargonResponse> {
    const payload = {
      texto,
      area_oficio: areaOficio,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/jargon/traducir`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Error HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('Error en traducirJargon:', error);
      throw new Error(error.message || 'Error de conexión con el servidor');
    }
  },
};