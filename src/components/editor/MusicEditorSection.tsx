import React, { useState, useRef, useEffect } from 'react';

export interface MusicSettingsData {
  enabled: boolean;
  url?: string;
  trackName?: string;
  artist?: string;
  autoPlay?: boolean;
  volume?: number;
  isCustom?: boolean;
}

interface MusicEditorSectionProps {
  currentMusicUrl: string;
  musicSettings?: MusicSettingsData;
  onChangeMusic: (newUrl: string, settings?: MusicSettingsData) => void;
  onToast: (msg: string) => void;
}

// Preset tracks with high quality royalty-free preview streams & the default local birthday track
const MUSIC_PRESETS = [
  {
    id: 'default-birthday',
    title: 'Happy Birthday Celebration (Default)',
    subtitle: 'Classic joyful birthday theme with brass and chimes',
    url: '/music/happy-birthday.mp3',
    icon: 'cake',
    category: 'Birthday Classic',
  },
  {
    id: 'acoustic-warm',
    title: 'Acoustic Warm Memories',
    subtitle: 'Gentle fingerpicked guitar and cozy festive atmosphere',
    url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=sweet-life-112189.mp3',
    icon: 'music_note',
    category: 'Acoustic & Cozy',
  },
  {
    id: 'upbeat-party',
    title: 'Upbeat Birthday Party Dance',
    subtitle: 'Vibrant pop celebration with claps, synth and uplifting groove',
    url: 'https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f77cb7.mp3?filename=happy-day-123447.mp3',
    icon: 'celebration',
    category: 'Party Beats',
  },
  {
    id: 'kids-jamboree',
    title: 'Playful Kids Wonder Jamboree',
    subtitle: 'Cute whistling, xylophone and bounce for children parties',
    url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=fun-and-quirky-10874.mp3',
    icon: 'toys',
    category: 'Kids & Games',
  },
  {
    id: 'lofi-chill',
    title: 'Lo-Fi Sunset Birthday Toast',
    subtitle: 'Smooth chillhop beats for intimate evening celebrations',
    url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=chill-abstract-intention-12099.mp3',
    icon: 'nightlife',
    category: 'Lofi & Evening',
  },
];

