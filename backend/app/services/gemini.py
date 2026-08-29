import os
try:
 from google import genai
except Exception:
 genai=None
def ask_gemini(prompt:str):
 if not os.getenv("GEMINI_API_KEY"):
  return "Add GEMINI_API_KEY to .env"
 return f"Gemini ready for: {prompt}"
