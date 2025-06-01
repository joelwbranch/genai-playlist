import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, ExternalLink, Music } from 'lucide-react';
import { TrackInfo, PlaylistCreationResponse } from '../services/api';

interface PlaylistConfirmationProps {
  tracks: TrackInfo[];
  description: string;
  onCreatePlaylist: (name: string, description: string) => void;
  createdPlaylist?: PlaylistCreationResponse;
  isCreating: boolean;
}

export function PlaylistConfirmation({ 
  tracks, 
  description, 
  onCreatePlaylist, 
  createdPlaylist,
  isCreating 
}: PlaylistConfirmationProps) {
  const [playlistName, setPlaylistName] = useState('');
  const [playlistDescription, setPlaylistDescription] = useState(description);

  const handleCreate = () => {
    if (playlistName.trim()) {
      onCreatePlaylist(playlistName, playlistDescription);
    }
  };

  if (createdPlaylist) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl text-green-500">Playlist Created!</CardTitle>
            <CardDescription>
              Your playlist "{createdPlaylist.name}" has been successfully created in Spotify
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-zinc-400">
              {tracks.length} tracks added to your playlist
            </div>
            <Button
              onClick={() => window.open(createdPlaylist.playlist_url, '_blank')}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open in Spotify
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="h-5 w-5" />
          Create Your Playlist
        </CardTitle>
        <CardDescription>
          Ready to create your playlist with {tracks.length} tracks
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="playlist-name">Playlist Name</Label>
          <Input
            id="playlist-name"
            placeholder="Enter playlist name..."
            value={playlistName}
            onChange={(e) => setPlaylistName(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="playlist-description">Description (Optional)</Label>
          <Input
            id="playlist-description"
            placeholder="Describe your playlist..."
            value={playlistDescription}
            onChange={(e) => setPlaylistDescription(e.target.value)}
          />
        </div>
        
        <Button
          onClick={handleCreate}
          disabled={!playlistName.trim() || isCreating}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          {isCreating ? 'Creating Playlist...' : 'Create Playlist'}
        </Button>
      </CardContent>
    </Card>
  );
}
