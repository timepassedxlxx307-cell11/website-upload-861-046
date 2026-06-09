(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function rootPrefix() {
    return location.pathname.indexOf('/movies/') !== -1 ? '../' : './';
  }

  function movieCard(movie) {
    var prefix = rootPrefix();
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card">',
      '  <a class="card-cover" href="' + escapeHtml(prefix + movie.url) + '">',
      '    <img src="' + escapeHtml(prefix + movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="play-pill">播放</span>',
      '  </a>',
      '  <div class="card-body">',
      '    <h3><a href="' + escapeHtml(prefix + movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
      '    <p class="card-meta">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + ' · ' + escapeHtml(movie.year) + '</p>',
      '    <p class="card-summary">' + escapeHtml(movie.oneLine || '') + '</p>',
      '    <div class="tag-row">' + tags + '</div>',
      '  </div>',
      '</article>'
    ].join('\n');
  }

  ready(function () {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (toggle && menu) {
      toggle.addEventListener('click', function () {
        menu.classList.toggle('is-open');
      });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
      var current = 0;

      function showSlide(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('is-active', slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('is-active', dotIndex === current);
        });
      }

      dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
          showSlide(index);
        });
      });

      if (slides.length > 1) {
        setInterval(function () {
          showSlide(current + 1);
        }, 5200);
      }
    }

    var localFilter = document.querySelector('[data-local-filter]');
    var filterList = document.querySelector('[data-filter-list]');
    if (localFilter && filterList) {
      var cards = Array.prototype.slice.call(filterList.querySelectorAll('.movie-card'));
      localFilter.addEventListener('input', function () {
        var query = localFilter.value.trim().toLowerCase();
        cards.forEach(function (card) {
          var text = (card.getAttribute('data-filter') || card.textContent || '').toLowerCase();
          card.style.display = text.indexOf(query) !== -1 ? '' : 'none';
        });
      });
    }

    var searchResults = document.querySelector('[data-search-results]');
    var searchSummary = document.querySelector('[data-search-summary]');
    var searchInput = document.querySelector('[data-search-input]');
    if (searchResults && searchSummary && window.MOVIE_SEARCH_INDEX) {
      var params = new URLSearchParams(location.search);
      var initialQuery = params.get('q') || '';
      if (searchInput) {
        searchInput.value = initialQuery;
      }

      function runSearch(query) {
        var keyword = query.trim().toLowerCase();
        var source = window.MOVIE_SEARCH_INDEX;
        var matched = keyword ? source.filter(function (movie) {
          var text = [
            movie.title,
            movie.region,
            movie.type,
            movie.year,
            movie.genre,
            (movie.tags || []).join(' '),
            movie.oneLine
          ].join(' ').toLowerCase();
          return text.indexOf(keyword) !== -1;
        }) : source.slice(0, 60);

        var visible = matched.slice(0, 120);
        searchSummary.textContent = keyword
          ? '找到 ' + matched.length + ' 条结果，当前显示前 ' + visible.length + ' 条。'
          : '默认展示最新片库中的 60 部影片，可输入关键词继续筛选。';
        searchResults.innerHTML = visible.map(movieCard).join('\n');
      }

      runSearch(initialQuery);
      if (searchInput) {
        searchInput.addEventListener('input', function () {
          runSearch(searchInput.value);
        });
      }
    }
  });
})();
