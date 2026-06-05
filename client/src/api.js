const API_BASE =
  import.meta.env.VITE_API_BASE ;
function parseTextResponse(res, text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export function authHeaders(token) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export async function fetchJson(path, { method = 'GET', headers = {}, body, ...rest } = {}) {
  const options = { method, headers, ...rest };
  if (body !== undefined) {
    options.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  const res = await fetch(`${API_BASE}${path}`, options);
  const text = await res.text();
  const data = parseTextResponse(res, text);

  if (!res.ok) {
    const message = data?.message || `${res.status} ${res.statusText}`;
    const error = new Error(message);
    error.status = res.status;
    error.body = data;
    throw error;
  }

  return data;
}
