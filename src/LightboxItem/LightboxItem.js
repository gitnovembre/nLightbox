class LightboxItem {
    /**
     * @param {Lightbox} lightbox
     * @param {string} key
     */
    constructor(lightbox, key) {
        this.lightbox = lightbox;
        this.key = key;

        this.loaded = false;
        this.loading = false;
        this.failed = false;
        this.data = null;
    }
}

LightboxItem.TYPE_NAME = 'default';

export default LightboxItem;
