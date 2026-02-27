function initVideoPlayer(config) {
    let video;
    if (typeof config.videoElement === "string") {
        video = document.querySelector(config.videoElement);
    } else {
        video = config.videoElement;
    }
    if (!video) return;

    let container;
    if (config.container) {
        container = document.querySelector(config.container);
    } else {
        container = video.parentElement;
    }

    const controlsConfig = config.controls || {};
    const defaults = config.defaults || {};

    video.controls = false;
    video.classList.add("video__player--video");

    let isSeeking = false;
    let lastVolume = defaults.volume != null ? defaults.volume : 1;

    function formatTime(time) {
        if (isNaN(time)) return "00:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }

    const icons = {
        play: `<img class="video__player--icon" src="./assets/icons/play-svgrepo-com.svg" alt="Play" />`,
        pause: `<img class="video__player--icon" src="./assets/icons/pause-svgrepo-com.svg" alt="Pause" />`,
        mute: `<img class="video__player--icon" src="./assets/icons/mute-volume-svgrepo-com.svg" alt="Mute" />`,
        unmute: `<img class="video__player--icon" src="./assets/icons/unmute-svgrepo-com.svg" alt="Unmute" />`,
        fullscreen: `<img class="video__player--icon" src="./assets/icons/fullscreen-svgrepo-com.svg" alt="Fullscreen" />`,
        exitFullscreen: `<img class="video__player--icon video__player--icon-exit" src="./assets/icons/fullscreen-svgrepo-com.svg" alt="Exit Fullscreen" />`,
    };

    const controls = document.createElement("div");
    controls.className = "video__player--controls";

    let html = `
        <button class="video__player--button play-pause" aria-label="Play/Pause">
            ${icons.play}
        </button>

        <div class="video__player--center-controls">
            <span class="video__player--time current">00:00</span>
            <input type="range" class="video__player--progress" min="0" max="100" value="0">
            <span class="video__player--time duration">00:00</span>
        </div>
        
        <div class="video__player--right-controls">
    `;

    if (controlsConfig.volume !== false) {
        html += `
            <button class="video__player--button mute" aria-label="Mute/Unmute">
                ${icons.unmute}
            </button>
            <input type="range" class="video__player--volume" min="0" max="1" step="0.01">
        `;
    }

    if (controlsConfig.playbackSpeed !== false) {
        html += `
            <select class="video__player--speed" aria-label="Playback Speed">
                <option class="video__player--speed-option" value="0.5">0.5x</option>
                <option class="video__player--speed-option" value="1" selected>1x</option>
                <option class="video__player--speed-option" value="1.25">1.25x</option>
                <option class="video__player--speed-option" value="1.5">1.5x</option>
                <option class="video__player--speed-option" value="2">2x</option>
            </select>
        `;
    }

    if (controlsConfig.fullscreen !== false) {
        html += `
            <button class="video__player--button fullscreen" aria-label="Toggle Fullscreen">
                ${icons.fullscreen}
            </button>
        `;
    }

    html += `</div>`;
    controls.innerHTML = html;
    container.appendChild(controls);

    const playPauseBtn = controls.querySelector(".play-pause");
    const progress = controls.querySelector(".video__player--progress");
    const currentTimeEl = controls.querySelector(".current");
    const durationEl = controls.querySelector(".duration");
    const volumeSlider = controls.querySelector(".video__player--volume");
    const muteBtn = controls.querySelector(".mute");
    const speedSelect = controls.querySelector(".video__player--speed");
    const fullscreenBtn = controls.querySelector(".fullscreen");

    function updateRangeBackground(slider, isVolume = false) {
        if (!slider) return;
        const value = isVolume ? slider.value * 100 : slider.value;
        slider.style.setProperty('--value', `${value}%`);
    }

    if (volumeSlider && defaults.volume != null) {
        video.volume = defaults.volume;
        volumeSlider.value = defaults.volume;
        updateRangeBackground(volumeSlider, true);
    }

    if (speedSelect && defaults.speed != null) {
        video.playbackRate = defaults.speed;
        speedSelect.value = defaults.speed;
    }

    video.addEventListener('click', () => {
        if (video.paused) video.play();
        else video.pause();
    });

    const interactables = controls.querySelectorAll("button, input, select");
    interactables.forEach(el => el.disabled = true);

    video.addEventListener("loadedmetadata", () => {
        durationEl.textContent = formatTime(video.duration);
        interactables.forEach(el => el.disabled = false);
    });

    playPauseBtn.addEventListener("click", () => {
        if (video.paused) video.play();
        else video.pause();
    });

    video.addEventListener("play", () => playPauseBtn.innerHTML = icons.pause);
    video.addEventListener("pause", () => playPauseBtn.innerHTML = icons.play);

    video.addEventListener("timeupdate", () => {
        if (!isSeeking) {
            progress.value = (video.currentTime / video.duration) * 100 || 0;
            currentTimeEl.textContent = formatTime(video.currentTime);
            updateRangeBackground(progress);
        }
    });

    progress.addEventListener("input", () => {
        isSeeking = true;
        currentTimeEl.textContent = formatTime((progress.value / 100) * video.duration);
        updateRangeBackground(progress);
    });

    progress.addEventListener("change", () => {
        video.currentTime = (progress.value / 100) * video.duration;
        isSeeking = false;
    });

    if (volumeSlider && muteBtn) {
        volumeSlider.addEventListener("input", () => {
            video.volume = volumeSlider.value;
            updateRangeBackground(volumeSlider, true);
            if (video.volume === 0) {
                video.muted = true;
                muteBtn.innerHTML = icons.mute;
            } else {
                video.muted = false;
                muteBtn.innerHTML = icons.unmute;
            }
        });

        muteBtn.addEventListener("click", () => {
            video.muted = !video.muted;
            if (video.muted) {
                lastVolume = video.volume;
                volumeSlider.value = 0;
                muteBtn.innerHTML = icons.mute;
            } else {
                video.volume = lastVolume > 0 ? lastVolume : 1;
                volumeSlider.value = video.volume;
                muteBtn.innerHTML = icons.unmute;
            }
            updateRangeBackground(volumeSlider, true);
        });
    }

    if (speedSelect) {
        speedSelect.addEventListener("change", () => {
            video.playbackRate = speedSelect.value;
        });
    }

    if (fullscreenBtn) {
        fullscreenBtn.addEventListener("click", () => {
            if (!document.fullscreenElement) {
                container.requestFullscreen();
            } else {
                document.exitFullscreen();
            }
        });

        document.addEventListener("fullscreenchange", () => {
            fullscreenBtn.innerHTML = document.fullscreenElement ? icons.exitFullscreen : icons.fullscreen;
        });
    }
}
