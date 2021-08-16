import { copyMethod, showMethodSignature } from '../iface-parser.js';
import { consoleLog, consoleWarn } from '../sys.js';


// Names of additional methods (besides vertexAttrib[0-9][if]v) where an
// array data argument doesn't need to be preceded by its length
const methodsWithNoArrayLength = [
    'readPixels', 'texImage2D', 'texSubImage2D'
] 

// When invoking some methods with array parameters we need to pass the size of
// the array, but in some we don't. This uses the method name to work out which
// is which. The method arg can be a string or any object with a name property.
export function methodNeedsArrayLength(method) {
    if (method.hasOwnProperty('name')) {
        method = method.name;
    }
    return !/vertexAttrib[0-9][if]v/.test(method) &&
        !methodsWithNoArrayLength.includes(method);
}

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
            if (tn?.includes('Array')) {
                if (methodNeedsArrayLength(m))
                {
                    let div = tn.match(/([0-9]*)Array/)?.[1] ?? '8';
                    div = Number(div);
                    if (div !== NaN) {
                        div /= 8;
                    } else {
                        div = 1;
                    }
                    div = (div == 1) ? '' : ` / ${div}`;
                    m.args.splice(i, 0, {name: `${a.name}->len${div}`});
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