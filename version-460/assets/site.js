(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      var open = mobileNav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(open));
    });
  }

  var heroRoot = document.querySelector('[data-hero-slider]');
  if (heroRoot) {
    var slides = Array.prototype.slice.call(heroRoot.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var next = Number(dot.getAttribute('data-slide') || 0);
        showSlide(next);
        startTimer();
      });
    });

    startTimer();
  }

  var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
  panels.forEach(function (panel) {
    var input = panel.querySelector('[data-card-search]');
    var buttons = Array.prototype.slice.call(panel.querySelectorAll('[data-filter-value]'));
    var grid = panel.parentElement.querySelector('[data-filterable]');
    if (!grid) {
      return;
    }
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
    var activeValue = 'all';

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function updateCards() {
      var query = normalize(input ? input.value : '');
      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-type'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' '));
        var matchQuery = !query || text.indexOf(query) !== -1;
        var matchFilter = activeValue === 'all' || text.indexOf(normalize(activeValue)) !== -1;
        card.style.display = matchQuery && matchFilter ? '' : 'none';
      });
    }

    if (input) {
      input.addEventListener('input', updateCards);
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        activeValue = button.getAttribute('data-filter-value') || 'all';
        buttons.forEach(function (item) {
          item.classList.toggle('active', item === button);
        });
        updateCards();
      });
    });
  });

  var searchForm = document.querySelector('[data-global-search-form]');
  var searchInput = document.querySelector('[data-global-search-input]');
  var searchResults = document.querySelector('[data-search-results]');
  var presets = Array.prototype.slice.call(document.querySelectorAll('[data-search-preset]'));

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function renderSearch(query) {
    if (!searchResults || !window.movieSearchData) {
      return;
    }
    var value = String(query || '').trim().toLowerCase();
    var data = window.movieSearchData;
    var filtered = value
      ? data.filter(function (movie) {
          return [movie.title, movie.year, movie.region, movie.type, movie.genre, movie.tags, movie.oneLine]
            .join(' ')
            .toLowerCase()
            .indexOf(value) !== -1;
        })
      : data.slice(0, 36);
    var cards = filtered.slice(0, 120).map(function (movie) {
      var tags = movie.tags.split(/[,，/、\s]+/).filter(Boolean).slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');
      return '<article class="movie-card compact">'
        + '<a class="poster-link" href="' + escapeHtml(movie.href) + '">'
        + '<img src="' + escapeHtml(movie.image) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">'
        + '<span class="poster-shade"></span><span class="play-chip">播放</span></a>'
        + '<div class="movie-card-body"><div class="movie-meta-line"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span></div>'
        + '<h2><a href="' + escapeHtml(movie.href) + '">' + escapeHtml(movie.title) + '</a></h2>'
        + '<p>' + escapeHtml(movie.oneLine) + '</p><div class="tag-row">' + tags + '</div></div></article>';
    }).join('');
    searchResults.innerHTML = '<div class="movie-grid mini-grid">' + cards + '</div>';
  }

  if (searchForm && searchInput) {
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    searchInput.value = initial;
    renderSearch(initial);
    searchForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var query = searchInput.value.trim();
      var url = new URL(window.location.href);
      if (query) {
        url.searchParams.set('q', query);
      } else {
        url.searchParams.delete('q');
      }
      window.history.replaceState(null, '', url.toString());
      renderSearch(query);
    });
    searchInput.addEventListener('input', function () {
      renderSearch(searchInput.value);
    });
  }

  presets.forEach(function (button) {
    button.addEventListener('click', function () {
      if (searchInput) {
        searchInput.value = button.getAttribute('data-search-preset') || '';
        renderSearch(searchInput.value);
      }
    });
  });
})();
