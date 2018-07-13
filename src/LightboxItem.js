class LightboxItem {
    /**
     * @param {string} key
     */
    constructor(key) {
        this.key = key;

        this.loaded = false;
        this.data = null;
    }
}
export class LightboxImage extends LightboxItem {
    /**
     * @param {string} key
     * @param {DOMStringMap} options
     */
    constructor(key, options) {
        super(key);
        this._src = options.lightboxSrc;
        this._alt = options.lightboxAlt;
    }

    /**
     * Loads asynchronously data and returns a Promise that serves html content
     * @return {Promise}
     */
    load() {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = this._src;
            img.alt = this._alt;
            img.onload = () => {
                const $figure = document.createElement('figure');
                $figure.appendChild(img);

                resolve($figure);
            };

            img.onerror = e => reject(e.message);
        });
    }
}

export class LightboxVideo extends LightboxItem {
    /**
     * @param {string} key
     * @param {DOMStringMap} options
     */
    constructor(key, options) {
        super(key);
        this._src = options.lightboxSrc;
        this._controls = options.lightboxControls === 'true';
        this._width = parseInt(options.lightboxWidth, 10);
        this._height = parseInt(options.lightboxHeight, 10);
    }

    /**
     * Loads asynchronously data and returns a Promise that serves html content
     * @return {Promise}
     */
    load() {
        return new Promise((resolve, reject) => {
            const video = document.createElement('video');
            video.controls = this._controls;

            if (this._width > 0) video.width = this._width;
            if (this._height > 0)video.height = this._height;

            const source = document.createElement('source');
            source.src = this._src;

            video.appendChild(source);

            video.oncanplay = () => resolve(video);
            video.onerror = e => reject(e.message);
        });
    }
}

export default LightboxItem;
