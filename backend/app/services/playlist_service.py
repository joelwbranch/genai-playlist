from typing import List, Dict, Any
from .openai_service import OpenAIService
from .spotify_service import SpotifyService
from .search_service import SearchService
from ..models import TrackInfo, PlaylistResponse

class PlaylistService:
    def __init__(self):
        self.openai_service = OpenAIService()
        self.spotify_service = SpotifyService()
        self.search_service = SearchService()
    
    def generate_playlist(self, description: str, access_token: str) -> PlaylistResponse:
        search_criteria = self.openai_service.process_description(description)
        
        all_tracks = []
        
        spotify_tracks = self.spotify_service.search_tracks(
            search_criteria.get("spotify_query", description),
            limit=15
        )
        all_tracks.extend(spotify_tracks)
        
        web_results = self.search_service.search_songs(
            search_criteria.get("web_search_queries", [description])
        )
        
        for result in web_results:
            web_tracks = self.spotify_service.search_tracks(result["query"], limit=3)
            all_tracks.extend(web_tracks)
        
        unique_tracks = self.remove_duplicates(all_tracks)
        final_tracks = unique_tracks[:20]
        
        reasoning = f"Found {len(final_tracks)} tracks based on: {', '.join(search_criteria.get('genres', []))} genres, {', '.join(search_criteria.get('moods', []))} moods"
        
        return PlaylistResponse(
            tracks=final_tracks,
            description=description,
            reasoning=reasoning
        )
    
    def refine_playlist(self, description: str, feedback: str, current_tracks: List[TrackInfo], access_token: str) -> PlaylistResponse:
        current_track_names = [f"{track.name} by {track.artist}" for track in current_tracks]
        
        refined_criteria = self.openai_service.refine_playlist(
            description, feedback, current_track_names
        )
        
        all_tracks = []
        
        spotify_tracks = self.spotify_service.search_tracks(
            refined_criteria.get("spotify_query", f"{description} {feedback}"),
            limit=15
        )
        all_tracks.extend(spotify_tracks)
        
        web_results = self.search_service.search_songs(
            refined_criteria.get("web_search_queries", [f"{description} {feedback}"])
        )
        
        for result in web_results:
            web_tracks = self.spotify_service.search_tracks(result["query"], limit=3)
            all_tracks.extend(web_tracks)
        
        current_track_ids = {track.id for track in current_tracks}
        new_tracks = [track for track in all_tracks if track.id not in current_track_ids]
        
        unique_tracks = self.remove_duplicates(new_tracks)
        final_tracks = unique_tracks[:20]
        
        reasoning = f"Refined based on feedback: '{feedback}'. Found {len(final_tracks)} new tracks."
        
        return PlaylistResponse(
            tracks=final_tracks,
            description=description,
            reasoning=reasoning
        )
    
    def remove_duplicates(self, tracks: List[TrackInfo]) -> List[TrackInfo]:
        seen = set()
        unique_tracks = []
        
        for track in tracks:
            track_key = f"{track.name.lower()}_{track.artist.lower()}"
            if track_key not in seen:
                seen.add(track_key)
                unique_tracks.append(track)
        
        return unique_tracks
