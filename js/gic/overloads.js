// Certain methods in WebGL have explicit overloads. This file contains classes
// to modify the method signatures for C. They all implement:
// interface OveloadModifier {
//     overload(method): Method[]
// }
// If the result is empty the method needs no further overloading. Otherwise 
// the array contains replacement methods.

export class ListOverloadModifier {
    overload(method) {
        let replacements = [];
        for (const i in method.args) {
            let a = method.args[i];
            const t = a.type.name;
            if (t == 'BufferSource') {
                replacements.push(this.getByteArrayVersion(method, i));
            } else if (t == 'TexImageSource') {
                let m = {...method};
                m.name += 'FromPixbuf';
                replacements.push(m);
            } else if (t.endsWith('32List')) {
                replacements.push(this.getByteArrayVersion(method, i));
                let m = {...method};
                m.args = [...m.args];
                const etype = `GL${t.replace('32List', '').toLowerCase()}[]`;
                const lName = a.name + 'Length';
                m.args[i].type = {name: etype};
                m.args[i].arrayLength = lName;
                m.args.splice(i, 0, { name: lName, type: { name: 'GLint' }});
                m.name += 'FromArray';
                replacements.push(m);
            }
        }
        return replacements;
    }

    getByteArrayVersion(method, i) {
        let m = {...method};
        m.args = [...m.args];
        m.args[i].type = {name: 'Uint8Array'};
        m.name += 'FromByteArray';
        return m;
    }
}

export const overloadModifiers = {
};

// If the result is empty the method needs no further overloading. Otherwise 
// the array contains replacement methods.
export function modifyOverload(method) {
    let mod = overloadModifiers[method.name];
    if (!mod) {
        mod = new ListOverloadModifier();
    }
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