export const MusicEditorSection: React.FC<MusicEditorSectionProps> = ({
  currentMusicUrl,
  musicSettings,
  onChangeMusic,
  onToast,
}) => {
  const isMusicEnabled = musicSettings ? musicSettings.enabled : Boolean(currentMusicUrl);
  const activeUrl = currentMusicUrl || musicSettings?.url || '';

  // Local audio element for preview
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState<number>(musicSettings?.volume ?? 0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  // Custom URL input
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [customTrackTitle, setCustomTrackTitle] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Initialize or update audio src
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    const audio = audioRef.current;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
      setAudioError(null);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime || 0);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = () => {
      if (activeUrl) {
        setAudioError('Unable to preview audio track. Please check file format or URL.');
      }
      setIsPlaying(false);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    if (activeUrl && isMusicEnabled) {
      audio.src = activeUrl;
      audio.volume = isMuted ? 0 : volume;
      audio.load();
    } else {
      audio.pause();
      setIsPlaying(false);
    }

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.pause();
    };
  }, [activeUrl, isMusicEnabled]);

  const togglePlayPause = () => {
    if (!audioRef.current || !activeUrl || !isMusicEnabled) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.debug('Audio play prevented:', err);
          setAudioError('Click to permit audio playback in browser');
        });
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    setIsMuted(newVol === 0);
    if (audioRef.current) {
      audioRef.current.volume = newVol;
    }
  };

  const formatSeconds = (sec: number) => {
    if (isNaN(sec) || sec === 0) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Remove music completely
  const handleRemoveMusic = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
    onChangeMusic('', {
      enabled: false,
      url: '',
      trackName: 'No Music (Removed)',
      volume: 0,
      autoPlay: false,
    });
    onToast('🔇 Music removed from template. Site will be silent.');
  };

  // Restore Default Birthday Song
  const handleRestoreDefault = () => {
    const defaultPreset = MUSIC_PRESETS[0];
    onChangeMusic(defaultPreset.url, {
      enabled: true,
      url: defaultPreset.url,
      trackName: defaultPreset.title,
      volume: 0.7,
      autoPlay: true,
      isCustom: false,
    });
    onToast('Default Birthday Music restored!');
  };

  // Select a preset track
  const handleSelectPreset = (preset: (typeof MUSIC_PRESETS)[0]) => {
    onChangeMusic(preset.url, {
      enabled: true,
      url: preset.url,
      trackName: preset.title,
      volume: volume,
      autoPlay: true,
      isCustom: preset.id !== 'default-birthday',
    });
    onToast(`Set track to: ${preset.title}`);
  };

  // Custom Audio File Upload (MP3, WAV, etc.)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/') && !file.name.match(/\.(mp3|wav|ogg|m4a|aac)$/i)) {
      onToast('Please select a valid audio file (MP3, WAV, OGG, M4A).');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const title = file.name.replace(/\.[^/.]+$/, '');
        onChangeMusic(reader.result, {
          enabled: true,
          url: reader.result,
          trackName: title,
          volume: volume,
          autoPlay: true,
          isCustom: true,
        });
        setIsUploading(false);
        onToast(`Uploaded custom audio: ${title}!`);
      }
    };
    reader.onerror = () => {
      setIsUploading(false);
      onToast('Failed to read audio file.');
    };
    reader.readAsDataURL(file);
  };

  // Add Custom Audio via Public URL
  const handleAddCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const url = customUrlInput.trim();
    if (!url) return;

    const title = customTrackTitle.trim() || 'Custom Party Audio';
    onChangeMusic(url, {
      enabled: true,
      url,
      trackName: title,
      volume: volume,
      autoPlay: true,
      isCustom: true,
    });
    setCustomUrlInput('');
    setCustomTrackTitle('');
    onToast(`Custom audio URL set: ${title}`);
  };

  // Find active preset title if matches
  const activePreset = MUSIC_PRESETS.find((p) => p.url === activeUrl);
  const currentTitle =
    musicSettings?.trackName ||
    activePreset?.title ||
    (isMusicEnabled ? 'Custom Audio Track' : 'No Background Music');

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-3.5 sm:p-5 shadow-sm border border-surface-container-high space-y-4 sm:space-y-5">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="audio/mp3, audio/mpeg, audio/wav, audio/ogg, audio/aac, audio/m4a"
        className="hidden"
      />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2.5 border-b border-surface-container-high">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[24px] text-[#ff5a5f]">
              music_note
            </span>
            <h2 className="text-sm sm:text-base font-bold text-gray-900">
              Celebration Background Music
            </h2>
          </div>
          <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
            Play default birthday melodies, upload your own songs, or completely remove music.
          </p>
        </div>

        {/* Status Pill */}
        <span
          className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 border shadow-xs shrink-0 ${
            isMusicEnabled && activeUrl
              ? activePreset?.id === 'default-birthday'
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-700 border-rose-200'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isMusicEnabled && activeUrl
                ? isPlaying
                  ? 'bg-emerald-500 animate-ping'
                  : 'bg-emerald-500'
                : 'bg-rose-400'
            }`}
          />
          <span>
            {isMusicEnabled && activeUrl
              ? activePreset?.id === 'default-birthday'
                ? 'Default Song'
                : 'Custom Audio'
              : 'Music Off'}
          </span>
        </span>
      </div>

      {/* Real Full-functional Live Audio Player Card */}
      <div className="bg-gradient-to-br from-[#14305A] via-[#1E4984] to-[#006876] text-white rounded-2xl p-3.5 sm:p-5 shadow-md border border-white/10 space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            {/* Animated Disc / Vinyl Icon */}
            <div
              className={`w-12 h-12 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20 shadow-inner ${
                isPlaying ? 'animate-spin' : ''
              }`}
              style={{ animationDuration: '6s' }}
            >
              <span className="material-symbols-outlined text-[24px] text-[#ffd84d]">
                album
              </span>
            </div>

            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#ffd84d] block">
                NOW PLAYING ON TEMPLATE
              </span>
              <h3 className="text-sm sm:text-base font-extrabold truncate text-white leading-tight">
                {currentTitle}
              </h3>
              <p className="text-[11px] text-white/70 truncate max-w-xs sm:max-w-md">
                {activeUrl || 'No music configured'}
              </p>
            </div>
          </div>

          {/* Quick Play/Pause Big Button */}
          <button
            type="button"
            onClick={togglePlayPause}
            disabled={!isMusicEnabled || !activeUrl}
            className="w-12 h-12 rounded-full bg-[#ffd84d] hover:bg-[#ffcd2b] text-[#14305A] font-black flex items-center justify-center shadow-lg active:scale-95 transition-all cursor-pointer shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
            title={isPlaying ? 'Pause preview' : 'Play preview'}
          >
            <span className="material-symbols-outlined text-[28px]">
              {isPlaying ? 'pause' : 'play_arrow'}
            </span>
          </button>
        </div>

        {/* Progress & Scrubber Bar */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max={duration || 100}
              step="0.1"
              value={currentTime}
              onChange={handleSeek}
              disabled={!isMusicEnabled || !activeUrl}
              className="flex-1 h-1.5 bg-white/30 rounded-lg appearance-none cursor-pointer accent-[#ffd84d]"
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-white/70">
            <span>{formatSeconds(currentTime)}</span>
            {isPlaying && (
              <span className="flex items-center gap-1 text-[#ffd84d] font-sans text-[10px] font-bold">
                <span className="w-1.5 h-3 bg-[#ffd84d] animate-pulse rounded-full" />
                <span className="w-1.5 h-4 bg-[#ffd84d] animate-pulse rounded-full delay-75" />
                <span className="w-1.5 h-2.5 bg-[#ffd84d] animate-pulse rounded-full delay-150" />
                <span>Playing in template</span>
              </span>
            )}
            <span>{formatSeconds(duration)}</span>
          </div>
        </div>

        {/* Volume & Audio Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/10 text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleVolumeChange(isMuted ? 0.7 : 0)}
              className="text-white hover:text-[#ffd84d] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[19px]">
                {isMuted || volume === 0 ? 'volume_off' : volume > 0.5 ? 'volume_up' : 'volume_down'}
              </span>
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-20 sm:w-28 h-1.5 bg-white/30 rounded-lg appearance-none cursor-pointer accent-[#ffd84d]"
            />
            <span className="font-mono text-[10px] text-white/70">
              {Math.round((isMuted ? 0 : volume) * 100)}%
            </span>
          </div>

          {/* Action buttons inside player: Remove / Restore */}
          <div className="flex items-center gap-2">
            {isMusicEnabled && activeUrl ? (
              <button
                type="button"
                onClick={handleRemoveMusic}
                className="px-3 py-1 rounded-lg bg-rose-500/80 hover:bg-rose-600 text-white text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer shadow-sm"
              >
                <span className="material-symbols-outlined text-[14px]">music_off</span>
                <span>Remove Music</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleRestoreDefault}
                className="px-3 py-1 rounded-lg bg-[#ffd84d] hover:bg-[#ffcd2b] text-[#14305A] text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer shadow-sm"
              >
                <span className="material-symbols-outlined text-[14px]">refresh</span>
                <span>Restore Birthday Song</span>
              </button>
            )}
          </div>
        </div>

        {audioError && (
          <div className="p-2 rounded-lg bg-rose-500/30 text-rose-200 text-[11px] flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[15px]">info</span>
            <span>{audioError}</span>
          </div>
        )}
      </div>

      {/* Section to Insert Own Music */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-gray-800 uppercase tracking-wider block">
            Insert Your Own Custom Music
          </span>
          <span className="text-[11px] text-gray-400">MP3, WAV, OGG, M4A supported</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Upload from Local Device */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="p-5 bg-surface-container-low hover:bg-surface-container rounded-2xl border-2 border-dashed border-surface-container-high transition-all flex flex-col items-center justify-center text-center cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-full bg-white text-primary flex items-center justify-center shadow-sm mb-2 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[26px]">
                {isUploading ? 'sync' : 'upload_file'}
              </span>
            </div>
            <p className="text-xs font-bold text-gray-800">
              {isUploading ? 'Processing Audio File...' : 'Upload Audio Track from Device'}
            </p>
            <span className="text-[11px] text-gray-500 mt-0.5">
              Click to browse your computer or mobile files
            </span>
          </div>

          {/* Add Public Audio URL Form */}
          <form
            onSubmit={handleAddCustomUrl}
            className="p-4 bg-surface-container-low rounded-2xl border border-surface-container-high flex flex-col justify-between space-y-2"
          >
            <div>
              <span className="text-xs font-bold text-gray-700 block mb-1">
                Or Add Custom Music URL
              </span>
              <input
                type="url"
                value={customUrlInput}
                onChange={(e) => setCustomUrlInput(e.target.value)}
                placeholder="https://example.com/my-song.mp3"
                className="w-full h-8 px-2.5 text-xs bg-white rounded-lg border border-gray-200 focus:outline-none text-gray-900 mb-1.5"
              />
              <input
                type="text"
                value={customTrackTitle}
                onChange={(e) => setCustomTrackTitle(e.target.value)}
                placeholder="Track Title (e.g. Leo's Favorite Song)"
                className="w-full h-8 px-2.5 text-xs bg-white rounded-lg border border-gray-200 focus:outline-none text-gray-900"
              />
            </div>
            <button
              type="submit"
              disabled={!customUrlInput.trim()}
              className="w-full py-1.5 bg-primary text-on-primary hover:bg-primary-container text-xs font-bold rounded-lg cursor-pointer transition-all disabled:opacity-50 flex items-center justify-center gap-1"
            >
              <span className="material-symbols-outlined text-[15px]">add</span>
              <span>Set Audio URL</span>
            </button>
          </form>
        </div>
      </div>

      {/* Preset Celebration Audio Tracks */}
      <div className="space-y-3 pt-3 border-t border-surface-container-high">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-gray-800 uppercase tracking-wider block">
            Or Choose from Celebration Presets:
          </span>
          <span className="text-[11px] text-gray-400">1-click switch</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {MUSIC_PRESETS.map((preset) => {
            const isSelected = isMusicEnabled && activeUrl === preset.url;
            return (
              <div
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-primary/5 border-primary shadow-sm'
                    : 'bg-surface-container-low hover:bg-surface-container border-surface-container-high'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'bg-primary text-on-primary'
                        : 'bg-white text-gray-700 shadow-xs'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {preset.icon}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-900 truncate">
                      {preset.title}
                    </p>
                    <span className="text-[10px] text-gray-500 block truncate">
                      {preset.category}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-1.5">
                  {isSelected ? (
                    <span className="px-2 py-0.5 rounded-full bg-primary text-on-primary text-[10px] font-bold">
                      Active
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-white text-gray-600 border border-gray-200 text-[10px] font-medium hover:bg-gray-50">
                      Use
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

