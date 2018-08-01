class LightboxUIElement {
    /**
     * @param {string} tag HTML tag name
     */
    constructor(tag) {
        this.$root = document.createElement(tag);
        this.$root.classList.add('lightbox__ui_element');
    }

    hide() {
        this.$root.classList.add('hidden');
    }

    show() {
        this.$root.classList.remove('hidden');
    }

    disable() {
        this.$root.classList.add('disabled');
    }

    enable() {
        this.$root.classList.remove('disabled');
    }

    appendTo(parent) {
        parent.appendChild(this.$root);
    }

    addEventListener(eventName, callback) {
        this.$root.addEventListener(eventName, callback);
    }
}

export class LightboxUINext extends LightboxUIElement {
    constructor() {
        super('button');
        this.$root.classList.add('lightbox__ui_element_controls', 'lightbox__ui_element_controls_next');

        const icon = document.createElement('i');
        icon.classList.add('icon', 'icon_next');
        icon.innerHTML = '&#9658;';
        this.$root.appendChild(icon);
    }
}

export class LightboxUIPrev extends LightboxUIElement {
    constructor() {
        super('button');
        this.$root.classList.add('lightbox__ui_element_controls', 'lightbox__ui_element_controls_prev');

        const icon = document.createElement('i');
        icon.classList.add('icon', 'icon_prev');
        icon.innerHTML = '&#9658;';
        this.$root.appendChild(icon);
    }
}

export class LightboxUIClose extends LightboxUIElement {
    constructor() {
        super('button');
        this.$root.classList.add('lightbox__ui_element_close');
        this.$root.innerHTML = '&times;';
    }
}

export class LightboxUIPagination extends LightboxUIElement {
    constructor() {
        super('div');
        this.$root.classList.add('lightbox__ui_element_pagination');
    }

    update(current, total) {
        this.$root.innerHTML = `<span>${current}</span>&nbsp;/&nbsp;<span>${total}</span>`;
    }
}

export default LightboxUIElement;
