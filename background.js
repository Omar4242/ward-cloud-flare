chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'getCookies') {
    chrome.cookies.getAll({ url: 'https://wardyati.com' }, cookies => {
      sendResponse(cookies);
    });
    return true; // async response
  }
});
