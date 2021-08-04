// This utility scans all the interface ref .d.ts files passed as arguments
// and lists all the types they contain reference to on stdout.
import { cmdArgs, consolePrint, loadText } from "./sys.js";
import { parseInterface } from "./iface-parser.js";

// Specify the .d.ts refs file to parse on the command line

function addTypesFromFile(set, filename) {
    const ifaceTxt = loadText(filename);
    const ifaceData = parseInterface(ifaceTxt);
    for (const member of ifaceData) {
        if (member.hasOwnProperty("type")) {
            set.add(member.type.name);
        }
        if (member.hasOwnProperty("returnType")) {
            set.add(member.returnType.name);
        }
        for (const a of member.args ?? []) {
            set.add(a.type.name);
        }
    }
    return set
}

function parseAll() {
    const set = new Set();
    for (const f of cmdArgs) {
        addTypesFromFile(set, f);
    }
    consolePrint(Array.from(set.keys()).join('\n'), '\n');
}

parseAll();
