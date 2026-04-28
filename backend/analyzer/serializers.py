from rest_framework import serializers
from .models import CVAnalysis

class CVAnalysisSerializer(serializers.ModelSerializer):
    class Meta:
        model = CVAnalysis
        fields = ['id', 'job_title', 'job_description', 'match_score', 
                  'matched_keywords', 'missing_keywords', 'ai_suggestions', 'created_at']
        read_only_fields = ['created_at']