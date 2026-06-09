(function () {
  var hlsPromise = null;

  function loadHlsLibrary() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }
    if (hlsPromise) {
      return hlsPromise;
    }
    hlsPromise = new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
      script.async = true;
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
    return hlsPromise;
  }

  function attachSource(video, url) {
    if (video.dataset.ready === 'true') {
      return Promise.resolve();
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      video.dataset.ready = 'true';
      return Promise.resolve();
    }
    return loadHlsLibrary().then(function (Hls) {
      if (Hls && Hls.isSupported()) {
        var hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(url);
        hls.attachMedia(video);
        video._hls = hls;
        video.dataset.ready = 'true';
      } else {
        video.src = url;
        video.dataset.ready = 'true';
      }
    });
  }

  function setupPlayer(shell) {
    var video = shell.querySelector('[data-player]');
    var overlay = shell.querySelector('[data-play-overlay]');
    if (!video) {
      return;
    }
    var url = video.getAttribute('data-m3u8');
    if (!url) {
      return;
    }

    function play() {
      attachSource(video, url).then(function () {
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
        var playRequest = video.play();
        if (playRequest && playRequest.catch) {
          playRequest.catch(function () {
            video.controls = true;
          });
        }
      }).catch(function () {
        video.src = url;
        video.controls = true;
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
      });
    }

    if (overlay) {
      overlay.addEventListener('click', play);
    }
    video.addEventListener('click', function () {
      if (!video.dataset.ready) {
        play();
      }
    });
    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      Array.prototype.forEach.call(document.querySelectorAll('[data-player-shell]'), setupPlayer);
    });
  } else {
    Array.prototype.forEach.call(document.querySelectorAll('[data-player-shell]'), setupPlayer);
  }
})();
