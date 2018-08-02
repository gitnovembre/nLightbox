import uniqid from 'uniqid'; //eslint-disable-line
import Hammer from 'hammerjs';
import anime from 'animejs';
import ObjectAssignDeep from 'object-assign-deep';

import LightboxImage from './LightboxItem/LightboxImage';
import LightboxVideo from './LightboxItem/LightboxVideo';
import LightboxYoutube from './LightboxItem/LightboxYoutube';
import LightboxMap from './LightboxItem/LightboxMap';

import {
    LightboxUIClose,
    LightboxUINext,
    LightboxUIPrev,
    LightboxUIPagination,
    LightboxUIBulletlist,
} from './LightboxUI/LightboxUIElement'; //eslint-disable-line

const randomInt = (a, b) => {
    const min = Math.ceil(a);
    const max = Math.floor(b);
    return Math.floor(Math.random() * (max - min)) + min;
};

export default class Lightbox {
    /**
     * @param {object} [customOptions]
     * @param {number} [customOptions.uid] - Unique identifier that is used to group lightbox elements
     * @param {boolean} [customOptions.enableCloseOnBlur = true] - Toggle the action of closing the lightbox on clicking outside of the content
     * @param {boolean} [customOptions.enableCloseOnEscape = true] - Toggle the action of closing the lightbox on pressing escape
     * @param {boolean} [customOptions.enableArrowKey = true] - Toggle the use of arrow keys navigation < >
     * @param {boolean} [customOptions.enableAnimations = true] - Disable / enable animation transitions
     * @param {boolean} [customOptions.enableCloseUI = true] - Toggle the display of the close button
     * @param {boolean} [customOptions.enableNavUI = true] - Toggle the display of the controls (previous / next) buttons
     * @param {boolean} [customOptions.enablePaginationUI = true] - Toggle the display of the pagination information
     * @param {boolean} [customOptions.enableBulletlistUI = true] - Toggle the display of the bullelist nav
     * @param {object} [customOptions.animations = {}]
     * @param {object} [customOptions.animations.open] - Open animation
     * @param {object} [customOptions.animations.close] - Close animation
     * @param {object} [customOptions.animations.showElement] - Element display animation
     */
    constructor(customOptions = {}) {
        // deep copy
        this.options = ObjectAssignDeep.noMutate(Lightbox.DEFAULT_CONFIG, customOptions);

        if (typeof this.options.animations.open !== 'function') {
            throw new Error('Invalid open animation');
        }
        if (typeof this.options.animations.close !== 'function') {
            throw new Error('Invalid open animation');
        }
        if (typeof this.options.animations.showElement !== 'function') {
            throw new Error('Invalid open animation');
        }

        this.observers = {
            [Lightbox.EVENT_ONCLOSE]: null,
            [Lightbox.EVENT_ONOPEN]: null,
            [Lightbox.EVENT_ONCHANGE_BEFORE]: null,
            [Lightbox.EVENT_ONCHANGE_AFTER]: null,
        };

        this.types = {
            [LightboxImage.TYPE_NAME]: LightboxImage,
            [LightboxVideo.TYPE_NAME]: LightboxVideo,
            [LightboxYoutube.TYPE_NAME]: LightboxYoutube,
            [LightboxMap.TYPE_NAME]: LightboxMap,
        };

        this.elements = [];
        this.currentLoadingKey = undefined;
        this.currentIndex = -1;
        this.direction = Lightbox.DIRECTION_NONE;

        this.openState = false;
        this.loadingState = false;

        this.UI = {
            close: null,
            next: null,
            prev: null,
            pagination: null,
            bulletlist: null,
        };

        this.$lb = null;
        this.$lbInner = null;
        this.$lbContent = null;
    }

