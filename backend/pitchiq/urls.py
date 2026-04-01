from django.urls import path, include

urlpatterns = [
    path('api/auth/', include('apps.users.urls')),
    path('api/', include('apps.ideas.urls')),
    path('api/', include('apps.analysis.urls')),
]
