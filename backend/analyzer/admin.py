from django.contrib import admin
from .models import CVAnalysis

@admin.register(CVAnalysis)
class CVAnalysisAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'job_title', 'match_score', 'created_at']
    list_filter = ['match_score', 'created_at']
    search_fields = ['user__email', 'job_title']
    readonly_fields = ['cv_text', 'matched_keywords', 'missing_keywords', 'ai_suggestions']