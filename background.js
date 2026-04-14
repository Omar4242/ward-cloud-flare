chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'getAllCookies') {
    chrome.cookies.getAll({ domain: 'wardyati.com' }, cookies => {
      sendResponse(cookies);
    });
    return true; // keep message channel open
  }
});
