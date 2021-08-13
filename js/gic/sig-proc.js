// This performs additional modification of method signatures specific to
// the GI C output.
export class SignaturesProcessor {
    // methods is an array of methods. webgl2 is a boolean
    processSignatures(methods, webgl2) {
        const newMethods = [];
        for (let m of methods) {
            if (m.name == 'getUniformiv' || m.name == 'getUniformfv') {
                // This is aimed at gjs which automatically converts between
                // GByteArray and Uint8Array. A wrapper function can then
                // return a Float32Array or Int32Array etc without further
                // copying of the data.
                m = {...m};
                m.returnType = {name: 'Uint8Array', nullable: false,
                    transfer: 'full'};
            }
            newMethods.push(m);
        }
        return newMethods;
    }
}
