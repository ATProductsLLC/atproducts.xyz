var player;
var options;
var adTagUrl1 = 'https://pubads.g.doubleclick.net/gampad/ads?iu=/31904509/Gamepress_Preroll&description_url=__page-url__&env=vp&impl=s&correlator=&tfcd=0&npa=0&gdfp_req=1&output=vast&sz=640x480&unviewed_position_start=1';
var adTagUrl2 = 'https://pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/124319096/external/single_ad_samples&ciu_szs=300x250&impl=s&gdfp_req=1&env=vp&output=vast&unviewed_position_start=1&cust_params=deployment%3Ddevsite%26sample_ct%3Dlinear&correlator=';

var init = function(){
  player = videojs('asc_video_ad', {width: 640, height: 360});
  options = {
    id: 'asc_video_ad',
    techOrder: ['html5'],
    preload: "auto",
    vastLoadTimeout: 5000,
    autoPlayAdBreaks: true,
    adTagUrl: 'https://pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/124319096/external/single_ad_samples&ciu_szs=300x250&impl=s&gdfp_req=1&env=vp&output=vast&unviewed_position_start=1&cust_params=deployment%3Ddevsite%26sample_ct%3Dlinear&correlator=',
    debug: true
  };
  player.ima(options);
}

function adVideoPlay(){
  player.on(['contentupdate'], function() {
    player.ima.initializeAdDisplayContainer();
    player.ima.requestAds();
    
  });
     
  player.on(['adtimeout'], function() {
    player.ima.initializeAdDisplayContainer();
    player.ima.requestAds();      
    player.play();
    
  });

  player.on(['loadstart', 'play', 'playing', 'firstplay', 'pause', 'ended', 'error', 'adplay', 'adplaying', 'adfirstplay', 'adpause', 'adend', 'adtimeout', 'contentplay', 'contentplaying', 'contentfirstplay', 'contentpause', 'contentended'], function(e) {
    console.warn('VIDEOJS player event: ',  e.type);
  });   

  var showPlayer = true;
  if(typeof window.adblockDetector === 'undefined') {
    showPlayer = false; //disable video player call
  } else {
    if(window.adblockDetector){
      window.adblockDetector.init({
        debug: true,
        found: function(){ showPlayer = false; },
        notFound: function(){ showPlayer = true; }
      });
    }
  }

  if(showPlayer){
    var playerVideo = document.getElementById('asc_video_ad');
    var playerVideoBtn = document.getElementById('play_video');
    playerVideo.setAttribute("style", "display: block;");
    playerVideoBtn.setAttribute("style", "display: none;");
    
    player.ready(function() {
      
      player.ima.setContentWithAdTag(null, adTagUrl2, true);
      player.ima.requestAds();
      player.play();
      
    });

    // contentended
    player.on('adend', function() {
      
      playerVideo.setAttribute("style", "display: none;");
      playerVideoBtn.setAttribute("style", "display: block;");
      
    });

    
    player.on('ended', function(){
      
      player.load();
      player.ima.initializeAdDisplayContainer();
      player.ima.setContentWithAdTag(null, adTagUrl1, true);
      player.ima.requestAds();
    });

    
  } else {
    console.log('Please disable ad blocker.');
  }
}


init();