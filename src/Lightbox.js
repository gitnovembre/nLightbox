import uniqid from 'uniqid'; //eslint-disable-line
import Hammer from 'hammerjs';

import { LightboxImage, LightboxVideo, LightboxYoutubeVideo } from './LightboxItem';
import { LightboxUIClose, LightboxUINext, LightboxUIPrev, LightboxUIPagination } from './LightboxUIElement'; //eslint-disable-line

export default class Lightbox {
    constructor(customOptions = {}) {
        const options = Object.assign(Lightbox.DEFAULT_CONFIG, customOptions);

        this.UId = parseInt(options.uid, 10) || 1;

        this.closeOnBlur = options.closeOnBlur === true;
        this.closeOnEscape = options.closeOnEscape === true;
        this.arrowKeyNavigation = options.arrowKeyNavigation === true;

        this.observers = {
            [Lightbox.EVENT_ONCLOSE]: null,
            [Lightbox.EVENT_ONOPEN]: null,
            [Lightbox.EVENT_ONCHANGE_BEFORE]: null,
            [Lightbox.EVENT_ONCHANGE_AFTER]: null,
        };

        this.elements = [];
        this.currentKey = undefined;
        this.currentIndex = -1;

        this.openState = false;
        this.loadingState = false;

        this.UI = {
            close: {
                element: null,
                active: options.ui.close === true,
            },
            next: {
                element: null,
                active: options.ui.controls === true,
            },
            prev: {
                element: null,
                active: options.ui.controls === true,
            },
            pagination: {
                element: null,
                active: options.ui.pagination === true,
            },
        };

        this.$lb = null;
        this.$lbInner = null;
        this.$lbContent = null;
    }

    init() {
        // lb creation
        this.$lb = document.createElement('div');
        this.$lb.classList.add('lightbox');
        this.$lb.setAttribute('id', uniqid());

        // inner box creation
        this.$lbInner = document.createElement('div');
        this.$lbInner.classList.add('lightbox__inner');

        // UI container creation
        this.$lbUI = document.createElement('div');
        this.$lbUI.classList.add('lightbox__ui');
        this.$lbInner.appendChild(this.$lbUI);

        this.$lb.appendChild(this.$lbInner);

        this._initUI();
        this._initEvents();

        document.body.appendChild(this.$lb);
    }

