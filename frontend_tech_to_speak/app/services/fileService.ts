export interface FileExplainResponse {
  nombre_archivo: string;
  mime_type: string;
  texto_extraido: string;
  explicacion_clara: string;
  acciones_sugeridas: string[];
  nivel_urgencia: 'baja' | 'media' | 'alta';
}

const API_BASE_URL = 'http://localhost:8000';

export const fileService = {
  async traducirArchivo(file: File, areaOficio: string = 'TI'): Promise<FileExplainResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('area_oficio', areaOficio);

    const response = await fetch(`${API_BASE_URL}/api/v1/file/traducir`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Error HTTP ${response.status}`);
    }

    return await response.json();
  },
};