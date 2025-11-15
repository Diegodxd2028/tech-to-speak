'use client';

import { useState } from 'react';
import { fileService, FileExplainResponse } from '../services/fileService';
import { getUrgencyColor, getUrgencyBadge, getUrgencyEmoji } from '../utils/urgency';

export default function FilePage() {
  const [file, setFile] = useState<File | null>(null);
  const [area, setArea] = useState('TI');
  const [result, setResult] = useState<FileExplainResponse | null>(null);
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
    if (droppedFile) {
      processFile(droppedFile);
    } else {
      setError('Por favor arrastra un archivo válido');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Selecciona un archivo');
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fileService.traducirArchivo(file, area);
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Error al analizar archivo');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    setResult(null);
    setError(null);
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf':
        return '📄';
      case 'docx':
      case 'doc':
        return '📝';
      case 'xlsx':
      case 'xls':
        return '📊';
      case 'txt':
        return '📃';
      case 'pptx':
      case 'ppt':
        return '🎯';
      default:
        return '📁';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Analizador de Documentos</h1>
          <p className="text-gray-600">Sube archivos PDF, Word, Excel, TXT y obtén explicaciones claras</p>
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
              {file ? (
                <div className="space-y-4">
                  <div className="text-5xl">{getFileIcon(file.name)}</div>
                  <p className="text-sm text-gray-700 font-semibold">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <button
                    type="button"
                    onClick={handleClear}
                    className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
                  >
                    Cambiar archivo
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
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <div>
                    <p className="text-gray-700 font-semibold mb-2">
                      📎 Arrastra tu documento aquí o haz clic para seleccionar
                    </p>
                    <p className="text-gray-500 text-sm">
                      PDF, DOCX, DOC, XLSX, XLS, TXT, PPTX, PPT hasta 50MB
                    </p>
                  </div>
                  <label className="inline-block">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.txt,.xlsx,.xls,.pptx,.ppt,.rtf,.odt,.csv,.html,.xml,.json"
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
                      Seleccionar archivo
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
                    Analizar documento
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
              {/* File Info */}
              <div className="mb-6 flex items-center gap-3">
                <div className="text-3xl">{getFileIcon(result.nombre_archivo)}</div>
                <div>
                  <p className="text-xs uppercase font-semibold text-gray-700">Archivo procesado:</p>
                  <p className="text-sm text-gray-800 font-semibold">{result.nombre_archivo}</p>
                </div>
              </div>

              {/* Extracted Text */}
              <div className="mb-6">
                <p className="text-xs uppercase font-semibold text-gray-700 mb-2">📄 Texto extraído:</p>
                <div className="text-gray-700 text-sm bg-white bg-opacity-50 p-3 rounded max-h-32 overflow-y-auto">
                  {result.texto_extraido}
                </div>
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
                Analizar otro documento
              </button>
            </div>
          )}
        </div>

        {/* Info Footer */}
        <p className="text-center text-gray-600 text-sm mt-8">
          💡 Arrastra o sube un documento → Selecciona área → Obtén explicación clara
        </p>
      </div>
    </div>
  );
}