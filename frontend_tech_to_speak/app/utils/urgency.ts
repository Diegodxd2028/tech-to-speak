export const getUrgencyColor = (level: string) => {
  switch (level) {
    case 'alta':
      return 'bg-red-50 border-red-200';
    case 'media':
      return 'bg-yellow-50 border-yellow-200';
    case 'baja':
      return 'bg-green-50 border-green-200';
    default:
      return 'bg-gray-50 border-gray-200';
  }
};

export const getUrgencyBadge = (level: string) => {
  switch (level) {
    case 'alta':
      return 'bg-red-100 text-red-800';
    case 'media':
      return 'bg-yellow-100 text-yellow-800';
    case 'baja':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getUrgencyEmoji = (level: string) => {
  switch (level) {
    case 'alta':
      return '🔴 Urgente';
    case 'media':
      return '🟡 Moderado';
    case 'baja':
      return '🟢 Bajo';
    default:
      return '⚫ Desconocido';
  }
};

export const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};