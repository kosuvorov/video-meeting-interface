import React, { useState, useEffect } from 'react';
import { 
  MicOff, VideoOff, ClosedCaption, Smile,
  Hand, MonitorUp, MoreVertical, Phone, 
  Info, Users, MessageSquare, Shapes, Lock,
  Settings, Play, Pause, RotateCcw, Image as ImageIcon,
  Upload, X
} from 'lucide-react';

export default function App() {
  const [eventName, setEventName] = useState('meeting');
  const [initialMinutes, setInitialMinutes] = useState(5);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [slideImage, setSlideImage] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
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
      const url = URL.createObjectURL(e.target.files[0]);
      setSlideImage(url);
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
            <div className="bg-black/60 backdrop-blur-md px-8 py-10 md:px-16 md:py-12 rounded-3xl text-center shadow-2xl border border-white/10 max-w-4xl w-full">
              <div className="text-3xl md:text-5xl lg:text-6xl font-medium text-white drop-shadow-md leading-tight">
                The <span className="text-blue-400 font-semibold">{eventName}</span> starts in
              </div>
              <div className="text-7xl md:text-[10rem] font-bold my-6 font-mono text-white drop-shadow-2xl tracking-tighter leading-none">
                {formatTime(timeLeft)}
              </div>
              <div className="text-3xl md:text-5xl lg:text-6xl font-medium text-white drop-shadow-md leading-tight">
                minutes.
              </div>
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

            <div className="space-y-5">
              {/* Event Name */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Event Name</label>
                <input 
                  type="text" 
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  className="w-full bg-[#3c4043] border border-gray-600 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                  placeholder="e.g. meeting, webinar"
                />
              </div>

              {/* Timer Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Duration (minutes)</label>
                <input 
                  type="number" 
                  min="1"
                  value={initialMinutes}
                  onChange={(e) => {
                    const mins = parseInt(e.target.value) || 0;
                    setInitialMinutes(mins);
                    setTimeLeft(mins * 60);
                    setIsRunning(false);
                  }}
                  className="w-full bg-[#3c4043] border border-gray-600 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                />
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

              {/* Timer Controls */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Timer Controls</label>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setIsRunning(!isRunning)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg font-medium transition shadow-sm ${
                      isRunning ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {isRunning ? <><Pause size={18} /> Pause</> : <><Play size={18} /> Start</>}
                  </button>
                  <button 
                    onClick={() => {
                      setIsRunning(false);
                      setTimeLeft(initialMinutes * 60);
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
