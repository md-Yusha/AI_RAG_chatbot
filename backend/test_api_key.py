import os
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables
load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")

if not api_key:
    print("Error: GOOGLE_API_KEY environment variable not set")
    exit(1)

# Configure the API
genai.configure(api_key=api_key)

# List available models
print("Available models:")
for model in genai.list_models():
    if "generateContent" in model.supported_generation_methods:
        print(f"- {model.name}")

# Test a simple generation
try:
    model = genai.GenerativeModel('models/gemini-1.5-pro')
    response = model.generate_content("Hello, what can you do?")
    print("\nTest response:")
    print(response.text)
    print("\nAPI key is working correctly!")
except Exception as e:
    print(f"\nError testing API key: {e}")