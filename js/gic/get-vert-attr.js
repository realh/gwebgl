import {MultiGetter} from './multi-getter.js';

export class VertexAttribGetter extends MultiGetter {
    getMultiAllocatorLines(method) {
        return ['    int resultSize = 16;',
            '    gpointer data = g_malloc(16);'];
    }
}
