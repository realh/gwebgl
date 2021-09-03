# gwebgl

This generates a [GObject Introspectable](https://gi.readthedocs.io/en/latest/)
wrapper library for [OpenGL ES](https://www.khronos.org/opengles/). The API is
designed so that when it's bound to Javascript with gjs the API is as close as
possible to [WebGL](https://www.khronos.org/webgl/).

# Building

You need meson and headers etc for GTK (you can use either GTK3 or 4), epoxy and
OpenGL.

First time only:
```
meson setup build .
```

Then:
```
meson compile -C build
meson install -C build
```

You may need to change the installation prefix to /usr for gobject-introspection
to work. Do this by chaging the setup command:
```
meson setup --prefix=/usr build .
```
or run:
```
meson configure --prefix=/usr build
```

# Using the library

Javascript wrappers are required to provide (almost) full WebGL compatibility;
these are provided in the `gjs_src` folder in the source tree and installed
in `{datadir}/gwebgl`. `{datadir}` defaults to `{prefix}/share` where `{prefix}`
is usually `/usr/local` for manual installations and `/usr` for distro packages.
gjs doesn't really have an infrastructure for JS libraries, so simply copy the
JS files into your own project. Adapt the gi imports if you're not using ES6
module imports.

Create a rendering context with:
```
const gl = new WebGLRenderingContext();
gl.gtk_gl_area = myGtkGLAreaWidget;
```
where `myGtkGLAreaWidget` is the GtkGLArea you're running the context in. This
will be used as the context's `canvas` property.

Where WebGL expects an image source, for example the overload of `texImage2D`
that doesn't take raw data, use a GdkPixbuf.

# OpenGL ES with GTK

Currently, [requesting a GLES context in GTK/GDK from code gets
ignored](https://gitlab.gnome.org/GNOME/gtk/-/issues/4221). If you're lucky your
distro will have GTK built with certain debugging features enabled, then you can
set the environment variable `GDK_DEBUG=gl-gles`. This works in Arch Linux, but
I haven't tried other distros.

The demos currently simply use gl.clear to make the window background
black. The C demo is a leftover from early debugging, and the gjs demo will be
developed into something more interesting.

The gjs demo can be run via the `rundemo.sh` script. To use GTK3 instead of
GTK4 change the 4 to 3 on the first line of `demo.js`.

To compile and run the C demo from the source directory without installing:

```
gcc -o cdemo `pkg-config --cflags --libs gtk4 epoxy` -I./build -L./build -lgwebgl cdemo.c
GDK_DEBUG=gl-gles,opengl MESA_DEBUG=1 LD_LIBRARY_PATH=./build ./cdemo
```
For GTK3 change the `gtk4` above to `gtk+-3.0`.

# How the constants are modelled

The generated C code for classes that include property constants in WebGL stores
them in hash tables which are available via static methods. The JS wrappers
read these tables and add properties to the class prototypes. This is the
simplest way and reasonably efficient at run-time after the classes have been
defined. Conventional GObject properties don't work here because gjs doesn't
support them with upper case names.

## License

`lib.dom.ts` was taken from a node module belonging to Microsoft's Typescript
project, and is presumably copyrighted to Microsoft. The files in `refs` are
derived from this. These files are licensed under the Apache 2.0 license.

The other files, and the code they generate are also covered by the Apache 2.0
license:

Copyright 2021 Tony Houghton

Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed
under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
CONDITIONS OF ANY KIND, either express or implied. See the License for the
specific language governing permissions and limitations under the License.
