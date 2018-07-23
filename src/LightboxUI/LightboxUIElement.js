class LightboxUIElement {
    /**
     * @param {string} tag HTML tag name
     */
    constructor(tag) {
        this._$root = document.createElement(tag);
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

    set innerHTML(html) {
        this._$root.innerHTML = html;
    }

    get innerHTML() {
        return this._$root.innerHTML;
    }
}

export class LightboxUINext extends LightboxUIElement {
    constructor() {
        super('button');
        this._$root.classList.add('lightbox__ui_element_controls', 'lightbox__ui_element_controls_next');

        const icon = document.createElement('i');
        icon.classList.add('icon', 'icon_next');
        icon.innerHTML = '&#9658;';
        this._$root.appendChild(icon);
    }
}

export class LightboxUIPrev extends LightboxUIElement {
    constructor() {
        super('button');
        this._$root.classList.add('lightbox__ui_element_controls', 'lightbox__ui_element_controls_prev');

        const icon = document.createElement('i');
        icon.classList.add('icon', 'icon_prev');
        icon.innerHTML = '&#9664;';
        this._$root.appendChild(icon);
    }
}

export class LightboxUIClose extends LightboxUIElement {
    constructor() {
        super('button');
        this._$root.classList.add('lightbox__ui_element_close');
        this._$root.textContent = 'Close';
    }
}

export class LightboxUIPagination extends LightboxUIElement {
    constructor() {
        super('div');
        this._$root.classList.add('lightbox__ui_element_pagination');
        this._$root.textContent = '';
    }
}

export default LightboxUIElement;
