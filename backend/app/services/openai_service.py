from openai import OpenAI
from typing import Dict, Any, List
from ..config import settings
import json

class OpenAIService:
    def __init__(self):
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
    
    def process_description(self, description: str) -> Dict[str, Any]:
        prompt = f"""
        Analyze this music description and extract structured search criteria: "{description}"
        
        Return a JSON object with these fields:
        - genres: List of music genres (e.g., ["rock", "pop", "electronic"])
        - moods: List of moods/emotions (e.g., ["energetic", "upbeat", "relaxing"])
        - decades: List of decades if mentioned (e.g., ["1980s", "1990s"])
        - artists: List of specific artists if mentioned
        - keywords: List of other relevant keywords for searching
        - spotify_query: A well-formed Spotify search query string
        - web_search_queries: List of 3-5 web search queries to find relevant songs
        
        Example output:
        {{
            "genres": ["rock", "alternative"],
            "moods": ["energetic", "upbeat"],
            "decades": ["1990s"],
            "artists": [],
            "keywords": ["workout", "gym"],
            "spotify_query": "genre:rock genre:alternative year:1990-1999 energy:0.7-1.0",
            "web_search_queries": [
                "best energetic rock songs 1990s workout",
                "upbeat alternative rock 90s gym music",
                "high energy rock songs 1990s playlist"
            ]
        }}
        """
        
        response = self.client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a music expert that analyzes descriptions and creates search criteria. Always respond with valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3
        )
        
        try:
            return json.loads(response.choices[0].message.content)
        except json.JSONDecodeError:
            return {
                "genres": [],
                "moods": [],
                "decades": [],
                "artists": [],
                "keywords": [],
                "spotify_query": description,
                "web_search_queries": [f"best songs {description}"]
            }
    
    def refine_playlist(self, original_description: str, feedback: str, current_tracks: List[str]) -> Dict[str, Any]:
        prompt = f"""
        Original playlist description: "{original_description}"
        User feedback: "{feedback}"
        Current tracks: {current_tracks}
        
        Based on the feedback, generate new search criteria to improve the playlist.
        Return a JSON object with the same structure as before, but adjusted based on the feedback.
        
        Consider:
        - If user wants more energy, adjust mood and search terms
        - If user mentions specific genres/artists, include them
        - If user wants different decades, adjust time periods
        - If user wants to remove certain types of songs, exclude those terms
        """
        
        response = self.client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a music expert that refines playlists based on user feedback. Always respond with valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3
        )
        
        try:
            return json.loads(response.choices[0].message.content)
        except json.JSONDecodeError:
            return self.process_description(f"{original_description} {feedback}")
