// This is an abstract class that can be used as a base for outputting a class
// in a specific format.

export class ClassBuilder {
    // nameTx: NameTransformer

    // members is a flat array of member objects where a member is a property
    // or method as described in iface-parser.js.
    // The 'final' bool argument determines whether the class is derivable.
    // parent is the name (in the target bindings) of the parent class. It can
    // be nully to use the default base class for the target (eg GObject).
    buildClass(name, members, final, parent) {
        this.name = name;
        this.final = final;
        this.parent = parent;
        // Split into properties and methods
        this.props = new Map();
        this.methods = new Map();
        for (const m of members) {
            if (m.hasOwnProperty('readOnly')) {
                this.props.set(m.name, m);
            } else {
                this.methods.set(m.name, m);
            }
        }
        this.process();
    }

    process() {
        this.lines = this.getHeader();
        this.lines.push('', ...this.getClassDefinition());
        this.lines.push('', ...this.getFooter());
    }

    getClassDefinition() {
        const lines = this.getClassOpener();
        lines.push(...this.getPropertyDeclarations());
        lines.push(...this.getFunctionDeclarations());
        lines.push(...this.getClassCloser());
        return lines;
    }

    // abstract getHeader(): string[]
    // abstract getclassOpener(): string[]
    // abstract getPropertyDeclarations(): string[]
    // abstract getFunctionDeclarations(): string[]
    // abstract getclassCloser(): string[]
    // abstract getFooter(): string[]
}
