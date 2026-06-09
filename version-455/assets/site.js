(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  function initNavigation() {
    var button = document.querySelector(".mobile-menu-button");
    var panel = document.querySelector(".mobile-panel");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      var expanded = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", expanded ? "false" : "true");
      panel.hidden = expanded;
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    if (!slides.length || !dots.length) {
      return;
    }
    var current = 0;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-index") || 0));
      });
    });
    window.setInterval(function () {
      show(current + 1);
    }, 5200);
  }

  function initFiltering() {
    var libraries = Array.prototype.slice.call(document.querySelectorAll(".movie-library"));
    libraries.forEach(function (library) {
      var input = library.querySelector(".search-input");
      var selects = Array.prototype.slice.call(library.querySelectorAll(".filter-select"));
      var cards = Array.prototype.slice.call(library.querySelectorAll(".movie-card"));
      var empty = library.querySelector(".empty-state");
      if (!cards.length) {
        return;
      }
      function valueFor(name) {
        var select = library.querySelector('.filter-select[data-filter="' + name + '"]');
        return select ? select.value : "";
      }
      function apply() {
        var query = input ? input.value.trim().toLowerCase() : "";
        var category = valueFor("category");
        var type = valueFor("type");
        var region = valueFor("region");
        var visible = 0;
        cards.forEach(function (card) {
          var text = card.getAttribute("data-search") || "";
          var matchesQuery = !query || text.indexOf(query) !== -1;
          var matchesCategory = !category || card.getAttribute("data-category") === category;
          var matchesType = !type || card.getAttribute("data-type") === type;
          var matchesRegion = !region || card.getAttribute("data-region") === region;
          var matches = matchesQuery && matchesCategory && matchesType && matchesRegion;
          card.hidden = !matches;
          if (matches) {
            visible += 1;
          }
        });
        if (empty) {
          empty.hidden = visible !== 0;
        }
      }
      if (input) {
        input.addEventListener("input", apply);
      }
      selects.forEach(function (select) {
        select.addEventListener("change", apply);
      });
    });
  }

  window.initStaticPlayer = function (videoId, overlayId, mediaUrl) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    if (!video || !overlay || !mediaUrl) {
      return;
    }
    var loaded = false;
    var hlsInstance = null;
    function playVideo() {
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {});
      }
    }
    function start() {
      overlay.classList.add("is-hidden");
      if (loaded) {
        playVideo();
        return;
      }
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = mediaUrl;
        video.addEventListener("loadedmetadata", playVideo, { once: true });
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls();
        hlsInstance.loadSource(mediaUrl);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
      } else {
        video.src = mediaUrl;
        video.addEventListener("loadedmetadata", playVideo, { once: true });
      }
    }
    overlay.addEventListener("click", start);
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };

  ready(function () {
    initNavigation();
    initHero();
    initFiltering();
  });
})();
