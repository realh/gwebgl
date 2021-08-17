import { cmdArgs, mkDirWithParents } from '../sys.js';
import { WebGLToGLES } from '../webgl-to-gles.js';
import { GICGenerator } from './generator.js';
import { saveHandleTypes } from './handle-types.js';

// outDir must end with 'gwebgl' for the includes to work
function main(refsDir, outDir) {
    mkDirWithParents(outDir);
    saveHandleTypes(`${outDir}/handle-types.h`);
    const generator = new GICGenerator();
    const wToES = new WebGLToGLES(generator, refsDir, outDir);
    wToES.processAll();
}

main(cmdArgs[0], cmdArgs[1]);
