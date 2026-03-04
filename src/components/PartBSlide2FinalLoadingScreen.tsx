import React, { useRef, useEffect } from 'react';

interface PartBSlide2FinalLoadingScreenProps {
    onComplete: () => void;
}

const PART_B_SLIDE_2_VIDEO = encodeURI('/PART B_SLIDE 2_FINAL LOADING.mp4');

const PartBSlide2FinalLoadingScreen: React.FC<PartBSlide2FinalLoadingScreenProps> = ({ onComplete }) => {
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
                src={PART_B_SLIDE_2_VIDEO}
                className="absolute inset-0 w-full h-full object-cover pixelated"
                playsInline
                muted
                autoPlay
                onEnded={handleEnded}
            />
        </div>
    );
};

export default PartBSlide2FinalLoadingScreen;
