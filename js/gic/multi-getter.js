// This is an abstract class to handle WebGL methods such as getParameter and
// getUniform where a single WebGL function chooses one of two or more GLES
// functions based on an argument value. The GLES functions return arrays of
// float, int etc and when the array has a size of one the WebGL method returns
// the element's value instead of a TypedArray. This case is handled by setting
// the 'single' constructor argument to the returned type name.
export class MultiGetter {
    constructor(single = null) {
        this.single = single;
    }

    getAllocatorLines(method) {
        if (this.single) {
            return [`    ${this.single} result;`];
        } else {
            return this.getMultiAllocatorLines(method);
        }
    }

    // This should return a set of lines that includes:
    // gint resultSize;
    // gpointer data;
    //
    //abstract getMultiAllocatorLines(method);

    adaptMethod(method) {
        const m = {...method};
        if (this.single && !method.name.endsWith('v')) {
            m.name += 'v';
        }
        m.args = [...m.args];
        m.args.push({name: this.single ? '&result' : 'data'});
        m.returnType = {name: 'void'};
        return m;
    }

    getResultAdjusterLines(method) {
        return this.single ?  ['    return result;'] :
            ['    return g_byte_array_new_take(data, resultSize);'];
    }
}
