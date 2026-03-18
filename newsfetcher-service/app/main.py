# main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
from dotenv import load_dotenv
import httpx
import os

from app.story_generator import generate_story_from_article

load_dotenv()
NEWSAPI_KEY = os.getenv("NEWSAPI_KEY")
NEWSAPI_URL = "https://newsapi.org/v2/everything"

app = FastAPI(title="Child Safety News API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

NODE_BACKEND_URL = os.getenv("NODE_BACKEND_URL", "http://localhost:3000")

# Models
class StoryOption(BaseModel):
    text: str
    to: int

class StoryScene(BaseModel):
    title: str
    image: str
    options: List[StoryOption]

class StoryData(BaseModel):
    title: str
    description: str
    level: str
    topic: str
    scenes: List[StoryScene]

@app.get("/api/news")
async def get_categorized_news():
    articles = await fetch_news_articles()
    for article in articles:
        article["topic"] = categorize_article(article)
        article["topicId"] = get_topic_id(article["topic"])
    return {"articles": articles}

@app.post("/api/generate-story")
async def generate_story(article_index: int):
    try:
        articles_response = await get_categorized_news()
        articles = articles_response["articles"]

        if article_index < 0 or article_index >= len(articles):
            raise HTTPException(status_code=400, detail="Invalid article index")

        selected_article = articles[article_index]
        story = await generate_story_from_article(selected_article)
        return story
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate story: {str(e)}")

@app.get("/api/news-stories")
async def get_saved_stories():
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{NODE_BACKEND_URL}/api/news-stories")
            response.raise_for_status()
            return response.json()
    except httpx.HTTPError as e:
        raise HTTPException(status_code=e.response.status_code if hasattr(e, 'response') else 500,
                            detail=f"Error fetching saved stories: {str(e)}")

@app.post("/api/news-stories")
async def save_story(story_data: Dict[str, Any]):
    try:
        transformed_story = transform_story_for_node(story_data)
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{NODE_BACKEND_URL}/api/news-stories",
                json=transformed_story,
                headers={"Content-Type": "application/json"}
            )
            response.raise_for_status()
            return response.json()
    except httpx.HTTPError as e:
        error_detail = str(e)
        if hasattr(e, 'response') and e.response:
            try:
                error_data = e.response.json()
                error_detail = error_data.get('error', str(e))
            except:
                pass
        raise HTTPException(status_code=e.response.status_code if hasattr(e, 'response') else 500,
                            detail=f"Error saving story: {error_detail}")

@app.get("/api/news-stories/{story_id}")
async def get_story_by_id(story_id: str):
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{NODE_BACKEND_URL}/api/news-stories/{story_id}")
            response.raise_for_status()
            return response.json()
    except httpx.HTTPError as e:
        raise HTTPException(status_code=e.response.status_code if hasattr(e, 'response') else 500,
                            detail=f"Error fetching story: {str(e)}")

# --- Helper Functions ---
def get_topic_id(topic_name: str) -> str:
    topic_mapping = {
        "Child Abuse": "6421a2fc5e7b4b5a8d3f9e7e",
        "Sexual Exploitation": "6421a2fc5e7b4b5a8d3f9e7f",
        "Online Exploitation": "6421a2fc5e7b4b5a8d3f9e80",
        "Cyberbullying": "6421a2fc5e7b4b5a8d3f9e81",
        "Child Labour": "6421a2fc5e7b4b5a8d3f9e82",
        "Child Marriage": "6421a2fc5e7b4b5a8d3f9e83",
        "Mental Health": "6421a2fc5e7b4b5a8d3f9e84",
        "Education": "6421a2fc5e7b4b5a8d3f9e85",
        "Safety / Protection": "6421a2fc5e7b4b5a8d3f9e86",
        "Trafficking": "6421a2fc5e7b4b5a8d3f9e87",
        "Uncategorized": "6421a2fc5e7b4b5a8d3f9e7d"
    }
    return topic_mapping.get(topic_name, "6421a2fc5e7b4b5a8d3f9e7d")

