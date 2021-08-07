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
        if (n.startsWith('WebGL') || n.startsWith('EXT_') ||
                    n.startsWith('OES_') || n.startsWith('WEBGL_'))
        {
            return `Gwebgl${n} *${dblIndirection}`;
        } else if (n.startsWith('"') || n.startsWith('string')) {
            // TODO: There may be exceptions to this simple constness rule
            //let immutable = typeDetails.method ? 'const ' : '';
            return 'const char *' + dblIndirection;
        } else if (TypeMapper.builtins.includes(n)) {
            return n;
        } else {
            n = TypeMapper.simpleMap[n];
            if (n) {
                return n;
            }
        }
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
        'GLint | GLboolean': 'GLint',
        'Float32List': 'const GLfloat *',
        'Int32List': 'const gint32 *',
        'Uint32List': 'const guint32 *',
    }

}
/* TODO:
        'ArrayBufferView',
        'string',
        'any',
        'TexImageSource',
        'BufferSource',
        'HTMLCanvasElement | OffscreenCanvas',
*/
