(function () {
    "use strict";

    var menuButton = document.querySelector("[data-menu-button]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function () {
            mobileNav.classList.toggle("is-open");
        });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var activeIndex = 0;

        var showSlide = function (index) {
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === activeIndex);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === activeIndex);
            });
        };

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide(activeIndex + 1);
            }, 5200);
        }
    }

    var searchInputs = Array.prototype.slice.call(document.querySelectorAll("[data-search]"));

    searchInputs.forEach(function (input) {
        var targetSelector = input.getAttribute("data-search");
        var cards = Array.prototype.slice.call(document.querySelectorAll(targetSelector));
        var empty = document.querySelector("[data-empty-state]");

        input.addEventListener("input", function () {
            var value = input.value.trim().toLowerCase();
            var visible = 0;

            cards.forEach(function (card) {
                var text = (card.getAttribute("data-title") + " " + card.getAttribute("data-meta")).toLowerCase();
                var matched = !value || text.indexOf(value) !== -1;
                card.style.display = matched ? "" : "none";
                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        });
    });

    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

    players.forEach(function (player) {
        var video = player.querySelector("[data-player-video]");
        var button = player.querySelector("[data-play-button]");
        var streamUrl = player.getAttribute("data-video-url") || (button && button.getAttribute("data-video-url"));
        var loaded = false;
        var hlsInstance = null;

        var loadStream = function () {
            if (!video || !streamUrl) {
                return;
            }

            if (!loaded) {
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = streamUrl;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({ enableWorker: true });
                    hlsInstance.loadSource(streamUrl);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = streamUrl;
                }
                loaded = true;
            }

            player.classList.add("is-ready");
            var playResult = video.play();
            if (playResult && typeof playResult.catch === "function") {
                playResult.catch(function () {});
            }
        };

        if (button) {
            button.addEventListener("click", loadStream);
        }

        if (video) {
            video.addEventListener("click", function () {
                if (!loaded) {
                    loadStream();
                }
            });
            video.addEventListener("play", function () {
                player.classList.add("is-ready");
            });
        }

        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
})();
