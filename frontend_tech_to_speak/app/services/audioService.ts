export interface ExplainResponse {
  nombre_archivo: string;
  mime_type: string;
  texto_transcrito: string;
  explicacion_clara: string;
  acciones_sugeridas: string[];
  nivel_urgencia: 'baja' | 'media' | 'alta';
}

const API_BASE_URL = 'http://localhost:8000';

export const audioService = {
  /**
   * Envía un archivo de audio al servidor para transcripción y explicación
   * POST /api/v1/audio/explicar
   */
  async explainAudio(audioBlob: Blob, filename: string, areaOficio: string = 'TI'): Promise<ExplainResponse> {
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, filename);
      formData.append('area_oficio', areaOficio);

      console.log('Enviando audio para explicar:', {
        nombre: filename,
        tamaño: audioBlob.size,
        tipo: audioBlob.type,
        area_oficio: areaOficio,
        endpoint: `${API_BASE_URL}/api/v1/audio/explicar`
      });

      const response = await fetch(`${API_BASE_URL}/api/v1/audio/explicar`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = `Error HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorMessage;
        } catch {
          errorMessage = await response.text() || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Explicación exitosa:', data);
      return data;
    } catch (error) {
      console.error('Error en explainAudio:', error);
      throw error;
    }
  },

  /**
   * Descarga un archivo de audio localmente
   */
  downloadAudio(audioBlob: Blob, filename: string): void {
    const url = URL.createObjectURL(audioBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  },
};