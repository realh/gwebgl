import { copyMethod } from '../iface-parser.js';

export class TextureFromGdkPixbuf {
    getAllocatorLines(method) {
        return [
            '    int width  = gdk_pixbuf_get_width(source);',
            '    int height = gdk_pixbuf_get_height(source);',
            '    const guint8 *data = gdk_pixbuf_get_pixels(source);'
        ];
    }

    adaptMethod(method) {
        const m = copyMethod(method);
        m.name = m.name.replace('FromPixbuf', '');
        m.args[m.args.length - 1].name = 'data';
        const addArgs = [{name: 'width'}, {name: 'height'}]
        if (!m.name.includes('Sub')) {
            addArgs.push({name: '0'});  // border
        }
        m.args.splice(m.args.length - 3, 0, ...addArgs);
        return m;
    }

    getResultAdjusterLines(method) {
        return [];
    }
}