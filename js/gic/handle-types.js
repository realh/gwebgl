import {cmdArgs, saveText} from '../sys.js';

const template = `#ifndef __GWEBGL_HANDLE_TYPES_H
#define __GWEBGL_HANDLE_TYPES_H

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

function webglAlias(wt, ct = 'unsigned') {
    wt = 'GwebglWebGL' + wt;
    return `/**\n * ${wt}: A WebGL handle type\n */\ntypedef ${ct} ${wt};\n`;
}

export function saveHandleTypes(filename) {
    saveText(filename, template);
}

if (cmdArgs.length == 2 && cmdArgs[0] == '-o') {
    saveHandleTypes(cmdArgs[1]);
}
