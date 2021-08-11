// Some methods have to take additional action to allocate memory for their
// results. This is an abstract base class to help perform those actions.
export class AllocatedResultGenerator {
    // addBufferSizeArgsAt: Index in args at which to add bufferSizeArgs
    // bufferSizeArgs: [{name: string}]
    // elementType: Type name (in C) of allocated buffer members
    // terminated: Whether allocated buffer should have an additional element
    //             for a 0-terminator
    // bufSizeAttribute: enum to pass to sizeQueryMethod (without GL_ prefix)
    // sizeQueryMethod: Method name for getting bufSize
    // bufOutArg: Name of arg in which buffer result is passed out
    constructor(addBufferSizeArgsAt, bufferSizeArgs, elementType, terminated,
        bufSizeAttribute, sizeQueryMethod, bufOutArg)
    {
        this.addBufferSizeArgsAt = addBufferSizeArgsAt;
        this.bufferSizeArgs = bufferSizeArgs;
        this.elementType = elementType;
        this.terminated = terminated;
        this.bufSizeAttribute = bufSizeAttribute;
        this.sizeQueryMethod = sizeQueryMethod;
        this.bufOutArg = bufOutArg;
    }

    addBufferSizeArgs(m) {
        m.args = [...m.args];
        m.args.splice(this.addBufferSizeArgsAt, 0, ...this.bufferSizeArgs);
    }

    getAllocatorLines(method) {
        const lines = this.getSizeQueryLines(method);
        lines.push(this.getAllocStatement(method));
        return lines;
    }

    getSizeQueryLines(method) {
        return [
            '    GLint bufSize;',
            '    GLsizei bufLength;',
            `    ${this.sizeQueryMethod}(program, ` +
                    `GL_${this.bufSizeAttribute}, &bufSize);`,
            ];
    }

    getAllocSize(method, varName) {
        let bufSize = this.terminated ? `(${varName} + 1)` : varName;
        bufSize = `${bufSize} * sizeof(${this.elementType})`;
        return bufSize;
    }

    getAllocStatement(method) {
        const bufSize = this.getAllocSize(method, 'bufSize');
        return `    ${this.elementType} *buf = g_malloc(${bufSize});`;
    }

    getResultAdjusterLines(method) {
        const bufLength = this.getAllocSize(method, 'bufLength');
        let lines = [];
        let indent = '    ';
        if (this.bufOutArg) {
            lines.push(`    if (${this.bufOutArg})`, '    {');
            indent += '    ';
        }
        lines.push(
            `${indent}if (bufLength < bufSize)`,
            `${indent}{`,
            `${indent}    buf = g_realloc(buf, ${bufLength});`,
            `${indent}}`,
        );
        if (this.terminated) {
            lines.push(`${indent}buf[bufLength] = 0;`);
        }
        if (this.bufOutArg) {
            lines.push(`${indent}*${this.bufOutArg} = buf;`,
                '    }',
                '    else',
                '    {',
                '        g_free(buf);',
                '    }',
            );
        }
        return lines
    }

    // abstract adaptMethod(method: Method): void
}

// For use with getActiveAttrib/getActiveUniform
export class ShaderActiveVarAllocatedResultGenerator extends
AllocatedResultGenerator
{
    constructor(bufSizeAttribute) {
        super(2, [{name: 'bufSize'}, {name: '&bufLength'}], 'GLchar', true,
            bufSizeAttribute, 'glGetProgramiv', 'name');
    }

    adaptMethod(method) {
        const m = {...method};
        this.addBufferSizeArgs(m);
        m.args[6] = {name: 'buf'};
        return m;
    }
}

export class ReturnedAllocatedResultGenerator extends
AllocatedResultGenerator
{
    constructor(bufSizeAttribute, elementType, sizeQueryMethod) {
        super(1, [{name: 'bufSize'}, {name: '&bufLength'}], elementType, true,
            bufSizeAttribute, sizeQueryMethod);
    }

    adaptMethod(method) {
        const m = {...method};
        this.addBufferSizeArgs(m);
        m.returnType = {name: 'void'};
        m.args.push({name: 'buf'});
        return m;
    }

    getResultAdjusterLines(method) {
        return [...super.getResultAdjusterLines(method), '    return buf;'];
    }
}
