'use client';

import { useState } from 'react';
import { textService, JargonResponse } from '../services/textService';
import { getUrgencyColor, getUrgencyBadge, getUrgencyEmoji } from '../utils/urgency';

export default function TextPage() {
  const [input, setInput] = useState('');
  const [area, setArea] = useState('TI');
  const [result, setResult] = useState<JargonResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) {
      setError('Por favor ingresa un texto');
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await textService.traducirJargon(input, area);
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Error al traducir');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setInput('');
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Traductor de Jerga Técnica</h1>
          <p className="text-gray-600">Convierte explicaciones técnicas en lenguaje simple</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Input Area */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                📝 Texto técnico
              </label>
              <textarea
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-600 focus:outline-none resize-none"
                rows={6}
                placeholder="Pega aquí el texto técnico que quieres traducir..."
                value={input}
                onChange={e => setInput(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-2">{input.length} caracteres</p>
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
                disabled={loading}
                className={`flex-1 py-4 rounded-xl font-bold text-white transition-all duration-300 flex items-center justify-center gap-2 ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 shadow-lg'
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                    Traduciendo...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.3A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z"></path>
                    </svg>
                    Traducir
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
              {/* Original Text */}
              <div className="mb-6">
                <p className="text-xs uppercase font-semibold text-gray-700 mb-2">📄 Texto original:</p>
                <p className="text-gray-700 text-sm bg-white bg-opacity-50 p-3 rounded">
                  {result.texto_original}
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

              {/* New Translation Button */}
              <button
                onClick={handleClear}
                className="w-full mt-6 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-lg"
              >
                Nueva traducción
              </button>
            </div>
          )}
        </div>

        {/* Info Footer */}
        <p className="text-center text-gray-600 text-sm mt-8">
          💡 Escribe texto técnico → Selecciona área → Obtén explicación clara
        </p>
      </div>
    </div>
  );
}