from django.urls import path
from .views import IdeaListCreateView

urlpatterns = [
    path('ideas/', IdeaListCreateView.as_view()),
]
