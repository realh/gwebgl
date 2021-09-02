#include <gtk/gtk.h>
#include <epoxy/gl.h>
#include "gwebgl.h"

static gboolean tick(GtkGLArea *glarea)
{
    if (gtk_widget_get_realized(GTK_WIDGET(glarea)))
    {
        gtk_gl_area_queue_render(glarea);
    }
    return TRUE;
}

gboolean render(GtkGLArea *glarea, GdkGLContext *context,
    GwebglWebGLRenderingContextBase *gl)
{
    (void) glarea;
    (void) context;
    g_print("Render callback\n");
    //glClearColor(0.0, 0.0, 0.0, 1.0);
    //glClear(GL_COLOR_BUFFER_BIT);
    gwebgl_webgl_rendering_context_base_clearColor(gl, 0.0, 0.0, 0.0, 1.0);
    gwebgl_webgl_rendering_context_base_clear(gl, GL_COLOR_BUFFER_BIT);
    return TRUE;
}

void activate(GtkApplication *app)
{
    GtkWidget *win = gtk_application_window_new(app);
    gtk_window_set_default_size(GTK_WINDOW(win), 800, 600);
    GtkWidget *canvas = gtk_gl_area_new();
    GtkGLArea *glarea = GTK_GL_AREA(canvas);
    gtk_gl_area_set_use_es(glarea, TRUE);
    gtk_gl_area_set_required_version(glarea, 2, 0);
    GwebglWebGLRenderingContext *gl = g_object_new(
        GWEBGL_TYPE_WEBGL_RENDERING_CONTEXT, NULL);
    {
        guint nprops;
        GParamSpec **props = g_object_class_list_properties(
            G_OBJECT_CLASS(GWEBGL_WEBGL_RENDERING_CONTEXT_GET_CLASS(gl)),
            &nprops);
        g_print("GwebglWebGLRenderingContextBase has %u properties\n", nprops);
        for (guint n = 0; n < nprops; ++n)
        {
            g_print("%3d %50s\n", n, g_param_spec_get_name(props[n]));
        }
        g_free(props);
    }
    g_signal_connect(glarea, "render", G_CALLBACK(render), gl);
#if GTK_MAJOR_VERSION == 3
    gtk_container_add(GTK_CONTAINER(win), canvas);
    gtk_widget_show_all(win);
#else
    gtk_window_set_child(GTK_WINDOW(win), canvas);
    gtk_window_present(GTK_WINDOW(win));
#endif
    g_timeout_add(1000, G_SOURCE_FUNC(tick), glarea);
}

int main(int argc, char **argv)
{
    GtkApplication *app = gtk_application_new("uk.co.realh.gwebgl.cdemo",
        G_APPLICATION_FLAGS_NONE);
    g_signal_connect(app, "activate", G_CALLBACK(activate), NULL);
    g_application_run(G_APPLICATION(app), argc, argv);
}
