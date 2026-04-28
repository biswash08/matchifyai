import PyPDF2
import docx
import re
import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

# Configure Gemini API - uses GEMINI_API_KEY from .env
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if GEMINI_API_KEY:
    client = genai.Client(api_key=GEMINI_API_KEY)
else:
    client = None
    print("Warning: GEMINI_API_KEY not found in environment variables")

def extract_text_from_pdf(pdf_file):
    """Extract text from PDF file"""
    try:
        reader = PyPDF2.PdfReader(pdf_file)
        text = ""
        for page in reader.pages:
            extracted = page.extract_text()
            if extracted:
                text += extracted + "\n"
        return text.strip()
    except Exception as e:
        return f"Error extracting PDF: {str(e)}"

def extract_text_from_docx(docx_file):
    """Extract text from DOCX file"""
    try:
        doc = docx.Document(docx_file)
        text = ""
        for paragraph in doc.paragraphs:
            if paragraph.text.strip():
                text += paragraph.text + "\n"
        return text.strip()
    except Exception as e:
        return f"Error extracting DOCX: {str(e)}"

def extract_keywords(text):
    """Extract important keywords from text"""
    # Convert to lowercase and find words
    words = re.findall(r'\b[a-z]+\b', text.lower())
    
    # Common stop words to ignore
    stop_words = {
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
        'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
        'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'i', 'you',
        'we', 'they', 'he', 'she', 'it', 'this', 'that', 'these', 'those',
        'from', 'as', 'will', 'would', 'could', 'should', 'may', 'might', 'must'
    }
    
    # Count word frequency
    word_count = {}
    for word in words:
        if word not in stop_words and len(word) > 2:
            word_count[word] = word_count.get(word, 0) + 1
    
    # Return top keywords sorted by frequency
    sorted_words = sorted(word_count.items(), key=lambda x: x[1], reverse=True)
    return [word for word, count in sorted_words[:50]]

def calculate_match_score(cv_text, job_description):
    """Calculate match score based on keyword overlap"""
    cv_keywords = set(extract_keywords(cv_text))
    jd_keywords = set(extract_keywords(job_description))
    
    matched = cv_keywords.intersection(jd_keywords)
    missing = jd_keywords.difference(cv_keywords)
    
    if len(jd_keywords) > 0:
        score = (len(matched) / len(jd_keywords)) * 100
    else:
        score = 0
    
    return {
        'score': round(score, 2),
        'matched_keywords': list(matched)[:20],
        'missing_keywords': list(missing)[:20],
        'matched_count': len(matched),
        'total_keywords': len(jd_keywords)
    }

def get_ai_suggestions(cv_text, job_description, missing_keywords):
    """Generate AI-powered suggestions using Google Gemini API"""
    
    # If no API key, use fallback suggestions
    if not client:
        return get_fallback_suggestions(cv_text, job_description, missing_keywords)
    
    # Build prompt based on whether there are missing keywords
    if not missing_keywords or len(missing_keywords) == 0:
        prompt = f"""
        You are a professional CV reviewer. Analyze this CV against the job description and provide 5 specific suggestions.
        
        JOB DESCRIPTION:
        {job_description[:1500]}
        
        CV TEXT:
        {cv_text[:1500]}
        
        Provide 5 actionable suggestions. Use emojis. Keep each suggestion under 100 characters.
        """
    else:
        missing_str = ", ".join(missing_keywords[:8])
        prompt = f"""
        You are a professional CV reviewer.
        
        JOB DESCRIPTION:
        {job_description[:1500]}
        
        CV TEXT:
        {cv_text[:1500]}
        
        MISSING KEYWORDS: {missing_str}
        
        Provide 5 specific suggestions to add these missing keywords naturally.
        Use emojis. Keep each suggestion under 100 characters.
        """
    
    try:
        # Using confirmed working model from available list
        response = client.models.generate_content(
            model="gemini-2.5-flash",  # ✅ Working model
            contents=prompt,
            config={
                "max_output_tokens": 1000,
                "temperature": 0.7,
            }
        )
        
        suggestions = response.text.strip()
        
        # Truncate if too long
        if len(suggestions) > 800:
            suggestions = suggestions[:800] + "..."
        
        return suggestions
        
    except Exception as e:
        print(f"Gemini API Error: {e}")
        # Fallback to basic suggestions if API fails
        return get_fallback_suggestions(cv_text, job_description, missing_keywords)

def get_fallback_suggestions(cv_text, job_description, missing_keywords):
    """Fallback suggestions if Gemini API fails or no API key"""
    suggestions = []
    
    # Add missing keywords suggestions
    if missing_keywords:
        top_missing = missing_keywords[:5]
        suggestions.append(f"🎯 Add these keywords: {', '.join(top_missing)}")
    
    # General CV improvement tips
    suggestions.append("📊 Quantify your achievements with numbers and metrics")
    suggestions.append("💪 Use strong action verbs (developed, managed, created, optimized)")
    suggestions.append("🎨 Customize your CV summary to match the job role")
    suggestions.append("🏆 Highlight relevant projects and technologies")
    
    # Check CV length
    if len(cv_text) < 500:
        suggestions.append("📝 Add more details about your experience and skills")
    
    # Check for common technology stacks
    tech_checks = {
        'python': '🐍 Add Python to your technical skills',
        'django': '🚀 Add Django framework to your backend skills',
        'react': '⚛️ Add React.js to your frontend skills',
        'javascript': '📜 Add JavaScript to your skills',
        'postgresql': '🐘 Add PostgreSQL database experience',
        'aws': '☁️ Add AWS cloud experience',
        'docker': '🐳 Add Docker containerization experience',
        'git': '🔀 Add Git version control experience',
        'html': '🌐 Add HTML/CSS to your frontend skills',
        'css': '🎨 Add CSS/styling experience',
        'nodejs': '🟢 Add Node.js experience',
        'mongodb': '🍃 Add MongoDB experience',
        'typescript': '📘 Add TypeScript to your skills',
        'rest': '🔌 Add REST API experience',
        'graphql': '📡 Add GraphQL experience',
        'kubernetes': '☸️ Add Kubernetes experience',
        'jenkins': '🔧 Add CI/CD experience',
        'jira': '📋 Add project management experience',
        'agile': '🔄 Add Agile methodology experience',
    }
    
    job_lower = job_description.lower()
    cv_lower = cv_text.lower()
    
    for tech, suggestion in tech_checks.items():
        if tech in job_lower and tech not in cv_lower:
            suggestions.append(suggestion)
    
    # Return top 6 suggestions
    return "\n".join(suggestions[:6])