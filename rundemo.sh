#!/bin/sh
cd `dirname $0`
builddir=`pwd`/build
export GI_TYPELIB_PATH=${GI_TYPELIB_PATH:${GI_TYPELIB_PATH}:}${builddir}
export LD_LIBRARY_PATH=${LD_LIBRARY_PATH:${LD_LIBRARY_PATH}:}${builddir}
export GDK_DEBUG=${GDK_DEBUG:+${GDK_DEBUG},}gl-gles
#gjs -m ./demo/main.js
gjs -m ./demo.js
