class LightboxItem {
    /**
     * @param {Lightbox} lightbox
     * @param {string} key
     */
    constructor(lightbox, key) {
        this.lightbox = lightbox;
        this.key = key;

        this.loaded = false;
        this.data = null;
    }
}
export class LightboxImage extends LightboxItem {
    /**
     * @param {Lightbox} lightbox
     * @param {string} key
     * @param {Object} options
     */
    constructor(lightbox, key, options) {
        super(lightbox, key);
        this.src = options.src;
        this.alt = options.alt;
        this.width = parseInt(options.width, 10);
        this.height = parseInt(options.height, 10);
    }

    /**
     * Loads asynchronously data and returns a Promise that serves html content
     * @return {Promise}
     */
    load() {
        return new Promise((resolve, reject) => {
            const img = new Image();

            img.src = this.src;
            img.alt = this.alt;

            if (this.width > 0) img.width = this.width;
            if (this.height > 0)img.height = this.height;

            img.onload = () => {
                const $figure = document.createElement('figure');
                $figure.appendChild(img);

                // const $figcaption = document.createElement('figcaption');
                // $figcaption.textContent = '';
                // $figure.appendChild($figcaption);

                resolve($figure);
            };

            img.onerror = e => reject(e.message);
        });
    }
}

export class LightboxVideo extends LightboxItem {
    /**
     * @param {Lightbox} lightbox
     * @param {string} key
     * @param {Object} options
     */
    constructor(lightbox, key, options) {
        super(lightbox, key);
        this.src = options.src;
        this.controls = options.controls === 'true';
        this.width = parseInt(options.width, 10);
        this.height = parseInt(options.height, 10);
    }

    /**
     * Loads asynchronously data and returns a Promise that serves html content
     * @return {Promise}
     */
    load() {
        return new Promise((resolve, reject) => {
            const video = document.createElement('video');
            video.controls = this._controls;

            if (this.width > 0) video.width = this.width;
            if (this.height > 0)video.height = this.height;

            const source = document.createElement('source');
            source.src = this.src;

            video.appendChild(source);

            video.oncanplay = () => resolve(video);
            video.onerror = e => reject(e.message);
        });
    }
}

export default LightboxItem;
