import {ClassBuilder} from '../class-builder.js';
import {NameTransformer} from './name-tx.js';

export class HeaderClassBuilder extends ClassBuilder {
    // glHeaderName should be 'GLES2/gl2.h' or 'GLES3/gl3.h' or nully. If nully
    // it will generate a conditional include that can be overriden by including
    // either of the above before the header this generates.
    constructor(glHeaderName) {
        super();
        this.glHeaderName = glHeaderName;
        this.nameTx = new NameTransformer();
    }

    buildClass(name, members, final, parent) {
        this.gClassName = this.nameTx.classNameFromJS(this.name);
        this.classNameLower = this.nameTx.loweredClassName(this.name);
        parent = parent || 'GObject';
        if (final) {
            this.priv = `    ${this.gClassName}Private *priv = ` +
                `${this.classNameLower}_get_instance_private(self);`;
        }
        super.buildClass(name, members, final, parent);
    }

    getHeader() {
        return [`#include <gwebgl/${this.nameTx.fileBaseName(this.name)}>`];
    }

    getClassOpener() {
        const lines = [this.final ? `struct _${this.gClassName} {` :
            'typedef struct {'];
        if (this.final) {
            lines.push(`    ${this.parent} parent_instance;`);
        }
        const props = this.getPropertyBackings();
        lines.push(...props);
        lines.push(`}${this.final ? ';' : ` ${this.gClassName}Private;`}`, '');
        const withPrivate = this.final ? '' : '_WITH_PRIVATE';
        let parentUpper = this.nameTx.upperedClassName(this.parent);
        if (!this.parent.startsWith('Gwebgl') &&
            parentUpper.startsWith('GWEBGL_'))
        {
            parentUpper = parentUpper.substring(7);
        }
        parentUpper = parentUpper.split('_');
        lines.push(`G_DEFINE_TYPE${withPrivate}(` +
            `${this.gClassName}, ${this.classNameLower}, ` +
            `${parentUpper[0]}_TYPE_${parentUpper.slice(1).join('_')});`, '');
        // TODO: class_init and init functions
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
                lines.push(this.nameTx.methodSignature(getter, this.name));
                lines.push('{');
                if (!this.final) {
                    lines.push(this.priv);
                }
                lines.push(`    return ${this.final ? 'self' : 'priv'}->` +
                    `${p.name};`);
                lines.push('}', '');
            }
        }
        return lines;
    }

    getFunctionDeclarations() {
        const lines = [];
        for (const m of this.methods) {
            // TODO: Implement function body
            lines.push(this.nameTx.methodSignature(m, this.name) + ';');
        }
        return lines;
    }

    getClassCloser() {
        return [];
    }

    getFooter() {
        return ['G_END_DECLS'];
    }
}
