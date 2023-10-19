function hasLocalStorage() {
    if (!chrome.storage.local) return false;
    if (!isObject(chrome.storage.local)) return false;
  
    return true;
  }
  
  function setup() {
    if (!hasLocalStorage()) return false;
  
    if (!chrome.storage.local.get([LOCAL_STORAGE_KEY]) && !Array.isArray(chrome.storage.local.get([LOCAL_STORAGE_KEY]))) {
      var defaultStorageChannels = channels.map(function (block) {
        //Enable all on startup
        block['enabled'] = true;
        return block;
      });
  
      chrome.storage.local.set({[LOCAL_STORAGE_KEY]: JSON.stringify(defaultStorageChannels)});
    }
  };
  
  function getValues() {
    if (!hasLocalStorage()) return false;
  
    var params = chrome.storage.local.get([LOCAL_STORAGE_KEY]);
    params = JSON.parse(params);
  
    return params;
  };
  
  function setChannelEnabled(channelId, enabled, channelName) {
    if (!hasLocalStorage()) return;
  
    if (channelId) channelId = channelId.trim();
    if (channelName) channelName = channelName.trim();
  
    var storedChannels = chrome.storage.local.get([LOCAL_STORAGE_KEY]);
    storedChannels = JSON.parse(storedChannels); 
  
    if (!Array.isArray(storedChannels)) setup();
  
    var foundChannelIndex = -1;
    var isCustomChannel = true;
    for (var i = 0; i < storedChannels.length; i++) {
      var block = storedChannels[i];
  
      if (block.id === channelId) {
        foundChannelIndex = i;
        isCustomChannel = block['custom'] === true;
        block.enabled = enabled;
        storedChannels[i] = block;
      }
    };
  
    if (foundChannelIndex === -1 && isCustomChannel) {
      //Push new
      storedChannels.push({
        "id": channelId,
        "name": channelName,
        "icon": "../img/channels/custom.png",
        "enabled": enabled,
        "custom": true
      })
    } else if (!enabled && isCustomChannel && foundChannelIndex !== -1) {
      //Remove custom channel
      storedChannels.splice(foundChannelIndex, 1);
    }
  
    //Set all
    chrome.storage.local[LOCAL_STORAGE_KEY] = JSON.stringify(storedChannels);
  };
  
  function setAllChannelsEnabled(enabled) {
    if (!hasLocalStorage()) return;
  
    var storedChannels = chrome.storage.local.get([LOCAL_STORAGE_KEY]);
    storedChannels = JSON.parse(storedChannels); 
  
    var defaultStorageChannels = storedChannels.map(function(block) {
      //Disable all
      block['enabled'] = enabled;
      return block;
    });
  
    chrome.storage.local.set({[LOCAL_STORAGE_KEY]: JSON.stringify(defaultStorageChannels)});
  
  };
  
  setup();