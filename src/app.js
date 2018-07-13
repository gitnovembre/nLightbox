import '../assets/css/lightbox'; //eslint-disable-line

import Lightbox from './Lightbox';

window.lb = new Lightbox({
    uid: 1,
    closeOnBlur: true,
    closeOnEscape: true,
    ui: {
        close: false,
        controls: true,
        pagination: true,
    },
});
