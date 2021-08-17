project('gwebgl', 'c')
deps = [dependency('gdk-pixbuf-2.0'), dependency('glesv2')]
gwebgl_c = custom_target('gwebgl_c',
  output: ['rendering-context-base.c', 'rendering-context.c',
    'rendering-context-base.h', 'rendering-context.h', 'handle-types.h'],
  input: 'js/gic/main.js',
  command: ['gjs', '-m', '@INPUT@', '@SOURCE_ROOT@/ref', '@BUILD_ROOT@'],
  depend_files: files(
    'js/sys.js',
    'js/iface-parser.js',
    'js/gic/class-impl.js',
    'js/gic/overloads.js',
    'js/gic/types.js',
    'js/gic/handle-types.js',
    'js/gic/class-header.js',
    'js/gic/name-tx.js',
    'js/gic/shader-source.js',
    'js/gic/multi-getter.js',
    'js/gic/generator.js',
    'js/gic/gpixbuf.js',
    'js/gic/main.js',
    'js/gic/README.md',
    'js/gic/invocation.js',
    'js/gic/result-buffers.js',
    'js/webgl-to-gles.js',
    'js/class-builder.js'
  )
)

library('gwebgl', [gwebgl_c[0], gwebgl_c[1]], dependencies: deps)
