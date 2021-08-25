# gwebgl

This generates a [GObject Introspectable](https://gi.readthedocs.io/en/latest/)
wrapper library for [OpenGL ES](https://www.khronos.org/opengles/). The API is
designed so that when it's bound to Javascript with gjs the API is as close as
possible to [WebGL](https://www.khronos.org/webgl/).

## Status

It can now generate a GI library which in theory fully supports all of WebGL 1,
with the help of Javascript wrappers (supplied in the `gjswrappers` folder).
However, in preliminary testing it doesn't work in gjs with GTK4. No errors are
reported, the widget just stays blank (it should be cleared to black). It works
with GTK3, and equivalent C code works in GTK4. Weird.

## Building

Install meson and development files for gobject-introspection, OpenGL ES and
GTK (3 or 4). It might work on MacOS with
[ANGLE](https://github.com/google/angle) but this is untested.
```
meson setup build
meson compile -C build
```

`rundemo.sh` runs the very simple example program with some environment
variables set up to use the files from the `build` subdirectory without
installing them.

To compile the C equivalent of the demo:
```
gcc -o build/cdemo `pkg-config --cflags --libs gtk4 glesv2` -I./build -L./build -lgwebgl cdemo.c
```
Run it with:
```
LD_LIBRARY_PATH=./build ./build/cdemo
```

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
