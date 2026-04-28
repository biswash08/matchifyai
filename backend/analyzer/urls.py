from django.urls import path
from .views import (
    PublicAnalyzeView, 
    SaveAnalysisView, 
    AnalysisHistoryView, 
    AnalysisDetailView
)

urlpatterns = [
    path('public-analyze/', PublicAnalyzeView.as_view(), name='public-analyze'),
    path('save/', SaveAnalysisView.as_view(), name='save-analysis'),
    path('history/', AnalysisHistoryView.as_view(), name='history'),
    path('history/<int:analysis_id>/', AnalysisDetailView.as_view(), name='analysis-detail'),
]