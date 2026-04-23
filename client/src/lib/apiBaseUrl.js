export const getApiBaseUrl = () => {
  const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '');

  if (configuredApiBaseUrl) {
    return configuredApiBaseUrl;
  }

  if (typeof window !== 'undefined') {
    const { hostname } = window.location;

    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return `http://${hostname}:5000`;
    }
  }

  return '';
};

export const API_BASE_URL = getApiBaseUrl();
