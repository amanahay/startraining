export async function api(path, options = {}) {
  const config = {
    credentials: 'include',
    headers: options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' },
    ...options
  };
  if (config.body && !(config.body instanceof FormData) && typeof config.body !== 'string') {
    config.body = JSON.stringify(config.body);
  }
  const response = await fetch(`/api${path}`, config);
  const data = response.headers.get('content-type')?.includes('application/json')
    ? await response.json()
    : await response.text();
  if (!response.ok) throw new Error(data?.message || 'Permintaan gagal.');
  return data;
}

export function assetUrl(url) {
  return url || '';
}
