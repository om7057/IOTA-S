# app/story_generator.py
import os
import json
import httpx
import asyncio
from typing import Dict, Any
from dotenv import load_dotenv

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Try models in order of availability and rate limits
GEMINI_MODELS = [
    "gemini-2.5-flash"
]
BASE_GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models"

# Simple in-memory cache for generated stories
STORY_CACHE: Dict[str, Dict[str, Any]] = {}

async def generate_story_from_article(article: Dict[str, Any]) -> Dict[str, Any]:
    """Generate story with retry logic and rate limiting"""
    if not GEMINI_API_KEY:
        print("No GEMINI_API_KEY provided, using demo story")
        return get_demo_story(article)

    # Check cache first
    article_key = article.get('title', '').lower()[:50]
    if article_key in STORY_CACHE:
        print(f"Using cached story for: {article_key}")
        return STORY_CACHE[article_key]

    # Retry logic with exponential backoff
    max_retries = 3
    retry_delay = 2  # seconds
    
    for attempt in range(max_retries):
        article_content = f"Title: {article['title']}\n\nDescription: {article['description']}\n\nContent: {article['content']}\n\nSource: {article['source']}"
        payload = {
            "contents": [
                {
                    "parts": [
                        {
                            "text": f"""Create an interactive story for children based on this article:

{article_content}

REQUIREMENTS - STRICTLY FOLLOW:
1. Minimum 6-7 scenes (not less)
2. Story MUST incorporate specific details/context from the article
3. Create branching paths where:
   - WRONG choices: Lead to consequence scenes explaining why that decision was harmful
   - RIGHT choices: Lead to resolution scenes showing positive outcomes
   - Add a "try again" option to return to decision points
4. Each scene must have:
   - "id": Integer 0, 1, 2, ...
   - "title": Scene heading
   - "text": 3-4 sentences of narrative that directly relates to article content
   - "image": "" (empty string)
   - "options": Array with 2-3 choices, each with "text" and "to" (scene id)

5. Structure example:
   - Scene 0: Problem setup (describe situation from article)
   - Scene 1-2: Decision point with 2-3 different paths
   - Scene 3: Consequence of wrong choice (explain why it's wrong, tied to article)
   - Scene 4: Path back to try again
   - Scene 5: Consequence of right choice (show learning)
   - Scene 6: Final resolution/conclusion (no options)

6. Make it engaging with:
   - Real scenarios directly based on article topic
   - Multiple decision branches (not linear)
   - Educational outcomes for each path
   - Child-friendly language but serious topic handling
   - Consequences that show learning, not punishment

RETURN FORMAT:
{{
  "title": "Unique title from article context",
  "description": "One-line story description",
  "scenes": [
    {{
      "id": 0,
      "title": "Scene heading",
      "text": "3-4 sentence narrative...",
      "image": "",
      "options": [
        {{"text": "Choice A", "to": 1}},
        {{"text": "Choice B", "to": 2}}
      ]
    }}
  ]
}}

Return ONLY valid JSON, no markdown, no explanation."""
                            }
                        ]
                    }
                ]
            }

        print(f"Generating story (attempt {attempt + 1}/{max_retries})...")
        
        # Try different models with fallback
        for model in GEMINI_MODELS:
            try:
                gemini_url = f"{BASE_GEMINI_URL}/{model}:generateContent"
                print(f"  Trying model: {model}...")
                
                async with httpx.AsyncClient(timeout=30) as client:
                    response = await client.post(
                        f"{gemini_url}?key={GEMINI_API_KEY}",
                        json=payload,
                        headers={"Content-Type": "application/json"}
                    )
                    response.raise_for_status()
                    data = response.json()

                    if data.get("candidates") and len(data["candidates"]) > 0:
                        text_response = data["candidates"][0]["content"]["parts"][0]["text"]
                        json_match = text_response.strip()
                        
                        # Extract JSON from markdown code blocks if present
                        if "```json" in json_match:
                            json_match = json_match.split("```json")[1].split("```")[0].strip()
                        elif "```" in json_match:
                            json_match = json_match.split("```")[1].split("```")[0].strip()
                        
                        # Parse and validate the JSON
                        story = json.loads(json_match)
                        
                        # Validate story structure
                        if not validate_story_structure(story):
                            print(f"Invalid story structure from {model}, trying next model...")
                            continue
                        
                        # Cache successful story
                        STORY_CACHE[article_key] = story
                        print(f"✓ Story generated with {model} and cached successfully")
                        return story

                    raise Exception("No valid response from Gemini API")
            
            except httpx.HTTPStatusError as e:
                status_code = e.response.status_code
                print(f"  {model} error: {status_code}")
                
                # If rate limited on this model, try next
                if status_code == 429:
                    if model != GEMINI_MODELS[-1]:  # Not the last model
                        print(f"  {model} rate limited, trying next model...")
                        continue
                    else:
                        print(f"  All models rate limited on attempt {attempt + 1}/{max_retries}")
                        if attempt < max_retries - 1:
                            wait_time = retry_delay * (2 ** attempt)
                            print(f"Rate limited! Waiting {wait_time}s before retry...")
                            await asyncio.sleep(wait_time)
                            break  # Break inner loop to retry all models
                        else:
                            print("Max retries exceeded due to rate limiting, using fallback")
                            return get_demo_story(article)
                else:
                    # Other errors - try next model
                    if model != GEMINI_MODELS[-1]:
                        print(f"  Trying next model...")
                        continue
                    else:
                        print(f"  All models failed with error: {status_code}")
                        return get_demo_story(article)
            
            except Exception as e:
                print(f"  {model} exception: {str(e)[:50]}")
                if model != GEMINI_MODELS[-1]:
                    print(f"  Trying next model...")
                    continue
                else:
                    print(f"All models failed: {str(e)[:100]}")
                    return get_demo_story(article)

    # Final fallback if nothing works
    print("Unable to generate story from any source, using demo")
    return get_demo_story(article)

