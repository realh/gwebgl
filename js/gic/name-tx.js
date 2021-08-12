import {consoleWarn, consoleLog} from '../sys.js';
import {TypeMapper} from './types.js';
import {handleTypes} from './handle-types.js';

// NameTransformer for transforming names from JS/TS WebGL to C/GObject
export class NameTransformer {
    constructor() {
        this.typeMapper = new TypeMapper();
    }

    typeFromJS(name) {
        return typeMapper.mapType(typeName);
    }

    classNameFromJS(name) {
        return 'Gwebgl' + name;
    }

    // This could go a bit wrong with groups of more than one capital, but that
    // should just make the C a bit ugly without breaking anything. We'll make
    // an exception for GObject though.
    separateCamels(name) {
        if (name == 'GObject') {
            return 'G_OBJECT';
        }
        let s = 'gwebgl_';
        // We want to treat 'WebGL' as one word.
        if (name.startsWith('WebGL2')) {
            s += 'webgl2_';
            name = name.substring(6);
        } else if (name.startsWith('WebGL')) {
            s += 'webgl_';
            name = name.substring(5);
        }
        // Add an underscore before any capital that follows a non-capital.
        name = /([a-z0-9])([A-Z])/g[Symbol.replace](name, '$1_$2');
        return s + name;
    }

    loweredClassName(name) {
        return this.separateCamels(name).toLowerCase();
    }

    upperedClassName(name) {
        return this.separateCamels(name).toUpperCase();
    }

    fileBaseName(name) {
        return this.loweredClassName(name).replaceAll('_', '-').
            replace(/gwebgl-webgl2?-/, '');
    }

    // Both names are from the JS/TS API.
    methodNameFromJS(methodName, className) {
        return `${this.loweredClassName(className)}_${methodName}`;
    }

    // method has the interface described in iface-parser.js.
    // Not strictly just a name transformation, but this is the most convenient
    // place for it. If a type transformation fails, the result will have a
    // '//' comment prefix.
    methodSignature(method, className, annotations = false) {
        const nm = method.name;
        let comment = '';
        if (!this.adjustSignature(method, className)) {
            comment = '// ';
        }
        const returnType = this.errorCheckedTypeConversion({
            type: method.returnType,
            memberOf: className,
            method: method.name
        });
        if (returnType.includes('/*')) {
            comment = '// ';
        }
        const methodName = this.methodNameFromJS(method.name, className)
        let lines = [];
        if (annotations && !comment) {
            lines = ['/**', ` * ${methodName}: (method):`];
        }
        const args = [`${this.classNameFromJS(className)} *self`];
        for (let a of method.args) {
            const td = {
                type: a.type,
                memberOf: className,
                method: method.name,
                argName: a.name
            };
            let t = this.errorCheckedTypeConversion(td);
            if (a.out) {
                t += '*';
            }
            if (lines) {
                let s = ` * @${a.name}:`;
                let lengthClause = '';
                if (a.out) {
                    if (a.name == 'result' && (method.name == 'getUniformiv' ||
                        method.name == 'getUniformfv'))
                    {
                        lengthClause = ' length=length';
                    }
                    s += ' (out)';
                    if (a.optional) {
                        s += ' (optional)';
                    }
                }
                s = this.typeAnnotation(s, a.type, lengthClause);
                lines.push(s);
            }
            a = `${t}${a.name}`;
            if (a.includes('/*')) {
                comment = '// ';
            }
            args.push(a);
        }
        if (method.returnType.name != 'void' && lines) {
            const a = this.typeAnnotation('', method.returnType,
                ' zero-terminated=1');
            lines.push(
                ` * Returns:${a}`);
        }
        if (comment) {
            lines = [];
        } else if (lines) {
            lines.push(' */');
        }
        return annotations ? lines :
            `${comment}${returnType}${methodName}(${args.join(', ')})`;
    }

    typeAnnotation(s, type, lengthClause = '') {
        if (type.nullable && !handleTypes.includes(type.name)) {
            s += ' (nullable)';
        }
        if (type.transfer) {
            s += ` (transfer ${type.transfer})`;
        }
        if (type.name.endsWith('[]')) {
            const t = type.name.substring(0, type.name.length - 2);
            let etype = TypeMapper.gElementTypes[t];
            if (!etype) {
                throw new Error(`TypeMapper.gElementTypes.${t} is undefined`);
            }
            s += ` (array${lengthClause}) (element-type ${etype})`;
        }
        if (s && !s.endsWith(':')) {
            s += ':';
        }
        return s;
    }

    // Some methods have signatures that don't map directly between WebGL
    // and OpenGL ES. This modifies the method in place and returns it. If it
    // returns null the method is not supported.
    adjustSignature(method, className) {
        if (NameTransformer.methodBlacklist.includes(method.name)) {
            return null;
        }
        const rt = method.returnType.name;
        switch (rt) {
            case 'GwebglWebGLContextAttributes':
                return null;
            case 'WebGLActiveInfo':
                method.returnType.name = 'void';
                this.addOutArg(method, 'size', 'GLint');
                this.addOutArg(method, 'type', 'GLenum');
                this.addOutArg(method, 'name', 'string');
                break;
            case 'WebGLShaderPrecisionFormat':
                method.returnType.name = 'void';
                this.addOutArg(method, 'range_min', 'GLint');
                this.addOutArg(method, 'range_max', 'GLint');
                this.addOutArg(method, 'precision', 'GLint');
                break;
        }
        return method;
    }

    addOutArg(method, argName, argType) {
        let nullable = undefined;
        let transfer = undefined;
        if (argType == 'string') {
            nullable = true;
            transfer = 'full';
        }
        method.args.push({name: argName,
            type: {name: argType, nullable, transfer},
            optional: true, out: true});
    }

    errorCheckedTypeConversion(typeDetails) {
        try {
            let t = this.typeMapper.mapType(typeDetails);
            if (!t.endsWith('*') && !t.endsWith(' ')) {
                t += ' ';
            }
            return t;
        } catch (e) {
            consoleWarn(e);
            return `gpointer /* ${typeDetails.type.name} */ `;
        }
    }

    gParamSpecType(type) {
        if (type.hasOwnProperty('name')) {
            type = type.name;
        }
        return TypeMapper.gTypes[type];
    }

    static methodBlacklist = ['getContextAttributes', 'getExtension'];
}
