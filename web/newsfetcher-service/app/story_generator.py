# app/story_generator.py
import os
import json
import httpx
from typing import Dict, Any
from dotenv import load_dotenv

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

async def generate_story_from_article(article: Dict[str, Any]) -> Dict[str, Any]:
    if not GEMINI_API_KEY:
        return get_demo_story()

    try:
        article_content = f"Title: {article['title']}\n\nDescription: {article['description']}\n\nContent: {article['content']}\n\nSource: {article['source']}"
        payload = {
            "contents": [
                {
                    "parts": [
                        {
                            "text": f"""Create an interactive child safety story based on this news article, formatted as a series of steps with choices. Follow this exact JSON structure:

{{
  "title": "Story title based on article",
  "scenes": [
    {{
      "id": 1,
      "text": "Scene description",
      "imagePrompt": "description for image generation",
      "options": [
        {{"text": "Choice 1", "nextScene": 2}},
        {{"text": "Choice 2", "nextScene": 3}}
      ]
    }}
  ]
}}

Article Content: {article_content}. Give only code, no explanation and game till 10 to 15 id."""
                        }
                    ]
                }
            ]
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{GEMINI_API_URL}?key={GEMINI_API_KEY}",
                json=payload,
                headers={"Content-Type": "application/json"}
            )
            response.raise_for_status()
            data = response.json()

            if data.get("candidates") and len(data["candidates"]) > 0:
                text_response = data["candidates"][0]["content"]["parts"][0]["text"]
                json_match = text_response.strip()
                if "```json" in json_match:
                    json_match = json_match.split("```json")[1].split("```")[0].strip()
                elif "```" in json_match:
                    json_match = json_match.split("```")[1].split("```")[0].strip()
                return json.loads(json_match)

            raise Exception("No valid response from Gemini API")

    except Exception as e:
        print(f"Error generating story: {str(e)}")
        return get_demo_story()

def get_demo_story() -> Dict[str, Any]:
    return {
        "title": "The Secret and the Safe Place",
        "scenes": [
            {
                "id": 1,
                "text": "You're playing in the park when a new neighbor, Mr. Grumbly, offers you a special candy...",
                "imagePrompt": "A young child in a park, looking hesitantly at a friendly but slightly unsettling adult offering candy.",
                "options": [
                    {"text": "Take the candy and keep it a secret.", "nextScene": 2},
                    {"text": "Politely say no and go play with your friends.", "nextScene": 3}
                ]
            },
            
        ]
    }