    _initUI() {
        // UI elements creation
        const closeBtn = new LightboxUIClose();
        closeBtn.appendTo(this.$lbUI);
        closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.close();
        });

        if (!this.UI.close.active) {
            closeBtn.hide();
        }
        this.UI.close.element = closeBtn;


        const prevBtn = new LightboxUIPrev();
        prevBtn.appendTo(this.$lbUI);
        prevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.prev();
        });
        if (!this.UI.prev.active) {
            prevBtn.hide();
        }
        this.UI.prev.element = prevBtn;


        const nextBtn = new LightboxUINext();
        nextBtn.appendTo(this.$lbUI);
        nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.next();
        });
        if (!this.UI.next.active) {
            nextBtn.hide();
        }
        this.UI.next.element = nextBtn;


        // pagination creation
        const paginationEl = new LightboxUIPagination();
        paginationEl.appendTo(this.$lbUI);
        if (!this.UI.pagination.active) {
            paginationEl.hide();
        }
        this.UI.pagination.element = paginationEl;


        // loader creation
        const $loader = document.createElement('p');
        $loader.className = 'lightbox__message lightbox__message_loader';
        $loader.innerHTML = 'Chargement en cours ...';
        this.$lbInner.appendChild($loader);

        // content box creation
        this.$lbContent = document.createElement('div');
        this.$lbContent.className = 'lightbox__content';
        this.$lbInner.appendChild(this.$lbContent);
    }

    _initEvents() {
        // lb events
        this.$lb.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (e.target === this.$lb && this.closeOnBlur) { // user clicks off content bounds
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
        const h = new Hammer(this.$lb);

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
            if (e.keyCode === 27 && this.closeOnEscape) {
                this.close();
            } else if (e.keyCode === 37 && this.arrowKeyNavigation) {
                this.prev();
            } else if (e.keyCode === 39 && this.arrowKeyNavigation) {
                this.next();
            }
        });

        document.addEventListener('DOMContentLoaded', () => {
            // gathers all elements in the DOM that have the same group id as the lightbox
            const elements = document.querySelectorAll('[data-lightbox]');

            // index all elements / get lightbox gallery data
            this.elements = Array.from(elements).map((node) => ({
                data: JSON.parse(node.dataset.lightbox),
                key: uniqid(),
                item: node,
            })).filter((element) => element.data.group === this.UId).map((element) => {
                const { key, data, item } = element;
                item.dataset.lightboxTarget = key;

                element.item.addEventListener('click', (e) => {
                    e.preventDefault();
                    this._loadByKey(element.key);
                    this.open();
                });

                // TODO: Enable custom types support
                switch (element.data.type) {
                case 'image':
                    return new LightboxImage(this, key, data);

                case 'video':
                    return new LightboxVideo(this, key, data);

                case 'youtube':
                    return new LightboxYoutubeVideo(this, key, data);

                default:
                    throw new Error('Invalid lightbox type');
                }
            });
        });
    }

    on(eventName, callback) {
        if (typeof callback !== 'function') {
            throw new Error('Callback must be a function');
        }
        if (!Object.prototype.hasOwnProperty.call(this.observers, eventName)) {
            throw new Error(`Undefined event name : ${eventName}`);
        }

        this.observers[eventName] = callback;
    }

    /**
     * Retrieve an element by key and draws it
     * @param {string} element
     */
    _loadByKey(key) {
        if (this.currentKey !== key) {
            this._loadElement(this.elements.find((e) => e.key === key));
        }
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
        if (index >= this.elements.length) {
            index = this.elements.length - 1;
        }

        if (this.currentIndex !== i) {
            this._loadElement(this.elements[index]);
        }
    }

    /**
     * Retrieve an element and draws it
     * @param {LightboxItem} e
     */
    _loadElement(e) {
        const element = e;
        const prevElement = this.elements[this.currentIndex];

        if (element) {
            if (this.observers[Lightbox.EVENT_ONCHANGE_BEFORE] !== null) {
                this.observers[Lightbox.EVENT_ONCHANGE_BEFORE](prevElement, element);
            }

            this.$lbContent.innerHTML = '';

            if (element.loaded) { // either the image is already loaded
                this._appendElement(element);
            } else { // or we need to do it before showing it
                this._loading = true;
                this.currentKey = element.key;

                Promise.resolve(element.load()).then((markup) => {
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
                    if (this.currentKey === element.key) {
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

            this.$lbContent.innerHTML = '';
            this.$lbContent.appendChild(element.data);

            if (this.observers[Lightbox.EVENT_ONCHANGE_AFTER] !== null) {
                this.observers[Lightbox.EVENT_ONCHANGE_AFTER](element);
            }
        }
    }

    /**
     * Finds the index of an element in the array based on its key
     * @param {string} key
     * @return {number}
     */
    _findIndex(key) {
        return this.elements.findIndex((e) => e.key === key);
    }

    /**
     * Opens the lightbox and fires a callback
     * @return {Promise}
     */
    open() {
        return new Promise((resolve, reject) => {
            if (!this.openState) {
                this.openState = true;
                this.$lb.classList.add('active');

                if (this.observers[Lightbox.EVENT_ONOPEN] !== null) {
                    this.observers[Lightbox.EVENT_ONOPEN]();
                }
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
            if (this.openState) {
                this.openState = false;
                this.$lb.classList.remove('active');

                if (this.observers[Lightbox.EVENT_ONCLOSE] !== null) {
                    this.observers[Lightbox.EVENT_ONCLOSE]();
                }
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
        this._loadByIndex(this.currentIndex + 1);
    }

    /**
     * Tries to load previous item
     */
    prev() {
        this._loadByIndex(this.currentIndex - 1);
    }

    /**
     * Tries to load an item based on its index
     */
    jumpTo(i) {
        this._loadByIndex(i);
    }

    /**
     * Set lightbox loading state
     * @param {boolean} state
     */
    set _loading(state) {
        if (state === true) {
            this.loadingState = true;
            this.$lb.classList.add('loading');
        } else {
            this.loadingState = false;
            this.$lb.classList.remove('loading');
        }
    }

    /**
     * Get current lightbox loading state
     * @return {boolean}
     */
    get _loading() {
        return this.loadingState;
    }

    /**
     * Changes the current index
     * @param {number} index
     */
    set _index(index) {
        if (index === this.currentIndex) {
            return;
        }

        if (index >= 0 && index < this.elements.length) {
            this.currentIndex = index;
        }

        if (this.UI.prev.active) {
            if (this.currentIndex === 0) {
                this.UI.prev.element.disable();
            } else {
                this.UI.prev.element.enable();
            }
        }

        if (this.UI.next.active) {
            if (this.currentIndex === this.elements.length - 1) {
                this.UI.next.element.disable();
            } else {
                this.UI.next.element.enable();
            }
        }

        if (this.UI.pagination.active) {
            this.UI.pagination.element.innerHTML = `<span>${this.currentIndex + 1}</span> / <span>${this.elements.length}</span>`;
        }
    }

    /**
     * Get the current index
     * @return {number}
     */
    get _index() {
        return this.currentIndex;
    }

    isOpen() {
        return this.openState;
    }
}

Lightbox.DEFAULT_CONFIG = {
    uid: 1,
    closeOnBlur: true,
    closeOnEscape: true,
    arrowKeyNavigation: true,
    ui: {
        close: true,
        controls: true,
        pagination: true,
    },
};


Lightbox.EVENT_ONCLOSE = 'close';
Lightbox.EVENT_ONOPEN = 'open';
Lightbox.EVENT_ONCHANGE_BEFORE = 'change.before';
Lightbox.EVENT_ONCHANGE_AFTER = 'change.after';
