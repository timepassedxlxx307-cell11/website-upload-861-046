(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function text(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupMobileMenu() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", panel.classList.contains("is-open") ? "true" : "false");
    });
  }

  function setupHeroCarousels() {
    document.querySelectorAll("[data-hero-carousel]").forEach(function (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
      if (!slides.length) {
        return;
      }
      var current = 0;
      var timer = null;
      function show(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === current);
          dot.setAttribute("aria-current", dotIndex === current ? "true" : "false");
        });
      }
      function start() {
        if (slides.length < 2) {
          return;
        }
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5000);
      }
      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          show(index);
          if (timer) {
            window.clearInterval(timer);
            start();
          }
        });
      });
      show(0);
      start();
    });
  }

  function setupSearchForms() {
    document.querySelectorAll("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var query = input ? input.value.trim() : "";
        var target = "./search.html";
        if (query) {
          target += "?q=" + encodeURIComponent(query);
        }
        window.location.href = target;
      });
    });
  }

  function setupFilters() {
    document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
      var input = panel.querySelector("[data-filter-input]");
      var year = panel.querySelector("[data-filter-year]");
      var type = panel.querySelector("[data-filter-type]");
      var scope = panel.getAttribute("data-filter-panel");
      var list = document.querySelector("[data-filter-list='" + scope + "']");
      var empty = document.querySelector("[data-filter-empty='" + scope + "']");
      if (!list) {
        return;
      }
      var cards = Array.prototype.slice.call(list.querySelectorAll("[data-card]"));
      var params = new URLSearchParams(window.location.search);
      if (input && params.get("q")) {
        input.value = params.get("q");
      }
      function apply() {
        var query = input ? text(input.value) : "";
        var yearValue = year ? text(year.value) : "";
        var typeValue = type ? text(type.value) : "";
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = text(card.getAttribute("data-search-text"));
          var cardYear = text(card.getAttribute("data-year"));
          var cardType = text(card.getAttribute("data-type"));
          var ok = true;
          if (query && haystack.indexOf(query) === -1) {
            ok = false;
          }
          if (yearValue && cardYear !== yearValue) {
            ok = false;
          }
          if (typeValue && cardType !== typeValue) {
            ok = false;
          }
          card.hidden = !ok;
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.hidden = visible !== 0;
        }
      }
      [input, year, type].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
      apply();
    });
  }

  window.setupMoviePlayer = function (videoId, streamUrl, buttonId) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    if (!video || !streamUrl) {
      return;
    }
    function attach() {
      if (video.getAttribute("data-ready") === streamUrl) {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        video.setAttribute("data-ready", streamUrl);
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        if (video.hlsInstance) {
          video.hlsInstance.destroy();
        }
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        video.hlsInstance = hls;
        video.setAttribute("data-ready", streamUrl);
        return;
      }
      video.src = streamUrl;
      video.setAttribute("data-ready", streamUrl);
    }
    function start() {
      attach();
      if (button) {
        button.classList.add("is-hidden");
      }
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          if (button) {
            button.classList.remove("is-hidden");
          }
        });
      }
    }
    if (button) {
      button.addEventListener("click", start);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
  };

  ready(function () {
    setupMobileMenu();
    setupHeroCarousels();
    setupSearchForms();
    setupFilters();
  });
})();
