import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

client = genai.Client(api_key=os.getenv('GEMINI_API_KEY'))

models_to_test = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-flash-latest",
]

for model_name in models_to_test:
    print(f"\nTesting {model_name}...")
    try:
        response = client.models.generate_content(
            model=model_name,
            contents="Say 'OK'"
        )
        print(f"✓ {model_name} works!")
    except Exception as e:
        print(f"✗ {model_name} failed: {e}")