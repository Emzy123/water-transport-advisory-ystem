/**
 * Resolve the vessel position WebSocket URL from environment.
 */
export function getVesselWsUrl() {
  if (import.meta.env.VITE_WS_URL) {
    return import.meta.env.VITE_WS_URL;
  }

  const apiUrl = import.meta.env.VITE_API_URL || '/api/v1';
  if (apiUrl.startsWith('http')) {
    const url = new URL(apiUrl);
    url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
    url.pathname = '/ws/vessels';
    url.search = '';
    return url.toString();
  }

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}/ws/vessels`;
}
