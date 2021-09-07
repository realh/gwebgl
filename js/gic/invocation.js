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

// Matrix functions need the array length argument to be divided again by the
// number of elements in the array. This returns that value, 1 if it isn't a
// matrix method. The argument can be a string or an object as in
// methodNeedsArrayLength().
export function matrixSizeMultiplier(method) {
    if (method.hasOwnProperty('name')) {
        method = method.name;
    }
    if (!method.startsWith('uniformMatrix')) {
        return 1;
    }
    let i = method.indexOf('From');
    if (i == -1) {
        i = method.length;
    }
    let s = method.substring(13, i - 2);
    switch (s) {
        case '2':
            return 4;
        case '3':
            return 9;
        case '4':
            return 16;
        case '2x3':
        case '3x2':
            return 6;
        case '2x4':
        case '4x2':
            return 8;
        case '3x4':
        case '4x3':
            return 12;
        default:
            throw new Error(`Misparsed ${s} from ${method}`);
    }
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
        let arrayLength = null;
        let matSize = 1;
        if (m.name == 'bufferDataSizeOnly') {
            m.args.splice(2, 0, {name: 'NULL', type: 'any'});
            m.name = 'bufferData';
        } else if ((matSize = matrixSizeMultiplier(m)) > 1) {
            arrayLength =
                m.args.find(a => a.arrayLength != undefined)?.arrayLength;
        }
        for (let i = 0; i < m.args.length; ++i) {
            const a = m.args[i];
            const tn = a.type?.name;
            if (tn?.includes('Array')) {
                if (methodNeedsArrayLength(m))
                {
                    let div = tn.match(/([0-9]*)Array/)?.[1] || '8';
                    div = Number(div);
                    if (div !== NaN) {
                        div *= matSize / 8;
                    } else {
                        div = 1;
                    }
                    div = (div == 1) ? '' : ` / ${div}`;
                    // In glUniformMatrix* the array length comes before the
                    // transpose argument
                    m.args.splice(m.name.startsWith('uniformMatrix') ?
                        i - 1 : i,
                        0,
                        {name: `${a.name} ? ${a.name}->len${div} : 0`});
                    ++i;
                }
                // For most cases we should prefer a const pointer, but for
                // readPixels we can't use const, so it's easiest just to never
                // use const
                a.name = `${a.name} ? (gpointer) ${a.name}->data : NULL`;
            } else if (tn == 'GLintptr' &&
                !m.name.startsWith('bufferSubData'))
            {
                // Mostly WebGL uses GLintptr for actual pointers, but in
                // bufferSubData it's used for an int offset
                a.name = '(gconstpointer) ' + a.name;
            } else if (matSize > 1 && arrayLength && a.name == arrayLength) {
                a.name += ` / ${matSize}`;
            }
        }
    }
    return m;
}
