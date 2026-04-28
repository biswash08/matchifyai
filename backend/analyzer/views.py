from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import CVAnalysis
from .utils import extract_text_from_pdf, extract_text_from_docx, calculate_match_score, get_ai_suggestions
from .serializers import CVAnalysisSerializer

class PublicAnalyzeView(APIView):
    """Public CV analysis - no login required"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        job_title = request.data.get('job_title', '')
        job_description = request.data.get('job_description')
        cv_file = request.FILES.get('cv_file')
        
        if not cv_file:
            return Response({'error': 'CV file is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        if not job_description:
            return Response({'error': 'Job description is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Extract text from CV
        file_extension = cv_file.name.split('.')[-1].lower()
        if file_extension == 'pdf':
            cv_text = extract_text_from_pdf(cv_file)
        elif file_extension == 'docx':
            cv_text = extract_text_from_docx(cv_file)
        else:
            return Response({'error': 'Only PDF and DOCX files are supported'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Calculate match score
        match_result = calculate_match_score(cv_text, job_description)
        
        # Get AI suggestions
        suggestions = get_ai_suggestions(cv_text, job_description, match_result['missing_keywords'])
        
        return Response({
            'match_score': match_result['score'],
            'matched_keywords': match_result['matched_keywords'],
            'missing_keywords': match_result['missing_keywords'],
            'matched_count': match_result['matched_count'],
            'total_keywords': match_result['total_keywords'],
            'ai_suggestions': suggestions,
        }, status=status.HTTP_200_OK)

class SaveAnalysisView(APIView):
    """Save analysis to user history - requires login"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        job_title = request.data.get('job_title', '')
        job_description = request.data.get('job_description')
        cv_file = request.FILES.get('cv_file')
        match_score = request.data.get('match_score')
        matched_keywords = request.data.get('matched_keywords', [])
        missing_keywords = request.data.get('missing_keywords', [])
        ai_suggestions = request.data.get('ai_suggestions', '')
        
        if not cv_file:
            return Response({'error': 'CV file is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Extract text from CV
        file_extension = cv_file.name.split('.')[-1].lower()
        if file_extension == 'pdf':
            cv_text = extract_text_from_pdf(cv_file)
        elif file_extension == 'docx':
            cv_text = extract_text_from_docx(cv_file)
        else:
            return Response({'error': 'Only PDF and DOCX files are supported'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Save to database
        analysis = CVAnalysis.objects.create(
            user=request.user,
            job_title=job_title,
            job_description=job_description,
            cv_text=cv_text,
            cv_file=cv_file,
            match_score=float(match_score),
            matched_keywords=matched_keywords,
            missing_keywords=missing_keywords,
            ai_suggestions=ai_suggestions
        )
        
        serializer = CVAnalysisSerializer(analysis)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class AnalysisHistoryView(generics.ListAPIView):
    """Get user's analysis history"""
    permission_classes = [IsAuthenticated]
    serializer_class = CVAnalysisSerializer
    
    def get_queryset(self):
        return CVAnalysis.objects.filter(user=self.request.user)

class AnalysisDetailView(APIView):
    """Get single analysis detail"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, analysis_id):
        try:
            analysis = CVAnalysis.objects.get(id=analysis_id, user=request.user)
            serializer = CVAnalysisSerializer(analysis)
            return Response(serializer.data)
        except CVAnalysis.DoesNotExist:
            return Response({'error': 'Analysis not found'}, status=status.HTTP_404_NOT_FOUND)
    
    def delete(self, request, analysis_id):
        try:
            analysis = CVAnalysis.objects.get(id=analysis_id, user=request.user)
            analysis.delete()
            return Response({'message': 'Analysis deleted successfully'})
        except CVAnalysis.DoesNotExist:
            return Response({'error': 'Analysis not found'}, status=status.HTTP_404_NOT_FOUND)