import React, { useState, useRef, useEffect } from 'react';

interface Slide3ScreenProps {
    onComplete: () => void;
}

const SLIDE_3_VIDEO_SRC = encodeURI('/Slide 3 (PART A) - FRUIT JAM (NO AUDIO YET).mp4');

const Slide3Screen: React.FC<Slide3ScreenProps> = ({ onComplete }) => {
    const [videoReady, setVideoReady] = useState(false);
    const [videoError, setVideoError] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;
        video.play().catch(() => setVideoError(true));
    }, []);

    useEffect(() => {
        if (videoError) {
            const t = setTimeout(onComplete, 800);
            return () => clearTimeout(t);
        }
    }, [videoError, onComplete]);

    const handleEnded = () => {
        onComplete();
    };

    return (
        <div className="relative w-full h-full overflow-hidden bg-issy-pink">
            <video
                ref={videoRef}
                src={SLIDE_3_VIDEO_SRC}
                preload="auto"
                className={`absolute inset-0 w-full h-full object-cover pixelated transition-opacity duration-300 ${videoReady && !videoError ? 'opacity-100' : 'opacity-0'}`}
                playsInline
                muted
                autoPlay
                onLoadedData={() => setVideoReady(true)}
                onCanPlay={() => setVideoReady(true)}
                onError={() => setVideoError(true)}
                onEnded={handleEnded}
            />
        </div>
    );
};

export default Slide3Screen;
