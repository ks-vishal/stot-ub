export function logFrontendError(error, info = {}) {
  fetch('/api/log/frontend-error', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ error, ...info, url: window.location.href, userAgent: navigator.userAgent }),
  });
} 