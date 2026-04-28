import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

client = genai.Client(api_key=os.getenv('GEMINI_API_KEY'))

print("Available models:")
print("-" * 50)

try:
    for model in client.models.list():
        print(f"✓ {model.name}")
except Exception as e:
    print(f"Error listing models: {e}")
    
    # Alternative method
    print("\nTrying alternative method...")
    try:
        response = client.models.list(config={'page_size': 100})
        for model in response:
            print(f"✓ {model.name}")
    except Exception as e2:
        print(f"Alternative also failed: {e2}")