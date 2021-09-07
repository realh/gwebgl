import GObject from 'gi://GObject';
import Gwebgl from 'gi://Gwebgl';

import {mixinWebGLRenderingContextBase} from './WebGLRenderingContextBase.js';

const Gjs_WebGLRenderingContext = mixinWebGLRenderingContextBase(
    Gwebgl.WebGLRenderingContext);

export const WebGLRenderingContext = GObject.registerClass({
    GTypeName: 'WebGLRenderingContext'
}, class WebGLRenderingContext extends Gjs_WebGLRenderingContext {
    bufferData(target, data, usage) {
        if (typeof data == 'number') {
            super.bufferDataSizeOnly(target, data, usage);
        } else if (data === null) {
            // Not sure how this makes sense, but MDN says it can be NULL
            super.bufferDataSizeOnly(target, 0, usage);
        } else {
            if (!(data instanceof Uint8Array)) {
                if (data.buffer) {
                    data = new Uint8Array(data.buffer);
                } else {
                    data = data?.constructor?.name ?? typeof data;
                    throw new Error(`Can't buffer data from type ${data}`);
                }
            }
            super.bufferData(target, data, usage);
        }
    }

    //texImage2D(target, level, internalformat, format, type, source);
    texImage2D(target, level, internalformat, width, height, border,
        format, type, source)
    {
        if (format === undefined && type === undefined && source === undefined)
        {
            format = width;
            type = height;
            source = border;
            // source must be a GdkPixbuf or have a gpixbuf member of that type
            source = source.gpixbuf ?? source;
            super.texImage2DFromPixbuf(target, level, internalformat, format,
                type, source);
        } else {
            super.texImage2D(target, level, internalformat, width, height,
                border, format, type, source);
        }
    }

    //texSubImage2D(target, level, xoffset, yoffset,
    //  internalformat, format, type, source);
    texSubImage2D(target, level, xoffset, yoffset,
        width, height, format, type, source)
    {
        if (format === undefined && type === undefined && source === undefined)
        {
            source = format;
            type = height;
            format = width;
            // source must be a GdkPixbuf or have a gpixbuf member of that type
            source = source.gpixbuf ?? source;
            super.texSubImage2DFromPixbuf(target, level, xoffset, yoffset,
                format, type, source);
        } else {
            super.texSubImage2D(target, level, xoffset, yoffset,
                internalformat, width, height, format, type, source);
        }
    }

    readPixels(x, y, width, height, format, type, pixels) {
        if (!pixels) {
            return;
        }
        // The pixels argument is (out caller-allocates). I'm not sure whether
        // the data is copied or the original pixels' data is modified. In the
        // former case the output data needs to be copied back into pixels.
        let result = super.readPixels(x, y, width, height, format, type,
            new Uint8Array(pixels.buffer));
        if (result.buffer != pixels.buffer) {
            if (result.constructor != pixels.constructor) {
                result = new pixels.constructor(result.buffer);
            }
            pixels.set(result);
        }
    }

    get_glsl_version(es) {
        return es ? '100' : '120';
    }

});

// Defined separately in case the typename would refer to the class before it
// got decorated for GObject when used in the context of a static method
WebGLRenderingContext.new_for_gtk_gl_area = function(gtk_gl_area) {
    return new WebGLRenderingContext({gtk_gl_area});
}
