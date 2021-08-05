import {consoleError} from '../sys.js';
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
        if (name.startsWith('WebGL')) {
            s += 'webgl_';
            name = name.substring(5);
        }
        // Add an underscore before any capital that follows a non-capital.
        name = /([a-z0-9])([A-Z])/g[Symbol.replace](name, '$1_$2');
        return name;
    }

    loweredClassName(name) {
        return this.separateCamels(name).toLowerCase();
    }

    upperedClassName(name) {
        return this.separateCamels(name).toUpperCase();
    }

    // Both names are from the JS/TS API.
    methodNameFromJS(methodName, className) {
        return `${this.loweredClassName(className)}_${methodName}`;
    }

    // method has the interface described in iface-parser.js.
    // Not strictly just a name transformation, but this is the most convenient
    // place for it. If a type transformation fails, the result will have a
    // '//' comment prefix.
    methodSignature(method, className) {
        let comment = '';
        const returnType = errorCheckedTypeConversion({
            type: method.returnType,
            memberOf: className,
            method: method.name
        });
        if (returnType.includes('/*')) {
            comment = '// ';
        }
        const args = [];
        for (let a of method.args) {
            const td = {
                type: a.type,
                memberOf: className,
                method: method.name,
                argName: a.name
            };
            a = `${this.errorCheckedTypeConversion(td)} ${a.name}`;
            if (a.includes('/*')) {
                comment = '// ';
            }
            args.push(a);
        }
        const methodName = this.methodNameFromJS(method.name, className)
        return `${comment}${returnType}${methodName}(${args.join(', ')})`;
    }

    errorCheckedTypeConversion(typeDetails) {
        try {
            let t = this.typeMapper.mapType(typeDetails);
            if (!t.endsWith('*')) {
                t += ' ';
            }
            return t;
        } catch (e) {
            consoleError(e);
            return `void * /* ${typeDetails.type.name} */ `;
        }
    }
}
