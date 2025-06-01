from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .models import (
    PlaylistGenerationRequest, PlaylistRefinementRequest, PlaylistResponse,
    PlaylistCreationRequest, PlaylistCreationResponse, UserProfile,
    SpotifyAuthResponse, SpotifyTokenRequest
)
from .services.spotify_service import SpotifyService
from .services.playlist_service import PlaylistService

app = FastAPI(title="GenAI Playlist Generator")

# Disable CORS. Do not remove this for full-stack development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

spotify_service = SpotifyService()
playlist_service = PlaylistService()

@app.get("/healthz")
async def healthz():
    return {"status": "ok"}

@app.post("/auth/spotify", response_model=SpotifyAuthResponse)
async def get_spotify_auth_url():
    try:
        auth_url = spotify_service.get_auth_url()
        return SpotifyAuthResponse(auth_url=auth_url)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/auth/spotify/callback")
async def spotify_callback(request: SpotifyTokenRequest):
    try:
        token_info = spotify_service.get_access_token(request.code)
        return token_info
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/user/profile")
async def get_user_profile(access_token: str) -> UserProfile:
    try:
        return spotify_service.get_user_profile(access_token)
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

@app.post("/playlist/generate", response_model=PlaylistResponse)
async def generate_playlist(request: PlaylistGenerationRequest):
    try:
        return playlist_service.generate_playlist(request.description, request.access_token)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/playlist/refine", response_model=PlaylistResponse)
async def refine_playlist(request: PlaylistRefinementRequest):
    try:
        return playlist_service.refine_playlist(
            request.description, 
            request.feedback, 
            request.current_tracks, 
            request.access_token
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/playlist/create", response_model=PlaylistCreationResponse)
async def create_playlist(request: PlaylistCreationRequest):
    try:
        playlist = spotify_service.create_playlist(
            request.access_token,
            request.user_id,
            request.name,
            request.description
        )
        
        track_ids = [track.id for track in request.tracks]
        spotify_service.add_tracks_to_playlist(
            request.access_token,
            playlist["id"],
            track_ids
        )
        
        return PlaylistCreationResponse(
            playlist_id=playlist["id"],
            playlist_url=playlist["external_urls"]["spotify"],
            name=playlist["name"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
