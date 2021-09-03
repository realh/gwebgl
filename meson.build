project('gwebgl', 'c')

gnome = import('gnome')

gwincdir = get_option('includedir') / 'gwebgl'

deps = [dependency('gdk-pixbuf-2.0'), dependency('epoxy')]
gwebgl_c = custom_target('gwebgl_c',
  output: ['rendering-context-base.c', 'rendering-context.c',
    'rendering-context-base.h', 'rendering-context.h', 'handle-types.h',
    'gwebgl.h'],
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
  ),
  install: true,
  install_dir: [false, false, gwincdir, gwincdir, gwincdir, gwincdir]
)

libgwebgl = library('gwebgl', [gwebgl_c[0], gwebgl_c[1]], dependencies: deps,
    install: true)

webgl_gir = gnome.generate_gir(
    libgwebgl,
    sources: gwebgl_c,
    namespace: 'Gwebgl',
    nsversion: '1.0',
    identifier_prefix: 'Gwebgl',
    symbol_prefix: 'gwebgl',
    includes: ['GObject-2.0', 'GdkPixbuf-2.0'],
    header: 'gwebgl/gwebgl.h',
    install: true,
)

install_data('gjs_src/WebGLRenderingContextBase.js',
  'gjs_src/WebGLRenderingContext.js')
install_data('README.md',
  install_dir: get_option('datadir')/'doc'/'gwebgl')
