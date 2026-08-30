from google import genai
from app.core.config import GEMINI_API_KEY
client=genai.Client(api_key=GEMINI_API_KEY)
def ask(prompt:str):
    return client.models.generate_content(model="gemini-2.5-flash",contents=prompt).text
