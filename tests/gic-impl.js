import { cmdArgs, consolePrint, loadText } from '../js/sys.js';
import { parseInterface } from '../js/iface-parser.js';
import { ClassImplementationBuilder } from '../js/gic/class-impl.js';

// First cmd line arg is 'final' or 'derivable'.
// Second arg is the .d.ts ref file to parse
// Third arg is parent class, eg 'GObject', or nothing

function runTest(filename, derivability, parent) {
    const ifaceTxt = loadText(filename);
    const ifaceData = parseInterface(ifaceTxt);
    const builder = new ClassImplementationBuilder();
    let name = filename.split('/');
    name = name[name.length - 1].replace('.d.ts', '');
    if (name.endsWith('Overloads')) {
        name = name.replace('Overloads', '');
    }
    builder.buildClass(name, ifaceData, derivability == 'final', parent);
    consolePrint(builder.lines.join('\n'));
}

runTest(cmdArgs[1], cmdArgs[0], cmdArgs[2]);
