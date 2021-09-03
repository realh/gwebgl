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
            super.bufferData(target, data, usage);
        } else if (data === null) {
            // Not sure how this makes sense, but MDN says it can be NULL
            super.bufferData(target, 0, usage);
        } else if (data instanceof ArrayBufferView) {
            data = data.buffer;
        }
        // else (data instanceof ArrayBuffer)
        super.bufferDataFromByteArray(target, new Uint8Array(data), usage);
    }

    bufferSubData(target, offset, data) {
        if (data instanceof ArrayBufferView) {
            data = data.buffer;
        }
        super.bufferSubDataFromByteArray(target, offset, new Uint8Array(data));
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
                border, format, type,
                source ? new Uint8Array(source.buffer) : null);
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
                internalformat, width, height, format, type,
                source ? new Uint8Array(source.buffer) : null);
        }
    }

    compressedTexImage2D(target, level, internalformat, width, height, border,
        source)
    {
        super.compressedTexImage2D(target, level, internalformat, width, height,
            border, new Uint8Array(source.buffer));
    }

    compressedTexSubImage2D(target, level, xoffset, yoffset, width, height,
        format, source)
    {
        super.compressedTexSubImage2D(target, level, xoffset, yoffset,
            width, height, format, new Uint8Array(source.buffer));
    }

    uniform1fv(location, v) {
        if (v instanceof Float32Array) {
            super.uniform1fvFromByteArray(location, new Uint8Array(v.buffer));
        } else {
            super.uniform1fvFromArray(location, v);
        }
    }

    uniform2fv(location, v) {
        if (v instanceof Float32Array) {
            super.uniform2fvFromByteArray(location, new Uint8Array(v.buffer));
        } else {
            super.uniform2fvFromArray(location, v);
        }
    }

    uniform3fv(location, v) {
        if (v instanceof Float32Array) {
            super.uniform3fvFromByteArray(location, new Uint8Array(v.buffer));
        } else {
            super.uniform3fvFromArray(location, v);
        }
    }

    uniform4fv(location, v) {
        if (v instanceof Float32Array) {
            super.uniform4fvFromByteArray(location, new Uint8Array(v.buffer));
        } else {
            super.uniform4fvFromArray(location, v);
        }
    }

    uniform1iv(location, v) {
        if (v instanceof Int32Array) {
            super.uniform1ivFromByteArray(location, new Uint8Array(v.buffer));
        } else {
            super.uniform1ivFromArray(location, v);
        }
    }

    uniform2iv(location, v) {
        if (v instanceof Int32Array) {
            super.uniform2ivFromByteArray(location, new Uint8Array(v.buffer));
        } else {
            super.uniform2ivFromArray(location, v);
        }
    }

    uniform3iv(location, v) {
        if (v instanceof Int32Array) {
            super.uniform3ivFromByteArray(location, new Uint8Array(v.buffer));
        } else {
            super.uniform3ivFromArray(location, v);
        }
    }

    uniform4iv(location, v) {
        if (v instanceof Int32Array) {
            super.uniform4ivFromByteArray(location, new Uint8Array(v.buffer));
        } else {
            super.uniform4ivFromArray(location, v);
        }
    }

    uniformMatrix2fv(location, transpose, v) {
        if (v instanceof Float32Array) {
            super.uniformMatrix2fvFromByteArray(location, transpose,
                new Uint8Array(v.buffer));
        } else {
            super.uniformMatrix2fvFromArray(location, transpose, v);
        }
    }

    uniformMatrix3fv(location, transpose, v) {
        if (v instanceof Float32Array) {
            super.uniformMatrix3fvFromByteArray(location, transpose,
                new Uint8Array(v.buffer));
        } else {
            super.uniformMatrix3fvFromArray(location, transpose, v);
        }
    }

    uniformMatrix4fv(location, transpose, v) {
        if (v instanceof Float32Array) {
            super.uniformMatrix4fvFromByteArray(location, transpose,
                new Uint8Array(v.buffer));
        } else {
            super.uniformMatrix4fvFromArray(location, transpose, v);
        }
    }

    readPixels(x, y, width, height, format, type, pixels) {
        super.readPixels(x, y, width, height, format, type,
            new Uint8Array(pixels.buffer));
    }
});
