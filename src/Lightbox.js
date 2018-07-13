import uniqid from 'uniqid'; //eslint-disable-line
import Hammer from 'hammerjs';

import { LightboxImage, LightboxVideo } from './LightboxItem';
import { LightboxUIClose, LightboxUINext, LightboxUIPrev } from './LightboxUIElement';

export default class Lightbox {
    constructor(options = {}) {
        this._uid = parseInt(options.uid, 10) || 1;
        this._onOpenCallback = typeof options.onOpen === 'function' ? options.onOpen : null;
        this._onCloseCallback = typeof options.onClose === 'function' ? options.onClose : null;
        this._closeOnBlur = typeof options.closeOnBlur === 'boolean' ? options.closeOnBlur : true;
        this._closeOnEscape = typeof options.closeOnEscape === 'boolean' ? options.closeOnEscape : true;
        this._arrowKeyNavigation = typeof options.arrowKeyNavigation === 'boolean' ? options.arrowKeyNavigation : true;

        this._elements = [];
        this._currentKey = undefined;
        this._currentIndex = -1;

        this._openState = false;
        this._loadingState = false;

        this._UI = {
            close: {
                element: null,
                active: options.ui && options.ui.close === true,
            },
            next: {
                element: null,
                active: options.ui && options.ui.controls === true,
            },
            prev: {
                element: null,
                active: options.ui && options.ui.controls === true,
            },
        };

        this._$lb = null;
        this._$lbInner = null;
        this._$lbContent = null;

        this._init();
    }

    _init() {
        // lb creation
        this._$lb = document.createElement('div');
        this._$lb.classList.add('lightbox');
        this._$lb.setAttribute('id', uniqid());

        // inner box creation
        this._$lbInner = document.createElement('div');
        this._$lbInner.classList.add('lightbox__inner');

        // UI container creation
        this._$lbUI = document.createElement('div');
        this._$lbUI.classList.add('lightbox__ui');
        this._$lbInner.appendChild(this._$lbUI);

        this._$lb.appendChild(this._$lbInner);

        this._initUI();
        this._initEvents();

        document.body.appendChild(this._$lb);
    }