    /**
     * Custom types object derived from LightboxItem
     * @param {array} customTypes
     */
    init(customTypes = []) {
        // register custom types
        customTypes.forEach((typeClass) => {
            if (!typeClass.TYPE_NAME) {
                throw new Error(`Invalid Lightbox type : ${typeClass.TYPE_NAME}`);
            }
            if (this._typeExists(typeClass.TYPE_NAME)) {
                throw new Error(`Cannot overwrite existing Lightbox type, ${typeClass.TYPE_NAME}`);
            }
            this.types[typeClass.TYPE_NAME] = typeClass;
        });

        // lb creation
        this.$lb = document.createElement('div');
        this.$lb.classList.add('lightbox');
        this.$lb.setAttribute('id', this.options.uid);

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


        this._autoOpenDetect();
    }

    /**
     * Detect in fragment URL parameters to trigger the lightbox automatically
     * #####################
     * # Parameters list : #
     * #####################
     * g : Lightbox UID
     * k : key - Target an element by key
     * i : index - Target an element by index
     * d : delay - Wait X ms after the lightbox has been initialized
     * s : scroll - Wait for a specific scroll height
     * f : force - Force the lightbox to switch to the target element even
     * if it is already open
     *
     * Example localhost:80/#g:l1+k:test+d:200
     */
    _autoOpenDetect() {
        /**
         * Hashmark detection
         */
        const hashmark = window.location.hash.substr(1);
        const regex = /&?([a-z])=(\w{0,})/g;

        const result = {};

        // read URL fragment
        let match = regex.exec(hashmark);
        while (match != null) {
            const key = match[1] || undefined;
            const value = match[2] || undefined;

            if (key && value) {
                result[key] = value;
            }
            match = regex.exec(hashmark);
        }

        // try to load the element if it exists
        if (result.g === this.options.uid) {
            let index;
            if (result.k) {
                index = this.keyExists(result.k) ? this._findIndex(result.k) : 0;
            } else if (result.i === 'first') {
                index = 0;
            } else if (result.i === 'last') {
                index = this.count() - 1;
            } else if (result.i === 'random') {
                index = randomInt(0, this.count());
            } else {
                index = parseInt(result.i || 0, 10);
            }

            const delay = parseInt(result.d || -1, 10);
            const scrollTop = parseInt(result.s || -1, 10);
            const force = parseInt(result.f || 1, 10) === 1;

            if (scrollTop > 0) {
                // if scroll paramter is present, handle scroll then delay
                const scrollFunc = () => {
                    const maxScrollableHeight = document.body.clientHeight - window.innerHeight;

                    if (window.scrollY >= result.s || window.scrollY >= maxScrollableHeight) {
                        if (delay > 0) {
                            setTimeout(() => this._safeOpenThenLoad(index, force), delay);
                        } else {
                            this._safeOpenThenLoad(index, force);
                        }
                        window.removeEventListener('scroll', scrollFunc);
                    }
                };

                window.addEventListener('scroll', scrollFunc);
            } else if (delay > 0) {
                // handle delay
                setTimeout(() => this._safeOpenThenLoad(index, force), delay);
            } else {
                this._safeOpenThenLoad(index, force);
            }
        }
    }

    /**
     * Open then load the element by index
     * @param {number} index
     * @param {boolean} force - If false and the lightbox is already open
     * it cancels loading the new element
     */
    _safeOpenThenLoad(index, force) {
        if (!this.isOpen()) {
            this.open().then(() => {
                this.direction = Lightbox.DIRECTION_NONE;
                this._loadAndDisplayByIndex(index);
            });
        } else if (force) {
            this.direction = Lightbox.DIRECTION_NONE;
            this._loadAndDisplayByIndex(index);
        }
    }

