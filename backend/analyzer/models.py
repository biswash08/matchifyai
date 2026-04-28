from django.db import models
from django.conf import settings

class CVAnalysis(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='analyses'
    )
    job_title = models.CharField(max_length=200, blank=True)
    job_description = models.TextField()
    cv_text = models.TextField()
    cv_file = models.FileField(upload_to='cvs/', null=True, blank=True)
    
    # Analysis results
    match_score = models.FloatField(default=0)
    matched_keywords = models.JSONField(default=list)
    missing_keywords = models.JSONField(default=list)
    ai_suggestions = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.job_title or 'Untitled'} - {self.created_at.strftime('%Y-%m-%d')}"