    _initUI() {
        // UI elements creation
        const closeBtn = new LightboxUIClose();
        closeBtn.appendTo(this._$lbUI);
        closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.close();
        });

        if (!this._UI.close.active) {
            closeBtn.hide();
        }
        this._UI.close.element = closeBtn;


        const prevBtn = new LightboxUIPrev();
        prevBtn.appendTo(this._$lbUI);
        prevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.prev();
        });
        if (!this._UI.prev.active) {
            prevBtn.hide();
        }
        this._UI.prev.element = prevBtn;


        const nextBtn = new LightboxUINext();
        nextBtn.appendTo(this._$lbUI);
        nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.next();
        });
        if (!this._UI.next.active) {
            nextBtn.hide();
        }
        this._UI.next.element = nextBtn;


        // loader creation
        const $loader = document.createElement('p');
        $loader.className = 'lightbox__message lightbox__message_loader';
        $loader.innerHTML = 'Chargement en cours ...';
        this._$lbInner.appendChild($loader);

        // content box creation
        this._$lbContent = document.createElement('div');
        this._$lbContent.className = 'lightbox__content';
        this._$lbInner.appendChild(this._$lbContent);
    }

    _initEvents() {
        // lb events
        this._$lb.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (e.target === this._$lb && this._closeOnBlur) { // user clicks off content bounds
                this.close();
            } else if (e.target.classList.contains('lightbox__close')) { // user clicks on a child element of the lightbox which has the classname "close"
                this.close();
            } else if (e.target.classList.contains('lightbox__next')) {
                this.next();
            } else if (e.target.classList.contains('lightbox__prev')) {
                this.prev();
            }
        });

        // Touch gestures support
        const h = new Hammer(this._$lb);
        h.get('swipe').set({ direction: Hammer.DIRECTION_HORIZONTAL });
        h.get('tap').set({ taps: 2 });

        // controls when swiping
        h.on('swiperight', () => {
            this.prev();
        });
        h.on('swipeleft', () => {
            this.next();
        });

        // close on double tap
        h.on('tap', () => {
            this.close();
        });

        document.addEventListener('keydown', (e) => {
            // user can close the lightbox when pressing the escape key
            if (e.keyCode === 27 && this._closeOnEscape) {
                this.close();
            } else if (e.keyCode === 37 && this._arrowKeyNavigation) {
                this.prev();
            } else if (e.keyCode === 39 && this._arrowKeyNavigation) {
                this.next();
            }
        });

        document.addEventListener('DOMContentLoaded', () => {
            // gathers all elements in the DOM that have the same group id as the lightbox
            const elements = document.querySelectorAll(`[data-lightbox-group='${this._uid}']`);

            // index all elements / get lightbox gallery data
            this._elements = Array.from(elements).map((i) => {
                const item = i;
                const key = uniqid();
                const type = item.dataset.lightboxType;

                item.dataset.lightboxTarget = key;

                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    this._loadByKey(key);
                    this.open();
                });

                switch (type) {
                case 'image':
                    return new LightboxImage(key, item.dataset);

                case 'video':
                    return new LightboxVideo(key, item.dataset);

                default:
                    throw new Error('Invalid lightbox type');
                }
            });
        });
    }

    /**
     * Retrieve an element by key and draws it
     * @param {string} element
     */
    _loadByKey(key) {
        this._loadElement(this._elements.find(e => e.key === key));
    }

    /**
     * Retrieve an element by index and draws it
     * @param {int} i
     */
    _loadByIndex(i) {
        let index = i;

        if (index < 0) {
            index = 0;
        }
        if (index >= this._elements.length) {
            index = this._elements.length - 1;
        }

        this._loadElement(this._elements[index]);
    }

    /**
     * Retrieve an element and draws it
     * @param {LightboxItem} e
     */
    _loadElement(e) {
        const element = e;

        if (element) {
            this._$lbContent.innerHTML = '';

            if (element.loaded) { // either the image is already loaded
                this._appendElement(element);
            } else { // or we need to do it before showing it
                this._loading = true;
                this._currentKey = element.key;

                element.load().then((markup) => {
                    element.data = markup;
                }).catch(() => {
                    const mess = document.createElement('p');
                    mess.classList.add('lightbox__message', 'lightbox__message_error');
                    mess.textContent = 'Impossible de charger le contenu ...';

                    element.data = mess;
                }).finally(() => {
                    /*
                    if there is a key mismatch, it means that
                    while the element was finished loading,
                    the user had already closed the lightbox
                    and clicked on another element
                    */
                    if (this._currentKey === element.key) {
                        this._appendElement(element);
                    }
                    element.loaded = true;

                    this._loading = false;
                });
            }
        }
    }

    /**
     * Appends content of the given element
     * @param {LightboxElement} element
     */
    _appendElement(element) {
        const index = this._findIndex(element.key);

        // if the index could not be found, someone messed w/ the element list
        // (it should always find a match)
        if (index !== -1) {
            this._index = index;

            this._$lbContent.innerHTML = '';
            this._$lbContent.appendChild(element.data);
        }
    }

    /**
     * Finds the index of an element in the array based on its key
     * @param {string} key
     * @return {number}
     */
    _findIndex(key) {
        return this._elements.findIndex(e => e.key === key);
    }

    /**
     * Opens the lightbox and fires a callback
     * @return {Promise}
     */
    open() {
        return new Promise((resolve, reject) => {
            if (!this._openState) {
                this._openState = true;
                this._$lb.classList.add('active');

                if (this._onOpenCallback) this._onOpenCallback();
                resolve();
            }

            reject();
        });
    }

    /**
     * Closes the lightbox and fires a callback
     * @return {Promise}
     */
    close() {
        return new Promise((resolve, reject) => {
            if (this._openState) {
                this._openState = false;
                this._$lb.classList.remove('active');

                if (this._onCloseCallback) this._onCloseCallback();
                resolve();
            }

            reject();
        });
    }

    /**
     * Toggle the lightbox
     * @return {Promise}
     */
    toggle() {
        return this.isOpen() ? this.close() : this.open();
    }

    /**
     * Tries to load next item
     */
    next() {
        this._loadByIndex(this._currentIndex + 1);
    }

    /**
     * Tries to load previous item
     */
    prev() {
        this._loadByIndex(this._currentIndex - 1);
    }

    /**
     * Set lightbox loading state
     * @param {boolean} state
     */
    set _loading(state) {
        if (state === true) {
            this._loadingState = true;
            this._$lb.classList.add('loading');
        } else {
            this._loadingState = false;
            this._$lb.classList.remove('loading');
        }
    }

    /**
     * Get current lightbox loading state
     * @return {boolean}
     */
    get _loading() {
        return this._loadingState;
    }

    /**
     * Changes the current index
     * @param {number} index
     */
    set _index(index) {
        if (index >= 0 && index < this._elements.length) {
            this._currentIndex = index;
        }

        if (this._UI.prev.active) {
            if (this._currentIndex === 0) {
                this._UI.prev.element.disable();
            } else {
                this._UI.prev.element.enable();
            }
        }

        if (this._UI.next.active) {
            if (this._currentIndex === this._elements.length - 1) {
                this._UI.next.element.disable();
            } else {
                this._UI.next.element.enable();
            }
        }
    }

    /**
     * Get the current index
     * @return {number}
     */
    get _index() {
        return this._currentIndex;
    }

    isOpen() {
        return this._openState;
    }
}
