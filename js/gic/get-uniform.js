import {MultiGetter} from './multi-getter.js';

export class UniformGetter extends MultiGetter {
    getMultiAllocatorLines(method) {
        return bodyAlloc.split('\n');
    }
}

var bodyAlloc = `
    GLint resultSize;
    GLenum utype;
    gwebgl_webgl_rendering_context_base_getActiveUniform(self,
        program, location, &resultSize, &utype, NULL);
    switch (utype) {
        case GL_INT_VEC2:
        case GL_FLOAT_VEC2:
        case GL_BOOL_VEC2:
            resultSize *= 8;
            break;
        case GL_INT_VEC3:
        case GL_FLOAT_VEC3:
        case GL_BOOL_VEC3:
            resultSize *= 12;
            break;
        case GL_INT_VEC4:
        case GL_FLOAT_VEC4:
        case GL_BOOL_VEC4:
            resultSize *= 16;
            break;
        case GL_FLOAT_MAT2:
            resultSize *= 4 * 4;
            break;
        case GL_FLOAT_MAT3:
            resultSize *= 9 * 4;
            break;
        case GL_FLOAT_MAT4:
            resultSize *= 16 * 4;
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
        /* These should be filtered out and handled by the 'single' versions
        case GL_INT:
        case GL_FLOAT:
        case GL_UNSIGNED_INT:
        case GL_BOOL:
        case GL_SAMPLER_2D:
        case GL_SAMPLER_CUBE:
        */
            resultSize *= 4;
            break;
    }
    gpointer data = g_malloc(resultSize);`;