def validate_story_structure(story: Dict[str, Any]) -> bool:
    """Validate that the story has required fields and structure"""
    required_fields = ["title", "description", "scenes"]
    if not all(field in story for field in required_fields):
        return False
    
    # Minimum 6 scenes required
    if not isinstance(story["scenes"], list) or len(story["scenes"]) < 6:
        print(f"Story has {len(story.get('scenes', []))} scenes, need at least 6")
        return False
    
    for scene in story["scenes"]:
        if not all(field in scene for field in ["id", "title", "text", "options"]):
            return False
        if not isinstance(scene["options"], list):
            return False
        # Validate each option has "text" and "to" fields
        for option in scene["options"]:
            if not all(field in option for field in ["text", "to"]):
                return False
    
    return True

def get_demo_story(article: Dict[str, Any]) -> Dict[str, Any]:
    """Generate a fallback story with 6+ scenes and proper branching"""
    article_title = article.get('title', 'Safety')
    topic = article_title[:50] if article_title else "child safety"
    
    return {
        "title": f"Facing The Challenge: {topic[:25]}",
        "description": f"Learn to navigate situations related to {topic[:35]} with wise decisions and support",
        "scenes": [
            {
                "id": 0,
                "title": "A New Day",
                "text": f"Today you encounter a situation related to {topic}. It's something you've never dealt with before. You feel uncertain about what to do. There are several people around you - your friend, a teacher, and a stranger. What's your first instinct?",
                "image": "",
                "options": [
                    {"text": "Ask your friend what to do", "to": 1},
                    {"text": "Ask the teacher for advice", "to": 2},
                    {"text": "Handle it yourself first", "to": 3}
                ]
            },
            {
                "id": 1,
                "title": "Relying on Your Friend",
                "text": "Your friend has good intentions but might not know all the facts. After discussing it, you realize your friend is uncertain too. They suggest you both talk to an adult who knows more about these situations.",
                "image": "",
                "options": [
                    {"text": "Thank your friend and find a trusted adult", "to": 4},
                    {"text": "Try to solve it yourself anyway", "to": 3}
                ]
            },
            {
                "id": 2,
                "title": "Seeking Help from an Authority",
                "text": "The teacher listens carefully to your concern and explains the situation clearly. They help you understand the risks and the right way to respond. The teacher explains that getting help from trusted adults is always the smart choice.",
                "image": "",
                "options": [
                    {"text": "Thank the teacher and follow their guidance", "to": 5},
                    {"text": "Ask more questions to understand better", "to": 6}
                ]
            },
            {
                "id": 3,
                "title": "Going It Alone",
                "text": "You try to handle it by yourself, but it becomes confusing and stressful. You realize you need help after all. The situation gets more complicated because you waited too long. You finally decide to reach out to an adult.",
                "image": "",
                "options": [
                    {"text": "Go tell a trusted adult now", "to": 4},
                    {"text": "Realize this was a learning moment", "to": 7}
                ]
            },
            {
                "id": 4,
                "title": "Getting Support",
                "text": "You find a parent, teacher, or counselor and explain everything honestly. They listen without judgment and help you work through it. With their guidance, you understand what went wrong and what the right approach is. They make sure you feel safe and supported.",
                "image": "",
                "options": [
                    {"text": "Learn from this experience", "to": 7}
                ]
            },
            {
                "id": 5,
                "title": "Taking the Right Path",
                "text": "By following the teacher's guidance, you handle the situation confidently and correctly. Your actions help protect yourself and possibly others too. The teacher confirms you made smart choices. You feel proud of yourself for making responsible decisions.",
                "image": "",
                "options": [
                    {"text": "Reflect on what you learned", "to": 7}
                ]
            },
            {
                "id": 6,
                "title": "Deeper Understanding",
                "text": "The teacher answers your questions in detail, helping you truly understand why certain responses are better than others. You learn not just what to do, but WHY it matters. This knowledge will help you in many situations. You feel more confident now.",
                "image": "",
                "options": [
                    {"text": "Apply this wisdom", "to": 7}
                ]
            },
            {
                "id": 7,
                "title": "Your Takeaway",
                "text": "Whether you learned quickly or through mistakes, the key lesson is clear: Trusted adults like parents, teachers, and counselors are there for a reason. They have experience and care about your safety. When facing difficult situations, reaching out for help is a sign of strength, not weakness. Remember this the next time you're unsure.",
                "image": "",
                "options": []
            }
        ]
    }
