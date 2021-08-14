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
        let dblIndirection = n.endsWith('[]') ? '*' : '';
        const m = TypeMapper.simpleMap[n];
        if (dblIndirection) {
            n = n.substring(0, n.length - 2);
        }
        if (n.startsWith('WebGL'))
        {
            n = `Gwebgl${n}`;
        } else if (n.startsWith('EXT_') || n.startsWith('OES_') ||
                n.startsWith('WEBGL_') || n.startsWith('ANGLE_'))
        {
            n = `Gwebgl${n} *`;
        } else if (n.startsWith('"') || n.startsWith('string')) {
            n = 'char *';
        } else if (TypeMapper.builtins.includes(n)) {
            n = n.replace('GL', 'g');
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
        // Generally pointer args are const and results are not
        if ((dblIndirection || n.endsWith('*')) &&
            typeDetails.type.transfer != 'full')
        {
            n = 'const ' + n;
        } 
        return n + dblIndirection;
    }

    static builtins = [
        'GLuint',
        'GLint',
        'GLfloat',
        'GLuint64',
        'GLboolean',
        'GLint64',
    ]

    static simpleMap = {
        'GLenum': 'guint',
        'boolean': 'gboolean',
        'GLint | GLboolean': 'gint',
        'GLintptr': 'glong',
        'GLsizei': 'gint',
        'GLsizeiptr': 'gssize',
        'GLbitfield': 'guint',
        'GLclampf': 'gfloat',
        'void': 'void',
        'any': 'gpointer',
        // TODO: ClassBuilder should convert these List types in advance
        'Float32List': 'GLfloat *',
        'Int32List': 'gint32 *',
        'Uint32List': 'guint32 *',
        // gjs only supports Uint8Array, so further marshalling is needed for
        // the others
        'Float32Array': 'GByteArray *',
        'Int32Array': 'GByteArray *',
        'Uint8Array': 'GByteArray *',
        /*
        'ArrayBufferView': 'GBytes *',
        'BufferSource': 'GBytes *',
        'HTMLCanvasElement | OffscreenCanvas': 'GtkGLArea *',
        'TexImageSource': 'GdkPixbuf *',
        */
    }

    // As used in g_value_set_*/_get_* etc
    static gTypes = {
        'GLenum': 'uint',
        'GLuint': 'uint',
        'GLintptr': 'int64',
        'GLsizeiptr': 'int64',
        'GLint': 'int',
        'GLbitfield': 'uint',
        'GLfloat': 'float',
        'GLuint64': 'uint64',
        'GLsizei': 'int',
        'GLboolean': 'boolean',
        'GLint64': 'int64',
        'GLclampf': 'float',
        'boolean': 'boolean',
        'GLint | GLboolean': 'int',
        'any': 'pointer',
        'HTMLCanvasElement | OffscreenCanvas': 'object',
        'string': 'string',
    }

    // When we want to specify the element-type in an array
    static gElementTypes = {
        'GLfloat': 'gfloat',
        'GLint': 'gint',
        'WebGLShader': 'guint',
        'string': 'utf8',
    }

    // For use in element-type annotations when they aren't in gTypes
    static gArrayEquivalents = {
        'Float32List': 'float',
        'Int32List': 'int32',
        'Uint32List': 'uint32',
    }
}
