import LightboxItem from './LightboxItem';

class LightboxVideo extends LightboxItem {
    /**
     * @param {Lightbox} lightbox
     * @param {string} key
     * @param {Object} options
     */
    constructor(lightbox, key, { src, width = 854, height = 480, autoplay = false, controls = true } = {}) { //eslint-disable-line
        super(lightbox, key);

        this.src = src;
        this.autoplay = autoplay === true;
        this.controls = controls === true;
        this.width = parseInt(width, 10);
        this.height = parseInt(height, 10);
    }

    /**
     * Loads asynchronously data and returns a Promise that serves html content
     * @return {Promise}
     */
    load() {
        return new Promise((resolve, reject) => {
            const video = document.createElement('video');

            video.autoplay = this.autoplay;
            video.controls = this.controls;

            if (this.width > 0) video.width = this.width;
            if (this.height > 0)video.height = this.height;

            const source = document.createElement('source');
            source.src = this.src;

            video.appendChild(source);

            video.oncanplay = () => resolve(video);
            video.onerror = (e) => reject(e.message);
        });
    }
}

LightboxVideo.TYPE_NAME = 'video';

export default LightboxVideo;
