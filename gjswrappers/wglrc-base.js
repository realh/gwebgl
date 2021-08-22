// The wrapper methods for WebGLRenderingContextBase are added as a mixin
// because they may have to be added to more than one base class. For WebGL 1
// only we can get away with only adding them to WebGLRenderingContext,
// ignoring WebGLRenderingContextBase, but to support WebGL 2 in addition, they
// would also have to be added to WebGL2RenderingContext, because its GObject
// version derives directly from the GObject version of WebGLRenderingContext,
// not this wrapper.
export function mixinWebGLRenderingContextBase(parentClass, name) {
    const namer = {};
    namer[name] = class extends parentClass {
        // Converts an ArrayBufferView to an array of bools. gjs returns
        // Uint8Array, but the elements are actually 4 bytes each.
        _boolArray(array) {
            return Array.from(new Int32Array(array.buffer)).map(
                a => a ? true : false);
        }

        getBufferParameter(target, pname) {
            return this.getBufferParameteriv(target, pname);
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
                    return this.getParameteri(pname);
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
                    return this.getParameterb(pname) ? true : false;
                case this.ARRAY_BUFFER_BINDING:
                case this.ELEMENT_ARRAY_BUFFER_BINDING:
                case this.FRAMEBUFFER_BINDING:
                case this.RENDERBUFFER_BINDING:
                case this.CURRENT_PROGRAM:
                case this.TEXTURE_BINDING_2D:
                case this.TEXTURE_BINDING_CUBE_MAP:
                    return this.getParameteri(pname) || null;
                case this.DEPTH_CLEAR_VALUE:
                case this.LINE_WIDTH:
                case this.POLYGON_OFFSET_FACTOR:
                case this.POLYGON_OFFSET_UNITS:
                case this.SAMPLE_COVERAGE_VALUE:
                    return this.getParameterf(pname);
                case this.COLOR_WRITEMASK:
                    return this._boolArray(this.getParameterbv(pname, 16));
                case this.ALIASED_LINE_WIDTH_RANGE:
                case this.ALIASED_POINT_SIZE_RANGE:
                case this.DEPTH_RANGE:
                    return new Float32Array(
                        this.getParameterfv(pname, 8).buffer);
                case this.BLEND_COLOR:
                case this.COLOR_CLEAR_VALUE:
                    return new Float32Array(
                        this.getParameterfv(pname, 16).buffer);
                case this.COMPRESSED_TEXTURE_FORMATS:
                    const n = this.getParameteri(
                        this.NUM_COMPRESSED_TEXTURE_FORMATS);
                    return new Uint32Array(
                        this.getParameteriv(pname, n).buffer);
                case this.MAX_VIEWPORT_DIMS:
                    return new Int32Array(
                        this.getParameteriv(pname, 8).buffer);
                case this.SCISSOR_BOX:
                case this.VIEWPORT:
                    return new Int32Array(
                        this.getParameteriv(pname, 16).buffer);
                case this.RENDERER:
                case this.SHADING_LANGUAGE_VERSION:
                case this.VENDOR:
                case this.VERSION:
                    return this.getString(pname);
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
                        return this.getUniformf(program, location);
                    } else {
                        return new Float32Array(
                            this.getUniformfv(
                                program, location, 4 * info.size).buffer);
                    }
                case this.FLOAT_VEC2:
                    return new Float32Array(
                        this.getUniformfv(
                            program, location, 8 * info.size).buffer);
                case this.FLOAT_VEC3:
                    return new Float32Array(
                        this.getUniformfv(
                            program, location, 12 * info.size).buffer);
                case this.FLOAT_VEC4:
                    return new Float32Array(
                        this.getUniformfv(
                            program, location, 16 * info.size).buffer);
                case this.SAMPLER_2D:
                case this.SAMPLER_CUBE:
                case this.INT:
                    if (info.size == 1) {
                        return this.getUniformi(program, location);
                    } else {
                        return new Int32Array(
                            this.getUniformiv(
                                program, location, 4 * info.size).buffer);
                    }
                case this.INT_VEC2:
                    return new Int32Array(
                        this.getUniformiv(
                            program, location, 8 * info.size).buffer);
                case this.INT_VEC3:
                    return new Int32Array(
                        this.getUniformiv(
                            program, location, 12 * info.size).buffer);
                case this.INT_VEC4:
                    return new Int32Array(
                        this.getUniformiv(
                            program, location, 16 * info.size).buffer);
                case this.BOOL:
                    if (info.size == 1) {
                        return this.getUniformi(program, location) ?
                            true : false;
                    } else {
                        return this._boolArray(
                            this.getUniformiv(
                                program, location, 4 * info.size));
                    }
                case this.BOOL_VEC2:
                    return this._boolArray(
                        this.getUniformiv(program, location, 8 * info.size));
                case this.BOOL_VEC3:
                    return this._boolArray(
                        this.getUniformiv(program, location, 12 * info.size));
                case this.BOOL_VEC4:
                    return this._boolArray(
                        this.getUniformiv(program, location, 16 * info.size));
                case this.FLOAT_MAT2:
                    return new Float32Array(
                        this.getUniformfv(
                            program, location, 16 * info.size).buffer);
                case this.FLOAT_MAT3:
                    return new Float32Array(
                        this.getUniformfv(
                            program, location, 36 * info.size).buffer);
                case this.FLOAT_MAT4:
                    return new Float32Array(
                        this.getUniformfv(
                            program, location, 64 * info.size).buffer);
            }
        }
    };
    return namer[name];
}


// getVertexAttribfv(index: GLuint, pname: GLenum, resultSize: GLint): Uint8Array;
// getVertexAttribi(index: GLuint, pname: GLenum): GLint;
// getVertexAttribf(index: GLuint, pname: GLenum): GLfloat;
getVertexAttrib(index, pname);

// vertexAttrib1fvFromByteArray(index: GLuint, values: Float32Array): void;
// vertexAttrib1fvFromArray(index: GLuint, values: GLfloat[]): void;
vertexAttrib1fv(index, values);

// vertexAttrib2fvFromByteArray(index: GLuint, values: Float32Array): void;
// vertexAttrib2fvFromArray(index: GLuint, values: GLfloat[]): void;
vertexAttrib2fv(index, values);

// vertexAttrib3fvFromByteArray(index: GLuint, values: Float32Array): void;
// vertexAttrib3fvFromArray(index: GLuint, values: GLfloat[]): void;
vertexAttrib3fv(index, values);

// vertexAttrib4fvFromByteArray(index: GLuint, values: Float32Array): void;
// vertexAttrib4fvFromArray(index: GLuint, values: GLfloat[]): void;
vertexAttrib4fv(index, values);
