import { saveText } from '../sys.js';

const template = `#ifndef __GWEBGL_HANDLE_TYPES_H
#define __GWEBGL_HANDLE_TYPES_H

#include <glib.h>

#ifdef __cplusplus
extern "C" {
#endif

${webglAlias('Program')}
${webglAlias('Shader')}
${webglAlias('Buffer')}
${webglAlias('Framebuffer')}
${webglAlias('Renderbuffer')}
${webglAlias('Texture')}
${webglAlias('UniformLocation', 'int')}

#ifdef __cplusplus
}
#endif

#endif // __GWEBGL_HANDLE_TYPES_H
`

function webglAlias(wt, ct = 'guint') {
    wt = 'GwebglWebGL' + wt;
    return `/**\n * ${wt}:\n */\ntypedef ${ct} ${wt};\n`;
}

export function saveHandleTypes(filename) {
    saveText(filename, template);
}

/*
if (cmdArgs.length == 2 && cmdArgs[0] == '-o') {
    saveHandleTypes(cmdArgs[1]);
}
*/

export const handleTypes = [ 'WebGLProgram', 'WebGLShader',
    'WebGLBuffer', 'WebGLFramebuffer', 'WebGLRenderbuffer',
    'WebGLTexture', 'WebGLUniformLocation',
]
