#!/usr/bin/env -S gjs -m

import GLib from 'gi://GLib';
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk?version=4.0';
import GdkPixbuf from 'gi://GdkPixbuf';
import system from 'system';
import {WebGLRenderingContext} from '../WebGLRenderingContext.js';
import * as glmatrix from './gl-matrix.js';
import {main} from './webgl-demo.js';

let canvas = null;
let renderTag = null;
let animationTag = null;
let renderCallback = null;

export function requestAnimationFrame(cb) {
    renderCallback = cb;
    if (animationTag === null && canvas) {
        animationTag = GLib.idle_add(GLib.PRIORITY_DEFAULT_IDLE, () => {
            if (animationTag) {
                GLib.source_remove(animationTag);
                animationTag = null;
            }
            if (renderTag === null) {
                renderTag = canvas.connect('render', () => {
                    if (renderTag !== null) {
                        canvas.disconnect(renderTag);
                        renderTag = null;
                    }
                    if (renderCallback) {
                        renderCallback(GLib.get_monotonic_time() / 1000);
                        return true;
                    }
                    return false;
                });
            }
            canvas.queue_render();
            return false;
        });
    }
}

function activate(app, cb) {
    try {
        const dir = GLib.path_get_dirname(system.programInvocationName);
        const filename = GLib.build_filenamev([dir, 'cubetexture.png']);
        const image = GdkPixbuf.Pixbuf.new_from_file(filename);
        const win = Gtk.ApplicationWindow.new(app);
        win.set_default_size(800, 600);
        canvas = Gtk.GLArea.new();
        canvas.set_has_depth_buffer(true);
        canvas.set_use_es(true);
        canvas.set_required_version(2, 0);
        canvas.connect('unrealize', () => {
            if (renderTag !== null) {
                canvas.disconnect(renderTag);
                renderTag = null;
            }
            if (animationTag !== null) {
                GLib.source_remove(animationTag);
                animationTag = null;
            }
            canvas = null;
        });
        const on_render = canvas.connect('render', () => {
            try {
                canvas.disconnect(on_render);
                const gl = WebGLRenderingContext.new_for_gtk_gl_area(canvas);
                cb(canvas, gl, image);
            } catch (e) {
                logError(e);
            }
            return true;
        });
        canvas.set_size_request(800, 600);
        if (Gtk.MAJOR_VERSION == 4) {
            win.set_child(canvas);
            win.present();
        } else {
            win.add(canvas);
            win.show_all();
        }
    } catch (e) {
        logError(e);
    }
}

// This doesn't return until the app quits because it calls app.run(). Instead
// the supplied cb is called with a GtkGLArea and a WebGLRenderingContext. The
// callback should render the first frame, then call requestAnimationFrame as
// appropriate.
export function startApp(id, cb) {
    const app = Gtk.Application.new('uk.co.realh.gwebgl.' + id, 
        Gio.ApplicationFlags.NONE);
    app.connect('activate', () => {
        activate(app, cb);
    });
    app.run(null);
}

function first_render(canvas, gl, image) {
    const ctx = canvas.get_context()
    print(`Context version: OpenGL${ctx.get_use_es() ? ' ES' : ''} ` +
        ctx.get_version().join('.'));
    main(canvas, gl, image);
}

function alert(message) {
    printerr('alert: ' + message);
}

let gdk_debug = GLib.getenv("GDK_DEBUG")
if (!gdk_debug?.length) {
    GLib.setenv('GDK_DEBUG', 'gl-gles', true);
} else if (!gdk_debug.includes('gl-gles')) {
    GLib.setenv('GDK_DEBUG', `${gdk_debug},gl-gles`, true);
}
globalThis.requestAnimationFrame = requestAnimationFrame;
globalThis.alert = alert;
startApp('demo', first_render);
