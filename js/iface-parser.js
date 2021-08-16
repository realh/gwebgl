import { consoleLog } from './sys.js';

// lines can be a string or string[]. The result is an array of members.
// Each member is either a Property:
// { name: string, type: Type, readOnly: boolean, optional: boolean }
// or a Method:
// { name: string,
//   args: {name: string, Type: type, optional: boolean, out?: boolean,
//          arrayLength?: string}[],
//   returnType: Type }
// where arrayLength is the name of the argument containing an array's length
// and Type is:
// { name: string, nullable?: boolean, transfer?: 'full' | 'none' }
// type.name may be 'void'
export function parseInterface(lines) {
    if (typeof lines == 'string') { lines = lines.split('\n'); }
    // Ignore first line and trailing }
    lines = lines.slice(1);
    let l;
    while (l = lines[lines.length - 1].trim(), l == '}' || !l) {
        lines.pop();
    }
    const members = [];
    for (let ln of lines) {
        ln = ln.trim().replace(/;$/, '');
        if (ln.startsWith('readonly')) {
            members.push(parseProperty(ln.substring(9), true));
        } else if (/^[A-Z_a-z0-9]*\??:/.test(ln)) {
            members.push(parseProperty(ln, false));
        } else {
            members.push(parseMethod(ln));
        }
    }
    return members;
}

function parseProperty(ln, readOnly) {
    let optional = false;
    let [name, typeStr] = ln.split(':');
    name = name.trim();
    if (name.endsWith('?')) {
        optional = true;
        name = name.substring(0, name.length - 1);
    }
    const typedef = parseType(typeStr);
    return { name, type: typedef, readOnly };
}

function parseType(typeStr) {
    let nullable = false;
    typeStr = typeStr.trim();
    if (typeStr.includes('|')) {
        const union = typeStr.split('|').map(s => s.trim()).filter(s => {
            if (s == 'null') {
                nullable = true;
                return false;
            }
            return true;
        });
        if (nullable) {
            // Replace the union type without null
            typeStr = union.join(' | ');
        }
    }
    return { name: typeStr, nullable: nullable };
}

function parseMethod(ln) {
    const [name, tail] = ln.split('(', 2);
    let [args, ret] = tail.split('):');
    ret = parseType(ret.trim());
    if (ret.name == 'string' || ret.name.includes('Array') ||
        ret.name.endsWith('[]'))
    {
        ret.transfer = 'full';
    }
    args = args.trim();
    const parsedArgs = [];
    if (args) {
        args = args.split(',');
        for (const a of args) {
            let optional = false;
            let [nm, tp] = a.split(':');
            nm = nm.trim();
            if (nm.endsWith('?')) {
                optional = true;
                nm = nm.substring(0, nm.length - 1);
            }
            //consoleLog(`Parsed arg '${a} as ${nm}: ${tp}`);
            tp = parseType(tp.trim());
            parsedArgs.push({ name: nm.trim(), type: tp, optional });
        }
    }
    return { name, args: parsedArgs, returnType: ret };
}

export function copyMethod(method) {
    const m = {...method};
    m.args = m.args.map(a => { return {...a}});
    m.returnType = {...m.returnType};
    return m;
}