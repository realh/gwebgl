import { mkDirWithParents, saveText } from '../sys.js';
import { HeaderClassBuilder } from './class-header.js';
import { ClassImplementationBuilder } from './class-impl.js';
import { NameTransformer } from './name-tx.js';

export var enableGdkPixbuf = true;

// Generates GObject-Introspected C source and header files
export class GICGenerator {
    constructor() {
        this.nameTx = new NameTransformer();
        this.headerBuilder = new HeaderClassBuilder(null, null, this.nameTx);
        this.sourceBuilder = new ClassImplementationBuilder(this.nameTx);
    }

    generate(name, ifaceData, outDir) {
        outDir += '/gwebgl';
        mkDirWithParents(outDir);
        if (name.endsWith('Overloads')) {
            name = name.replace('Overloads', '');
        }
        let additionalIncludes = [];
        let final = false;
        let parent;
        if (name == 'WebGLRenderingContext') {
            additionalIncludes.push('<gwebgl/rendering-context-base.h>');
            parent = 'GwebglWebGLRenderingContextBase';
            if (enableGdkPixbuf) {
                additionalIncludes.push('<gdk-pixbuf/gdk-pixbuf.h>');
            }
        } else {
            parent = 'GObject';
        }
        const baseName = this.nameTx.fileBaseName(name);
        this.headerBuilder.additionalIncludes = additionalIncludes;
        this.headerBuilder.buildClass(name, ifaceData, final, parent);
        saveText(`${outDir}/${baseName}.h`,
            this.headerBuilder.lines.join('\n'));
        this.sourceBuilder.buildClass(name, ifaceData, final, parent);
        saveText(`${outDir}/${baseName}.c`,
            this.sourceBuilder.lines.join('\n'));
    }
}