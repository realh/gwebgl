interface Canvas {
    height: number;
    width: number;
    getWebGLContext(options?: WebGLContextAttributes): WebGLRenderingContext | null;
    getWebGL2Context(options?: WebGLContextAttributes): WebGLRenderingContext | null;
}
