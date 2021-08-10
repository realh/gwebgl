// This is an abstract class that can be used as a base for outputting a class
// in a specific format.

export class ClassBuilder {
    // nameTx: NameTransformer

    // members is a flat array of member objects where a member is a property
    // or method as described in iface-parser.js. Some classes have properties
    // with a 'construct' flag. Such properties are read-only | construct-only
    // and have getters, all non-introspected.
    // The 'final' bool argument determines whether the class is derivable.
    // parent is the name (in the target bindings) of the parent class. It can
    // be nully to use the default base class for the target (eg GObject).
    buildClass(name, members, final, parent) {
        this.name = name;
        this.final = final;
        this.parent = parent;
        // Split into properties and methods
        this.props = [];
        this.methods = [];
        for (const m of members) {
            if (m.hasOwnProperty('readOnly')) {
                this.props.push(m);
            } else {
                this.methods.push(m);
            }
        }
        // Sort to make sure overloads appear consecutively
        const sorter = (a, b) => {
            a = a.name;
            b = b.name;
            if (a < b) {
                return -1;
            } else if (a > b) {
                return 1;
            } else {
                return 0;
            }
        }
        this.props.sort(sorter);
        this.methods.sort(sorter);
        this.process();
    }

    process() {
        this.filterProps();
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

    // Removes properties that have no equivalent in OpenGL ES
    filterProps() {
        this.props = this.props.filter(p => !p.name.includes('WEBGL'));
        if (this.name == 'WebGLRenderingContextBase') {
            this.props = this.props.filter(p => {
                // Remove anything with lower case eg 'canvas',
                // 'bufferWidth', 'bufferHeight'
                if (p.name.toUpperCase() != p.name) {
                    return false;
                }
                // OpenGL ES 2.0 doesn't support DEPTH_STENCIL_*;
                if (p.name.startsWith('DEPTH_STENCIL')) {
                    return false;
                }
                // TODO: Add them to WebGL2RenderingContextBase
                return true;
            });
        }
    }

    // abstract getHeader(): string[]
    // abstract getclassOpener(): string[]
    // abstract getPropertyDeclarations(): string[]
    // abstract getFunctionDeclarations(): string[]
    // abstract getclassCloser(): string[]
    // abstract getFooter(): string[]
}
