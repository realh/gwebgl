// This is class to handle WebGL methods such as getParameter and
// getUniform where a single WebGL function chooses one of two or more GLES
// functions based on an argument value. The GLES functions return arrays of
// float, int etc and when the array has a size of one the WebGL method returns
// the element's value instead of a TypedArray. This case is handled by setting

import { copyMethod } from "../iface-parser";

// the 'single' constructor argument to the returned type name.
export class MultiGetter {
    constructor(single = null, rename = null) {
        this.single = single;
        this.rename = rename;
    }

    getAllocatorLines(method) {
        if (this.single) {
            return [`    ${this.single} result;`];
        } else {
            return [`    gpointer data = g_malloc(resultSize);`];
        }
    }

    adaptMethod(method) {
        const m = copyMethod(method);
        if (this.rename) {
            m.name = this.rename;
        }
        if (this.single && !m.name.endsWith('v')) {
            m.name += 'v';
        }
        if (!this.single) {
            // We don't pass resultSize to the OpenGL func
            m.args.pop();
        }
        m.args.push({name: this.single ? '&result' : 'data'});
        m.returnType = {name: 'void'};
        return m;
    }

    getResultAdjusterLines(method) {
        return this.single ?  ['    return result;'] :
            ['    return g_byte_array_new_take(data, resultSize);'];
    }
}
