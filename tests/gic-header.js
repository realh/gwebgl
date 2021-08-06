import { cmdArgs, consolePrint, loadText } from '../js/sys.js';
import { parseInterface } from '../js/iface-parser.js';
import { HeaderClassBuilder } from '../js/gic/class-header.js';

// First cmd line arg is 'final' or 'derivable'.
// Second arg is the .d.ts ref file to parse
// Third arg is 'GLES3/gl3.h', 'GLES2/gl2.h' or nothing
// Fourth arg is parent class, eg 'GObject', or nothing

function runTest(filename, derivability, header, parent) {
    const ifaceTxt = loadText(filename);
    const ifaceData = parseInterface(ifaceTxt);
    const builder = new HeaderClassBuilder(header);
    let name = filename.split('/');
    name = name[name.length - 1].replace('.d.ts', '');
    builder.buildClass(name, ifaceData, derivability == 'final', parent);
    consolePrint(builder.lines.join('\n'));
}

runTest(cmdArgs[1], cmdArgs[0], cmdArgs[2], cmdArgs[3]);
