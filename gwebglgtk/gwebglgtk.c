#include "gwebglgtk.h"

static gboolean gwebglgtk_queue_render_idle_callback(gpointer glarea)
{
    gtk_gl_area_queue_render(glarea);
    return FALSE;
}

/**
 * gwebglgtk_queue_render:
 * @glarea: (transfer none):
 *
 * gtk_glarea_queue_render has no effect when called while handling a "render"
 * signal. Calling GLib.idle_add() from gjs seems to allow the JS callback to
 * be called during JS garbage collection, which isn't allowed. This sets up
 * an idle callback to call gtk_glarea_queue_render all in C. It's very basic;
 * the caller should still take responsibility for avoiding calling this when
 * a render is already queued, in case that matters.
 */
void gwebglgtk_queue_render_when_idle(GtkGLArea *glarea)
{
    g_idle_add(gwebglgtk_queue_render_idle_callback, glarea);
}
