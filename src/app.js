import '../assets/css/main'; //eslint-disable-line

import Lightbox from './Lightbox';

window.lb1 = new Lightbox({
    uid: 1,
    closeOnBlur: true,
    closeOnEscape: true,
    arrowKeyNavigation: true,
    ui: {
        close: true,
        controls: true,
        pagination: true,
    },
});

window.lb2 = new Lightbox({
    uid: 2,
    closeOnBlur: true,
    closeOnEscape: true,
    arrowKeyNavigation: false,
    ui: {
        close: false,
        controls: false,
        pagination: false,
    },
});
