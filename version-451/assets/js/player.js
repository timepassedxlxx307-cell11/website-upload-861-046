(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var video = document.querySelector("video[data-video-url]");
    if (!video) {
      return;
    }

    var url = video.getAttribute("data-video-url");
    var layer = document.querySelector("[data-play-layer]");
    var hlsInstance = null;

    var bind = function () {
      if (!url || video.getAttribute("data-bound") === "true") {
        return;
      }
      video.setAttribute("data-bound", "true");
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(url);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal && hlsInstance) {
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hlsInstance.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hlsInstance.recoverMediaError();
            } else {
              video.src = url;
            }
          }
        });
      } else {
        video.src = url;
      }
    };

    var play = function () {
      bind();
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
      if (layer) {
        layer.classList.add("hidden");
      }
    };

    bind();

    if (layer) {
      layer.addEventListener("click", play);
    }

    video.addEventListener("play", function () {
      if (layer) {
        layer.classList.add("hidden");
      }
    });

    video.addEventListener("pause", function () {
      if (layer && video.currentTime === 0) {
        layer.classList.remove("hidden");
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();