import {consoleWarn, consoleLog} from '../sys.js';
import {TypeMapper} from './types.js';

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
    // should just make the C a bit ugly without breaking anything.
    separateCamels(name) {
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
        return this.loweredClassName(name).replaceAll('_', '-');
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
                if (a.out) {
                    s += ' (out)';
                    if (a.optional) {
                        s += ' (optional)';
                    }
                }
                s = this.typeAnnotation(s, a.type);
                lines.push(s);
            }
            a = `${t}${a.name}`;
            if (a.includes('/*')) {
                comment = '// ';
            }
            args.push(a);
        }
        if (method.returnType.name != 'void' && lines) {
            lines.push(
                ` * Returns:${this.typeAnnotation('', method.returnType)}`);
        }
        if (comment) {
            lines = [];
        } else if (lines) {
            lines.push(' */');
        }
        return annotations ? lines :
            `${comment}${returnType}${methodName}(${args.join(', ')})`;
    }

    typeAnnotation(s, type) {
        //let etype = TypeMapper.gArrayEquivalents[a.type.name];
        if (type.nullable) {
            s += ' (nullable)';
        }
        if (type.name.endsWith('[]')) {
            let etype = TypeMapper.gTypes[
                    type.name.substring(type.name - 2)];
            s += ` (array) (element-type ${etype})`;
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
        method.args.push({name: argName, type: {name: argType, nullable: true},
            optional: true, out: true});
    }

    methodAnnotations(method, className) {
        if (!this.adjustSignature(method, className)) {
            return [];
        }
        const lines = ['/**'];

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
            return `void * /* ${typeDetails.type.name} */ `;
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
