import { ClassBuilder } from '../class-builder.js';
import { TextureFromGdkPixbuf } from './gpixbuf.js';
import { adaptMethodForInvocation } from './invocation.js';
import { MultiGetter } from './multi-getter.js';
import { NameTransformer } from './name-tx.js';
import { OverloadSignaturesProcessor } from './overloads.js';
import {
    ReturnedAllocatedResultGenerator, ReturnOutParameter,
    ShaderActiveVarAllocatedResultGenerator, ShaderPrecisionFixer, StringGetter
} from './result-buffers.js';
import { ShaderSource } from './shader-source.js';

export class ClassImplementationBuilder extends ClassBuilder {
    constructor(outDir, nameTx) {
        super(outDir);
        this.nameTx = nameTx ?? new NameTransformer();
        this.signaturesProcessor = new OverloadSignaturesProcessor();
    }

    buildClass(name, members, final, parent) {
        this.name = name;
        this.gClassName = this.nameTx.classNameFromJS(name);
        this.classNameLower = this.nameTx.loweredClassName(name);
        this.classNameUpper = this.nameTx.upperedClassName(name);
        parent = parent || 'GObject';
        // Only the base class needs private data, and only if it supports
        // the canvas property as a GtkGLArea. I've decided to shift support
        // for canvas to the JS wrapper, so now nothing needs private data
        /*
        if (name == 'WebGLRenderingContextBase' && enableCanvasAsGtkGLArea) {
            this.priv = [`    ${this.gClassName}Private *priv = `,
                `        ${this.classNameLower}_get_instance_private(self);`];
        } else {
            this.priv = false;
        }
        */
        this.priv = false;
        super.buildClass(name, members, final, parent);
    }

    getHeader() {
        const header = [`#include "${this.nameTx.fileBaseName(this.name)}.h"`];
        return header;
    }

    getClassOpener() {
        const lines = [];
        if (this.final) {
            lines.push(`struct _${this.gClassName} {`,
             `    ${this.parent} parent_instance;`);
        } else if (this.priv) {
            lines.push('typedef struct {');
        }
        if (this.final) {
            lines.push('};');
        } else if (this.priv) {
            lines.push(`} ${this.gClassName}Private;`);
        }
        const withPrivate = this.priv ? '_WITH_PRIVATE' : '';
        let parentUpper = this.nameTx.upperedClassName(this.parent);
        if (!this.parent.startsWith('Gwebgl') &&
            parentUpper.startsWith('GWEBGL_'))
        {
            parentUpper = parentUpper.substring(7);
        } else if (parentUpper.startsWith('GWEBGL_WEB_GL')) {
            parentUpper = parentUpper.replace('WEB_GL', 'WEBGL_');
        }
        parentUpper = parentUpper.split('_');
        lines.push(`G_DEFINE_TYPE${withPrivate}( \\`,
            `    ${this.gClassName}, ${this.classNameLower}, \\`,
            `    ${parentUpper[0]}_TYPE_${parentUpper.slice(1).join('_')});`,
            '');
        // instance init()
        lines.push('static void ' +
                this.nameTx.methodNameFromJS('init', this.name) + '(',
                '    ' + this.gClassName + ' *self)',
            '{', '    (void) self;', '}', '');
        return lines;
    }

    getPropertyDeclarations() {
        const lines = [];

        if (this.props.length) {
            const template = `
static GHashTable *webgl_constants;

/**
 * ${this.gClassName}_get_webgl_constants:
 * Returns: (transfer none) (element-type utf8 guint):
 */
GHashTable *${this.gClassName}_get_webgl_constants()
{
    return webgl_constants;
}
`;
            lines.push(...template.split('\n'));
        }

        lines.push('static void ' +
                this.nameTx.methodNameFromJS('class_init', this.name) + '(',
                '    ' + this.gClassName + 'Class *klass)',
                '{',
                '    (void) klass;');
        if (this.props.length) {
            lines.push('    webgl_constants = g_hash_table_new(g_str_hash, ' +
                'g_str_equal);');
        }
        for (const p of this.props) {
            lines.push('    g_hash_table_insert(webgl_constants, ',
                `        "${p.name}", (gconstpointer *) GL_${p.name});`);
        }
        lines.push('}', '');
        return lines;
    }

    getFunctionDeclarations() {
        const lines = [];
 
        for (const m of this.methods) {
            const sig = this.nameTx.methodSignature(m, this.name);
            if (sig[0].startsWith('//')) { continue; }
            lines.push(...this.nameTx.methodSignature(m, this.name, true));
            lines.push(...sig, '{');
            const inv = adaptMethodForInvocation(m);
            lines.push(...this.methodBody(inv));
            lines.push('}', '');
        }
        return lines;
    }

