// shaderSource is not really a getter, but the getter interface is handy

import { copyMethod } from "../iface-parser.js";

// for the necessary modifications.
export class ShaderSource {
    getAllocatorLines(method) {
        return [];
    }

    adaptMethod(method) {
        const m = copyMethod(method);
        m.args = [m.args[0], {name: '1'}, {name: '&' + m.args[1].name},
            {name: 'NULL'}];
        return m;
    }

    getResultAdjusterLines(method) {
        return [];
    }
}
