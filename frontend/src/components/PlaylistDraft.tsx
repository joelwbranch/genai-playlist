import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ThumbsUp, ThumbsDown, ExternalLink, Play, RefreshCw } from 'lucide-react';
import { TrackInfo } from '../services/api';

interface PlaylistDraftProps {
  tracks: TrackInfo[];
  description: string;
  reasoning: string;
  onRefine: (feedback: string) => void;
  onConfirm: () => void;
  isRefining: boolean;
}

export function PlaylistDraft({ 
  tracks, 
  description, 
  reasoning, 
  onRefine, 
  onConfirm, 
  isRefining 
}: PlaylistDraftProps) {
  const [feedback, setFeedback] = useState('');
  const [likedTracks, setLikedTracks] = useState<Set<string>>(new Set());
  const [dislikedTracks, setDislikedTracks] = useState<Set<string>>(new Set());

  const handleTrackLike = (trackId: string) => {
    const newLiked = new Set(likedTracks);
    const newDisliked = new Set(dislikedTracks);
    
    if (newLiked.has(trackId)) {
      newLiked.delete(trackId);
    } else {
      newLiked.add(trackId);
      newDisliked.delete(trackId);
    }
    
    setLikedTracks(newLiked);
    setDislikedTracks(newDisliked);
  };

  const handleTrackDislike = (trackId: string) => {
    const newLiked = new Set(likedTracks);
    const newDisliked = new Set(dislikedTracks);
    
    if (newDisliked.has(trackId)) {
      newDisliked.delete(trackId);
    } else {
      newDisliked.add(trackId);
      newLiked.delete(trackId);
    }
    
    setLikedTracks(newLiked);
    setDislikedTracks(newDisliked);
  };

  const handleRefine = () => {
    let refinedFeedback = feedback;
    
    if (likedTracks.size > 0) {
      const likedTrackNames = tracks
        .filter(t => likedTracks.has(t.id))
        .map(t => `"${t.name}" by ${t.artist}`)
        .join(', ');
      refinedFeedback += ` I like these tracks: ${likedTrackNames}. Please find more songs similar to these.`;
    }
    
    if (dislikedTracks.size > 0) {
      const dislikedTrackNames = tracks
        .filter(t => dislikedTracks.has(t.id))
        .map(t => `"${t.name}" by ${t.artist}`)
        .join(', ');
      refinedFeedback += ` I don't like these tracks: ${dislikedTrackNames}. Please avoid similar songs.`;
    }
    
    onRefine(refinedFeedback);
    setFeedback('');
    setLikedTracks(new Set());
    setDislikedTracks(new Set());
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Playlist Draft</CardTitle>
          <CardDescription>
            Based on: "{description}"
          </CardDescription>
          <Badge variant="secondary" className="w-fit">
            {tracks.length} tracks found
          </Badge>
          <p className="text-sm text-zinc-400">{reasoning}</p>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tracks</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {tracks.map((track, index) => (
                <div key={track.id} className="flex items-center justify-between p-3 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-zinc-500 w-6">{index + 1}</span>
                      <h4 className="font-medium truncate">{track.name}</h4>
                    </div>
                    <p className="text-sm text-zinc-400 truncate">{track.artist}</p>
                    <p className="text-xs text-zinc-500 truncate">{track.album}</p>
                    <p className="text-xs text-zinc-500">{formatDuration(track.duration_ms)}</p>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleTrackLike(track.id)}
                      className={likedTracks.has(track.id) ? 'text-green-500' : ''}
                    >
                      <ThumbsUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleTrackDislike(track.id)}
                      className={dislikedTracks.has(track.id) ? 'text-red-500' : ''}
                    >
                      <ThumbsDown className="h-4 w-4" />
                    </Button>
                    {track.preview_url && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(track.preview_url, '_blank')}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(track.external_url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Refine Your Playlist</CardTitle>
          <CardDescription>
            Provide feedback to improve the playlist, or confirm to create it in Spotify
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Add feedback like 'more upbeat songs', 'less rock', 'add some 90s hits', etc."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="min-h-20"
          />
          
          <div className="flex gap-3">
            <Button
              onClick={handleRefine}
              disabled={isRefining || (!feedback.trim() && likedTracks.size === 0 && dislikedTracks.size === 0)}
              variant="outline"
            >
              {isRefining ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Refining...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refine Playlist
                </>
              )}
            </Button>
            
            <Separator orientation="vertical" className="h-10" />
            
            <Button
              onClick={onConfirm}
              className="bg-green-600 hover:bg-green-700"
            >
              Create Playlist
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
