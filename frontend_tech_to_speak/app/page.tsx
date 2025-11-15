'use client';

import { useAudioRecorder } from './hooks/useAudioRecorder';
import { getUrgencyColor, getUrgencyBadge, getUrgencyEmoji, formatTime } from './utils/urgency';
export default function Home() {
  const {
    isRecording,
    recordingTime,
    audioBlob,
    isProcessing,
    explanation,
    error,
    handleRecordClick,
    handleExplain,
    handleDownload,
    handleNewRecording,
  } = useAudioRecorder();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-2">Tech to Talk</h1>
          <p className="text-gray-600 text-lg">Convierte tu voz en acciones claras</p>
        </div>

        {/* Recording Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
          {/* Mic Icon */}
          <div className="flex justify-center mb-8">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${isRecording
                ? 'bg-red-500 animate-pulse shadow-lg shadow-red-500/50'
                : explanation
                  ? 'bg-green-500 shadow-lg shadow-green-500/50'
                  : 'bg-blue-600'
              }`}>
              <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path>
                <path d="M2 10a8 8 0 1 1 16 0 8 8 0 0 1-16 0z"></path>
              </svg>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700 text-sm font-semibold">⚠️ {error}</p>
            </div>
          )}

          {/* Status Text */}
          {!explanation && (
            <div className="text-center mb-8">
              <p className="text-gray-500 text-sm mb-2 uppercase tracking-wide font-semibold">Estado</p>
              <p className={`text-2xl font-bold ${isRecording ? 'text-red-500' : 'text-gray-900'}`}>
                {isRecording ? 'Grabando...' : audioBlob ? 'Audio listo' : 'Listo para grabar'}
              </p>
            </div>
          )}

          {/* Recording Time */}
          {isRecording && (
            <div className="text-center mb-6">
              <p className="text-gray-500 text-sm mb-2 uppercase tracking-wide font-semibold">Tiempo de grabación</p>
              <p className="text-3xl font-mono font-bold text-blue-600">{formatTime(recordingTime)}</p>
            </div>
          )}

          {/* Waveform Animation */}
          {isRecording && (
            <div className="flex items-center justify-center gap-1 mb-8 h-12">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className="bg-blue-600 rounded-full w-1"
                  style={{
                    height: `${Math.random() * 40 + 10}px`,
                    animation: `pulse 0.6s ease-in-out ${i * 0.05}s infinite`,
                  }}
                ></div>
              ))}
            </div>
          )}

          {/* Explanation Result */}
          {explanation && (
            <div className={`border-2 rounded-xl p-6 mb-6 ${getUrgencyColor(explanation.nivel_urgencia)}`}>
              {/* Transcribed Text */}
              <div className="mb-6">
                <p className="text-xs uppercase font-semibold text-gray-700 mb-2">📝 Texto transcrito:</p>
                <p className="text-gray-700 text-sm bg-white bg-opacity-50 p-3 rounded">
                  {explanation.texto_transcrito}
                </p>
              </div>

              {/* Urgency Badge */}
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs uppercase font-semibold text-gray-700">Explicación clara</p>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getUrgencyBadge(explanation.nivel_urgencia)}`}>
                  {getUrgencyEmoji(explanation.nivel_urgencia)}
                </span>
              </div>

              {/* Explanation */}
              <p className="text-gray-800 text-base leading-relaxed mb-6">
                {explanation.explicacion_clara}
              </p>

              {/* Actions */}
              <div className="bg-white bg-opacity-50 rounded-lg p-4">
                <p className="text-xs uppercase font-semibold text-gray-700 mb-3">Acciones sugeridas:</p>
                <ul className="space-y-2">
                  {explanation.acciones_sugeridas.map((accion, idx) => (
                    <li key={idx} className="flex gap-3 text-sm text-gray-700">
                      <span className="font-bold text-blue-600">{idx + 1}.</span>
                      <span>{accion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Record Button */}
          {!explanation && (
            <button
              onClick={handleRecordClick}
              disabled={isProcessing}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 ${isRecording
                  ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg disabled:bg-gray-400'
                }`}
            >
              {isRecording ? (
                <>
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                  Detener grabación
                </>
              ) : (
                <>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path>
                    <path d="M2 10a8 8 0 1 1 16 0 8 8 0 0 1-16 0z"></path>
                  </svg>
                  Grabar
                </>
              )}
            </button>
          )}

          {/* Explain Button */}
          {audioBlob && !explanation && (
            <button
              onClick={() => handleExplain('TI')}
              disabled={isProcessing}
              className={`w-full mt-4 py-4 rounded-xl font-bold text-white transition-all duration-300 flex items-center justify-center gap-2 ${isProcessing
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 shadow-lg'
                }`}
            >
              {isProcessing ? (
                <>
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                  Procesando...
                </>
              ) : (
                <>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5z"></path>
                  </svg>
                  Explicar con IA
                </>
              )}
            </button>
          )}

          {/* Download Button */}
          {audioBlob && !explanation && (
            <button
              onClick={handleDownload}
              className="w-full mt-2 py-3 rounded-xl font-bold text-blue-600 border-2 border-blue-600 bg-white hover:bg-blue-50 transition-all duration-300"
            >
              📥 Descargar WEBM
            </button>
          )}

          {/* New Recording Button */}
          {explanation && (
            <button
              onClick={handleNewRecording}
              className="w-full py-4 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all duration-300 shadow-lg"
            >
              Nueva grabación
            </button>
          )}
        </div>

        {/* Info Text */}
        <p className="text-center text-gray-600 text-sm mt-8">
          Grabar → Procesar con IA → Obtener explicación clara
        </p>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 0.5;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}