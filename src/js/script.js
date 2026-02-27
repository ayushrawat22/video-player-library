import initVideoPlayer from './videoPlayerAyush';
import '../sass/main.scss';

//was given like this in the doc shared
document.addEventListener("DOMContentLoaded", () => {
    initVideoPlayer({
        videoElement: "#guitarVideo",
        container: ".video__player",
        controls: {
            volume: true,
            fullscreen: true,
            playbackSpeed: true
        },
        defaults: {
            volume: 0.8,
            speed: 1
        }
    });
});
