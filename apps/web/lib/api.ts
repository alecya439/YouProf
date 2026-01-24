export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '/api';

export const apiUrl = (path: string) => {
  if (!path) return API_BASE_URL;
  return `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};

export const parseApiError = async (res: Response) => {
  const contentType = res.headers.get('content-type') || '';

  try {
    if (contentType.includes('application/json')) {
      const data = await res.json();
      if (typeof data === 'string') return data;
      if (data?.message) {
        return Array.isArray(data.message) ? data.message.join(', ') : data.message;
      }
      if (data?.error) return data.error;
    }

    const text = await res.text();
    return text || `Request failed with status ${res.status}`;
  } catch {
    return `Request failed with status ${res.status}`;
  }
};
