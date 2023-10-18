; (function () {
    var searchForm = document.querySelector("#search-form");
    var searchFormInput;
    if (searchForm) searchFormInput = searchForm.querySelector("#search");
  
    var channels = [];
    var channelIds = [];
    var channelNames = [];
    var addedDailyTopLink = false;
    var observingTargetNode = false;
    var targetNode = null;
  
    function getChannels(callback) {
      browser.runtime.sendMessage({
        action: GET_ALL,
      }, function (values) {
        if (!Array.isArray(values)) return false;
        channels = values;
        channelNames = [];
        channelIds = [];
  
        channels.filter(function (block) {
          return block.enabled;
        }).forEach(function (block) {
          if (block.name) channelNames.push(block.name.toLowerCase());
          if (block.id) channelIds.push(block.id.toLowerCase());
        });
  
        if (callback) callback();
      });
    };
  
    getChannels();
  
    if (searchForm) {
      searchForm.addEventListener("submit", function () {
        waitForVideoResults();
      }, false);
    }
    if (searchFormInput) {
      searchFormInput.addEventListener("keyup", function (event) {
        if (event.keyCode === 13) {
          waitForVideoResults();
        }
      });
    }
  
    //
  
    chrome.runtime.onMessage.addListener(function (request) {
      if (request.type === SEND_SUCCESS && request.hasOwnProperty('msg')) {
        alert(request.msg);
      } else {
        getChannels(function() {
          waitForVideoResults();
        });
      }
      return true;
    });
  
    //
  
    function addDailyTopLink() {
      if (addedDailyTopLink) {
        return false;
      }
  
      var cursearch = window.location.search;
      var isActive = false;
      if (cursearch === "?search_query=youtube&sp=CAMSBAgCEAE%253D") isActive = true;
  
      var sidebarList = document.querySelector("div#items.style-scope.ytd-guide-section-renderer");
      if (!sidebarList) {
        return false;
      }
  
      var btn = document.createElement("a");
      btn.href = DAILY_TOP_URL;
      btn.style.setProperty("display", "block");
      btn.style.setProperty("height", "40px");
      btn.style.setProperty("width", "100%");
      btn.style.setProperty("line-height", "40px");
      btn.style.setProperty("padding", "0 28px");
      btn.style.setProperty("cursor", "pointer");
      btn.style.setProperty("box-sizing", "border-box");
      btn.style.setProperty("text-decoration", "none");
      if (isActive) {
        btn.style.setProperty("background-color", "#d9d9d9");
      }
  
      btn.addEventListener("mouseover", function () {
        btn.style.setProperty("background-color", "#E7E7E7");
      }, false);
  
      btn.addEventListener("mouseout", function () {
        if (!isActive) btn.style.removeProperty("background-color");
      }, false);
  
      var text = document.createElement("span");
      text.innerHTML = "Daily Popular Videos";
      text.style.setProperty("display", "inlne-block");
      text.style.setProperty("color", "rgba(17,17,17,0.8)");
      text.style.setProperty("font-size", "14px");
      text.style.setProperty("line-height", "40px");
      text.style.setProperty("text-decoration", "none");
      text.style.setProperty("vertical-align", "middle");
      if (isActive) {
        text.style.setProperty("font-weight", "500");
        text.style.setProperty("color", "#000");
      }
  
      var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.style.setProperty("display", "inlne-block");
      svg.style.setProperty("height", "20px");
      svg.style.setProperty("width", "20px");
      svg.style.setProperty("vertical-align", "middle");
      svg.style.setProperty("margin", "0 24px 0 0");
      svg.setAttribute("version", "1.1");
      svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      svg.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
      svg.setAttribute("viewBox", "0 0 1792 1792");
  
      var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", "M1920 1536v128h-2048v-1536h128v1408h1920zm-128-1248v435q0 21-19.5 29.5t-35.5-7.5l-121-121-633 633q-10 10-23 10t-23-10l-233-233-416 416-192-192 585-585q10-10 23-10t23 10l233 233 464-464-121-121q-16-16-7.5-35.5t29.5-19.5h435q14 0 23 9t9 23z");
      path.setAttribute("fill", "#909090");
      if (isActive) path.setAttribute("fill", "#fc0d1b");
  
      svg.appendChild(path);
      btn.appendChild(svg)
      btn.appendChild(text);
  
      if (sidebarList) {
        sidebarList.appendChild(btn);
        addedDailyTopLink = true;
      }
    };
  
    function waitForVideoResults() {
      var resultVideochannelLinks = document.querySelectorAll('ytd-video-renderer a.yt-formatted-string.yt-simple-endpoint, yt-formatted-string.ytd-channel-name');
      for (var i = 0; i < resultVideochannelLinks.length; i++) {
        var n = resultVideochannelLinks[i];
        var txt = n.getAttribute('href') || n.getAttribute('title');
        var found = txt ? txt.replace('/user/', '').replace('/channel/', '').toLowerCase() : -1;
  
        if (channelIds.indexOf(found) > -1 || channelNames.indexOf(found) > -1) {
          var parent = n.closest("ytd-video-renderer, ytd-compact-video-renderer");
          if (parent) parent.remove();
        }
      }
    };
  
    var observeDOM = (function () {
      var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
  
      return function (obj, callback) {
        if (!obj || !obj.nodeType === 1) return;
  
        if (MutationObserver) {
          var obs = new MutationObserver(function (mutations) {
            var videoBlocks = mutations.find(function (m) {
              return m.type === 'childList' && (m.target.id === 'contents');
            });
            callback(videoBlocks);
          });
          obs.observe(obj, { childList: true, subtree: true });
        }
        else if (window.addEventListener) {
          obj.addEventListener('DOMNodeInserted', callback, false);
          obj.addEventListener('DOMNodeRemoved', callback, false);
        }
      }
    })();
  
    var interval;
    interval = setInterval(function () {
      if (!addedDailyTopLink) {
        addDailyTopLink();
      }
  
      targetNode = document.querySelectorAll('#content.style-scope.ytd-app');
      if (targetNode && !observingTargetNode) {
        observingTargetNode = true;
  
        for (var i = 0; i < targetNode.length; i++) {
          var tn = targetNode[i];
          observeDOM(tn, function (m) {
            waitForVideoResults();
          });
        }
      }
  
      if (addedDailyTopLink && targetNode) {
        clearInterval(interval);
      }
  
      waitForVideoResults();
    }, 100);
  
    //Clear after 10sec.
    setTimeout(function () {
      clearInterval(interval);
    }, 10000);
  })();