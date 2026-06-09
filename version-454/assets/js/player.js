(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function attach(video, stream) {
    if (video.dataset.ready === "1") {
      return;
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = stream;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 60
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
      video._hls = hls;
    } else {
      video.src = stream;
    }
    video.dataset.ready = "1";
  }

  function start(shell) {
    var video = shell.querySelector("video");
    var overlay = shell.querySelector(".play-overlay");
    var stream = shell.getAttribute("data-stream");
    if (!video || !stream) {
      return;
    }
    attach(video, stream);
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
    video.controls = true;
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {
        video.controls = true;
      });
    }
  }

  ready(function () {
    Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(function (shell) {
      var video = shell.querySelector("video");
      var overlay = shell.querySelector(".play-overlay");
      if (overlay) {
        overlay.addEventListener("click", function (event) {
          event.preventDefault();
          start(shell);
        });
      }
      if (video) {
        video.addEventListener("click", function () {
          if (video.paused) {
            start(shell);
          }
        });
      }
    });
  });
})();
