from pydantic import BaseModel
from typing import List, Optional

class TrackInfo(BaseModel):
    id: str
    name: str
    artist: str
    album: str
    preview_url: Optional[str] = None
    external_url: str
    duration_ms: int

class PlaylistGenerationRequest(BaseModel):
    description: str
    access_token: str

class PlaylistRefinementRequest(BaseModel):
    description: str
    feedback: str
    current_tracks: List[TrackInfo]
    access_token: str

class PlaylistResponse(BaseModel):
    tracks: List[TrackInfo]
    description: str
    reasoning: str

class PlaylistCreationRequest(BaseModel):
    name: str
    description: str
    tracks: List[TrackInfo]
    access_token: str
    user_id: str

class PlaylistCreationResponse(BaseModel):
    playlist_id: str
    playlist_url: str
    name: str

class UserProfile(BaseModel):
    id: str
    display_name: str
    email: Optional[str] = None
    followers: int
    images: List[str] = []

class SpotifyAuthResponse(BaseModel):
    auth_url: str

class SpotifyTokenRequest(BaseModel):
    code: str
