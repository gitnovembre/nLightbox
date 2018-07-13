class LightboxUIElement {
    constructor() {
        this._$root = document.createElement('button');
        this._$root.classList.add('lightbox__ui_element');
    }

    hide() {
        this._$root.classList.add('hidden');
    }

    show() {
        this._$root.classList.remove('hidden');
    }

    disable() {
        this._$root.classList.add('disabled');
    }

    enable() {
        this._$root.classList.remove('disabled');
    }

    appendTo(parent) {
        parent.appendChild(this._$root);
    }

    addEventListener(eventName, callback) {
        this._$root.addEventListener(eventName, callback);
    }
}

export class LightboxUINext extends LightboxUIElement {
    constructor() {
        super();
        this._$root.classList.add('lightbox__ui_element_controls', 'lightbox__ui_element_controls_next');
        this._$root.textContent = '►';
    }
}

export class LightboxUIPrev extends LightboxUIElement {
    constructor() {
        super();
        this._$root.classList.add('lightbox__ui_element_controls', 'lightbox__ui_element_controls_prev');
        this._$root.textContent = '◀';
    }
}

export class LightboxUIClose extends LightboxUIElement {
    constructor() {
        super();
        this._$root.classList.add('lightbox__ui_element_close');
        this._$root.textContent = 'Close';
    }
}

export default LightboxUIElement;
