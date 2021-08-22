import { cmdArgs, mkDirWithParents, saveText } from '../sys.js';
import { WebGLToGLES } from '../webgl-to-gles.js';
import { GICGenerator } from './generator.js';
import { saveHandleTypes } from './handle-types.js';
import { packageHeader } from './pkg-header.js';

// outDir must end with 'gwebgl' for the includes to work
function main(refsDir, outDir) {
    mkDirWithParents(outDir);
    saveHandleTypes(`${outDir}/handle-types.h`);
    const generator = new GICGenerator(outDir);
    const wToES = new WebGLToGLES(generator, refsDir, outDir);
    wToES.processAll();
    saveText(`${outDir}/gwebgl.h`, packageHeader);
}

main(cmdArgs[0], cmdArgs[1]);
