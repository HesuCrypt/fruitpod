import React, { useRef, useEffect } from 'react';

interface Slide3ScreenProps {
    onComplete: () => void;
}

const SLIDE_3_VIDEO_SRC = encodeURI('/Slide 3 (PART A) - FRUIT JAM (NO AUDIO YET).mp4');

const Slide3Screen: React.FC<Slide3ScreenProps> = ({ onComplete }) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;
        video.play().catch(() => {});
    }, []);

    const handleEnded = () => {
        onComplete();
    };

    return (
        <div className="relative w-full h-full overflow-hidden">
            <video
                ref={videoRef}
                src={SLIDE_3_VIDEO_SRC}
                className="absolute inset-0 w-full h-full object-cover pixelated"
                playsInline
                muted
                autoPlay
                onEnded={handleEnded}
            />
        </div>
    );
};

export default Slide3Screen;
