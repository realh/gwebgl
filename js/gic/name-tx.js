import { consoleWarn } from '../sys.js';
import { handleTypes } from './handle-types.js';
import { TypeMapper } from './types.js';

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
        if (name.startsWith('Gwebgl')) {
            name = name.replace('Gwebgl', '');
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
        let n = this.loweredClassName(name).replaceAll('_', '-').
            replace(/gwebgl-webgl2?-/, '');
        if (name.includes('WebGL2')) {
            if (n.includes('context')) {
                if (!n.includes('context2')) {
                    n = n.replace('context', 'context2');
                }
            } else if (!n.endsWith('2')) {
                n += '2';
            }
        }
        return n;
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
            lines = ['/**', ` * ${methodName}:`, ` * @self: A ${className}`];
        }
        const args = [`${this.classNameFromJS(className)} *self`];
        for (let a of method.args) {
            const td = {
                type: a.type,
                memberOf: className,
                method: nm,
                argName: a.name
            };
            let t = this.errorCheckedTypeConversion(td);
            if (a.direction == 'out') {
                t += '*';
            }
            if (lines) {
                let s = ` * @${a.name}:`;
                if (a.direction) {
                    s += ` (${a.direction})`;
                    if (a.optional) {
                        s += ' (optional)';
                    }
                }
                s = this.typeAnnotation(s, a.type, a.arrayLength ?
                    ' length=' + a.arrayLength : '');
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
        if (annotations) {
            return lines;
        }
        let argLines = args.join(',\n').split('\n').filter(a => a?.length).
            map(a => `${comment}    ${a}`);
        const numArgs = argLines.length;
        let closer = ')';
        if (numArgs) {
            argLines[numArgs - 1] += closer;
            closer = '';
        }
        return [comment + returnType,
             `${comment}${methodName}(${closer}`,
             ...argLines];
        // Add self = args.shift(); before the argLines statement, change the
        // second allocation to closer ',' instead of '', and replace the
        // return statement with the one below to put the return type and self
        // arg all on the same line.
        /*
        return [`${comment}${returnType}${methodName}(${self}${closer}`,
             ...argLines];
        */
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
    // returns null the method is not supported. This also handles the special
    // case of readPixels where the caller allocates the output.
    adjustSignature(method, className) {
        if (NameTransformer.methodBlacklist.includes(method.name)) {
            return null;
        }
        if (method.name == 'readPixels' &&
            method.args[6]?.type?.name?.includes('Array'))
        {
            // Gjs copies byte arrays so this needs to return the altered array
            // for the wrapper to copy into the input. Making both input and
            // output transfer full is safer and shouldn't cause any additional
            // copying.
            method.args[6].type.transfer = 'full';
            method.returnType = { name: 'Uint8Array', transfer: 'full' };
            return method;
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
            optional: true, direction: 'out'});
    }

    errorCheckedTypeConversion(typeDetails) {
        try {
            let t = this.typeMapper.mapType(typeDetails);
            if (typeDetails.method == 'readPixels' && t == 'const GByteArray *')
            {
                // readPixels' array arg is writable
                t = t.replace('const ', '');
            }
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
