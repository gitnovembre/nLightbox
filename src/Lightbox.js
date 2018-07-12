import uniqid from 'uniqid';

import { LightboxImage } from './LightboxItem'

class Lightbox{
    constructor(options = {}){
        this._uid = parseInt(options.uid) || 1;
        this._onOpenCallback = typeof options.onOpen === "function" ? options.onOpen : null;
        this._onCloseCallback = typeof options.onClose === "function" ? options.onClose : null;
        this._closeOnBlur = options.closeOnBlur === true;
        this._closeOnEscape = options.closeOnEscape === true;

        this._elements = [];
        this._index = undefined;

        this._openState = false;
        this._loadingState = false;

        this._$lb = null;
        this._$lbInner = null;
        this._$lbContent = null;

        this._init();
    }

    _init(){
        // lb creation
        this._$lb = document.createElement('div');
        this._$lb.classList.add('lightbox');
        this._$lb.setAttribute('id', uniqid());
      
        // lb events
        this._$lb.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            // user clicks off content bounds
            if(e.target === this._$lbInner && this._closeOnBlur){
                this.close();
            }
            // user clicks on a child element of the lightbox which has the classname "close"
            else if(e.target.classList.contains('lightbox__close')){
                this.close();
            }
        });

        document.addEventListener('keydown', (e) => {
            // user can close the lightbox when pressing the escape key
            if(e.keyCode === 27 && this._closeOnEscape){
                this.close();
            }
        });

        document.addEventListener('DOMContentLoaded', () => {
            const elements = document.querySelectorAll(`[data-lightbox-group='${this._uid}']`);
            
            // index all elements / get lightbox gallery data
            this._elements = Array.from(elements).map(item => {
                const key = uniqid();
                const source = item.dataset.lightboxSrc;
                const type = item.dataset.lightboxType;

                delete item.dataset.lightboxSrc;
                delete item.dataset.lightboxType;
                delete item.dataset.lightboxGroup;

                item.dataset.lightboxTarget = key;

                item.addEventListener('click', e => {
                    e.preventDefault();
                    this._get(key);
                    this.open();
                });

                switch(type){
                    case 'image':
                    return new LightboxImage(key, source);

                    default:
                    throw new Error('Invalid lightbox type');
                }
            });
        });

        // inner box creation
        this._$lbInner = document.createElement('div');
        this._$lbInner.classList.add('lightbox__inner');

        // loader creation
        const $loader = document.createElement('p');
        $loader.className = 'lightbox__message lightbox__message_loader';
        $loader.innerHTML = 'Chargement en cours ...';
        this._$lbInner.appendChild($loader);

        // content box creation
        this._$lbContent = document.createElement('div');
        this._$lbContent.className = 'lightbox__content';
        this._$lbInner.appendChild(this._$lbContent);


        this._$lb.appendChild(this._$lbInner);

        document.body.appendChild(this._$lb);
    }

    _get(key){
        const element = this._elements.find(e => e.key === key);

        if(element){
            this._$lbContent.innerHTML = '';

            if(element.loaded){
                this._$lbContent.appendChild(element.data);
            } 
            else{
                this._loading = true;
                this._index = key;
                
                element.load().then(markup => {
                    element.data = markup;
                }).catch(e => {
                    element.data = `<p class="lightbox__message lightbox__message_error">Impossible de charger le contenu ...</p>`;
                }).finally(() => {
                    if(this._index === key){
                        this._$lbContent.innerHTML = '';
                        this._$lbContent.appendChild(element.data);
                    }
                    element.loaded = true;

                    this._loading = false;
                });
            }
        }
    }

    open(){
        return new Promise((resolve, reject) => {
            if(!this._openState){
                this._openState = true;
                this._$lb.classList.add('active');
    
                if(this._onOpenCallback) this._onOpenCallback();
                resolve();
            }
        });
    }

    close(){
        return new Promise((resolve, reject) => {
            if(this._openState){
                this._openState = false;
                this._$lb.classList.remove('active');

                if(this._onCloseCallback) this._onCloseCallback();
                resolve();
            }
        });
    }

    toggle(){
        return this.isOpen() ? this.close() : this.open();
    }

    next(){
        return new Promise((resolve, reject) => {

        })
    }

    prev(){
        return new Promise((resolve, reject) => {
            
        })
    }

    /**
     * Set lightbox loading state
     * @param {boolean} state
     */
    set _loading(state){
        if(state === true){
            this._loadingState = true;
            this._$lb.classList.add('loading');
        }
        else{
            this._loadingState = false;
            this._$lb.classList.remove('loading');
        }
    }

    /**
     * Get current lightbox loading state
     * @return {boolean}
     */
    get _loading(){
        return this._loadingState;
    }

    isOpen(){
        return this._openState;
    }
}

export default Lightbox;