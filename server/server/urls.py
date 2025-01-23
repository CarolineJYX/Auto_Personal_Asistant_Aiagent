from django.contrib import admin
from django.conf.urls.static import static
from django.urls import path, include, re_path
from django.views.static import serve

from server import settings
from . import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('webapp.urls')),
    path('ai/message', views.ai_message, name='ai_message'),
    path('email/send', views.send_email, name='send_email'),
    path('', views.home, name='home'),
    # static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    # static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
]
