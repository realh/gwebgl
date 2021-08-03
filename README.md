# gwebgl

This generates a [GObject Introspectable](https://gi.readthedocs.io/en/latest/)
wrapper library for [OpenGL ES](https://www.khronos.org/opengles/). The API is
designed so that when it's bound to Javascript with gjs the API is as close as
possible to [WebGL](https://www.khronos.org/webgl/).

The project is nowhere near ready for use yet, check back later.

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
