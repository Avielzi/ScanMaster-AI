
import React, { useRef, useState, useEffect } from 'react';

interface CameraCaptureProps {
  onCapture: (base64Image: string) => void;
  onClose: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [isFlash, setIsFlash] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [timerDuration, setTimerDuration] = useState<0 | 3 | 5>(0);

  const startCamera = async () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("לא ניתן לגשת למצלמה. וודא שנתת הרשאות מתאימות.");
      onClose();
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [facingMode]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL('image/jpeg', 0.9);
        
        // Visual flash effect
        setIsFlash(true);
        setTimeout(() => setIsFlash(false), 150);
        
        onCapture(base64);
      }
    }
  };

  const handleCaptureClick = () => {
    if (countdown !== null) return; // Prevent multiple clicks during countdown

    if (timerDuration > 0) {
      let currentCount = timerDuration;
      setCountdown(currentCount);
      const interval = setInterval(() => {
        currentCount -= 1;
        if (currentCount <= 0) {
          clearInterval(interval);
          setCountdown(null);
          capturePhoto();
        } else {
          setCountdown(currentCount);
        }
      }, 1000);
    } else {
      capturePhoto();
    }
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const toggleTimer = () => {
    setTimerDuration(prev => (prev === 0 ? 3 : prev === 3 ? 5 : 0));
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-4">
      <div className="relative w-full max-w-lg aspect-[3/4] bg-gray-900 rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] border-4 border-gray-800">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          className="w-full h-full object-cover"
        />
        
        {/* Grid Overlay */}
        {showGrid && (
          <div className="absolute inset-0 pointer-events-none z-10">
            <div className="absolute top-1/3 left-0 w-full h-[1px] bg-white/20" />
            <div className="absolute top-2/3 left-0 w-full h-[1px] bg-white/20" />
            <div className="absolute left-1/3 top-0 h-full w-[1px] bg-white/20" />
            <div className="absolute left-2/3 top-0 h-full w-[1px] bg-white/20" />
          </div>
        )}

        {/* Flash Overlay */}
        {isFlash && <div className="absolute inset-0 bg-white animate-pulse z-40" />}

        {/* Countdown Overlay */}
        {countdown !== null && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px] z-30">
            <span className="text-white text-9xl font-black animate-ping drop-shadow-2xl">
              {countdown}
            </span>
          </div>
        )}

        {/* Top Controls Overlay */}
        <div className="absolute top-6 inset-x-6 flex items-center justify-between z-20">
          <button 
            onClick={onClose}
            className="p-3 bg-black/40 backdrop-blur-md rounded-2xl text-white hover:bg-black/60 transition-all active:scale-90"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="flex gap-2">
            <button 
              onClick={() => setShowGrid(!showGrid)}
              className={`p-3 backdrop-blur-md rounded-2xl transition-all active:scale-90 ${showGrid ? 'bg-blue-600 text-white' : 'bg-black/40 text-white'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
            <button 
              onClick={toggleTimer}
              className={`p-3 backdrop-blur-md rounded-2xl transition-all active:scale-90 relative ${timerDuration > 0 ? 'bg-blue-600 text-white' : 'bg-black/40 text-white'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {timerDuration > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-black">
                  {timerDuration}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Bottom Controls Overlay */}
        <div className="absolute bottom-8 inset-x-0 flex items-center justify-around z-20">
          <button 
            onClick={toggleCamera}
            className="p-5 bg-white/10 backdrop-blur-xl rounded-3xl text-white hover:bg-white/20 transition-all active:rotate-180 duration-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>

          <button 
            onClick={handleCaptureClick}
            disabled={countdown !== null}
            className={`w-24 h-24 bg-white rounded-full border-[10px] border-slate-700 shadow-2xl active:scale-90 transition-all flex items-center justify-center group ${countdown !== null ? 'opacity-50 grayscale' : ''}`}
          >
            <div className="w-16 h-16 rounded-full border-2 border-slate-200 group-hover:scale-95 transition-transform" />
          </button>

          <div className="w-16 h-16" /> {/* Balance spacer */}
        </div>
      </div>
      
      <canvas ref={canvasRef} className="hidden" />
      
      <div className="mt-8 text-center space-y-2">
        <p className="text-white font-black text-xl tracking-tight">צלמו את הקבלה במלואה</p>
        <p className="text-white/40 text-sm font-medium">מומלץ לצלם על רקע כהה ובתאורה טובה</p>
      </div>
    </div>
  );
};

export default CameraCapture;
