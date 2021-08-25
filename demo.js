import Gtk from 'gi://Gtk?version=4.0';
import GLib from 'gi://GLib';
import Gio from 'gi://Gio';
import Gwebgl from 'gi://Gwebgl';
const WebGLRenderingContext = Gwebgl.WebGLRenderingContext;

function render(glarea, gl) {
    print('render');
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
    //glarea.set_use_es(true);
    //glarea.set_required_version(2, 0);
    const gl = new WebGLRenderingContext();
    glarea.connect('render', () => {
        render(glarea, gl);
        return true;
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
