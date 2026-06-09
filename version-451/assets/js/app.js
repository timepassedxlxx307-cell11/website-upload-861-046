(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (menuButton && panel) {
      menuButton.addEventListener("click", function () {
        panel.classList.toggle("is-open");
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var active = 0;
      var timer = null;
      var setActive = function (index) {
        active = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === active);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === active);
        });
      };
      var start = function () {
        timer = window.setInterval(function () {
          setActive(active + 1);
        }, 5200);
      };
      var stop = function () {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      };
      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          stop();
          setActive(Number(dot.getAttribute("data-hero-dot")) || 0);
          start();
        });
      });
      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", start);
      if (slides.length > 1) {
        start();
      }
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";
    var input = document.querySelector("[data-filter-input]");
    var yearFilter = document.querySelector("[data-year-filter]");
    var typeFilter = document.querySelector("[data-type-filter]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));

    if (input && initialQuery) {
      input.value = initialQuery;
    }

    var applyFilters = function () {
      var q = input ? input.value.trim().toLowerCase() : "";
      var year = yearFilter ? yearFilter.value : "";
      var type = typeFilter ? typeFilter.value : "";
      cards.forEach(function (card) {
        var text = (card.getAttribute("data-search") || "").toLowerCase();
        var cardYear = card.getAttribute("data-year") || "";
        var cardType = card.getAttribute("data-type") || "";
        var ok = true;
        if (q && text.indexOf(q) === -1) {
          ok = false;
        }
        if (year && cardYear !== year) {
          ok = false;
        }
        if (type && cardType !== type) {
          ok = false;
        }
        card.style.display = ok ? "" : "none";
      });
    };

    if (input || yearFilter || typeFilter) {
      if (input) {
        input.addEventListener("input", applyFilters);
      }
      if (yearFilter) {
        yearFilter.addEventListener("change", applyFilters);
      }
      if (typeFilter) {
        typeFilter.addEventListener("change", applyFilters);
      }
      applyFilters();
    }
  });
})();