const BASE_URL = 'http://localhost:8080/api';

export class APIError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const url = `${BASE_URL}${endpoint}`;
  
  // Set default headers
  const headers = new Headers(options.headers || {});
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const config: RequestInit = {
    ...options,
    headers,
    credentials: 'include', // Crucial for HTTP-only cookie JWT transmission
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    let errorMsg = 'An error occurred';
    try {
      const errorData = await response.json();
      errorMsg = errorData.message || errorMsg;
    } catch (e) {
      // JSON parsing failed, use status text
      errorMsg = response.statusText || errorMsg;
    }
    throw new APIError(errorMsg, response.status);
  }

  // Handle empty or 204 responses
  if (response.status === 204) {
    return null;
  }

  return response.json();
}
