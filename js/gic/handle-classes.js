import {HeaderClassBuilder} from './class-header.js';
import {ClassImplementationBuilder} from './class-impl.js';
import {saveText} from '../sys.js';

export class BuildHandleClass {
    get nameTx() {return this.headerBuilder.nameTx};

    // dest is the output path
    constructor(dest) {
        this.dest = dest;
        this.headerBuilder = new HeaderClassBuilder('GLES/gl2.h');
        this.implBuilder = new ClassImplementationBuilder('GLES/gl2.h');
    }

    // name is the WebGL name, handleType is 'GLuint' or 'GLint'
    buildClass(name, handleType) {
        const outputBase = this.dest + '/' + this.nameTx.fileBaseName(name);
        const handleProp = {
            name: 'handle', type: handleType, readOnly: true, optional: false
        };
        this.headerBuilder.buildClass(name, [handleProp], true, 'GObject');
        this.implBuilder.buildClass(name, [handleProp], true, 'GObject');
        saveText(outputBase + '.h', this.headerBuilder.lines.join('\n'));
        saveText(outputBase + '.c', this.implBuilder.lines.join('\n'));
    }
}
