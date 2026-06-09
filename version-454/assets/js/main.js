(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function createSearchItem(movie) {
    var link = document.createElement("a");
    link.className = "search-item";
    link.href = movie.url;

    var image = document.createElement("img");
    image.src = movie.cover;
    image.alt = movie.title;
    image.loading = "lazy";

    var box = document.createElement("div");
    var title = document.createElement("strong");
    title.textContent = movie.title;
    var meta = document.createElement("span");
    meta.textContent = [movie.year, movie.region, movie.genre].filter(Boolean).join(" · ");

    box.appendChild(title);
    box.appendChild(meta);
    link.appendChild(image);
    link.appendChild(box);
    return link;
  }

  function setupSiteSearch(form) {
    var input = form.querySelector("input[type='search']");
    var panel = form.querySelector("[data-search-panel]");
    if (!input || !panel) {
      return;
    }

    function render() {
      var query = normalize(input.value);
      panel.innerHTML = "";
      if (!query) {
        panel.classList.remove("is-open");
        return;
      }
      var source = window.MOVIES_INDEX || [];
      var results = source.filter(function (movie) {
        return normalize(movie.title + " " + movie.region + " " + movie.year + " " + movie.genre + " " + movie.category).indexOf(query) !== -1;
      }).slice(0, 10);

      if (!results.length) {
        var empty = document.createElement("div");
        empty.className = "search-item";
        var text = document.createElement("strong");
        text.textContent = "暂无匹配影片";
        empty.appendChild(document.createElement("span"));
        empty.appendChild(text);
        panel.appendChild(empty);
      } else {
        results.forEach(function (movie) {
          panel.appendChild(createSearchItem(movie));
        });
      }
      panel.classList.add("is-open");
    }

    input.addEventListener("input", render);
    input.addEventListener("focus", render);
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      render();
      var firstLink = panel.querySelector("a");
      if (firstLink) {
        window.location.href = firstLink.href;
      }
    });

    document.addEventListener("click", function (event) {
      if (!form.contains(event.target)) {
        panel.classList.remove("is-open");
      }
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var active = 0;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === active);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
      });
    });

    show(0);
    setInterval(function () {
      show(active + 1);
    }, 5000);
  }

  function setupMobileMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupFilters() {
    var input = document.querySelector("[data-filter-input]");
    var region = document.querySelector("[data-filter-region]");
    var year = document.querySelector("[data-filter-year]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    var empty = document.querySelector("[data-empty-state]");
    if (!cards.length) {
      return;
    }

    function matches(card) {
      var query = normalize(input && input.value);
      var regionValue = normalize(region && region.value);
      var yearValue = normalize(year && year.value);
      var haystack = normalize([
        card.getAttribute("data-title"),
        card.getAttribute("data-region"),
        card.getAttribute("data-year"),
        card.getAttribute("data-genre"),
        card.getAttribute("data-type")
      ].join(" "));
      if (query && haystack.indexOf(query) === -1) {
        return false;
      }
      if (regionValue && normalize(card.getAttribute("data-region")).indexOf(regionValue) === -1) {
        return false;
      }
      if (yearValue && normalize(card.getAttribute("data-year")) !== yearValue) {
        return false;
      }
      return true;
    }

    function apply() {
      var visible = 0;
      cards.forEach(function (card) {
        var ok = matches(card);
        card.style.display = ok ? "" : "none";
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    [input, region, year].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
    apply();
  }

  ready(function () {
    setupMobileMenu();
    setupHero();
    setupFilters();
    Array.prototype.slice.call(document.querySelectorAll("[data-site-search]")).forEach(setupSiteSearch);
  });
})();
