// Floating sniper button
const btn = document.createElement('button');
btn.innerHTML = '🔥<br>Snipe Hold';
btn.style.cssText = `
  position:fixed; bottom:30px; right:30px; z-index:2147483647; 
  padding:18px 14px; background:#e74c3c; color:white; border:none; 
  border-radius:50%; font-size:22px; box-shadow:0 6px 20px rgba(231,76,60,0.4);
  line-height:1; text-align:center; cursor:pointer;
`;
document.body.appendChild(btn);

btn.addEventListener('click', async () => {
  // Auto-detect roomId from current URL
  const url = window.location.href;
  const roomMatch = url.match(/\/rooms\/(\d+)/);
  if (!roomMatch) {
    alert('❌ Please open a Wardyati room page first (e.g. /rooms/6585/...)');
    return;
  }
  const roomId = roomMatch[1];

  // Ask for shiftInstanceId (super easy: right-click the "Hold" button → Inspect → copy the number)
  const shiftInstanceId = prompt(
    `✅ Room detected: ${roomId}\n\nEnter the Shift Instance ID for the hold you want to snipe:`,
    '503673' // default example from your fetch
  );
  if (!shiftInstanceId) return;

  const targetTime = prompt(
    'Exact fire time (Cairo time, millisecond precision):\nExample: 2026-04-20T10:00:00.000+03:00',
    new Date(Date.now() + 300000).toISOString().replace('Z', '+03:00')
  );
  if (!targetTime) return;

  // Get ALL cookies for wardyati.com
  const cookies = await chrome.runtime.sendMessage({ action: 'getAllCookies' });
  const cookieString = cookies.map(c => `${c.name}=${c.value}`).join('; ');

  // Extract csrftoken (required for x-csrftoken header)
  const csrfCookie = cookies.find(c => c.name === 'csrftoken');
  const csrfToken = csrfCookie ? csrfCookie.value : null;

  if (!csrfToken) {
    alert('⚠️ No csrftoken cookie found. Make sure you are logged in to Wardyati.');
    return;
  }

  const endpoint = `https://wardyati.com/rooms/${roomId}/shift-instances/${shiftInstanceId}/action/hold/`;

  const payload = {
    targetTime,
    wardyatiEndpoint: endpoint,
    method: 'POST',
    headers: {
      'accept': '*/*',
      'accept-language': 'en-US,en;q=0.9',
      'priority': 'u=1, i',
      'sec-ch-ua': '"Google Chrome";v="134", "Not.A/Brand";v="8", "Chromium";v="134"',
      'sec-ch-ua-mobile': '?1',
      'sec-ch-ua-platform': '"Android"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'x-csrftoken': csrfToken,
      'referer': url,                    // important for anti-bot
      'user-agent': navigator.userAgent,
      'Cookie': cookieString             // ← this is the magic
    },
    body: null,   // no body needed
    secret: 'YOUR_SECRET_HERE'   // ← replace with the one you set in wrangler secret
  };

  try {
    const res = await fetch('https://your-worker.your-subdomain.workers.dev/schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      alert('✅ SNIPE SCHEDULED SUCCESSFULLY!\nIt will fire from Cloudflare at the exact time.');
      console.log('Snipe scheduled for', targetTime, '→', endpoint);
    } else {
      const err = await res.text();
      alert('❌ Error: ' + err);
    }
  } catch (e) {
    alert('❌ Could not reach your Worker. Check the URL and secret.');
  }
});
