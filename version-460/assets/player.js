function initializePlayer(video) {
  var source = video.getAttribute('data-m3u8');
  var shell = video.closest('.player-shell');
  var button = shell ? shell.querySelector('.play-trigger') : null;

  if (!source) {
    return;
  }

  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = source;
  } else if (window.Hls && window.Hls.isSupported()) {
    var hls = new window.Hls({
      enableWorker: true,
      lowLatencyMode: true
    });
    hls.loadSource(source);
    hls.attachMedia(video);
  } else {
    video.src = source;
  }

  function playVideo() {
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {});
    }
  }

  if (button) {
    button.addEventListener('click', playVideo);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      playVideo();
    }
  });

  video.addEventListener('play', function () {
    if (shell) {
      shell.classList.add('playing');
    }
  });

  video.addEventListener('pause', function () {
    if (shell) {
      shell.classList.remove('playing');
    }
  });
}

document.addEventListener('DOMContentLoaded', function () {
  Array.prototype.slice.call(document.querySelectorAll('.native-player')).forEach(initializePlayer);
});
