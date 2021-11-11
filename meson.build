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

libgwebglgtk3 = library('gwebglgtk3', ['gwebglgtk/gwebglgtk.c'],
    dependencies: [dependency('gtk+-3.0')], install: true)

install_headers('gwebglgtk/gwebglgtk.h', subdir: 'gwebglgtk3')

libgwebglgtk3_gir = gnome.generate_gir(
    libgwebglgtk3,
    sources: ['gwebglgtk/gwebglgtk.c', 'gwebglgtk/gwebglgtk.h'],
    namespace: 'GwebglGtk',
    nsversion: '3.0',
    identifier_prefix: 'GwebglGtk',
    symbol_prefix: 'gwebglgtk',
    includes: ['Gtk-3.0'],
    header: 'gwebglgtk/gwebglgtk.h',
    install: true,
)

libgwebglgtk4 = library('gwebglgtk4', ['gwebglgtk/gwebglgtk.c'],
    dependencies: [dependency('gtk4')], install: true)

install_headers('gwebglgtk/gwebglgtk.h', subdir: 'gwebglgtk4')

libgwebglgtk4_gir = gnome.generate_gir(
    libgwebglgtk3,
    sources: ['gwebglgtk/gwebglgtk.c', 'gwebglgtk/gwebglgtk.h'],
    namespace: 'GwebglGtk',
    nsversion: '4.0',
    identifier_prefix: 'GwebglGtk',
    symbol_prefix: 'gwebglgtk',
    includes: ['Gtk-4.0'],
    header: 'gwebglgtk/gwebglgtk.h',
    install: true,
)