    _initUI() {
        // UI elements creation
        const closeBtn = new LightboxUIClose(this);
        closeBtn.appendTo(this.$lbUI);
        closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.close();
        });

        if (!this.options.enableCloseUI) {
            closeBtn.hide();
        }
        this.UI.close = closeBtn;


        const prevBtn = new LightboxUIPrev(this);
        prevBtn.appendTo(this.$lbUI);
        prevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.prev();
        });
        if (!this.options.enableNavUI) {
            prevBtn.hide();
        }
        this.UI.prev = prevBtn;


        const nextBtn = new LightboxUINext(this);
        nextBtn.appendTo(this.$lbUI);
        nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.next();
        });
        if (!this.options.enableNavUI) {
            nextBtn.hide();
        }
        this.UI.next = nextBtn;


        // pagination creation
        const paginationEl = new LightboxUIPagination(this);
        paginationEl.appendTo(this.$lbUI);
        if (!this.options.enablePaginationUI) {
            paginationEl.hide();
        }
        this.UI.pagination = paginationEl;


        // pagination creation
        const bulletlistEl = new LightboxUIBulletlist(this);
        bulletlistEl.appendTo(this.$lbUI);
        if (!this.options.enableBulletlistUI) {
            bulletlistEl.hide();
        }
        this.UI.bulletlist = bulletlistEl;


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

            if (e.target === this.$lb && this.options.enableCloseOnBlur) {
                // user clicks off content bounds
                this.close();
            } else if (e.target.classList.contains('lightbox__close')) {
                // user clicks on a child element of the lightbox which has the classname "close"
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
        h.on('swiperight', (e) => {
            if (e.pointerType !== 'mouse') {
                this.prev();
            }
        });
        h.on('swipeleft', (e) => {
            if (e.pointerType !== 'mouse') {
                this.next();
            }
        });

        // close on double tap
        h.on('tap', (e) => {
            if (e.pointerType !== 'mouse') {
                this.close();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (this.isOpen()) {
                // user can close the lightbox when pressing the escape key
                if (e.keyCode === 27 && this.options.enableCloseOnEscape) {
                    this.close();
                } else if (e.keyCode === 37 && this.options.enableArrowKey) {
                    this.prev();
                } else if (e.keyCode === 39 && this.options.enableArrowKey) {
                    this.next();
                }
            }
        });


        // gathers all elements in the DOM that have the same group id as the lightbox
        const elements = document.querySelectorAll('[data-lightbox]');

        // index all elements / get lightbox gallery data
        this.elements = Array.from(elements).map((node) => {
            const { key, ...dataset } = JSON.parse(node.dataset.lightbox);
            return {
                dataset,
                key: (key || uniqid()),
                item: node,
            };
        }).filter((element) => element.dataset.group === this.options.uid).map(
            this._createElement.bind(this),
        );
    }

    /**
     * Create a new lightbox element and appends it to the elements list
     * @param {object} protoElement
     * @param {string} protoElement.key - Unique identifier
     * @param {object} protoElement.dataset - List of options depending on the type of item
     * @param {Node} protoElement.item - Target DOM node element binded to the lightbox item
     */
    _createElement(protoElement) {
        const { key, dataset, item } = protoElement;

        if (item) {
            item.dataset.lightboxTarget = key;

            item.addEventListener('click', (e) => {
                e.preventDefault();

                this._reset();

                this.open().then(() => {
                    this.direction = Lightbox.DIRECTION_NONE;
                    this._loadAndDisplayByKey(key);
                });
            });
        }

        // check if type is registered
        if (!this._typeExists(dataset.type)) {
            throw new Error('Invalid lightbox type');
        }

        const CustomType = this.types[dataset.type];
        return new CustomType(this, key, dataset);
    }

    /**
     * Feed raw data to the lightbox directly and initialize lightbox elements
     * @param {array|string} userData
     * @param {string} data.target - Name of the target DOM element
     * that will be binded to the lightbox item
     * @param {object} data.dataset - List of options depending on the lightbox item
     */
    feed(userData) {
        let data = userData;

        if (typeof userData === 'string') {
            data = JSON.parse(userData);
        }

        const temp = data.map(({ target, key, ...dataset }) => this._createElement({
            dataset,
            key: (key || uniqid()),
            item: document.querySelector(target),
        }));

        this.elements = [...this.elements, ...temp];
    }

    /**
     * Check if a lightbox type is registered
     * @param {string} name
     * @return {boolean}
     */
    _typeExists(name) {
        return Object.hasOwnProperty.call(this.types, name);
    }

    /**
     * Hook a callback on a given event
     * @param {string} eventName
     * @return {function} callback
     */
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
    _loadAndDisplayByKey(key) {
        this._loadAndDisplayElement(this.elements.find((e) => e.key === key));
    }

    /**
     * Retrieve an element by key and draws it
     * @param {string} key
     * @return {boolean}
     */
    keyExists(key) {
        return this.elements.find((e) => e.key === key) !== undefined;
    }

    /**
     * Retrieve an element by index and draws it
     * @param {int} i
     */
    _loadAndDisplayByIndex(i) {
        let index = i;

        if (index < 0) {
            index = 0;
        }
        if (index >= this.elements.length) {
            index = this.elements.length - 1;
        }

        this._loadAndDisplayElement(this.elements[index]);
    }

    /**
     * Loads an element without displaying it after
     * @param {LightboxItem} e
     */
    _preloadElement(e) {
        return new Promise((resolve, reject) => {
            const element = e;

            if (!element) {
                reject(new Error('Invalid element provided'));
            }
            if (element.loaded || element.loading) {
                reject(new Error('Cannot preload element, it is either loading or already loaded'));
            }

            element.loading = true;

            // Content container creation
            const container = document.createElement('div');
            container.classList.add('lightbox__container');
            container.id = element.key;

            Promise.resolve(element.load()).then((markup) => {
                // check lb if inner content is valid
                if (!(typeof markup === 'object')) {
                    throw new Error('Lightbox item load function must return a valid Node object');
                }
                container.appendChild(markup);
            }).catch((error) => {
                // flag element error
                element.failed = true;

                const mess = document.createElement('p');
                mess.classList.add('lightbox__message', 'lightbox__message_error', 'lightbox__message_nopointerevent');
                mess.innerHTML = `
                    Impossible de charger le contenu
                    <span class="error_message">(${error instanceof Error ? error.message : error})</span>
                `;
                container.appendChild(mess);
            }).finally(() => {
                this.$lbContent.appendChild(container);
                element.container = container;

                // Remove loading flag
                element.loaded = true;
                element.loading = false;

                resolve();
            });
        });
    }

    /**
     * Retrieve an element and displays it
     * @param {LightboxItem} e
     */
    _loadAndDisplayElement(e) {
        const element = e;

        if (element && (element.loaded || !element.loading)) {
            const prevElement = this.elements[this.currentIndex];

            // in case the element is already displayed
            if (element === prevElement) {
                return;
            }

            if (this.observers[Lightbox.EVENT_ONCHANGE_BEFORE] !== null) {
                this.observers[Lightbox.EVENT_ONCHANGE_BEFORE](prevElement, element);
            }

            const beforeChange = () => {
                if (prevElement && typeof prevElement.beforeChange === 'function') {
                    prevElement.beforeChange();
                }
            };

            // cleanup previous element
            this._reset();

            if (element.loaded) { // either the image is already loaded
                beforeChange();
                this._showElement(element);
            } else { // or we need to do it before showing it
                // Load flags
                this._loading = true;
                this.currentLoadingKey = element.key;

                this._preloadElement(element).then(() => {
                    this._loading = false;

                    /*
                    if there is a key mismatch, it means that
                    while the element was finished loading,
                    the user had already closed the lightbox
                    and clicked on another element
                    */
                    if (this.currentLoadingKey === element.key) {
                        beforeChange();
                        this._showElement(element);
                    }
                });
            }
        }
    }

    /**
     * Shows content of the given element
     * @param {LightboxElement} element
     */
    _showElement(element) {
        const index = this._findIndex(element.key);

        if (element.failed) {
            this.disableUI();
        } else {
            this.enableUI();
        }

        // if the index could not be found, someone messed w/ the element list
        // (it should always find a match)
        if (index !== -1) {
            this._index = index;
            const target = element.container;

            if (this.options.enableAnimations) {
                /**
                 * ANIMATION
                 */
                this.$lb.classList.add('animating');
                target.classList.add('active');

                const animation = this.options.animations.showElement(target, this.direction);

                animation.complete = () => {
                    this.$lb.classList.remove('animating');

                    if (this.observers[Lightbox.EVENT_ONCHANGE_AFTER] !== null) {
                        this.observers[Lightbox.EVENT_ONCHANGE_AFTER](element);
                    }
                };
            } else { // no animation
                target.classList.add('active');

                if (this.observers[Lightbox.EVENT_ONCHANGE_AFTER] !== null) {
                    this.observers[Lightbox.EVENT_ONCHANGE_AFTER](element);
                }
            }
        }
    }

    /**
     * Hides content of the given element
     * @param {LightboxElement} element
     */
    _hideElement(element) { // eslint-disable-line
        if (element && element.container) {
            const target = element.container;
            target.classList.remove('active');
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
                // open callback to active container
                const element = this.elements[this.currentIndex];
                if (element && typeof element.beforeOpen === 'function') {
                    element.beforeOpen();
                }

                this.$lb.classList.add('active');
                this.$lb.classList.add('animating');

                const animation = this.options.animations.open(this.$lb);

                animation.complete = () => {
                    if (this.observers[Lightbox.EVENT_ONOPEN] !== null) {
                        this.observers[Lightbox.EVENT_ONOPEN]();
                    }
                    this.$lb.classList.remove('animating');
                    this.openState = true;
                    resolve();
                };
            } else {
                reject();
            }
        });
    }

    /**
     * Closes the lightbox and fires a callback
     * @return {Promise}
     */
    close() {
        return new Promise((resolve, reject) => {
            if (this.openState) {
                this.$lb.classList.add('animating');

                const animation = this.options.animations.close(this.$lb);

                animation.complete = () => {
                    this.$lb.classList.remove('active');
                    this.$lb.classList.remove('animating');

                    this.direction = Lightbox.DIRECTION_NONE;
                    this.openState = false;

                    if (this.observers[Lightbox.EVENT_ONCLOSE] !== null) {
                        this.observers[Lightbox.EVENT_ONCLOSE]();
                    }
                    resolve();
                };

                // close callback to active container
                const element = this.elements[this.currentIndex];
                if (element) {
                    if (typeof element.beforeClose === 'function') {
                        element.beforeClose();
                    }

                    this._hideElement(element);
                    this.currentIndex = -1;
                }
            } else {
                reject();
            }
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
        this.direction = Lightbox.DIRECTION_RIGHT;
        this._loadAndDisplayByIndex(this.currentIndex + 1);
    }

    /**
     * Tries to load previous item
     */
    prev() {
        this.direction = Lightbox.DIRECTION_LEFT;
        this._loadAndDisplayByIndex(this.currentIndex - 1);
    }

    /**
     * Tries to load an item based on its index
     * @param {number} i
     */
    jumpToIndex(i) {
        this.direction = Lightbox.DIRECTION_NONE;
        this._loadAndDisplayByIndex(i);
    }

    /**
     * Tries to load an item based on its key
     * @param {string} key
     */
    jumpToKey(key) {
        this.direction = Lightbox.DIRECTION_NONE;
        this._loadAndDisplayByKey(key);
    }

    /**
     * Hard reset, forces all elements' containers to be deactivated
     */
    _reset() {
        this.elements.filter(({ container }) => container && container.classList.contains('active')).forEach((element) => {
            this._hideElement(element);
        });
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

        if (this.options.enableNavUI) {
            if (this.currentIndex === 0) {
                this.UI.prev.disable();
            } else {
                this.UI.prev.enable();
            }
        }

        if (this.options.enableNavUI) {
            if (this.currentIndex === this.elements.length - 1) {
                this.UI.next.disable();
            } else {
                this.UI.next.enable();
            }
        }

        if (this.options.enablePaginationUI) {
            this.UI.pagination.update(this.currentIndex + 1, this.elements.length); // eslint-disable-line
        }

        if (this.options.enableBulletlistUI) {
            this.UI.bulletlist.update(this.currentIndex + 1, this.elements.length); // eslint-disable-line
        }
    }

    /**
     * Gets the current index
     * @return {number}
     */
    get _index() {
        return this.currentIndex;
    }

    disableUI() {
        this.$lb.classList.add('no_ui');
    }

    enableUI() {
        this.$lb.classList.remove('no_ui');
    }

    toggleUI() {
        if (this.isUIEnabled()) {
            this.disableUI();
        } else {
            this.enableUI();
        }
    }

    /**
     * Return current lightbox UI state
     * @return {boolean}
     */
    isUIEnabled() {
        return this.$lb.classList.contains('no_ui') !== true;
    }

    /**
     * @return {boolean}
     */
    isOpen() {
        return this.openState;
    }

    /**
     * Returns the current count of elements
     * @return {number}
     */
    count() {
        return this.elements.length;
    }


    /**
     * Show an element animation
     * @param {Element} node
     * @param {number} Direction (left/right/none)
     * @return {Object} Valid animejs object
     */
    static _showElementAnimation(node, direction) {
        const target = node;
        const offsetValue = { x: 20, y: 10 }; // initial offset
        const tOffset = { x: 0, y: 0 };

        if (direction === Lightbox.DIRECTION_LEFT) {
            tOffset.x = -offsetValue.x;
            tOffset.y = 0;
        } else if (direction === Lightbox.DIRECTION_RIGHT) {
            tOffset.x = offsetValue.x;
            tOffset.y = 0;
        } else {
            tOffset.x = 0;
            tOffset.y = -offsetValue.y;
        }

        // initial conditions
        target.style.transform = `scale(0.9) translateX(${tOffset.x}%) translateY(${tOffset.y}%)`;
        target.style.transformOrigin = 'center';
        target.style.opacity = '0';

        return anime({
            targets: target,
            scale: 1,
            translateX: 0,
            translateY: 0,
            opacity: 1,
            duration: 750,
            delay: 250,
            easing: [0.45, 0.73, 0.3, 1.0],
        });
    }

    /**
     * Close animation
     * @param {Element} node
     * @return {Object} Valid animejs object
     */
    static _closeAnimation(node) {
        const target = node;

        return anime({
            targets: target,
            opacity: 0,
            duration: 350,
            delay: 100,
            easing: 'easeOutSine',
        });
    }

    /**
     * Open animation
     * @param {Element} node
     * @return {Object} Valid animejs object
     */
    static _openAnimation(node) {
        const target = node;
        target.style.opacity = '0';
        target.style.transform = 'scale(1)';

        return anime({
            targets: target,
            opacity: 1,
            duration: 350,
            delay: 0,
            easing: 'easeOutSine',
        });
    }
}

Lightbox.DEFAULT_CONFIG = {
    uid: uniqid(),
    enableCloseOnBlur: true,
    enableCloseOnEscape: true,
    enableArrowKey: true,
    enableAnimations: true,
    enableCloseUI: true,
    enableNavUI: true,
    enablePaginationUI: true,
    enableBulletlistUI: true,
    animations: {
        open: Lightbox._openAnimation,
        close: Lightbox._closeAnimation,
        showElement: Lightbox._showElementAnimation,
    },
};


Lightbox.EVENT_ONCLOSE = 'close';
Lightbox.EVENT_ONOPEN = 'open';
Lightbox.EVENT_ONCHANGE_BEFORE = 'change.before';
Lightbox.EVENT_ONCHANGE_AFTER = 'change.after';

Lightbox.DIRECTION_NONE = -1;
Lightbox.DIRECTION_LEFT = 0;
Lightbox.DIRECTION_RIGHT = 1;
