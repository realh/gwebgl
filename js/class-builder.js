// This is an abstract class that can be used as a base for outputting a class
// in a specific format.

export class ClassBuilder {
    // nameTx: NameTransformer

    // members is either a Map<string, member> or an array of such maps. Each
    // member is a property or method as described in iface-parser.js.
    // The 'final' bool argument determines whether the class is derivable.
    // parent is the name (in the target bindings) of the parent class. It can
    // be nully to use the default base class for the target (eg GObject).
    buildClass(name, members, final, parent) {
        this.name = name;
        this.final = final;
        this.parent = parent;
        if (!(members instanceof Map)) {
            // Merge maps
            members = new Map(members.reduce((a, b) => [...a, ...b], []));
        }
        // Split into properties and methods
        this.props = new Map();
        this.methods = new Map();
        for (const [k, v] of members) {
            if (v.hasOwnProperty('readOnly')) {
                this.props.set(k, v);
            } else {
                this.methods.set(k, v);
            }
        }
        this.process();
    }

    process() {
        this.lines = this.getHeader();
        this.lines.push('', ...this.getClassDefinition());
        this.lines.push('', ...this.getFooter());
    }

    getclassDefinition() {
        lines = this.getClassOpener();
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
