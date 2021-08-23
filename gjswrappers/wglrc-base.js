import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';

// The wrapper methods for WebGLRenderingContextBase are added as a mixin
// because they may have to be added to more than one base class. For WebGL 1
// only we can get away with only adding them to WebGLRenderingContext,
// ignoring WebGLRenderingContextBase, but to support WebGL 2 in addition, they
// would also have to be added to WebGL2RenderingContext, because its GObject
// version derives directly from the GObject version of WebGLRenderingContext,
// not this wrapper.
// The new class name is 'Gjs_' + parentClass.name
export function mixinWebGLRenderingContextBase(parentClass) {
    const name = 'Gjs_' + parentClass.name;
    const namer = {};
    namer[name] = class extends parentClass {
        _init(params) {
            super._init(params);
        }

        get canvas() {
            // TODO: We should also be able to use a Gdk context for offscreen
            // rendering
            return this.gtk_gl_area;
        }

        get drawingBufferWidth() {
            return this.gtk_gl_area.get_allocated_width();
        }

        get drawingBufferHeight() {
            return this.gtk_gl_area.get_allocated_height();
        }

        // Converts an ArrayBufferView to an array of bools. gjs returns
        // Uint8Array, but the elements are actually 4 bytes each.
        _boolArray(array) {
            return Array.from(new Int32Array(array.buffer)).map(
                a => a ? true : false);
        }

        getBufferParameter(target, pname) {
            return super.getBufferParameteriv(target, pname);
        }

        getParameter(pname) {
            switch (pname) {
                case this.ACTIVE_TEXTURE:
                case this.BLEND_DST_ALPHA:
                case this.BLEND_DST_RGB:
                case this.BLEND_EQUATION:
                case this.BLEND_EQUATION_ALPHA:
                case this.BLEND_EQUATION_RGB:
                case this.BLEND_SRC_ALPHA:
                case this.BLEND_SRC_RGB:
                case this.CULL_FACE_MODE:
                case this.DEPTH_FUNC:
                case this.FRONT_FACE:
                case this.GENERATE_MIPMAP_HINT:
                case this.IMPLEMENTATION_COLOR_READ_FORMAT:
                case this.IMPLEMENTATION_COLOR_READ_TYPE:
                case this.STENCIL_BACK_FAIL:
                case this.STENCIL_BACK_FUNC:
                case this.STENCIL_BACK_PASS_DEPTH_FAIL:
                case this.STENCIL_BACK_PASS_DEPTH_PASS:
                case this.STENCIL_FAIL:
                case this.STENCIL_FUNC:
                case this.STENCIL_PASS_DEPTH_FAIL:
                case this.STENCIL_PASS_DEPTH_PASS:
                //case this.UNPACK_COLORSPACE_CONVERSION_WEB:
                case this.ALPHA_BITS:
                case this.BLUE_BITS:
                case this.DEPTH_BITS:
                case this.GREEN_BITS:
                case this.MAX_COMBINED_TEXTURE_IMAGE_UNITS:
                case this.MAX_CUBE_MAP_TEXTURE_SIZE:
                case this.MAX_FRAGMENT_UNIFORM_VECTORS:
                case this.MAX_RENDERBUFFER_SIZE:
                case this.MAX_TEXTURE_IMAGE_UNITS:
                case this.MAX_TEXTURE_SIZE:
                case this.MAX_VARYING_VECTORS:
                case this.MAX_VERTEX_ATTRIBS:
                case this.MAX_VERTEX_TEXTURE_IMAGE_UNITS:
                case this.MAX_VERTEX_UNIFORM_VECTORS:
                case this.PACK_ALIGNMENT:
                case this.RED_BITS:
                case this.SAMPLE_BUFFERS:
                case this.SAMPLES:
                case this.STENCIL_BACK_REF:
                case this.STENCIL_BITS:
                case this.STENCIL_CLEAR_VALUE:
                case this.STENCIL_REF:
                case this.SUBPIXEL_BITS:
                case this.UNPACK_ALIGNMENT:
                case this.STENCIL_VALUE_MASK:
                case this.STENCIL_BACK_VALUE_MASK:
                case this.STENCIL_BACK_WRITEMASK:
                case this.STENCIL_WRITEMASK:
                    return super.getParameteri(pname);
                case this.BLEND:
                case this.CULL_FACE:
                case this.DEPTH_TEST:
                case this.DEPTH_WRITEMASK:
                case this.DITHER:
                case this.POLYGON_OFFSET_FILL:
                case this.SAMPLE_COVERAGE_INVERT:
                case this.SCISSOR_TEST:
                case this.STENCIL_TEST:
                //case this.UNPACK_FLIP_Y_WEB:
                //case this.UNPACK_PREMULTIPLY_ALPHA_WEB:
                    return super.getParameterb(pname) ? true : false;
                case this.ARRAY_BUFFER_BINDING:
                case this.ELEMENT_ARRAY_BUFFER_BINDING:
                case this.FRAMEBUFFER_BINDING:
                case this.RENDERBUFFER_BINDING:
                case this.CURRENT_PROGRAM:
                case this.TEXTURE_BINDING_2D:
                case this.TEXTURE_BINDING_CUBE_MAP:
                    return super.getParameteri(pname) || null;
                case this.DEPTH_CLEAR_VALUE:
                case this.LINE_WIDTH:
                case this.POLYGON_OFFSET_FACTOR:
                case this.POLYGON_OFFSET_UNITS:
                case this.SAMPLE_COVERAGE_VALUE:
                    return super.getParameterf(pname);
                case this.COLOR_WRITEMASK:
                    return this._boolArray(super.getParameterbv(pname, 16));
                case this.ALIASED_LINE_WIDTH_RANGE:
                case this.ALIASED_POINT_SIZE_RANGE:
                case this.DEPTH_RANGE:
                    return new Float32Array(
                        super.getParameterfv(pname, 8).buffer);
                case this.BLEND_COLOR:
                case this.COLOR_CLEAR_VALUE:
                    return new Float32Array(
                        super.getParameterfv(pname, 16).buffer);
                case this.COMPRESSED_TEXTURE_FORMATS:
                    const n = super.getParameteri(
                        this.NUM_COMPRESSED_TEXTURE_FORMATS);
                    return new Uint32Array(
                        super.getParameteriv(pname, n).buffer);
                case this.MAX_VIEWPORT_DIMS:
                    return new Int32Array(
                        super.getParameteriv(pname, 8).buffer);
                case this.SCISSOR_BOX:
                case this.VIEWPORT:
                    return new Int32Array(
                        super.getParameteriv(pname, 16).buffer);
                case this.RENDERER:
                case this.SHADING_LANGUAGE_VERSION:
                case this.VENDOR:
                case this.VERSION:
                    return super.getString(pname);
            }
        }

        getActiveAttrib(program, index) {
            const info = super.getActiveAttrib(program, index);
            return {type: info[0], size: info[1], name: info[2]};
        }

        getActiveUniform(program, index) {
            const info = super.getActiveUniform(program, index);
            return {type: info[0], size: info[1], name: info[2]};
        }

        // TODO: With extensions or WebGL 2 this will sometimes need to call
        // the float version
        getTexParameter(target, pname) {
            return this.getTexParameteriv(target, pname);
        }

        getUniform(program, location) {
            const info = this.getActiveUniform(program, location);
            if (info.size < 1) {
                info.size = 1;
            }
            switch (info.type) {
                case this.FLOAT:
                    if (info.size == 1) {
                        return super.getUniformf(program, location);
                    } else {
                        return new Float32Array(
                            super.getUniformfv(
                                program, location, 4 * info.size).buffer);
                    }
                case this.FLOAT_VEC2:
                    return new Float32Array(
                        super.getUniformfv(
                            program, location, 8 * info.size).buffer);
                case this.FLOAT_VEC3:
                    return new Float32Array(
                        super.getUniformfv(
                            program, location, 12 * info.size).buffer);
                case this.FLOAT_VEC4:
                    return new Float32Array(
                        super.getUniformfv(
                            program, location, 16 * info.size).buffer);
                case this.SAMPLER_2D:
                case this.SAMPLER_CUBE:
                case this.INT:
                    if (info.size == 1) {
                        return super.getUniformi(program, location);
                    } else {
                        return new Int32Array(
                            super.getUniformiv(
                                program, location, 4 * info.size).buffer);
                    }
                case this.INT_VEC2:
                    return new Int32Array(
                        super.getUniformiv(
                            program, location, 8 * info.size).buffer);
                case this.INT_VEC3:
                    return new Int32Array(
                        super.getUniformiv(
                            program, location, 12 * info.size).buffer);
                case this.INT_VEC4:
                    return new Int32Array(
                        super.getUniformiv(
                            program, location, 16 * info.size).buffer);
                case this.BOOL:
                    if (info.size == 1) {
                        return super.getUniformi(program, location) ?
                            true : false;
                    } else {
                        return this._boolArray(
                            super.getUniformiv(
                                program, location, 4 * info.size));
                    }
                case this.BOOL_VEC2:
                    return this._boolArray(
                        super.getUniformiv(program, location, 8 * info.size));
                case this.BOOL_VEC3:
                    return this._boolArray(
                        super.getUniformiv(program, location, 12 * info.size));
                case this.BOOL_VEC4:
                    return this._boolArray(
                        super.getUniformiv(program, location, 16 * info.size));
                case this.FLOAT_MAT2:
                    return new Float32Array(
                        super.getUniformfv(
                            program, location, 16 * info.size).buffer);
                case this.FLOAT_MAT3:
                    return new Float32Array(
                        super.getUniformfv(
                            program, location, 36 * info.size).buffer);
                case this.FLOAT_MAT4:
                    return new Float32Array(
                        super.getUniformfv(
                            program, location, 64 * info.size).buffer);
            }
        }

        getVertexAttrib(index, pname) {
            switch (pname) {
                case VERTEX_ATTRIB_ARRAY_ENABLED:
                case VERTEX_ATTRIB_ARRAY_NORMALIZED:
                    return super.getVertexAttribi(index, pname) ? true : false;
                case VERTEX_ATTRIB_ARRAY_BUFFER_BINDING:
                case VERTEX_ATTRIB_ARRAY_SIZE:
                case VERTEX_ATTRIB_ARRAY_STRIDE:
                case VERTEX_ATTRIB_ARRAY_TYPE:
                    return super.getVertexAttribi(index, pname);
                case CURRENT_VERTEX_ATTRIB:
                    return new Float32Array(
                        super.getVertexAttribfv(index, pname, 16).buffer);
            }
        }

        vertexAttrib1fv(index, values) {
            if (values instanceof Float32Array) {
                super.vertexAttrib1fvFromByteArray(index,
                    new Uint8Array(values.buffer));
            } else {
                super.vertexAttrib1fvFromArray(index, values);
            }
        }

        vertexAttrib2fv(index, values) {
            if (values instanceof Float32Array) {
                super.vertexAttrib2fvFromByteArray(index,
                    new Uint8Array(values.buffer));
            } else {
                super.vertexAttrib2fvFromArray(index, values);
            }
        }

        vertexAttrib3fv(index, values) {
            if (values instanceof Float32Array) {
                super.vertexAttrib3fvFromByteArray(index,
                    new Uint8Array(values.buffer));
            } else {
                super.vertexAttrib3fvFromArray(index, values);
            }
        }

        vertexAttrib4fv(index, values) {
            if (values instanceof Float32Array) {
                super.vertexAttrib4fvFromByteArray(index,
                    new Uint8Array(values.buffer));
            } else {
                super.vertexAttrib4fvFromArray(index, values);
            }
        }
    };
    return GObject.register_class({
        GTypeName: name,
        Properties: {
            'gtk-gl-area': GObject.ParamSpec.object(
                'gtk-gl-area', 'gtk-gl-area', 'GtkGLArea',
                Gtk.GLArea.$gtype,
                GObject.ParamFlags.READABLE | GObject.ParamFlags.CONSTRUCT_ONLY
            ),
        },
    }, namer[name]);
}
