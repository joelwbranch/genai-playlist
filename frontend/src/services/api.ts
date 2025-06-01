import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface TrackInfo {
  id: string;
  name: string;
  artist: string;
  album: string;
  preview_url?: string;
  external_url: string;
  duration_ms: number;
}

export interface PlaylistResponse {
  tracks: TrackInfo[];
  description: string;
  reasoning: string;
}

export interface UserProfile {
  id: string;
  display_name: string;
  email?: string;
  followers: number;
  images: string[];
}

export interface PlaylistCreationResponse {
  playlist_id: string;
  playlist_url: string;
  name: string;
}

export const apiService = {
  async getSpotifyAuthUrl(): Promise<{ auth_url: string }> {
    const response = await api.post('/auth/spotify');
    return response.data;
  },

  async exchangeSpotifyCode(code: string): Promise<any> {
    const response = await api.post('/auth/spotify/callback', { code });
    return response.data;
  },

  async getUserProfile(accessToken: string): Promise<UserProfile> {
    const response = await api.get('/user/profile', {
      params: { access_token: accessToken }
    });
    return response.data;
  },

  async generatePlaylist(description: string, accessToken: string): Promise<PlaylistResponse> {
    const response = await api.post('/playlist/generate', {
      description,
      access_token: accessToken
    });
    return response.data;
  },

  async refinePlaylist(
    description: string,
    feedback: string,
    currentTracks: TrackInfo[],
    accessToken: string
  ): Promise<PlaylistResponse> {
    const response = await api.post('/playlist/refine', {
      description,
      feedback,
      current_tracks: currentTracks,
      access_token: accessToken
    });
    return response.data;
  },

  async createPlaylist(
    name: string,
    description: string,
    tracks: TrackInfo[],
    accessToken: string,
    userId: string
  ): Promise<PlaylistCreationResponse> {
    const response = await api.post('/playlist/create', {
      name,
      description,
      tracks,
      access_token: accessToken,
      user_id: userId
    });
    return response.data;
  }
};
