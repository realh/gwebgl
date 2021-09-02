# gwebgl

This generates a [GObject Introspectable](https://gi.readthedocs.io/en/latest/)
wrapper library for [OpenGL ES](https://www.khronos.org/opengles/). The API is
designed so that when it's bound to Javascript with gjs the API is as close as
possible to [WebGL](https://www.khronos.org/webgl/).

## Status

It can now generate a GI library which in theory fully supports all of WebGL 1,
with the help of Javascript wrappers (supplied in the `gjswrappers` folder).
However, gjs returns undefined for all the upper-case constant property values,
so I'll need to add a workaround. Making the wrappers auto-generated and moving
the constants into them is probably the best option for run-time efficiency.

# Building

You need meson and headers etc for GTK (you can use either GTK3 or 4), epoxy and
OpenGL.

First time only:
```
meson setup build
```

Then:
```
meson compile -C build
```

Installation is not supported yet.

# Info

Currently, [requesting a GLES context in GTK/GDK from code gets
ignored](https://gitlab.gnome.org/GNOME/gtk/-/issues/4221). If you're lucky your
distro will have GTK built with certain debugging features enabled, then you can
set the environment variable `GDK_DEBUG=gl-gles`. This works in Arch Linux, but
I haven't tried other distros.

The demos are supposed to simply use gl.clear to make the window background
black. I was planning on something more interesting, but I want to try to fix
the GTK4/gjs issue first. The C demo works as expected, the gjs demo
fails to change the background colour from GTK's default when run with GTK4.

The gjs demo can be run via the `rundemo.sh` script. To use GTK3 instead of
GTK4 change the 4 to 3 on the first line of `demo.js`.

To compile and run the C
demo from the source directory without installing:

```
gcc -o cdemo `pkg-config --cflags --libs gtk4 epoxy` -I./build -L./build -lgwebgl cdemo.c
GDK_DEBUG=gl-gles,opengl MESA_DEBUG=1 LD_LIBRARY_PATH=./build ./cdemo
```
For GTK3 change the `gtk4` above to `gtk+-3.0`.

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
