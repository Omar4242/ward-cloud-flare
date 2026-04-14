// Simple floating button
const btn = document.createElement('button');
btn.textContent = '🔥 Snipe this shift';
btn.style.cssText = 'position:fixed; bottom:20px; right:20px; z-index:999999; padding:15px; background:#e74c3c; color:white; border:none; border-radius:50%; font-size:18px; box-shadow:0 4px 12px rgba(0,0,0,0.3);';
document.body.appendChild(btn);

btn.addEventListener('click', async () => {
  // Example: read current shift from page (you adjust selector)
  const shiftId = document.querySelector('[data-shift-id]')?.dataset.shiftId;
  const shiftTime = document.querySelector('.shift-time')?.textContent;

  const targetTime = prompt('Exact fire time (ISO format, Cairo time):\nExample: 2026-04-20T10:00:00.000+03:00', new Date(Date.now() + 60000).toISOString());

  // Get cookies for this domain
  const cookies = await chrome.runtime.sendMessage({ action: 'getCookies' });

  // Get any localStorage tokens (common on modern sites)
  const tokens = {};
  if (window.localStorage) {
    Object.keys(localStorage).forEach(k => {
      if (k.includes('token') || k.includes('auth')) tokens[k] = localStorage.getItem(k);
    });
  }

  const payload = {
    targetTime,
    wardyatiEndpoint: 'https://wardyati.com/api/claim-shift', // change to real one
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': navigator.userAgent,
      // Add any other headers you usually see
      ...tokens // if tokens are in headers
    },
    body: { shiftId, /* other fields from page */ },
    secret: 'YOUR_SECRET_FROM_WRANGLER' // store in extension storage
  };

  const res = await fetch('https://your-worker.your-subdomain.workers.dev/schedule', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (res.ok) alert('✅ Snipe scheduled on Cloudflare!');
  else alert('Error – check console');
});
