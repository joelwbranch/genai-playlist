import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Music } from 'lucide-react';
import { apiService, UserProfile } from '../services/api';

interface SpotifyAuthProps {
  onAuthSuccess: (accessToken: string, userProfile: UserProfile) => void;
}

export function SpotifyAuth({ onAuthSuccess }: SpotifyAuthProps) {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code) {
      handleCallback(code);
    }
  }, []);

  const handleCallback = async (code: string) => {
    setIsLoading(true);
    try {
      const tokenData = await apiService.exchangeSpotifyCode(code);
      const userProfile = await apiService.getUserProfile(tokenData.access_token);
      
      localStorage.setItem('spotify_access_token', tokenData.access_token);
      localStorage.setItem('spotify_refresh_token', tokenData.refresh_token);
      
      window.history.replaceState({}, document.title, window.location.pathname);
      
      onAuthSuccess(tokenData.access_token, userProfile);
    } catch (error) {
      console.error('Auth callback error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const { auth_url } = await apiService.getSpotifyAuthUrl();
      window.location.href = auth_url;
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Music className="h-12 w-12 text-green-500" />
          </div>
          <CardTitle className="text-2xl">GenAI Playlist Generator</CardTitle>
          <CardDescription>
            Create custom Spotify playlists using natural language descriptions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleLogin} 
            disabled={isLoading}
            className="w-full bg-green-500 hover:bg-green-600 text-white"
          >
            {isLoading ? 'Connecting...' : 'Connect with Spotify'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
