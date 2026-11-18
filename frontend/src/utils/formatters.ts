export function formatTimeHour(isoString: string): string {
  if (!isoString) return '';
  try {
    // If it has 'T', extract local forecast hour/minute directly to preserve forecast location time without timezone offset drift
    if (isoString.includes('T')) {
      const timePart = isoString.split('T')[1];
      if (timePart) {
        const timeClean = timePart.split('Z')[0].split('+')[0].split('-')[0];
        const [hourStr, minStr] = timeClean.split(':');
        const hour = parseInt(hourStr, 10);
        if (!isNaN(hour)) {
          const minute = minStr ? minStr.substring(0, 2) : '00';
          const period = hour >= 12 ? 'PM' : 'AM';
          const displayHour = hour % 12 === 0 ? 12 : hour % 12;
          return `${displayHour.toString().padStart(2, '0')}:${minute} ${period}`;
        }
      }
    }
    const date = new Date(isoString);
    if (!isNaN(date.getTime())) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    }
    return isoString;
  } catch {
    return isoString;
  }
}

export function formatDatePretty(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return isoString;
  }
}
