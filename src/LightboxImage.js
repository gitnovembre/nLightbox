import LightboxItem from './LightboxItem';

class LightboxImage extends LightboxItem {
    /**
     * @param {Lightbox} lightbox
     * @param {string} key
     * @param {Object} options
     */
    constructor(lightbox, key, { src, width = -1, height = -1, alt = '' } = {}) { //eslint-disable-line
        super(lightbox, key);
        this.src = src;
        this.alt = alt;
        this.width = parseInt(width, 10);
        this.height = parseInt(height, 10);
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

                resolve($figure);
            };

            img.onerror = (e) => reject(e.message);
        });
    }
}

LightboxImage.TYPE_NAME = 'image';

export default LightboxImage;
