import React, { useState, useEffect, useRef } from 'react';
import {
  MicOff, VideoOff, ClosedCaption, Smile,
  Hand, MonitorUp, MoreVertical, Phone,
  Info, Users, MessageSquare, Shapes, Lock,
  Settings, Play, Pause, RotateCcw, Image as ImageIcon,
  Upload, X, BellRing, ChevronLeft, ChevronRight
} from 'lucide-react';
import { get as idbGet, set as idbSet } from 'idb-keyval';

export default function App() {
  const [eventName, setEventName] = useState('meeting');
  const [initialMinutes, setInitialMinutes] = useState(5);
  const [initialSeconds, setInitialSeconds] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [alarmTriggerSeconds, setAlarmTriggerSeconds] = useState<number | ''>('');
  const [isAlarmRinging, setIsAlarmRinging] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [eventColor, setEventColor] = useState('#60A5FA');
  const [overlayScale, setOverlayScale] = useState(1);
  const [recentImages, setRecentImages] = useState<{ name: string, data: string }[]>([]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const alarmTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (alarmTimeoutRef.current) clearTimeout(alarmTimeoutRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const stopAlarm = () => {
    setIsAlarmRinging(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };
  const [slideImage, setSlideImage] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Clock
  // Clock & Recent Images
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);

    // Load recent files
    idbGet('video-meeting-recents').then((val) => {
      if (val) setRecentImages(val);
    }).catch(console.error);

    return () => clearInterval(timer);
  }, []);

  // Countdown Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setSlideImage(dataUrl);
        // Only keep the latest 5 to stop IndexedDB bloating uncomfortably
        const updated = [{ name: file.name, data: dataUrl }, ...recentImages.filter(i => i.name !== file.name)].slice(0, 5);
        setRecentImages(updated);
        idbSet('video-meeting-recents', updated).catch(console.error);
      };
      reader.readAsDataURL(file);
    }
  };

  const formattedClock = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="h-screen w-screen bg-[#202124] text-white flex flex-col font-sans overflow-hidden">
      {/* Main Content Area */}
      <div className="flex-1 p-4 md:p-6 flex items-center justify-center relative overflow-hidden">
        {/* Presentation Container */}
        <div className="w-full h-full max-w-7xl bg-[#3c4043] rounded-xl overflow-hidden relative flex items-center justify-center shadow-2xl border border-gray-700/50">
          {slideImage ? (
            <img src={slideImage} alt="Slide" className="w-full h-full object-contain" />
          ) : (
            <div className="text-gray-400 flex flex-col items-center">
              <ImageIcon size={80} className="mb-6 opacity-40" />
              <p className="text-2xl font-medium text-gray-300">No presentation shared</p>
              <p className="text-base mt-2 text-gray-500">Upload a slide using the presenter controls</p>
            </div>
          )}

          {/* Timer Overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-4">
            <div
              style={{ transform: `scale(${overlayScale})` }}
              className="bg-black/60 backdrop-blur-md px-8 py-10 md:px-16 md:py-12 rounded-3xl text-center shadow-2xl border border-white/10 max-w-4xl w-full transition-transform duration-200 origin-center"
            >
              <div className="text-3xl md:text-5xl lg:text-6xl font-medium text-white drop-shadow-md leading-tight">
                The <span style={{ color: eventColor }} className="font-semibold">{eventName}</span> starts in
              </div>
              <div className="text-5xl md:text-7xl font-bold my-4 font-mono text-white drop-shadow-xl tracking-tighter leading-none">
                {formatTime(timeLeft)}
              </div>
              <div className="text-3xl md:text-5xl lg:text-6xl font-medium text-white drop-shadow-md leading-tight">
                minutes.
              </div>
            </div>
          </div>

          {/* Dummy Slide Overlay */}
          {slideImage && (
            <div className="absolute bottom-6 right-6 bg-black/60 backdrop-blur-sm pl-4 pr-3 py-2.5 rounded-xl flex items-center gap-5 text-white pointer-events-auto border border-white/10 shadow-lg">
              <span className="text-[13px] font-medium opacity-90 tracking-wide">Sharing slide 1 of 23</span>
              <div className="flex gap-2">
                <button className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition shadow-sm"><ChevronLeft size={16} /></button>
                <button className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition shadow-sm"><ChevronRight size={16} /></button>
              </div>
            </div>
          )}
        </div>

        {/* Dummy Meeting Tiles (Left Side) */}
        <div className="absolute top-8 left-8 flex flex-col gap-5 z-40 pointer-events-none hidden lg:flex">
          <div className="w-[200px] h-[130px] bg-[#3c4043] rounded-[14px] overflow-hidden relative shadow-2xl border border-white/10 flex flex-col items-center justify-center pointer-events-auto hover:border-white/20 transition-colors">
            <div className="w-[52px] h-[52px] bg-indigo-500 rounded-full flex items-center justify-center text-xl font-medium text-white shadow-md">AS</div>
            <div className="absolute bottom-2.5 left-2.5 right-2.5 flex justify-between items-center text-white">
              <div className="text-xs font-semibold px-2 py-1 bg-black/50 backdrop-blur-md rounded-md flex items-center gap-1.5 shadow-sm">
                <MicOff size={11} className="text-red-400" /> Alice S.
              </div>
              <div className="text-[10px] text-gray-300 font-medium px-2 py-1 bg-black/40 backdrop-blur-sm rounded-md tracking-wide">Waiting</div>
            </div>
          </div>

          <div className="w-[200px] h-[130px] bg-[#3c4043] rounded-[14px] overflow-hidden relative shadow-2xl border border-white/10 flex flex-col items-center justify-center pointer-events-auto hover:border-white/20 transition-colors">
            <div className="w-[52px] h-[52px] bg-rose-500 rounded-full flex items-center justify-center text-xl font-medium text-white shadow-md">JD</div>
            <div className="absolute bottom-2.5 left-2.5 right-2.5 flex justify-between items-center text-white">
              <div className="text-xs font-semibold px-2 py-1 bg-black/50 backdrop-blur-md rounded-md flex items-center gap-1.5 shadow-sm">
                <MicOff size={11} className="text-red-400" /> John D.
              </div>
              <div className="text-[10px] text-gray-300 font-medium px-2 py-1 bg-black/40 backdrop-blur-sm rounded-md tracking-wide">Waiting</div>
            </div>
          </div>
        </div>

        {/* Presenter Controls (Floating) */}
        {showControls && (
          <div className="absolute top-8 right-8 bg-[#202124] border border-gray-600 rounded-2xl shadow-2xl w-80 p-5 z-50 flex flex-col gap-5 pointer-events-auto">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-200">
                <Settings size={18} className="text-blue-400" /> Presenter Controls
              </h3>
              <button onClick={() => setShowControls(false)} className="text-gray-400 hover:text-white transition p-1 hover:bg-gray-700 rounded-md">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5 max-h-[80vh] overflow-y-auto pr-1 pb-2 custom-scrollbar">
              {/* Event Name */}
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Event Name</label>
                  <input
                    type="text"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    className="w-full bg-[#3c4043] border border-gray-600 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                    placeholder="e.g. meeting, webinar"
                  />
                </div>
                <div className="shrink-0 w-12">
                  <label className="block text-sm font-medium text-gray-400 mb-1.5 truncate">Color</label>
                  <input
                    type="color"
                    value={eventColor}
                    onChange={(e) => setEventColor(e.target.value)}
                    className="w-full h-[42px] bg-[#3c4043] border border-gray-600 rounded-lg cursor-pointer p-0.5"
                  />
                </div>
              </div>

              {/* Timer Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Duration</label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        value={initialMinutes}
                        onChange={(e) => {
                          const mins = Math.max(0, parseInt(e.target.value) || 0);
                          setInitialMinutes(mins);
                          setTimeLeft(mins * 60 + initialSeconds);
                          setIsRunning(false);
                        }}
                        className="w-full bg-[#3c4043] border border-gray-600 rounded-lg pl-3 pr-8 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">m</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={initialSeconds}
                        onChange={(e) => {
                          const secs = Math.max(0, Math.min(59, parseInt(e.target.value) || 0));
                          setInitialSeconds(secs);
                          setTimeLeft(initialMinutes * 60 + secs);
                          setIsRunning(false);
                        }}
                        className="w-full bg-[#3c4043] border border-gray-600 rounded-lg pl-3 pr-8 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">s</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Alarm Setting */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Alarm Trigger (after start)</label>
                <select
                  value={alarmTriggerSeconds}
                  onChange={(e) => setAlarmTriggerSeconds(e.target.value ? Number(e.target.value) : '')}
                  className="w-full bg-[#3c4043] border border-gray-600 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                >
                  <option value="">No Alarm</option>
                  <option value="10">10 Seconds</option>
                  <option value="30">30 Seconds</option>
                  <option value="60">1 Minute</option>
                  <option value="300">5 Minutes</option>
                  <option value="600">10 Minutes</option>
                </select>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">First Slide Image</label>
                <label className="w-full flex items-center justify-center gap-2 bg-[#3c4043] hover:bg-[#4a4d51] border border-gray-600 rounded-lg px-3 py-2.5 text-white cursor-pointer transition">
                  <Upload size={18} />
                  <span className="font-medium">Upload Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Recent Images */}
              {recentImages.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Recent Slides</label>
                  <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none">
                    {recentImages.map((img, idx) => (
                      <div key={idx} className="relative shrink-0 group">
                        <img
                          src={img.data}
                          alt={img.name}
                          onClick={() => setSlideImage(img.data)}
                          className={`w-16 h-12 object-cover rounded-lg border-2 cursor-pointer transition-colors ${slideImage === img.data ? 'border-blue-500' : 'border-gray-600 hover:border-gray-400'}`}
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const newRecents = recentImages.filter((_, i) => i !== idx);
                            setRecentImages(newRecents);
                            idbSet('video-meeting-recents', newRecents).catch(console.error);
                            if (slideImage === img.data && !newRecents.find(r => r.data === img.data)) setSlideImage(null);
                          }}
                          className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition shadow-lg"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Timer UI Scale */}
              <div>
                <label className="flex justify-between text-sm font-medium text-gray-400 mb-1.5">
                  <span>Card Size</span>
                  <span className="text-gray-500">{overlayScale.toFixed(1)}x</span>
                </label>
                <input
                  type="range"
                  min="0.5" max="1.5" step="0.1"
                  value={overlayScale}
                  onChange={e => setOverlayScale(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              {/* Timer Controls */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Timer Controls</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (!isRunning) {
                        setShowControls(false); // Close settings automatically on Start
                        if (alarmTriggerSeconds && Number(alarmTriggerSeconds) > 0) {
                          if (alarmTimeoutRef.current) clearTimeout(alarmTimeoutRef.current);
                          alarmTimeoutRef.current = setTimeout(() => {
                            setIsAlarmRinging(true);
                            if (!audioRef.current) {
                              audioRef.current = new Audio(import.meta.env.BASE_URL + 'alarm-sound.mp3');
                              audioRef.current.loop = true;
                            }
                            audioRef.current.play().catch(e => console.error(e));
                          }, Number(alarmTriggerSeconds) * 1000);
                        }
                      } else {
                        // On Pause, we cancel the pending alarm but leave it queued for the next 'start'
                        if (alarmTimeoutRef.current) clearTimeout(alarmTimeoutRef.current);
                      }
                      setIsRunning(!isRunning);
                    }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg font-medium transition shadow-sm ${isRunning ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                  >
                    {isRunning ? <><Pause size={18} /> Pause</> : <><Play size={18} /> Start</>}
                  </button>
                  <button
                    onClick={() => {
                      setIsRunning(false);
                      setTimeLeft(initialMinutes * 60 + initialSeconds);
                      if (alarmTimeoutRef.current) clearTimeout(alarmTimeoutRef.current);
                      stopAlarm();
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-[#3c4043] hover:bg-[#4a4d51] border border-gray-600 text-white py-2.5 rounded-lg font-medium transition shadow-sm"
                  >
                    <RotateCcw size={18} /> Reset
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Toggle Controls Button (if hidden) */}
        {!showControls && (
          <button
            onClick={() => setShowControls(true)}
            className="absolute top-8 right-8 bg-[#3c4043] hover:bg-[#4a4d51] p-3.5 rounded-full shadow-2xl border border-gray-600 transition text-gray-200 pointer-events-auto"
            title="Show Presenter Controls"
          >
            <Settings size={22} />
          </button>
        )}

        {/* Alarm Popup */}
        {isAlarmRinging && (
          <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm pointer-events-auto">
            <div className="bg-[#202124] border border-red-500/50 p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-6 max-w-sm w-full mx-4">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
                <BellRing size={32} className="text-red-500 animate-pulse" />
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">Alarm!</h2>
                <p className="text-gray-400">The scheduled alarm has been triggered.</p>
              </div>
              <button
                onClick={stopAlarm}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition shadow-lg"
              >
                Stop Alarm
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Control Bar */}
      <div className="h-[88px] px-6 flex items-center justify-between bg-[#202124] shrink-0">
        {/* Left: Time & Meeting Info */}
        <div className="flex items-center gap-4 w-1/4 text-[15px] font-medium text-gray-200">
          <span>{formattedClock}</span>
          <span className="hidden md:inline text-gray-500">|</span>
          <span className="hidden md:inline truncate">{eventName.charAt(0).toUpperCase() + eventName.slice(1)}</span>
        </div>

        {/* Center: Main Controls */}
        <div className="flex items-center justify-center gap-3 w-2/4">
          <button className="p-3.5 rounded-full bg-[#3c4043] hover:bg-[#4a4d51] transition">
            <MicOff size={22} className="text-red-400 fill-red-400/20" />
          </button>
          <button className="p-3.5 rounded-full bg-[#3c4043] hover:bg-[#4a4d51] transition">
            <VideoOff size={22} className="text-red-400 fill-red-400/20" />
          </button>
          <button className="p-3.5 rounded-full bg-[#3c4043] hover:bg-[#4a4d51] transition hidden sm:block">
            <ClosedCaption size={22} className="text-gray-200" />
          </button>
          <button className="p-3.5 rounded-full bg-[#3c4043] hover:bg-[#4a4d51] transition hidden sm:block">
            <Smile size={22} className="text-gray-200" />
          </button>
          <button className="p-3.5 rounded-full bg-[#3c4043] hover:bg-[#4a4d51] transition hidden md:block">
            <MonitorUp size={22} className="text-gray-200" />
          </button>
          <button className="p-3.5 rounded-full bg-[#3c4043] hover:bg-[#4a4d51] transition hidden sm:block">
            <Hand size={22} className="text-gray-200" />
          </button>
          <button className="p-3.5 rounded-full bg-[#3c4043] hover:bg-[#4a4d51] transition">
            <MoreVertical size={22} className="text-gray-200" />
          </button>
          <button className="p-3.5 rounded-full bg-red-600 hover:bg-red-700 transition px-6 ml-2 shadow-lg">
            <Phone size={24} className="rotate-[135deg] text-white fill-white" />
          </button>
        </div>

        {/* Right: Side Panel Controls */}
        <div className="flex items-center justify-end gap-2 w-1/4">
          <button className="p-2.5 text-gray-300 hover:text-white hover:bg-gray-800 rounded-full transition hidden lg:block">
            <Info size={22} />
          </button>
          <button className="p-2.5 text-gray-300 hover:text-white hover:bg-gray-800 rounded-full transition hidden lg:block">
            <Users size={22} />
          </button>
          <button className="p-2.5 text-gray-300 hover:text-white hover:bg-gray-800 rounded-full transition hidden lg:block">
            <MessageSquare size={22} />
          </button>
          <button className="p-2.5 text-gray-300 hover:text-white hover:bg-gray-800 rounded-full transition hidden lg:block">
            <Shapes size={22} />
          </button>
          <button className="p-2.5 text-gray-300 hover:text-white hover:bg-gray-800 rounded-full transition hidden lg:block">
            <Lock size={22} />
          </button>
        </div>
      </div>
    </div>
  );
}
