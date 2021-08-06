import { cmdArgs, consoleLog, loadText } from '../js/sys.js';
import { parseInterface } from '../js/iface-parser.js';
import { HeaderClassBuilder } from '../js/gic/class-header.js';

// First cmd line arg is 'final' or 'derivable'.
// Second arg is the .d.ts ref file to parse
// Third arg is 'GLES3/gl3.h', 'GLES2/gl2.h' or nothing
// Fourth arg is parent class, eg 'GObject', or nothing

function runTest(filename, derivability, header, parent) {
    const ifaceTxt = loadText(filename);
    const ifaceData = parseInterface(ifaceTxt);
    const builder = new HeaderClassBuilder(header, derivability == 'final');
    builder.buildClass(ifaceData.name, ifaceData.members,
        derivability == 'final', parent);
    consoleLog(builder.lines);
}

runTest(cmdArgs[1], cmdArgs[0], cmdArgs[2], cmdArgs[3]);
