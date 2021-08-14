export class VertexAttribGetter {
    constructor(arrayResult = false) {
        this.arrayResult = arrayResult;
    }

    getAllocatorLines(method) {
        switch (method.name) {
            case 'getVertexAttribfv':
                return ['    gpointer data = g_malloc(16);'];
            case 'getVertexAttribf':
                return ['    gfloat result;'];
            case 'getVertexAttribi':
                return ['    gint result;'];
        }
    }

    adaptMethod(method) {
        const m = {...method};
        m.args = [...m.args];
        let resArg;
        switch (method.name) {
            case 'getVertexAttribfv':
                m.name = 'getVertexAttribfv';
                resArg = 'data';
                break;
            case 'getVertexAttribf':
                m.name = 'getVertexAttribfv';
                resArg = '&result';
                break;
            case 'getVertexAttribi':
                m.name = 'getVertexAttribiv';
                resArg = '&result';
                break;
        }
        m.args.push({name: resArg});
        m.returnType = {name: 'void'};
        return m;
    }

    getResultAdjusterLines(method) {
        if (this.arrayResult) {
            return ['    return g_byte_array_new_take(data, 16);'];
        } else {
            return ['    return result;'];
        }
    }
}
