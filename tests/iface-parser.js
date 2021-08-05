import { cmdArgs, consoleLog, loadText } from '../js/sys.js';
import { parseInterface } from '../js/iface-parser.js';

// Specify the .d.ts refs file to parse on the command line

function runTest(filename) {
    const ifaceTxt = loadText(filename);
    const ifaceData = parseInterface(ifaceTxt);
    const ifaceJson = JSON.stringify(ifaceData, null, 2);
    consoleLog(ifaceJson);
}

runTest(cmdArgs[0]);
