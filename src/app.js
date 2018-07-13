import '../assets/css/lightbox'; //eslint-disable-line

import Lightbox from './Lightbox';

window.lb = new Lightbox({
    uid: 1,
    closeOnBlur: true,
    closeOnEscape: true,
    arrowKeyNavigation: false,
    ui: {
        close: true,
        controls: true,
        pagination: true,
    },
});
