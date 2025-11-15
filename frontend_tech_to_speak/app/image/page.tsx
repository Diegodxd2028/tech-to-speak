'use client';

import { useState } from 'react';
import { imageService, ImageExplainResponse } from '../services/imageService';
import { getUrgencyColor, getUrgencyBadge, getUrgencyEmoji } from '../utils/urgency';

export default function ImagePage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [area, setArea] = useState('TI');
  const [result, setResult] = useState<ImageExplainResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const processFile = (selectedFile: File) => {
    setFile(selectedFile);
    setResult(null);
    setError(null);

    // Crear preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      processFile(droppedFile);
    } else {
      setError('Por favor arrastra una imagen válida');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Selecciona una imagen');
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await imageService.traducirImagen(file, area);
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Error al analizar imagen');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Analizador de Imágenes Técnicas</h1>
          <p className="text-gray-600">Sube una imagen y obtén explicaciones claras del contenido técnico</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                isDragging
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              {preview ? (
                <div className="space-y-4">
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-h-64 mx-auto rounded-lg shadow-md"
                  />
                  <p className="text-sm text-gray-700 font-semibold">{file?.name}</p>
                  <button
                    type="button"
                    onClick={handleClear}
                    className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
                  >
                    Cambiar imagen
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <svg
                    className="w-16 h-16 mx-auto text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <div>
                    <p className="text-gray-700 font-semibold mb-2">
                      🖼️ Arrastra tu imagen aquí o haz clic para seleccionar
                    </p>
                    <p className="text-gray-500 text-sm">PNG, JPG, GIF hasta 10MB</p>
                  </div>
                  <label className="inline-block">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.currentTarget.parentElement?.querySelector('input')?.click();
                      }}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Seleccionar imagen
                    </button>
                  </label>
                </div>
              )}
            </div>

            {/* Select Area */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                🏢 Área técnica
              </label>
              <select
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-600 focus:outline-none"
                value={area}
                onChange={e => setArea(e.target.value)}
              >
                <option value="TI">Tecnología de la Información (TI)</option>
                <option value="Mecánica">Mecánica Automotriz</option>
                <option value="Salud">Salud y Medicina</option>
                <option value="Legal">Ley y Finanzas</option>
                <option value="Construcción">Construcción</option>
                <option value="Electricidad">Electricidad</option>
              </select>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                <p className="text-red-700 text-sm font-semibold">⚠️ {error}</p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading || !file}
                className={`flex-1 py-4 rounded-xl font-bold text-white transition-all duration-300 flex items-center justify-center gap-2 ${
                  loading || !file
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 shadow-lg'
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                    Analizando...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.3A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z"></path>
                    </svg>
                    Analizar imagen
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="px-6 py-4 rounded-xl font-bold text-gray-700 border-2 border-gray-300 hover:bg-gray-50 transition-all"
              >
                Limpiar
              </button>
            </div>
          </form>

          {/* Result */}
          {result && (
            <div className={`mt-8 border-2 rounded-xl p-6 ${getUrgencyColor(result.nivel_urgencia)}`}>
              {/* Extracted Text */}
              <div className="mb-6">
                <p className="text-xs uppercase font-semibold text-gray-700 mb-2">📄 Texto extraído:</p>
                <p className="text-gray-700 text-sm bg-white bg-opacity-50 p-3 rounded">
                  {result.texto_extraido}
                </p>
              </div>

              {/* Urgency Badge */}
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs uppercase font-semibold text-gray-700">Explicación clara</p>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getUrgencyBadge(result.nivel_urgencia)}`}>
                  {getUrgencyEmoji(result.nivel_urgencia)} {result.nivel_urgencia}
                </span>
              </div>

              {/* Explanation */}
              <p className="text-gray-800 text-base leading-relaxed mb-6 bg-white bg-opacity-50 p-4 rounded-lg">
                {result.explicacion_clara}
              </p>

              {/* Actions */}
              <div className="bg-white bg-opacity-50 rounded-lg p-4">
                <p className="text-xs uppercase font-semibold text-gray-700 mb-3">✅ Acciones sugeridas:</p>
                <ul className="space-y-2">
                  {result.acciones_sugeridas.map((accion, idx) => (
                    <li key={idx} className="flex gap-3 text-sm text-gray-700">
                      <span className="font-bold text-blue-600 flex-shrink-0">{idx + 1}.</span>
                      <span>{accion}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* New Analysis Button */}
              <button
                onClick={handleClear}
                className="w-full mt-6 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-lg"
              >
                Analizar otra imagen
              </button>
            </div>
          )}
        </div>

        {/* Info Footer */}
        <p className="text-center text-gray-600 text-sm mt-8">
          💡 Arrastra o sube una imagen → Selecciona área → Obtén explicación clara
        </p>
      </div>
    </div>
  );
}