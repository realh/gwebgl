// Certain methods in WebGL have explicit overloads. This file contains classes
// to modify the method signatures for C. They all implement:
// interface OveloadModifier {
//     overload(method): Method[]
// }
// If the result is empty the method needs no further overloading. Otherwise 
// the array contains replacement methods.

import { copyMethod } from '../iface-parser.js';
import { methodNeedsArrayLength } from './invocation.js';

export class ListOverloadModifier {
    overload(method) {
        let replacements = [];
        if (method.name == 'bufferData' && method.args[1].name == 'size') {
            const m = copyMethod(method);
            m.name += 'SizeOnly';
            return [m];
        }
        for (const i in method.args) {
            let a = method.args[i];
            const t = a.type.name;
            if (t == 'BufferSource') {
                const m = this.getByteArrayVersion(method, i);
                replacements.push(m);
            } else if (t == 'TexImageSource') {
                const m = copyMethod(method);
                m.name += 'FromPixbuf';
                replacements.push(m);
            } else if (t.endsWith('32List')) {
                const m = copyMethod(method);
                const etype = `GL${t.replace('32List', '').toLowerCase()}[]`;
                m.args[i].type = {name: etype};
                if (methodNeedsArrayLength(m)) {
                    const lName = a.name + 'Length';
                    m.args[i].arrayLength = lName;
                    // In glUniformMatrix* the array length comes before the
                    // transpose argument
                    m.args.splice(m.name.startsWith('uniformMatrix') ?
                        i - 1 : i,
                        0,
                        { name: lName, type: { name: 'GLint' }});
                }
                replacements.push(m);
            }
        }
        return replacements;
    }

    getByteArrayVersion(method, i) {
        let m = copyMethod(method);
        let t = m.args[i].type.name;
        if (t == 'BufferSource') {
            t = 'Uint8Array';
        } else {
            t = t.replace('List', 'Array');
        }
        m.args[i].type = {name: t};
        //m.name += 'FromByteArray';
        return m;
    }
}

// If the result is empty the method needs no further overloading. Otherwise 
// the array contains replacement methods.
export function modifyOverload(method) {
    const mod = new ListOverloadModifier();
    return mod.overload(method);
}

export class OverloadSignaturesProcessor {
    // methods is an array of methods. webgl2 is a boolean
    processSignatures(methods, webgl2) {
        const newMethods = [];
        for (let m of methods) {
            const modified = modifyOverload(m);
            if (modified.length) {
                newMethods.push(...modified);
            } else {
                newMethods.push(m);
            }
        }
        return newMethods;
    }
}
