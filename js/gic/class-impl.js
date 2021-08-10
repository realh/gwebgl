import {consoleLog} from '../sys.js';
import {ClassBuilder} from '../class-builder.js';
import {NameTransformer} from './name-tx.js';

export class ClassImplementationBuilder extends ClassBuilder {
    constructor() {
        super();
        this.nameTx = new NameTransformer();
    }

    buildClass(name, members, final, parent) {
        this.gClassName = this.nameTx.classNameFromJS(name);
        this.classNameLower = this.nameTx.loweredClassName(name);
        this.classNameUpper = this.nameTx.upperedClassName(name);
        parent = parent || 'GObject';
        if (!final) {
            this.priv = `    ${this.gClassName}Private *priv = ` +
                `${this.classNameLower}_get_instance_private(self);`;
        }
        super.buildClass(name, members, final, parent);
    }

    getHeader() {
        return [`#include <gwebgl/${this.nameTx.fileBaseName(this.name)}.h>`];
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
        // instance init()
        lines.push('static void ' +
                this.nameTx.methodNameFromJS('init', this.name) + '(' +
                this.gClassName + ' *self)',
            '{', '    (void) self;', '}', '');
        return lines;
    }

    getPropertyBackings() {
        const lines = [];
        for (const p of this.props) {
            if (p.construct) {
                const t = this.errorCheckedTypeConversion({
                    type: p.type,
                    memberOf: this.name
                });
                lines.push(`    ${t}${p.name};`);
            }
        }
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

        let setter = false;
        if (this.props) {
            // enum of indexes
            lines.push('enum {');
            let first = true;
            for (const p of this.props) {
                let d = '    ' + this.propIndexName(p);
                if (first) {
                    d += ' = 1';
                    first = false;
                }
                lines.push(d + ',');
            }
            lines.push('    NUM_PROPS', '};', '');
            lines.push('static GParamSpec *properties[NUM_PROPS] = {NULL};',
                '');
            
            const sap = this.selfAndPriv();
            
            // setter if needed
            for (const p of this.props) {
                if (!p.construct && !p.readonly) {
                    continue;
                }
                if (!setter) {
                    lines.push('static void set_property(GObject *object, ' +
                        'guint prop_id, const GValue *value, ' +
                        'GParamSpec *pspec)', '{');
                    lines.push(...sap[0]);
                    lines.push('    switch (prop_id)', '    {');
                    setter = true;
                }
                lines.push(`        case ${this.propIndexName(p)}:`,
                    `            ${sap[1]}->${p.name} = `,
                    `            g_value_get_` +
                    `${this.nameTx.gParamSpecType(p.type)}(value);`,
                    `            break;`);
            }
            if (setter) {
                lines.push(...this.closePropSwitch());
            }

            // getter
            lines.push('static void get_property(GObject *object, ' +
                    'guint prop_id, GValue *value, GParamSpec *pspec)', '{');
            lines.push(...sap[0]);
            // Avoids a warning if priv/self are unused, harmless if they are
            lines.push('    (void) self;');
            if (!this.final) {
                lines.push('    (void) priv;');
            }

            lines.push('    switch (prop_id)', '    {');
            for (const p of this.props) {
                const src = p.construct ?
                    `${sap[1]}->${p.name}` : `GL_${p.name}`;
                lines.push(`        case ${this.propIndexName(p)}:`,
                    `            g_value_set_` +
                    `${this.nameTx.gParamSpecType(p.type)}(value, ${src});`,
                    `            break;`);
            }
            lines.push(...this.closePropSwitch());
        }

        // class_init()
        lines.push('static void ' +
                this.nameTx.methodNameFromJS('class_init', this.name) + '(' +
                this.gClassName + 'Class *klass)',
            '{',
            '    GObjectClass *oclass = G_OBJECT_CLASS(klass);');

        if (setter) {
            lines.push(`    oclass->set_property = set_property;`);
        }
        if (this.props) {
            lines.push(`    oclass->get_property = get_property;`);
        }
        for (const p of this.props) {
            lines.push(`    properties[${this.propIndexName(p)}] = `,
                ...this.paramSpec(p));
        }
        if (this.props) {
            lines.push('    g_object_class_install_properties(oclass, ' +
                'NUM_PROPS, properties);');
        }
        lines.push('}');

        return lines;
    }

    getFunctionDeclarations() {
        const lines = [];
        for (const m of this.methods) {
            lines.push(...this.nameTx.methodSignature(m, this.name, true));
            lines.push(this.nameTx.methodSignature(m, this.name) + ';');
            // TODO: Implement function body
        }
        return lines;
    }

    getClassCloser() {
        return [];
    }

    getFooter() {
        return [];
    }

    propIndexName(propName) {
        if (propName.hasOwnProperty('name')) {
            propName = propName.name;
        }
        return 'PROP_' + propName.toUpperCase();
    }

    paramSpec(prop) {
        const n = `"${prop.name}"`;
        const gpst = this.nameTx.gParamSpecType(prop.type);
        const lines = [`    g_param_spec_${gpst}(`,
            `        ${n}, ${n}, ${n}, `];
        let minmax = '        ';
        if (gpst.includes("int") || gpst.includes("float")) {
            const u = gpst.toUpperCase();
            const min = gpst.includes('uint') ? 0 : 'G_MIN' + u;
            minmax += `${min}, G_MAX${u}, `;
        }
        let dflt = prop.construct ? '0' : `GL_` + prop.name;
        lines.push(minmax + dflt + ',');
        let flags = prop.construct ?
            'G_PARAM_READWRITE | G_PARAM_CONSTRUCT_ONLY' : 'G_PARAM_READABLE';
        lines.push('        ' + flags + ');');
        return lines;
    }

    selfAndPriv() {
        const lines = [`    ${this.gClassName} *self = ` +
            `${this.classNameUpper}(object);`];
        if (!this.final) {
            lines.push(this.priv);
        }
        const priv = this.final ? 'self' : 'priv';
        return [lines, priv];
    }

    // Also closes the function definition
    closePropSwitch() {
        return ['        default:',
            '            G_OBJECT_WARN_INVALID_PROPERTY_ID(object, ' +
                'prop_id, pspec);',
            '            break;', '    }', '}', ''];
    }
}
