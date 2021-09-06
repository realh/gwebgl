#!/bin/sh
cd `dirname $0`
builddir=`pwd`/build
export GI_TYPELIB_PATH=${GI_TYPELIB_PATH:${GI_TYPELIB_PATH}:}${builddir}
export LD_LIBRARY_PATH=${LD_LIBRARY_PATH:${LD_LIBRARY_PATH}:}${builddir}
export GDK_DEBUG=${GDK_DEBUG:+${GDK_DEBUG},}gl-gles

#export MALLOC_CHECK_=3
#export G_DEBUG=gc-friendly
#export G_SLICE=always-malloc
#export G_MESSAGES_DEBUG=all

#valgrind --error-limit=no \
#    --suppressions=/usr/share/gtk-4.0/valgrind/gtk.supp \
#    --suppressions=/usr/share/glib-2.0/valgrind/glib.supp \
#    --suppressions=/usr/share/clutter-1.0/valgrind/clutter.supp \
#    --suppressions=/usr/share/gjs-1.0/valgrind/gjs.supp \
    /usr/bin/gjs -m ./gjs_src/demo/main.js
