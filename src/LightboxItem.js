class LightboxItem{
    constructor(key, source){
        this.key = key;
        this.source = source;

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
    constructor(key, source){
        super(key, source);
    }

    load() {
        return new Promise((resolve, reject) => {
            const img = new Image;
            img.src = this.source;
            img.onload = () => {
                const $figure = document.createElement('figure');
                $figure.appendChild(img);

                resolve($figure);
            }
            
            img.onerror = e => reject(e.message);
        });
    }
}
