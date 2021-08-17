import { cmdArgs, mkDirWithParents } from '../sys.js';
import { WebGLToGLES } from '../webgl-to-gles.js';
import { GICGenerator } from './generator.js';
import { saveHandleTypes } from './handle-types.js';

function main(refsDir, outDir) {
    const d = `${outDir}/gwebgl`;
    mkDirWithParents(d);
    saveHandleTypes(`${d}/handle-types.h`);
    const generator = new GICGenerator();
    const wToES = new WebGLToGLES(generator, refsDir, outDir);
    wToES.processAll();
}

main(cmdArgs[0], cmdArgs[1]);