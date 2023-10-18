var browser = browser || chrome;

var LOCAL_STORAGE_KEY = "demainstream";
var GET_ALL = "get_all";
var SET = "set";
var SET_ALL = "set_all";
var RATING_GREEN = "#0f7b12";
var RATING_RED = "#7e0308";
var DAILY_TOP_URL = "https://www.youtube.com/results?search_query=youtube&sp=CAMSBAgCEAE%253D"
var SEND_SUCCESS = "send_success";
var ACTION_BLOCK_CHANNEL = "action_block_channel";
var ACTION_UNBLOCK_CHANNEL = "action_unblock_channel";

var list = document.getElementById("list");
var selectAllBtn = document.getElementById('select-all-btn');
var deselectAllBtn = document.getElementById('deselect-all-btn');
var helpBtn = document.getElementById('help-btn');
var helpView = document.getElementById('help-view');
var addBtn = document.getElementById('add-btn');
var addView = document.getElementById('add-view');
var addViewChannelIdInput = document.getElementById('add-view-channel-id-input');
var addViewChannelNameInput = document.getElementById('add-view-channel-name-input');
var addViewTextarea = document.getElementById('add-view-textarea');
var addViewSubmitBtn = document.getElementById('add-view-submit-btn');

var listItemCheckboxes = [];

browser.runtime.sendMessage({
  action: GET_ALL,
}, function (values) {
  if (!Array.isArray(values)) return false;

  makeList(values);
});

function makeList(values) {
  if (!Array.isArray(values)) return false;

  for (var i = 0; i < values.length; i++) {
    var block = values[i];
    var listItem = makeListItem(block);
    list.appendChild(listItem);
  };
};

function makeListItem(item) {
  var listItem = document.createElement("li");
  listItem.className = "list-item";

  var checkbox = document.createElement("input");
  checkbox.className = "list-item__checkbox";
  checkbox.setAttribute("type", "checkbox");
  checkbox.setAttribute("id", item.id);
  checkbox.setAttribute("name", item.name);

  listItemCheckboxes.push(checkbox);

  checkbox.addEventListener("change", function () {
    saveSetting(this.id, this.checked);
  }, false);
  checkbox.checked = item.enabled;

  var block = document.createElement("label");
  block.className = "list-item__block";
  block.setAttribute("for", item.id);

  var icon = document.createElement("img");
  icon.className = "list-item__icon";
  icon.src = item.icon;

  var text = document.createElement("span");
  text.className = "list-item__text";
  text.innerText = item.name || item.id;

  block.appendChild(icon);
  block.appendChild(text);

  listItem.appendChild(checkbox);
  listItem.appendChild(block);

  return listItem;
};

function saveSetting(id, enabled) {
  browser.runtime.sendMessage({
    action: SET,
    channelId: id,
    enabled: enabled
  });
};

function setAllEnabled(enabled) {
  browser.runtime.sendMessage({
    action: SET_ALL,
    enabled: enabled
  });

  for (var i = 0; i < listItemCheckboxes.length; i++) {
    var checkbox = listItemCheckboxes[i];
    checkbox.checked = enabled;
  };
};

selectAllBtn.addEventListener("click", function () {
  setAllEnabled(true);
}, false);

deselectAllBtn.addEventListener("click", function () {
  setAllEnabled(false);
}, false);

helpBtn.addEventListener("click", function () {
  var isHidden = helpView.classList.contains('hidden');
  if (isHidden) {
    list.classList.add('hidden');
    addView.classList.add('hidden');
  } else {
    list.classList.remove('hidden');
  }
  helpView.classList.toggle('hidden');
}, false);

addBtn.addEventListener("click", function () {
  var isHidden = addView.classList.contains('hidden');
  if (isHidden) {
    list.classList.add('hidden');
    helpView.classList.add('hidden');
  } else {
    list.classList.remove('hidden');
  }
  addView.classList.toggle('hidden');
}, false);

addViewSubmitBtn.addEventListener("click", function () {
  var updated = false;
  var textAreaValue = addViewTextarea.value;

  if (!!textAreaValue) {
    updated = true;
    var textAreaValueArray = textAreaValue.split(',');

    for (var i = 0; i < textAreaValueArray.length; i++) {
      var val = textAreaValueArray[i];
      if (!!val) {
        browser.runtime.sendMessage({
          action: SET,
          channelId: val,
          channelName: '',
          enabled: true,
        });
      }
    }
  }

  if (addViewChannelIdInput.value || addViewChannelNameInput.value) {
    updated = true;
    browser.runtime.sendMessage({
      action: SET,
      channelId: addViewChannelIdInput.value,
      channelName: addViewChannelNameInput.value,
      enabled: true
    });
  }

  //reset
  addViewChannelIdInput.value = '';
  addViewChannelNameInput.value = '';
  addViewTextarea.value = '';

  if (updated) {
    browser.runtime.sendMessage({
      action: SEND_SUCCESS,
      msg: 'Successfully added block(s)',
    });
  }
});