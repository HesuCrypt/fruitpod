import React, { useState, useRef, useEffect } from 'react';

interface PartBSlide2FinalLoadingScreenProps {
    onComplete: () => void;
}

const PART_B_SLIDE_2_VIDEO = encodeURI('/PART B_SLIDE 2_FINAL LOADING.mp4');

const PartBSlide2FinalLoadingScreen: React.FC<PartBSlide2FinalLoadingScreenProps> = ({ onComplete }) => {
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
                src={PART_B_SLIDE_2_VIDEO}
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

export default PartBSlide2FinalLoadingScreen;
