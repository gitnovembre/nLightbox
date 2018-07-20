import LightboxItem from './LightboxItem';

class LightboxYoutube extends LightboxItem {
    /**
     * @param {Lightbox} lightbox
     * @param {string} key
     * @param {Object} options
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
    }

    /**
     * Loads asynchronously data and returns a Promise that serves html content
     * @return {Promise}
     */
    load() {
        const iframe = document.createElement('iframe');
        if (this.width > 0) iframe.width = this.width;
        if (this.height > 0)iframe.height = this.height;

        iframe.frameBorder = 0;
        iframe.src = `https://www.youtube.com/embed/${this.videoId}?autoplay=${this.autoplay}&rel=${this.rel}&controls=${this.controls}&showinfo=${this.showinfo}&start=${this.start}`;
        iframe.allow = 'autoplay; encrypted-media';
        iframe.allowFullscreen = this.allowFullscreen;

        return iframe;
    }
}

LightboxYoutube.TYPE_NAME = 'youtube';

export default LightboxYoutube;
