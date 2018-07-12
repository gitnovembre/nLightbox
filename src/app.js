import '../assets/css/lightbox';

import Lightbox from './Lightbox';

window.lb = new Lightbox({
    uid: 1,
    closeOnBlur: true,
    closeOnEscape: true
});
/*
const btn = document.getElementById('btn');

btn.addEventListener('click', () => {
    lb.open();
    lb.load(new Promise((resolve, reject) => {
        const el = new Image;
    
        el.src = btn.dataset.lightboxUrl;
        el.alt = 'test';
        el.width = 900;
    
        el.onload = () => {
            const $figure = document.createElement('figure');
            
            const $closeBtn = document.createElement('button');
            $closeBtn.textContent = 'Close';
            $closeBtn.className = 'lightbox__close lightbox__ui lightbox__ui_close';

            const $controlNextBtn = document.createElement('button');
            $controlNextBtn.textContent = '>';
            $controlNextBtn.className = 'lightbox__next lightbox__ui lightbox__ui_controls lightbox__ui_controls_next';
            $figure.appendChild($controlNextBtn);

            const $controlPrevBtn = document.createElement('button');
            $controlPrevBtn.textContent = '<';
            $controlPrevBtn.className = 'lightbox__prev lightbox__ui lightbox__ui_controls lightbox__ui_controls_prev';
            $figure.appendChild($controlPrevBtn);

            $figure.appendChild($closeBtn);
            $figure.appendChild(el);
            resolve($figure)
        };
        el.onerror = () => reject();
    })).then(() => {
        console.info('LOADED');
        btn.classList.add('loaded');
    })
});
*/