import requests
from typing import List, Dict, Any
from ..config import settings

class SearchService:
    def __init__(self):
        self.api_key = settings.GOOGLE_SEARCH_API_KEY
        self.search_engine_id = settings.GOOGLE_SEARCH_ENGINE_ID
        self.base_url = "https://www.googleapis.com/customsearch/v1"
    
    def search_songs(self, queries: List[str]) -> List[Dict[str, str]]:
        all_results = []
        
        for query in queries[:3]:
            try:
                params = {
                    "key": self.api_key,
                    "cx": self.search_engine_id,
                    "q": f"{query} songs music",
                    "num": 5
                }
                
                response = requests.get(self.base_url, params=params)
                if response.status_code == 200:
                    data = response.json()
                    for item in data.get("items", []):
                        title = item.get("title", "")
                        snippet = item.get("snippet", "")
                        
                        song_info = self.extract_song_info(title, snippet)
                        if song_info:
                            all_results.append(song_info)
                            
            except Exception as e:
                continue
        
        return all_results[:15]
    
    def extract_song_info(self, title: str, snippet: str) -> Dict[str, str]:
        text = f"{title} {snippet}".lower()
        
        common_patterns = [
            "by ", "artist:", "performed by", "song by", "track by"
        ]
        
        for pattern in common_patterns:
            if pattern in text:
                parts = text.split(pattern)
                if len(parts) >= 2:
                    song_part = parts[0].strip()
                    artist_part = parts[1].split()[0:3]
                    
                    if song_part and artist_part:
                        return {
                            "query": f"{song_part} {' '.join(artist_part)}",
                            "source": "web_search"
                        }
        
        words = text.split()
        if len(words) >= 3:
            return {
                "query": " ".join(words[:6]),
                "source": "web_search"
            }
        
        return None
