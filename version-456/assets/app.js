(function () {
  var state = {
    heroIndex: 0,
    heroTimer: null
  };

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMobileNav() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
      toggle.textContent = nav.classList.contains("is-open") ? "×" : "☰";
    });
  }

  function setHeroSlide(index) {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    state.heroIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, current) {
      slide.classList.toggle("is-active", current === state.heroIndex);
    });
    dots.forEach(function (dot, current) {
      dot.classList.toggle("is-active", current === state.heroIndex);
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        setHeroSlide(index);
        if (state.heroTimer) {
          window.clearInterval(state.heroTimer);
        }
        state.heroTimer = window.setInterval(function () {
          setHeroSlide(state.heroIndex + 1);
        }, 5000);
      });
    });
    setHeroSlide(0);
    state.heroTimer = window.setInterval(function () {
      setHeroSlide(state.heroIndex + 1);
    }, 5000);
  }

  function normalize(value) {
    return String(value || "").toLowerCase().replace(/\s+/g, " ").trim();
  }

  function applyFilters() {
    var input = document.querySelector("[data-search-input]");
    var select = document.querySelector("[data-filter-select]");
    var activeChip = document.querySelector("[data-filter-chip].is-active");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    var query = input ? normalize(input.value) : "";
    var choice = "";
    if (select && select.value) {
      choice = normalize(select.value);
    }
    if (activeChip && activeChip.getAttribute("data-filter-value")) {
      choice = normalize(activeChip.getAttribute("data-filter-value"));
    }
    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute("data-title"),
        card.getAttribute("data-meta"),
        card.getAttribute("data-tags"),
        card.getAttribute("data-genre")
      ].join(" "));
      var okQuery = !query || haystack.indexOf(query) !== -1;
      var okChoice = !choice || choice === "all" || haystack.indexOf(choice) !== -1;
      card.classList.toggle("is-hidden-card", !(okQuery && okChoice));
    });
  }

  function initFilters() {
    var input = document.querySelector("[data-search-input]");
    var select = document.querySelector("[data-filter-select]");
    var chips = Array.prototype.slice.call(document.querySelectorAll("[data-filter-chip]"));
    if (input) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");
      if (q) {
        input.value = q;
      }
      input.addEventListener("input", applyFilters);
      if (input.hasAttribute("data-search-autofocus")) {
        input.focus();
      }
    }
    if (select) {
      select.addEventListener("change", applyFilters);
    }
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (item) {
          item.classList.remove("is-active");
        });
        chip.classList.add("is-active");
        applyFilters();
      });
    });
    applyFilters();
  }

  function initHeaderSearch() {
    var forms = Array.prototype.slice.call(document.querySelectorAll("[data-header-search]"));
    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (input && input.value.trim()) {
          event.preventDefault();
          window.location.href = "./search.html?q=" + encodeURIComponent(input.value.trim());
        }
      });
    });
  }

  function startPlayer(streamUrl) {
    var video = document.querySelector("[data-player-video]");
    var overlay = document.querySelector("[data-player-overlay]");
    var button = document.querySelector("[data-player-button]");
    if (!video || !streamUrl) {
      return;
    }
    var loaded = false;
    var hlsInstance = null;

    function loadStream() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function playVideo() {
      loadStream();
      video.controls = true;
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {
          if (overlay) {
            overlay.classList.remove("is-hidden");
          }
        });
      }
    }

    if (button) {
      button.addEventListener("click", function (event) {
        event.stopPropagation();
        playVideo();
      });
    }
    if (overlay) {
      overlay.addEventListener("click", playVideo);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        playVideo();
      }
    });
    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  ready(function () {
    initMobileNav();
    initHeaderSearch();
    initHero();
    initFilters();
  });

  window.CinemaPlayer = startPlayer;
})();
