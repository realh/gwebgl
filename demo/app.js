import GLib from 'gi://GLib';
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk?version=4.0';
//import {WebGLRenderingContext} from '../gjswrappers/wglrc.js';
import Gwebgl from 'gi://Gwebgl';
const WebGLRenderingContext = Gwebgl.WebGLRenderingContextBase;

let canvas = null;
let renderTag = null;
let animationTag = null;

export function requestAnimationFrame(cb) {
    if (animationTag === null && canvas) {
        animationTag = GLib.idle_add(GLib.PRIORITY_DEFAULT_IDLE, () => {
            animationTag = null;
            renderTag = canvas.connect('render', () => {
                if (renderTag !== null) {
                    canvas.disconnect(renderTag);
                    renderTag = null;
                    cb();
                    return true;
                }
            });
            canvas.queue_render();
            return false;
        });
    }
}

function activate(app, cb) {
    try {
        const win = Gtk.ApplicationWindow.new(app);
        win.set_default_size(800, 600);
        canvas = Gtk.GLArea.new();
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
                //const gl = new WebGLRenderingContext({'gtk-gl-area': canvas});
                const gl = new WebGLRenderingContext();
                cb(canvas, gl);
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
// callback should then render the first frame, then connect its own 'render'
// signal handler to the canvas.
export function startApp(id, cb) {
    const app = Gtk.Application.new('uk.co.realh.gwebgl.' + id, 
        Gio.ApplicationFlags.NONE);
    app.connect('activate', () => {
        activate(app, cb);
    });
    app.run(null);
}
