// This is an abstract class that can be used as a base for outputting a class
// in a specific format.

import { copyMethod, showMethodSignature } from './iface-parser.js';
import { saveText } from './sys.js';

export class ClassBuilder {
    // nameTx: NameTransformer

    constructor(outDir) {
        this.outDir = outDir;
    }

    // members is a flat array of member objects where a member is a property
    // or method as described in iface-parser.js. Some classes have properties
    // with a 'construct' flag. Such properties are read-only | construct-only
    // and have getters, all non-introspected.
    // The 'final' bool argument determines whether the class is derivable.
    // parent is the name (in the target bindings) of the parent class. It can
    // be nully to use the default base class for the target (eg GObject).
    buildClass(name, members, final, parent) {
        this.name = name;
        this.final = final;
        this.parent = parent;
        // Split into properties and methods
        this.props = [];
        this.methods = [];
        for (const m of members) {
            if (m.hasOwnProperty('readOnly')) {
                this.props.push(m);
            } else if (!this.shouldRemove(m)) {
                this.methods.push(m);
            }
        }
        this.saveMethods('orig-methods', this.methods);
        const webgl2 = name.includes('WebGL2');
        this.processParameterGetters(webgl2);
        if (this.signaturesProcessor) {
            this.methods = this.signaturesProcessor.processSignatures(
                this.methods, webgl2);
        }
        this.saveMethods('changed-methods', this.methods);
        // Sort to make sure overloads appear consecutively
        const sorter = (a, b) => {
            a = a.name;
            b = b.name;
            if (a < b) {
                return -1;
            } else if (a > b) {
                return 1;
            } else {
                return 0;
            }
        }
        this.props.sort(sorter);
        this.methods.sort(sorter);
        this.process();
    }

    process() {
        this.filterProps();
        this.lines = this.getHeader();
        this.lines.push('', ...this.getClassDefinition());
        this.lines.push('', ...this.getFooter());
    }

    getClassDefinition() {
        const lines = this.getClassOpener();
        lines.push(...this.getPropertyDeclarations());
        lines.push(...this.getFunctionDeclarations());
        lines.push(...this.getClassCloser());
        return lines;
    }

    shouldRemove(method) {
        return method.name == 'isContextLost';
    }

    // Removes properties that have no equivalent in OpenGL ES
    filterProps() {
        this.props = this.props.filter(p => !p.name.includes('WEBGL'));
        if (this.name == 'WebGLRenderingContextBase') {
            this.props = this.props.filter(p => {
                // Remove anything with lower case eg 'canvas',
                // 'bufferWidth', 'bufferHeight'
                /*
                if (p.name.toUpperCase() != p.name) {
                    return false;
                }
                */
                // OpenGL ES 2.0 doesn't support DEPTH_STENCIL_*;
                if (p.name.startsWith('DEPTH_STENCIL')) {
                    return false;
                }
                // TODO: Add DEPTH_STENCIL props to WebGL2RenderingContextBase
                return true;
            });
        }
    }

    // webgl2 is true for webgl2
    processParameterGetters(webgl2) {
        const changedMethods = [];
        for (let m of this.methods) {
            const nm = m.name;
            // Certain methods can't be mapped directly in the GObject system,
            // so need to be replaced by two or more functions. Then a JS
            // wrapper needs to work out which GI method to call, the size of
            // the result array (in bytes) and adapt the types.
            const multiGet = ClassBuilder.multiGetters[nm];
            if (multiGet) {
                for (const suf of multiGet)
                {
                    let rt;
                    let resultSize = false;
                    if (suf == 'i') {
                        rt = {name: 'GLint'};
                    } else if (suf == 'f') {
                        rt = {name: 'GLfloat'};
                    } else if (suf == 'b') {
                        // GLboolean is a byte, gboolean is 32-bits
                        rt = {name: 'GLubyte'};
                    } else if (suf == 'String') {
                        // GLboolean is a byte, gboolean is 32-bits
                        rt = {name: 'string'};
                    } else {
                        rt = {name: 'Uint8Array', transfer: 'full'};
                        resultSize = true;
                    }
                    let m2 = copyMethod(m);
                    if (suf == 'String') {
                        m2.name = 'getString';
                    } else {
                        m2.name += suf;
                    }
                    m2.returnType = rt;
                    if (resultSize) {
                        m2.args.push({ name: 'resultSize',
                            optional: false, type: { name: 'GLint' }});
                    }
                    changedMethods.push(m2);
                }
                continue;
            }
            if (ClassBuilder.ivAndi64vGetters.includes(nm) && webgl2) {
                const m2 = copyMethod(m);
                m2.name += 'i64v';
                m2.returnType.name = 'GLint64';
                changedMethods.push(m2);
                // TODO: i64v methods have to be added to
                // WebGL2RenderingContextBase
            }
            if (ClassBuilder.ivAndfvGetters.includes(nm)) {
                const m2 = copyMethod(m);
                m2.name += 'fv';
                m2.returnType.name = 'GLfloat';
                changedMethods.push(m2);
            }
            if (ClassBuilder.ivAndi64vGetters.includes(nm) ||
                ClassBuilder.ivGetters.includes(nm) ||
                ClassBuilder.ivAndfvGetters.includes(nm))
            {
                m = copyMethod(m);
                m.name += 'iv';
                m.returnType.name = 'GLint';
            } else if (ClassBuilder.ivGettersStripParameter.includes(nm)) {
                m = copyMethod(m);
                m.name = nm.replace('Parameter', '') + 'iv';
                m.returnType.name = 'GLint';
            }
            changedMethods.push(m);
        }
        this.methods = changedMethods;
    }

    saveMethods(leafname, methods) {
        saveText(`${this.outDir}/${this.name}-${leafname}`,
            methods.map(m => showMethodSignature(m) + ';').join('\n'));
    }

    static ivAndi64vGetters = ['getBufferParameter'];
    static ivAndfvGetters = ['getTexParameter'];

    static ivGetters = ['getFramebufferAttachmentParameter',
        'getRenderbufferParameter'];
    static ivGettersStripParameter = ['getProgramParameter',
        'getShaderParameter'];

    static multiGetters = {
        'getUniform': ['iv', 'fv', 'i', 'f'],
        'getVertexAttrib': ['fv', 'i', 'f'],
        'getParameter': ['iv', 'fv', 'i', 'f', 'bv', 'b', 'String'],
    }

    // abstract getHeader(): string[]
    // abstract getclassOpener(): string[]
    // abstract getPropertyDeclarations(): string[]
    // abstract getFunctionDeclarations(): string[]
    // abstract getclassCloser(): string[]
    // abstract getFooter(): string[]
}
