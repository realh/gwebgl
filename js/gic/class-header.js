import {ClassBuilder} from '../class-builder.js';
import {NameTransformer} from './name-tx.js';

export class HeaderClassBuilder extends ClassBuilder {
    // glHeaderName should be 'GLES2/gl2.h' or 'GLES3/gl3.h' or nully. If nully
    // it will generate a conditional include that can be overriden by including
    // either of the above before the header this generates.
    constructor(glHeaderName, final) {
        super();
        this.glHeaderName = glHeaderName;
        this.nameTx = new NameTransformer();
    }

    buildClass(name, members, final, parent) {
        this.sentinel = `__${this.nameTx.upperedClassName()}_H`
        parent = parent || 'GObject';
        super.buildClass(name, members, final, parent);
    }

    getHeader() {
        let inc = [`#ifndef ${this.sentinel}`,
            `#define ${this.sentinel}`,
            '#endif',
            ''
        ];
        if (!this.glHeaderName) {
            inc.push('#ifndef GL_GLES_PROTOTYPES',
                '#include <GLES3/gl3.h>',
                '#endif'
            );
        } else {
            inc.push(`#include <${this.glHeaderName}>`);
        }
        inc.push('#include <glib-object.h>');
        inc.push('', 'G_BEGIN_DECLS');
        return inc;
    }

    getClassOpener() {
        this.classNameUpper = this.nameTx.upperedClassName(this.name);
        this.classNameLower = this.nameTx.loweredClassName(this.name);
        const [nmSpcUpper, unqClsNmUpper] = this.classNameUpper.split('_', 2);
        const lines = [`#define ${nmSpcUpper}_TYPE_${unqClsNmUpper} ` +
            `${this.classNameLower}_get_type()`];
        const derivable = this.final ? "FINAL" : "DERIVABLE";
        lines.push(`G_DEFINE_${derivable}_TYPE(` +
            `${this.nameTx.classNameFromJS()}, ${this.classNameLower}, ` +
            `${nmSpcUpper}, ${unqClsNmUpper}, ${this.parent})`);
        return lines;
    }

    getPropertyDeclarations() {
        return [];
    }

    getFunctionDeclarations() {
        const lines = [];
        for (const [k, v] of this.methods) {
            lines.push(this.nameTx.methodSignature(v, this.name));
        }
        return lines;
    }

    getclassCloser() {
        return [];
    }

    getFooter() {
        return ['G_END_DECLS', '', `#endif // ${this.sentinel}`];
    }
}