def categorize_article(article):
    text = f"{article['title']} {article.get('description', '')}".lower()
    if "abuse" in text:
        return "Child Abuse"
    elif "sex" in text or "exploit" in text:
        return "Sexual Exploitation"
    elif "cyber" in text or "online" in text:
        return "Online Exploitation"
    elif "bully" in text:
        return "Cyberbullying"
    elif "labour" in text:
        return "Child Labour"
    elif "marriage" in text:
        return "Child Marriage"
    elif "mental" in text:
        return "Mental Health"
    elif "school" in text or "education" in text:
        return "Education"
    elif "traffick" in text:
        return "Trafficking"
    elif "safety" in text or "protect" in text or "hero" in text:
        return "Safety / Protection"
    else:
        return "Uncategorized"

async def fetch_news_articles():
    # Demo mode - return sample articles if API key is missing
    if not NEWSAPI_KEY:
        return get_demo_articles()
    
    params = {
        "q": "child safety OR child protection OR child rights",
        "language": "en",
        "sortBy": "publishedAt",
        "pageSize": 10,
        "apiKey": NEWSAPI_KEY
    }
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(NEWSAPI_URL, params=params, timeout=10.0)
            response.raise_for_status()
            data = response.json()
            articles = data.get("articles", [])
            return [
                {
                    "title": a["title"],
                    "description": a.get("description", ""),
                    "content": a.get("content", ""),
                    "source": a["source"]["name"]
                }
                for a in articles
            ]
    except Exception as e:
        print(f"Error fetching from NewsAPI: {e}")
        # Fallback to demo articles on any error
        return get_demo_articles()

def get_demo_articles():
    """Return demo articles for testing without NewsAPI key"""
    return [
        {
            "title": "New Child Safety Initiative Launched in Schools",
            "description": "Educational programs help children identify and report unsafe situations.",
            "content": "A comprehensive new initiative has been launched to educate children about personal safety and recognizing warning signs in adult behavior.",
            "source": "BBC News"
        },
        {
            "title": "Online Safety: Protecting Children from Digital Threats",
            "description": "Expert guide on teaching children to recognize phishing and suspicious online behavior.",
            "content": "Cybersecurity experts warn parents about increasing online exploitation of children and recommend digital literacy programs.",
            "source": "TechSafety Daily"
        },
        {
            "title": "Child Labour Awareness Day: Rights and Protection",
            "description": "Global movement highlights the importance of education over exploitation.",
            "content": "Organizations worldwide are raising awareness about child labor and promoting access to safe education for all children.",
            "source": "UN News"
        },
        {
            "title": "Building Supportive Networks: Safe Adults Matter",
            "description": "Research shows importance of trusted adult relationships in child development and safety.",
            "content": "New study emphasizes the critical role of teachers, counselors, and mentors in child safety and wellbeing.",
            "source": "Child Development Review"
        },
        {
            "title": "Digital Footprint: Teaching Kids About Online Privacy",
            "description": "Educators teach children the importance of privacy and permanence of digital sharing.",
            "content": "As children spend more time online, understanding digital permanence becomes crucial for their future.",
            "source": "Education Today"
        },
        {
            "title": "Boundaries and Consent: Age-Appropriate Education",
            "description": "Experts recommend teaching children about personal boundaries from an early age.",
            "content": "Teaching children to recognize and communicate boundaries is essential for their physical and emotional safety.",
            "source": "Psychology & Development"
        },
        {
            "title": "Child Marriage Prevention: Breaking the Cycle",
            "description": "Global efforts to end child marriage and ensure girls' access to education.",
            "content": "International organizations work to eliminate child marriage through education and community engagement.",
            "source": "Global Rights Forum"
        },
        {
            "title": "Stranger Awareness: Teaching Street Safety",
            "description": "Guidance on helping children navigate public spaces safely.",
            "content": "Child safety experts provide evidence-based strategies for teaching children about personal safety in public.",
            "source": "Safety Watch"
        }
    ]

def transform_story_for_node(story_data: Dict[str, Any]) -> Dict[str, Any]:
    return story_data
