import GoogleMapsLoader from 'google-maps';

import LightboxItem from './LightboxItem';

class LightboxMap extends LightboxItem {
    /**
     * @param {Lightbox} lightbox
     * @param {string} key
     * @param {Object} [options]
     * @param {string} [options.API_KEY] - Google Map API key
     * @param {string} [options.lang = fr] - Language
     * @param {number} [options.lat = 0.0]
     * @param {number} [options.lng = 0.0]
     * @param {number} [options.zoom = 8]
     * @param {number} [options.width = 1024]
     * @param {number} [options.height = 720]
     * @param {string} [options.styles]
     */
    constructor(lightbox, key, { api_key, lang = 'fr', lat = 0.0, lng = 0.0, zoom = 8, width = 1024, height = 720, styles = [] }) { // eslint-disable-line
        super(lightbox, key);

        this.api_key = api_key; // eslint-disable-line
        this.lang = lang;
        this.lat = parseFloat(lat);
        this.lng = parseFloat(lng);
        this.zoom = parseInt(zoom, 10);
        this.width = parseInt(width, 10);
        this.height = parseInt(height, 10);
        this.styles = styles;
    }

    /**
     * Loads asynchronously data and returns a Promise that serves html content
     * @return {Promise}
     */
    load() { // eslint-disable-line
        return new Promise((resolve, reject) => {
            if (!GoogleMapsLoader) {
                reject();
            }

            // Google Map API config
            GoogleMapsLoader.KEY = this.api_key;
            GoogleMapsLoader.LANGUAGE = this.lang;

            GoogleMapsLoader.load((google) => {
                const node = document.createElement('div');

                node.classList.add('map');
                node.style.width = `${this.width}px`;
                node.style.height = `${this.height}px`;

                new google.maps.Map(node, { // eslint-disable-line
                    center: { lat: this.lat, lng: this.lng },
                    zoom: this.zoom,
                    keyboardShortcuts: false,
                    styles: this.styles,
                });

                resolve(node);
            });
        });
    }
}

LightboxMap.TYPE_NAME = 'map';

export default LightboxMap;
