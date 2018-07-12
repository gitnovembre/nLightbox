class LightboxItem{
    /**
     * @param {string} key
     */
    constructor(key){
        this.key = key;

        this.loaded = false;
        this.data = null;
    }

    /**
     * Loads asynchronously data and returns a Promise that serves html content
     * @return {Promise} 
     */
    load() {
        return null;
    }
}

export class LightboxImage extends LightboxItem{
    /**
     * @param {string} key 
     * @param {DOMStringMap} options 
     */
    constructor(key, options){
        super(key);
        this._src = options.lightboxSrc;
        this._alt = options.lightboxAlt;
    }

    load() {
        return new Promise((resolve, reject) => {
            const img = new Image;
            img.src = this._src;
            img.alt = this._alt;
            img.onload = () => {
                const $figure = document.createElement('figure');
                
                const $closeBtn = document.createElement('button');
                $closeBtn.textContent = 'Close';
                $closeBtn.className = 'lightbox__close lightbox__ui lightbox__ui_close';
                $figure.appendChild($closeBtn);

                const $controlNextBtn = document.createElement('button');
                $controlNextBtn.textContent = '►';
                $controlNextBtn.className = 'lightbox__next lightbox__ui lightbox__ui_controls lightbox__ui_controls_next';
                $figure.appendChild($controlNextBtn);

                const $controlPrevBtn = document.createElement('button');
                $controlPrevBtn.textContent = '◀';
                $controlPrevBtn.className = 'lightbox__prev lightbox__ui lightbox__ui_controls lightbox__ui_controls_prev';
                $figure.appendChild($controlPrevBtn);

                $figure.appendChild(img);
            
                resolve($figure);
            }
            
            img.onerror = e => reject(e.message);
        });
    }
}
