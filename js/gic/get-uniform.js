const bodyAlloc = `
    GLint usize;
    GLenum utype;
    gwebgl_webgl_rendering_context_base_getActiveUniform(self,
        program, location, &usize, &utype, NULL);
    switch (utype) {
        case GL_INT_VEC2:
        case GL_FLOAT_VEC2:
        case GL_BOOL_VEC2:
            usize *= 8;
            break;
        case GL_INT_VEC3:
        case GL_FLOAT_VEC3:
        case GL_BOOL_VEC3:
            usize *= 12;
            break;
        case GL_INT_VEC4:
        case GL_FLOAT_VEC4:
        case GL_BOOL_VEC4:
            usize *= 16;
            break;
        case GL_FLOAT_MAT2:
            usize *= 4 * 4;
            break;
        case GL_FLOAT_MAT3:
            usize *= 9 * 4;
            break;
        case GL_FLOAT_MAT4:
            usize *= 16 * 4;
            break;
        /* WebGL 2.0
        case GL_UNSIGNED_INT_VEC2:
        case GL_UNSIGNED_INT_VEC3:
        case GL_UNSIGNED_INT_VEC4:
        case GL_FLOAT_MAT2x3:
        case GL_FLOAT_MAT2x4:
        case GL_FLOAT_MAT3x2:
        case GL_FLOAT_MAT3x4:
        case GL_FLOAT_MAT4x2:
        case GL_FLOAT_MAT4x3:
        case GL_SAMPLER_3D:
        case GL_SAMPLER_2D_SHADOW:
        case GL_SAMPLER_2D_ARRAY:
        case GL_SAMPLER_2D_ARRAY_SHADOW:
        case GL_SAMPLER_CUBE_SHADOW:
        case GL_INT_SAMPLER_2D:
        case GL_INT_SAMPLER_3D:
        case GL_INT_SAMPLER_CUBE:
        case GL_INT_SAMPLER_2D_ARRAY:
        case GL_UNSIGNED_INT_SAMPLER_2D:
        case GL_UNSIGNED_INT_SAMPLER_3D:
        case GL_UNSIGNED_INT_SAMPLER_CUBE:
        case GL_UNSIGNED_INT_SAMPLER_2D_ARRAY:
        */
        default:
        /*
        case GL_INT:
        case GL_FLOAT:
        case GL_UNSIGNED_INT:
        case GL_BOOL:
        case GL_SAMPLER_2D:
        case GL_SAMPLER_CUBE:
        */
            usize *= 4;
            break;
    }
    *result = g_malloc(usize);`;

export class UniformGetter {
    getAllocatorLines(method) {
        return bodyAlloc.split('\n');
    }

    adaptMethod(method) {
        const m = {...method};
        m.args = [...m.args];
        m.args.splice(2, 1);
        m.args[2].name = '*result';
        return m;
    }

    getResultAdjusterLines(method) {
        return ['    *length = usize;'];
    }
}

