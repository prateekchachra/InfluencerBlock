function sendYouTubeUpdate(data) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, data);
    });
  }
  
  browser.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    var action = message.action;
  
    switch (action) {
      case GET_ALL:
        if (sendResponse) {
          sendResponse(getValues());
        }
        break;
      case SET_ALL:
        setAllChannelsEnabled(message.enabled);
        sendYouTubeUpdate({
          type: SET_ALL,
          enabled: message.enabled
        });
        break;
      case SET:
        setChannelEnabled(message.channelId, message.enabled, message['channelName'] || null);
        sendYouTubeUpdate({
          type: SET,
          channelId: message.channelId
        });
        break;
      case SEND_SUCCESS:
        sendYouTubeUpdate({
          type: SEND_SUCCESS,
          msg: message.msg
        });
      default:
        break;
    };
  
    return true;
  });
  
  function contextMenuAction(info) {
    if (info !== null && info.hasOwnProperty('menuItemId') && info.hasOwnProperty('linkUrl')) {
      var channelId = info.linkUrl.replace(/^https?:\/\/(www\.)?youtube\.com\/(channel|user)\//gmi, '');
      var channelName = info.selectionText || '';
      var enabled = info.menuItemId === ACTION_BLOCK_CHANNEL;
      var action = enabled ? 'Blocked' : 'Unblocked';
  
      setChannelEnabled(channelId, enabled, channelName);
  
      sendYouTubeUpdate({
        type: SET,
        channelId: channelId
      });
  
      sendYouTubeUpdate({
        type: SEND_SUCCESS,
        msg: 'Successfully ' + action + " channel"
      });
    }
  }
  
  browser.runtime.onInstalled.addListener(function () {
    browser.contextMenus.onClicked.addListener(contextMenuAction);
  
    browser.contextMenus.create({
      id: ACTION_BLOCK_CHANNEL,
      title: "Block Channel",
      contexts: ["selection"],
      documentUrlPatterns: showForPages
    });
  
    browser.contextMenus.create({
      id: ACTION_UNBLOCK_CHANNEL,
      title: "Unblock Channel",
      contexts: ["selection"],
      documentUrlPatterns: showForPages
    });
  });