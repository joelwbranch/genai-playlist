import { useState, useEffect } from 'react';
import { SpotifyAuth } from './components/SpotifyAuth';
import { PlaylistDraft } from './components/PlaylistDraft';
import { PlaylistConfirmation } from './components/PlaylistConfirmation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Music, Sparkles, User } from 'lucide-react';
import { apiService, TrackInfo, UserProfile, PlaylistCreationResponse } from './services/api';

type AppState = 'auth' | 'input' | 'draft' | 'confirmation';

function App() {
  const [state, setState] = useState<AppState>('auth');
  const [accessToken, setAccessToken] = useState<string>('');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [description, setDescription] = useState('');
  const [tracks, setTracks] = useState<TrackInfo[]>([]);
  const [reasoning, setReasoning] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createdPlaylist, setCreatedPlaylist] = useState<PlaylistCreationResponse>();

  useEffect(() => {
    const token = localStorage.getItem('spotify_access_token');
    if (token) {
      setAccessToken(token);
      loadUserProfile(token);
    }
  }, []);

  const loadUserProfile = async (token: string) => {
    try {
      const profile = await apiService.getUserProfile(token);
      setUserProfile(profile);
      setState('input');
    } catch (error) {
      console.error('Failed to load user profile:', error);
      localStorage.removeItem('spotify_access_token');
      localStorage.removeItem('spotify_refresh_token');
    }
  };

  const handleAuthSuccess = (token: string, profile: UserProfile) => {
    setAccessToken(token);
    setUserProfile(profile);
    setState('input');
  };

  const handleGeneratePlaylist = async () => {
    if (!description.trim()) return;
    
    setIsGenerating(true);
    try {
      const response = await apiService.generatePlaylist(description, accessToken);
      setTracks(response.tracks);
      setReasoning(response.reasoning);
      setState('draft');
    } catch (error) {
      console.error('Failed to generate playlist:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefinePlaylist = async (feedback: string) => {
    setIsRefining(true);
    try {
      const response = await apiService.refinePlaylist(description, feedback, tracks, accessToken);
      setTracks(response.tracks);
      setReasoning(response.reasoning);
    } catch (error) {
      console.error('Failed to refine playlist:', error);
    } finally {
      setIsRefining(false);
    }
  };

  const handleConfirmPlaylist = () => {
    setState('confirmation');
  };

  const handleCreatePlaylist = async (name: string, playlistDescription: string) => {
    if (!userProfile) return;
    
    setIsCreating(true);
    try {
      const response = await apiService.createPlaylist(
        name,
        playlistDescription,
        tracks,
        accessToken,
        userProfile.id
      );
      setCreatedPlaylist(response);
    } catch (error) {
      console.error('Failed to create playlist:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleStartOver = () => {
    setDescription('');
    setTracks([]);
    setReasoning('');
    setCreatedPlaylist(undefined);
    setState('input');
  };

  if (state === 'auth') {
    return <SpotifyAuth onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Music className="h-8 w-8 text-green-500" />
            <h1 className="text-3xl font-bold">GenAI Playlist Generator</h1>
          </div>
          
          {userProfile && (
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={userProfile.images[0]} />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-zinc-400">{userProfile.display_name}</span>
            </div>
          )}
        </header>

        {state === 'input' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                Describe Your Perfect Playlist
              </CardTitle>
              <CardDescription>
                Use natural language to describe the music you want. For example: "upbeat 80s rock songs for working out" or "relaxing jazz for studying"
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Playlist Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the type of music you want in your playlist..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-24"
                />
              </div>
              
              <Button
                onClick={handleGeneratePlaylist}
                disabled={!description.trim() || isGenerating}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {isGenerating ? 'Generating Playlist...' : 'Generate Playlist'}
              </Button>
            </CardContent>
          </Card>
        )}

        {state === 'draft' && (
          <div className="space-y-6">
            <Button
              onClick={handleStartOver}
              variant="outline"
              className="mb-4"
            >
              ← Start Over
            </Button>
            
            <PlaylistDraft
              tracks={tracks}
              description={description}
              reasoning={reasoning}
              onRefine={handleRefinePlaylist}
              onConfirm={handleConfirmPlaylist}
              isRefining={isRefining}
            />
          </div>
        )}

        {state === 'confirmation' && (
          <div className="space-y-6">
            <Button
              onClick={() => setState('draft')}
              variant="outline"
              className="mb-4"
            >
              ← Back to Draft
            </Button>
            
            <PlaylistConfirmation
              tracks={tracks}
              description={description}
              onCreatePlaylist={handleCreatePlaylist}
              createdPlaylist={createdPlaylist}
              isCreating={isCreating}
            />
            
            {createdPlaylist && (
              <div className="text-center">
                <Button
                  onClick={handleStartOver}
                  variant="outline"
                  className="mt-4"
                >
                  Create Another Playlist
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
