#!/usr/bin/env -S gjs -m

import GLib from 'gi://GLib';
import {startApp, requestAnimationFrame} from './app.js';

function render(canvas, gl) {
    print('render');
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    requestAnimationFrame(() => {
        render(canvas, gl);
    });
}

startApp('demo1', (canvas, gl) => {
    print('GL context ready');
    render(canvas, gl);
    gl.canvas.connect('render', () => render(canvas, gl));
    gl.canvas.set_auto_render(false);
});
