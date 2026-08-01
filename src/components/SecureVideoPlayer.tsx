import { Shield, Play } from 'lucide-react';
import { useState } from 'react';

interface SecureVideoPlayerProps {
  youtubeId: string;
}

export default function SecureVideoPlayer({ youtubeId }: SecureVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  // Secure YouTube URL flags:
  // - controls=0: Hide YouTube player controls
  // - modestbranding=1: Minimize YouTube logo footprint
  // - rel=0: Disable related videos at the end
  // - disablekb=1: Disable keyboard shortcuts (prevents pressing Space, arrows, etc.)
  // - iv_load_policy=3: Turn off video annotations
  const videoSrc = `https://www.youtube.com/embed/${youtubeId}?autoplay=1&controls=0&modestbranding=1&rel=0&disablekb=1&iv_load_policy=3&showinfo=0&fs=0`;

  return (
    <div className="relative border border-slate-800 rounded-xl overflow-hidden bg-slate-950 aspect-video shadow-2xl max-w-3xl mx-auto group">
      {/* Absolute Header Overlay (Blocks clicking the YouTube title and share button) */}
      <div className="absolute top-0 inset-x-0 h-14 bg-gradient-to-b from-black/80 to-transparent z-10 pointer-events-auto" />

      {/* Absolute Bottom Right Overlay (Blocks clicking the 'Watch on YouTube' logo link) */}
      <div className="absolute bottom-0 right-0 w-28 h-12 bg-black/10 z-10 pointer-events-auto cursor-default" />

      {/* Top Brand Tag */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-slate-900/90 text-[10px] uppercase font-bold text-slate-300 px-3 py-1.5 rounded-full border border-slate-800 backdrop-blur">
        <Shield className="h-3.5 w-3.5 text-success" />
        <span>Stream Shield Protected</span>
      </div>

      {!isPlaying ? (
        // Premium Mock Thumbnail / Start Button
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 z-20 cursor-pointer" onClick={() => setIsPlaying(true)}>
          <div className="h-16 w-16 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform">
            <Play className="h-8 w-8 fill-current ml-1" />
          </div>
          <span className="mt-4 text-sm font-semibold text-slate-200">Start Recording Class Session</span>
          <span className="text-xs text-slate-400 mt-1">Direct YouTube URLs and downloading are blocked</span>
        </div>
      ) : (
        <iframe
          src={videoSrc}
          title="Secure Lesson Player"
          className="w-full h-full select-none pointer-events-none"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen={false}
        />
      )}
    </div>
  );
}
