import Gtk from 'gi://Gtk?version=4.0';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import Gio from 'gi://Gio';
//import Gwebgl from 'gi://Gwebgl';
//const WebGLRenderingContext = Gwebgl.WebGLRenderingContext;
import {WebGLRenderingContext} from './gjs_src/WebGLRenderingContext.js';

let rendered = false;

function render(glarea, gl) {
    print('render');
    if (!rendered) {
        rendered = true;
        const ctx = glarea.get_context();
        printerr('At first render: ' +
            `${ctx.get_required_version()} ES ${ctx.get_use_es()}`);
    }
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
}

function tick(glarea) {
    glarea.queue_render();
    return true;
}

function activate(app) {
    const win = Gtk.ApplicationWindow.new(app);
    win.set_default_size(800, 600);
    const glarea = Gtk.GLArea.new();
    //glarea.set_required_version(2, 0);
    //glarea.set_use_es(true);
    const gl = new WebGLRenderingContext();
    const specs = GObject.Object.list_properties.call(gl)
    printerr("WebGLRenderingContext properties:")
    for (const p of specs) {
        printerr(`  ${p.get_name()}`)
    }
    printerr(`gl.COLOR_BUFFER_BIT: ${gl.COLOR_BUFFER_BIT}`)
    printerr(`gl['COLOR-BUFFER-BIT']: ${gl['COLOR-BUFFER-BIT']}`)
    printerr('pspec for COLOR-BUFFER-BIT: ' +
        GObject.Object.find_property.call(gl, 'COLOR-BUFFER-BIT')?.get_name())
    printerr('pspec for COLOR_BUFFER_BIT: ' +
        GObject.Object.find_property.call(gl, 'COLOR_BUFFER_BIT')?.get_name())
    glarea.connect('render', () => {
        render(glarea, gl);
        return true;
    });
    glarea.connect('create-context', () => {
        try {
            let ctx;
            if (Gtk.MAJOR_VERSION == 3) {
                const w = glarea.get_window();
                ctx = w.create_gl_context();
            } else {
                const surface = glarea.get_native().get_surface();
                ctx = surface.create_gl_context();
            }
            printerr(`Created a ${ctx.constructor.$gtype.name}`);
            ctx.set_debug_enabled(true);
            printerr('Newly created context has required_version ' +
                `${ctx.get_required_version()} ES ${ctx.get_use_es()}`);
            ctx.set_use_es(1);
            ctx.set_required_version(2, 0);
            printerr('After requesting ES 2.0: ' +
                `${ctx.get_required_version()} ES ${ctx.get_use_es()}`);
            return ctx;
        } catch (e) {
            logError(e);
            return null;
        }
    });
    if (Gtk.MAJOR_VERSION == 3) {
        win.add(glarea);
        win.show_all();
    } else {
        win.set_child(glarea);
        win.present();
    }
    GLib.timeout_add(GLib.PRIORITY_DEFAULT_IDLE, 1000, () => tick(glarea));
}

function main() {
    const app = Gtk.Application.new('uk.co.realh.gwebgl.demo.js',
        Gio.ApplicationFlags.NONE);
    app.connect('activate', activate);
    app.run([]);
}

main();
