import spotipy
from spotipy.oauth2 import SpotifyOAuth
from typing import List, Dict, Any, Optional
from ..config import settings
from ..models import TrackInfo, UserProfile

class SpotifyService:
    def __init__(self):
        self.client_id = settings.SPOTIFY_CLIENT_ID
        self.client_secret = settings.SPOTIFY_CLIENT_SECRET
        self.redirect_uri = settings.SPOTIFY_REDIRECT_URI
        self.scope = "playlist-modify-public playlist-modify-private user-read-email user-read-private"
    
    def get_auth_url(self) -> str:
        sp_oauth = SpotifyOAuth(
            client_id=self.client_id,
            client_secret=self.client_secret,
            redirect_uri=self.redirect_uri,
            scope=self.scope
        )
        return sp_oauth.get_authorize_url()
    
    def get_access_token(self, code: str) -> Dict[str, Any]:
        sp_oauth = SpotifyOAuth(
            client_id=self.client_id,
            client_secret=self.client_secret,
            redirect_uri=self.redirect_uri,
            scope=self.scope
        )
        return sp_oauth.get_access_token(code)
    
    def get_spotify_client(self, access_token: str) -> spotipy.Spotify:
        return spotipy.Spotify(auth=access_token)
    
    def get_user_profile(self, access_token: str) -> UserProfile:
        sp = self.get_spotify_client(access_token)
        user = sp.current_user()
        return UserProfile(
            id=user["id"],
            display_name=user.get("display_name", ""),
            email=user.get("email"),
            followers=user["followers"]["total"],
            images=[img["url"] for img in user.get("images", [])]
        )
    
    def search_tracks(self, query: str, limit: int = 20) -> List[TrackInfo]:
        sp = self.get_spotify_client("")
        results = sp.search(q=query, type="track", limit=limit)
        tracks = []
        
        for track in results["tracks"]["items"]:
            track_info = TrackInfo(
                id=track["id"],
                name=track["name"],
                artist=", ".join([artist["name"] for artist in track["artists"]]),
                album=track["album"]["name"],
                preview_url=track.get("preview_url"),
                external_url=track["external_urls"]["spotify"],
                duration_ms=track["duration_ms"]
            )
            tracks.append(track_info)
        
        return tracks
    
    def create_playlist(self, access_token: str, user_id: str, name: str, description: str) -> Dict[str, Any]:
        sp = self.get_spotify_client(access_token)
        playlist = sp.user_playlist_create(
            user=user_id,
            name=name,
            description=description,
            public=False
        )
        return playlist
    
    def add_tracks_to_playlist(self, access_token: str, playlist_id: str, track_ids: List[str]) -> None:
        sp = self.get_spotify_client(access_token)
        track_uris = [f"spotify:track:{track_id}" for track_id in track_ids]
        sp.playlist_add_items(playlist_id, track_uris)
