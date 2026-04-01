from django.urls import path
from .views import (
    AnalysisDetailView,
    AnalysisStatusView,
    QAChatView,
    ExportPDFView,
    ExportPPTXView,
)

urlpatterns = [
    path('analysis/<str:analysis_id>/', AnalysisDetailView.as_view()),
    path('analysis/<str:analysis_id>/status/', AnalysisStatusView.as_view()),
    path('analysis/<str:analysis_id>/chat/', QAChatView.as_view()),
    path('analysis/<str:analysis_id>/pdf/', ExportPDFView.as_view()),
    path('analysis/<str:analysis_id>/pptx/', ExportPPTXView.as_view()),
]
