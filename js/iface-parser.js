// lines can be a string or string[]. The result is an array of members.
// Each member is either a property:
// { name: string; type: type; readOnly: boolean; }
// or a method:
// { name: string; args: {name: string; type: type}[]; returnType: type; }
// where type is:
// { name: string, nullable: boolean }
// type.name may be 'void'
export function parseInterface(lines) {
    if (typeof lines == 'string') { lines = lines.split('\n'); }
    // Ignore first and last lines
    lines = lines.slice(1, lines.length - 1);
    const members = [];
    for (let ln of lines) {
        ln = ln.trim().replace(/;$/, '');
        if (ln.startsWith('readonly')) {
            members.push(parseProperty(ln.substring(9), true));
        } else if (/^[A-Z_a-z0-9]*:/.test(ln)) {
            members.push(parseProperty(ln, false));
        } else {
            members.push(parseFunction(ln));
        }
    }
    return members;
}

function parseProperty(ln, readOnly) {
    let name, typeStr = ln.split(':');
    const typedef = parseType(typeStr);
    return { name, type: typedef, readOnly };
}

function parseType(typeStr) {
    let nullable = false;
    if (typeStr.includes('|')) {
        const union = typeStr.split('|').map(s => s.trim()).filter(s => {
            if (s == 'null') {
                nullable = true;
                return false;
            }
            return true;
        });
        if (nullable) { typestr = union.join(' | '); }
    }
    return { name: typeStr, nullable };
}

function parseMethod(ln) {
    const name, tail = ln.split('(', 2);
    let args, ret = ln.split('):');
    ret = parseType(ret.trim());
    args = args.split(',');
    const parsedArgs = [];
    for (const a of args) {
        let nm, tp = a.split(':');
        tp = tp.parseType(tp.trim());
        parsedArgs.push({ name: nm, type: tp });
    }
    return { name, args: parsedArgs };
}
