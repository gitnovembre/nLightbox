import '../YT';
import uniqid from 'uniqid';

import LightboxItem from './LightboxItem';

class LightboxYoutube extends LightboxItem {
    /**
     * @param {Lightbox} lightbox
     * @param {string} key
     * @param {Object} [options]
     * @param {string} [options.src] - Youtube link
     * @param {number} [options.width = -1]
     * @param {number} [options.height = -1]
     * @param {boolean} [options.rel = true] - Toggle related videos
     * @param {boolean} [options.autoplay = false] - Toggle autoplay
     * @param {boolean} [options.controls = true] - Toggle controls
     * @param {boolean} [options.showinfo = true]
     * @param {number} [options.start = 0] - Start the video at a given timecode
     * @param {boolean} [options.allowFullscreen = true]
     */
    constructor(lightbox, key, { src, width = 854, height = 480, rel = true, autoplay = false, controls = true, showinfo = true, start = 0, allowFullscreen = true } = {}) { //eslint-disable-line
        super(lightbox, key);

        // detect youtube video id
        const regex = /(?:youtube(?:-nocookie)?\.com\/(?:[^/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
        const match = src.match(regex);

        if (match) {
            this.videoId = match[1]; // eslint-disable-line
        } else {
            this.videoId = src;
        }

        this.rel = rel === true ? 1 : 0;
        this.autoplay = autoplay === true ? 1 : 0;
        this.controls = controls === true ? 1 : 0;
        this.showinfo = showinfo === true ? 1 : 0;
        this.start = parseInt(start, 10);

        this.allowFullscreen = allowFullscreen === true;
        this.width = parseInt(width, 10);
        this.height = parseInt(height, 10);

        this.player = null;
    }

    /**
     * Loads asynchronously data and returns a Promise that serves html content
     * @return {Promise}
     */
    load() {
        const buffer = document.createElement('div');
        buffer.style.display = 'none';
        buffer.id = uniqid();
        document.body.appendChild(buffer);

        return new Promise((resolve) => {
            this.player = new YT.Player(buffer, { // eslint-disable-line
                height: this.height,
                width: this.width,
                playerVars: {
                    autoplay: this.autoplay,
                    controls: this.controls,
                    showinfo: this.showinfo,
                    rel: this.rel,
                    start: this.start,
                },
                videoId: this.videoId,
                events: {
                    onReady: (e) => {
                        const node = e.target.a;
                        node.style.display = 'block';
                        resolve(node);
                    },
                },
            });
        });
    }

    beforeClose() {
        if (this.player) {
            this.player.pauseVideo();
        }
    }

    beforeChange() {
        if (this.player) {
            this.player.pauseVideo();
        }
    }
}

LightboxYoutube.TYPE_NAME = 'youtube';

export default LightboxYoutube;
