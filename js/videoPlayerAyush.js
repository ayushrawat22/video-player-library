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
        play: `<svg class="video__player--icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M16.6582 9.28638C18.098 10.1862 18.8178 10.6361 19.0647 11.2122C19.2803 11.7152 19.2803 12.2847 19.0647 12.7878C18.8178 13.3638 18.098 13.8137 16.6582 14.7136L9.896 18.94C8.29805 19.9387 7.49907 20.4381 6.83973 20.385C6.26501 20.3388 5.73818 20.0469 5.3944 19.584C5 19.053 5 18.1108 5 16.2264V7.77357C5 5.88919 5 4.94701 5.3944 4.41598C5.73818 3.9531 6.26501 3.66111 6.83973 3.6149C7.49907 3.5619 8.29805 4.06126 9.896 5.05998L16.6582 9.28638Z"/></svg>`,
        pause: `<svg class="video__player--icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 5V19M16 5V19"/></svg>`,
        mute: `<svg class="video__player--icon" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>`,
        unmute: `<svg class="video__player--icon" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`,
        fullscreen: `<svg class="video__player--icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9.00002 3.99998H4.00004L4 9M20 8.99999V4L15 3.99997M15 20H20L20 15M4 15L4 20L9.00002 20"/></svg>`,
        exitFullscreen: `<svg class="video__player--icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="transform: scale(0.9); opacity: 0.8;"><path d="M9.00002 3.99998H4.00004L4 9M20 8.99999V4L15 3.99997M15 20H20L20 15M4 15L4 20L9.00002 20"/></svg>`,
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

    // Dynamic track background coloring function for range sliders
    function updateRangeBackground(slider, isVolume = false) {
        if (!slider) return;
        const value = isVolume ? slider.value * 100 : slider.value;
        slider.style.background = `linear-gradient(to right, white ${value}%, rgba(255,255,255,0.2) ${value}%)`;
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
