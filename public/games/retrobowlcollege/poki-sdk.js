// Poki SDK loader for games.atproducts.xyz.
//
// This version does not download the Poki core SDK, so it makes no requests to
// Poki, Google, Amazon or Prebid. That keeps the site CSP from blocking anything,
// which removes the console errors and stops the game waiting on an ad.
// Every call resolves immediately.
(function () {
  function getParam(name) {
    var m = RegExp("[?&]" + name + "=([^&]*)").exec(window.location.search);
    return m && decodeURIComponent(m[1].replace(/\+/g, " "));
  }

  var noop = function () {};

  // Lets uph_poki.js know the SDK is available and not blocked.
  window.PokiSDK_OK = true;

  window.PokiSDK = {
    init: function () {
      return Promise.resolve();
    },
    initWithVideoHB: function () {
      return Promise.resolve();
    },
    // No ads, so a commercial break ends straight away.
    commercialBreak: function () {
      return Promise.resolve();
    },
    // No ad is shown, so no reward is granted. The game treats false as "no ad".
    rewardedBreak: function () {
      return Promise.resolve(false);
    },
    displayAd: function (a, b, beforeAd, adFinished) {
      if (adFinished) adFinished(true);
      if (beforeAd) beforeAd();
    },
    destroyAd: noop,
    getLeaderboard: function () {
      return Promise.resolve();
    },
    shareableURL: function () {
      return Promise.reject();
    },
    getURLParam: function (name) {
      return getParam("gd" + name) || getParam(name) || "";
    },
    getLanguage: function () {
      return navigator.language.toLowerCase().split("-")[0];
    },
    isAdBlocked: function () {
      return false;
    },
  };

  [
    "captureError", "customEvent", "gameInteractive", "gameLoadingFinished",
    "gameLoadingProgress", "gameLoadingStart", "gameplayStart", "gameplayStop",
    "happyTime", "logError", "muteAd", "roundEnd", "roundStart", "sendHighscore",
    "setDebug", "setDebugTouchOverlayController", "setLogging", "setPlayerAge",
    "setPlaytestCanvas", "enableEventTracking", "playtestSetCanvas",
    "playtestCaptureHtmlOnce",
  ].forEach(function (name) {
    window.PokiSDK[name] = noop;
  });
})();
