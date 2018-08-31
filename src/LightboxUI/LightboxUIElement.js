class LightboxUIElement {
    /**
     * @param {Lightbox} Lightbox instance
     * @param {string} tag HTML tag name
     */
    constructor(lightbox, tag) {
        this.lightbox = lightbox;

        this.$root = document.createElement(tag);
        this.$root.classList.add('lightbox__ui_element');
        this.$root.classList.add('ui-element');
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
    constructor(lightbox) {
        super(lightbox, 'button');
        this.$root.classList.add('ui-element_controls', 'ui-element_controls-next');

        const icon = document.createElement('i');
        icon.classList.add('ui-icon', 'ui-icon_next');
        this.$root.appendChild(icon);
    }
}

export class LightboxUIPrev extends LightboxUIElement {
    constructor(lightbox) {
        super(lightbox, 'button');
        this.$root.classList.add('ui-element_controls', 'ui-element_controls-prev');

        const icon = document.createElement('i');
        icon.classList.add('ui-icon', 'ui-icon_prev');
        this.$root.appendChild(icon);
    }
}

export class LightboxUIClose extends LightboxUIElement {
    constructor(lightbox) {
        super(lightbox, 'button');
        this.$root.classList.add('ui-element_close');

        const icon = document.createElement('i');
        icon.classList.add('ui-icon', 'ui-icon_close');
        this.$root.appendChild(icon);
    }
}

export class LightboxUIPagination extends LightboxUIElement {
    constructor(lightbox) {
        super(lightbox, 'div');
        this.$root.classList.add('ui-element_pagination', 'ui-pagination');
    }

    update(current, total) {
        this.$root.innerHTML = `<span class="ui-pagination__current">${current}</span>&nbsp;/&nbsp;<span class="ui-pagination__total">${total}</span>`;
    }
}

export class LightboxUIBulletlist extends LightboxUIElement {
    constructor(lightbox) {
        super(lightbox, 'ul');

        this.$root.classList.add('ui-element_bulletlist', 'ui-bulletlist');
    }

    update(current, total) {
        this.$root.innerHTML = '';
        for (let i = 1; i <= total; i += 1) {
            const li = document.createElement('li');
            li.addEventListener('click', (e) => {
                e.preventDefault();
                this.lightbox.jumpToIndex(i - 1);
            });
            if (i === current) {
                li.classList.add('active');
            }
            this.$root.appendChild(li);
        }
    }
}

export default LightboxUIElement;