    methodBody(m) {
        const castToString = m.name == 'getString';
        const lines = [];
        lines.push('    (void) self;');
        const create = m.args.length == 2 && m.args[1].name == '&a';
        if (create) {
            lines.push('    GLuint a;');
        }
        let alloc = m.name == 'getShaderPrecisionFormat' ?
            new ShaderPrecisionFixer() : null;
        if (!alloc) {
            alloc = ClassImplementationBuilder.getters[m.name];
        }
        if (!alloc) {
            alloc = this.getParameterGetterFixer(m);
        }
        if (alloc) {
            lines.push(...alloc.getAllocatorLines(m));
            m = alloc.adaptMethod(m);
        }
        let s = m.returnType.name == 'void' ? '    ' : '    return ';
        if (castToString) {
            s += '(const char *) ';
        }
        s += this.webGLMethodNameToGLESFunction(m) + '(';
        if (!m.args.length) {
            s += ');';
        }
        for (let i = 0; i < m.args.length; ++i) {
            let app = m.args[i].name;
            if (i == m.args.length - 1) {
                app += ');'
            } else {
                app += ', ';
            }
            if (s.length + app.length > 80) {
                lines.push(s);
                s = '        ' + app;
            } else {
                s += app;
            }
        }
        lines.push(s);
        if (alloc) {
            lines.push(...alloc.getResultAdjusterLines(m));
        }
        if (create) {
            lines.push('    return a;');
        }
        return lines;
    }

    getParameterGetterFixer(m) {
        if (m.hasOwnProperty('name')) {
            m = m.name;
        }
        if (m.startsWith('get') && !m.startsWith('getUniform') &&
            (m.includes('Parameter') || m.endsWith('iv')))
        {
            let resultType = 'GLint';
            if (m.endsWith('i64v')) {
                resultType = 'GLint64';
            } else if (m.endsWith('fv')) {
                resultType = 'GLfloat';
            }
            return new ReturnOutParameter(resultType);
        }
        return null;
    }

    webGLMethodNameToGLESFunction(m) {
        let nm = m.hasOwnProperty('name') ? m.name : m;
        nm = ClassBuilder.renames[nm] || nm;
        if (nm == 'depthRange') {
            nm += 'f';
        } else if (nm.endsWith('FromArray')) {
            nm = nm.replace('FromArray', '');
        } else if (nm.endsWith('FromByteArray')) {
            nm = nm.replace('FromByteArray', '');
        } else if (ClassBuilder.ivGetters.includes(nm)) {
            nm = nm + 'iv';
        }
        return `gl${nm.substring(0, 1).toUpperCase()}${nm.substring(1)}`;
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
        const hyphenated = n.replaceAll('_', '-')
        const gpst = this.nameTx.gParamSpecType(prop.type);
        const lines = [`g_param_spec_${gpst}(`,
            `        ${hyphenated},`, `        ${n},`, `        ${n},`];
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
        const lines = [`    ${this.gClassName} *self = `,
            `        ${this.classNameUpper}(object);`];
        if (this.priv) {
            lines.push(...this.priv);
        }
        const priv = this.priv ? 'priv' : 'self';
        return [lines, priv];
    }

    // Also closes the function definition
    closePropSwitch() {
        return ['        default:',
            '            G_OBJECT_WARN_INVALID_PROPERTY_ID(object, ' +
                'prop_id, pspec);',
            '            break;', '    }', '}', ''];
    }

    static getters = {
        getActiveAttrib: new ShaderActiveVarAllocatedResultGenerator(
            'ACTIVE_ATTRIBUTE_MAX_LENGTH'),
        getActiveUniform: new ShaderActiveVarAllocatedResultGenerator(
            'ACTIVE_UNIFORM_MAX_LENGTH'),
        getAttachedShaders: new ReturnedAllocatedResultGenerator(
            'ATTACHED_SHADERS', 'GLuint', 'glGetProgramiv'),
        getProgramInfoLog: new ReturnedAllocatedResultGenerator(
            'INFO_LOG_LENGTH', 'char', 'glGetProgramiv'),
        getShaderInfoLog: new ReturnedAllocatedResultGenerator(
            'INFO_LOG_LENGTH', 'char', 'glGetShaderiv'),
        getShaderSource: new ReturnedAllocatedResultGenerator(
            'SHADER_SOURCE_LENGTH', 'char', 'glGetShaderiv'),
        getSupportedExtensions: new StringGetter(true, 'EXTENSIONS'),
        getParameteri: new MultiGetter('gint', 'getIntegerv'),
        getParameterf: new MultiGetter('gfloat', 'getFloatv'),
        getParameterb: new MultiGetter('guint8', 'getBooleanv'),
        getParameteriv: new MultiGetter(null, 'getIntegerv'),
        getParameterfv: new MultiGetter(null, 'getFloatv'),
        getParameterbv: new MultiGetter(null, 'getBooleanv'),
        getUniformi: new MultiGetter('gint'),
        getUniformf: new MultiGetter('gfloat'),
        getUniformiv: new MultiGetter(),
        getUniformfv: new MultiGetter(),
        getVertexAttribi: new MultiGetter('gint'),
        getVertexAttribf: new MultiGetter('gfloat'),
        getVertexAttribfv: new MultiGetter(),
        getVertexAttribOffset: new ReturnOutParameter('glong',
            'getVertexAttribPointerv'),
        shaderSource: new ShaderSource(),
        texImage2DFromPixbuf: new TextureFromGdkPixbuf(),
        texSubImage2DFromPixbuf: new TextureFromGdkPixbuf(),
    }
}
