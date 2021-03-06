import {ClassBuilder} from '../class-builder.js';
import {NameTransformer} from './name-tx.js';
import {OverloadSignaturesProcessor} from './overloads.js';

export class HeaderClassBuilder extends ClassBuilder {
    // glHeaderName should be 'GLES2/gl2.h' or 'GLES3/gl3.h' or nully. If nully
    // it will generate a conditional include that can be overriden by including
    // either of the above before the header this generates.
    constructor(outDir, glHeaderName, additionalIncludes, nameTx) {
        super(outDir);
        this.glHeaderName = glHeaderName;
        this.nameTx = nameTx ?? new NameTransformer();
        this.additionalIncludes = additionalIncludes || [];
        this.signaturesProcessor = new OverloadSignaturesProcessor();
    }

    buildClass(name, members, final, parent) {
        this.sentinel = `__${this.nameTx.upperedClassName(name)}_H`;
        parent = parent || 'GObject';
        super.buildClass(name, members, final, parent);
    }

    saveMethods(leafName, methods) {
    }

    getHeader() {
        let inc = [`#ifndef ${this.sentinel}`,
            `#define ${this.sentinel}`,
            ''
        ];
        /*
        if (!this.glHeaderName) {
            inc.push('#ifndef GL_GLES_PROTOTYPES',
                '#include <GLES2/gl2.h>',
                '#endif'
            );
        } else {
            inc.push(`#include <${this.glHeaderName}>`);
        }
        */
        inc.push(`#include <epoxy/gl.h>`);
        inc.push('#include <glib-object.h>');
        inc.push('#include "handle-types.h"');
        for (const i of this.additionalIncludes) {
            inc.push('#include ' + i);
        }
        inc.push('', 'G_BEGIN_DECLS');
        return inc;
    }

    getClassOpener() {
        this.gClassName = this.nameTx.classNameFromJS(this.name);
        this.classNameUpper = this.nameTx.upperedClassName(this.name);
        this.classNameLower = this.nameTx.loweredClassName(this.name);
        const splitCNU = this.classNameUpper.split('_');
        const nmSpcUpper = splitCNU[0];
        const unqClsNmUpper = splitCNU.slice(1).join('_');
        const lines = [`#define ${nmSpcUpper}_TYPE_${unqClsNmUpper} \\`,
            `    ${this.classNameLower}_get_type()`];
        const derivable = this.final ? "FINAL" : "DERIVABLE";
        lines.push(`G_DECLARE_${derivable}_TYPE( \\`,
            `    ${this.gClassName}, ${this.classNameLower}, \\`,
            `    ${nmSpcUpper}, ${unqClsNmUpper}, ${this.parent})`);
        if (!this.final) {
            lines.push('',
                `struct _${this.gClassName}Class {`,
                `    ${this.parent}Class parent_class;`,
                '};');
        }
        lines.push('');
        return lines;
    }

    getPropertyDeclarations() {
        const lines = [];
        for (const p of this.props) {
            if (p.construct) {
                const getter = {
                    name: 'get_' + p.name,
                    args: [],
                    returnType: p.type
                }
                lines.push(this.nameTx.methodSignature(getter, this.name) +
                    ';');
            }
        }
        return lines;
    }

    getFunctionDeclarations() {
        const lines = [];
        for (const m of this.methods) {
            const sig = this.nameTx.methodSignature(m, this.name);
            sig[sig.length - 1] += ';';
            lines.push(...sig, '');
        }
        return lines;
    }

    getClassCloser() {
        if (this.props.length) {
            const getterName = this.nameTx.methodNameFromJS(
                'get_webgl_constants', this.name)
            return [`GHashTable *${getterName}();`, ''];
        } else {
            return [];
        }
    }

    getFooter() {
        return ['G_END_DECLS', '', `#endif // ${this.sentinel}`];
    }
}
