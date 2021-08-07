// Maps types from the Typescript definitions to C types.

export class TypeMapper {
    // In some cases we may need some context to work out the most appropriate
    // C type, so typeDetails has this interface: {
    //  type: type          // See ../js/iface-parser.js
    //  memberOf: string    // The interface currently being processed
    //  method?: string     // Method name (undefined for properties)
    //  varName?: string    // Argument name for methods, or property name
    // }
    // Returns: A string containing the C typename
    mapType(typeDetails) {
        let n = typeDetails.type.name;
        const dblIndirection = n.endsWith('[]') ? '*' : '';
        const m = TypeMapper.simpleMap[n];
        if (dblIndirection) {
            n = n.substring(0, n.length - 2);
        }
        if (n.startsWith('WebGL') || n.startsWith('EXT_') ||
                    n.startsWith('OES_') || n.startsWith('WEBGL_') ||
                    n.startsWith('ANGLE_'))
        {
            n = `Gwebgl${n} *`;
        } else if (n.startsWith('"') || n.startsWith('string')) {
            // TODO: There may be exceptions to this simple constness rule
            //let immutable = typeDetails.method ? 'const ' : '';
            n = 'const char *';
        } else if (TypeMapper.builtins.includes(n)) {
        } else if (m) {
            n = m;
        } else {
            // Fail gracefully
            const member = typeDetails.method ? `method ${typeDetails.method}` :
                `property ${varName}`;
            let e = `Can't process ${member} of ${typeDetails.memberOf}:- `;
            if (typeDetails.method) {
                if (typeDetails.varName) {
                    e + `arg ${typeDetails.varName} has `
                } else {
                    e + `returns `
                }
            }
            e += `unrecognised type ${typeDetails.type.name}`;
            throw new Error(e);
        }
        if (dblIndirection) {
            if (!n.endsWith('*')) {
                dblIndirection = ' *';
            }
        }
        return n + dblIndirection;
    }

    static builtins = [
        'void',
        'GLenum',
        'GLuint',
        'GLintptr',
        'GLsizeiptr',
        'GLint',
        'GLbitfield',
        'GLfloat',
        'GLuint64',
        'GLsizei',
        'GLboolean',
        'GLint64',
        'GLclampf',
    ]

    static simpleMap = {
        'boolean': 'gboolean',
        'GLint | GLboolean': 'GLint',
        'Float32List': 'const GLfloat *',
        'Int32List': 'const gint32 *',
        'Uint32List': 'const guint32 *',
        'ArrayBufferView': 'GBytes *',
        'any': 'void *',
        'TexImageSource': 'GdkPixbuf *',
        'BufferSource': 'GBytes *',
        'HTMLCanvasElement | OffscreenCanvas': 'GtkGLArea *',
    }

}
