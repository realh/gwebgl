import { parseInterface } from './iface-parser.js';
import { loadText, mkDirWithParents } from './sys.js';

// Generates the source code for implementing WebGL on GLES
export class WebGLToGLES {
    // generator is the object that generates the source files in the target
    // language
    constructor(generator, refsDir, outDir) {
        this.generator = generator;
        this.refsDir = refsDir;
        this.outDir = outDir;
        mkDirWithParents(outDir);
    }

    processInterface(name) {
        const filename = `${this.refsDir}/${name}.d.ts`;
        const ifaceTxt = loadText(filename);
        const ifaceData = parseInterface(ifaceTxt);
        this.generator.generate(name, ifaceData, this.outDir);
    }

    processAll() {
        this.processInterface('WebGLRenderingContextBase');
        this.processInterface('WebGLRenderingContextOverloads');
    }
}