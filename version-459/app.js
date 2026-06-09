(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    if (slides.length < 2) {
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
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupFilters() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-filter-input]"));
    inputs.forEach(function (input) {
      var scope = document.querySelector(input.getAttribute("data-filter-input"));
      if (!scope) {
        return;
      }
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
      input.addEventListener("input", function () {
        var words = input.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-filter-text") || "").toLowerCase();
          var visible = words.every(function (word) {
            return text.indexOf(word) !== -1;
          });
          card.style.display = visible ? "" : "none";
        });
      });
    });
  }

  function setupSearch() {
    var input = document.querySelector("[data-search-box]");
    var grid = document.querySelector("[data-search-results]");
    if (!input || !grid || !window.SEARCH_INDEX) {
      return;
    }

    function makeResult(item) {
      var link = document.createElement("a");
      link.className = "search-result";
      link.href = item.url;

      var image = document.createElement("img");
      image.src = item.cover;
      image.alt = item.title;
      image.loading = "lazy";
      link.appendChild(image);

      var body = document.createElement("span");
      var title = document.createElement("strong");
      title.textContent = item.title;
      body.appendChild(title);

      var desc = document.createElement("p");
      desc.textContent = item.desc;
      body.appendChild(desc);

      var meta = document.createElement("span");
      meta.className = "result-meta";
      meta.innerHTML = "<span>" + item.region + "</span><span>" + item.year + "</span><span>" + item.genre + "</span>";
      body.appendChild(meta);

      link.appendChild(body);
      return link;
    }

    function render() {
      var value = input.value.trim().toLowerCase();
      grid.innerHTML = "";
      if (!value) {
        window.SEARCH_INDEX.slice(0, 24).forEach(function (item) {
          grid.appendChild(makeResult(item));
        });
        return;
      }
      var words = value.split(/\s+/).filter(Boolean);
      var results = window.SEARCH_INDEX.filter(function (item) {
        var text = item.text.toLowerCase();
        return words.every(function (word) {
          return text.indexOf(word) !== -1;
        });
      }).slice(0, 96);
      results.forEach(function (item) {
        grid.appendChild(makeResult(item));
      });
    }

    input.addEventListener("input", render);
    render();
  }

  window.initMoviePlayer = function (shell) {
    if (!shell) {
      return;
    }
    var video = shell.querySelector("video");
    var overlay = shell.querySelector(".player-overlay");
    var action = shell.querySelector(".play-action");
    var streamUrl = shell.getAttribute("data-stream");
    var started = false;
    var hls = null;

    if (!video || !streamUrl) {
      return;
    }

    function prepare() {
      if (started) {
        return;
      }
      started = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function play() {
      prepare();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {});
      }
    }

    if (action) {
      action.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        play();
      });
    }

    if (overlay) {
      overlay.addEventListener("click", play);
    }

    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });

    video.addEventListener("emptied", function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
      started = false;
    });
  };

  function setupPlayers() {
    Array.prototype.slice.call(document.querySelectorAll(".player-shell")).forEach(function (shell) {
      window.initMoviePlayer(shell);
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupSearch();
    setupPlayers();
  });
})();
