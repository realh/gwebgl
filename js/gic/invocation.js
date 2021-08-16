import { copyMethod, showMethodSignature } from '../iface-parser.js';
import { consoleLog, consoleWarn } from '../sys.js';

// Changes a method signature from WebGL to a gl* invocation
export function adaptMethodForInvocation(m) {
    m = copyMethod(m);
    if (m.name == 'clearDepth') {
        m.name = 'clearDepthf';
    } else if (m.name.includes('create') &&
        m.name != 'createProgram' && m.name != 'createShader')
    {
        m.name = m.name.replace('create', 'gen') + 's';
        m.returnType = {name: 'void'};
        m.args = [{name: '1'}, {name: '&a'}];
    } else if (m.name.includes('delete') &&
        m.name != 'deleteProgram' && m.name != 'deleteShader')
    {
        m.name += 's';
        m.args = [{name: '1'}, {name: `&${m.args[0].name}`}];
    } else {
        if (m.name == 'bufferData') {
            m.args.splice(2, 0, {name: 'NULL', type: 'any'});
        }
        for (let i = 0; i < m.args.length; ++i) {
            const a = m.args[i];
            const tn = a.type?.name;
            if (tn == 'Uint8Array' || tn == 'ArrayBufferView') {
                if (!/[0-9][if]v$/.test(m.name) && m.name != 'readPixels') {
                    m.args.splice(i, 0, {name: `${a.name}->len`});
                    ++i;
                }
                // For most cases we should prefer a const pointer, but for
                // readPixels we can't use const, so it's easiest just to never
                // use const
                a.name = `(gpointer) ${a.name}->data`;
            } else if (tn == 'GLintptr') {
                a.name = '(gconstpointer) ' + a.name;
            } 
        }
    }
    return m;
}