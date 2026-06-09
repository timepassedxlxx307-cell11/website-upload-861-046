(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobileNav = document.getElementById('mobileNav');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            var open = mobileNav.classList.toggle('is-open');
            menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
            menuButton.textContent = open ? '×' : '☰';
        });
    }

    var slider = document.querySelector('[data-hero-slider]');

    if (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
        var index = 0;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                showSlide(dotIndex);
            });
        });

        window.setInterval(function () {
            showSlide(index + 1);
        }, 5600);
    }

    var filterList = document.querySelector('.js-filter-list');

    if (filterList) {
        var cards = Array.prototype.slice.call(filterList.querySelectorAll('.js-movie-card'));
        var searchInput = document.querySelector('.filter-search');
        var typeSelect = document.querySelector('.filter-type');
        var yearSelect = document.querySelector('.filter-year');
        var emptyState = document.querySelector('.empty-state');
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');

        if (query && searchInput) {
            searchInput.value = query;
        }

        function normalized(value) {
            return String(value || '').trim().toLowerCase();
        }

        function applyFilters() {
            var keyword = normalized(searchInput ? searchInput.value : '');
            var typeValue = normalized(typeSelect ? typeSelect.value : '');
            var yearValue = normalized(yearSelect ? yearSelect.value : '');
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = normalized([
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.year,
                    card.dataset.genre,
                    card.dataset.tags,
                    card.textContent
                ].join(' '));
                var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchesType = !typeValue || normalized(card.dataset.type).indexOf(typeValue) !== -1;
                var matchesYear = !yearValue || normalized(card.dataset.year) === yearValue;
                var show = matchesKeyword && matchesType && matchesYear;

                card.hidden = !show;

                if (show) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.hidden = visible !== 0;
            }
        }

        [searchInput, typeSelect, yearSelect].forEach(function (element) {
            if (element) {
                element.addEventListener('input', applyFilters);
                element.addEventListener('change', applyFilters);
            }
        });

        applyFilters();
    }

    var video = document.getElementById('movieVideo');
    var playOverlay = document.getElementById('playOverlay');

    if (video) {
        var hlsInstance = null;
        var hasStarted = false;
        var source = video.getAttribute('data-src');

        function attachSource() {
            if (!source || hasStarted) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else {
                video.src = source;
            }

            hasStarted = true;
        }

        function startPlay() {
            attachSource();

            if (playOverlay) {
                playOverlay.classList.add('is-hidden');
            }

            var promise = video.play();

            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {});
            }
        }

        if (playOverlay) {
            playOverlay.addEventListener('click', startPlay);
        }

        video.addEventListener('click', function () {
            if (!hasStarted) {
                startPlay();
            }
        });

        video.addEventListener('play', function () {
            if (playOverlay) {
                playOverlay.classList.add('is-hidden');
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }
}());
