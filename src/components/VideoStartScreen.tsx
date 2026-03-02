import React, { useState, useRef, useEffect } from 'react';

import btnStartBefore from '../assets/Fruit Jam Assets Slide 2 - START BUTTON BEFORE CLICK.png.png';
import btnStartAfter from '../assets/Fruit Jam Assets Slide 2 - START BUTTON AFTER CLICK.png';

interface VideoStartScreenProps {
    onStart: () => void;
}

const VideoStartScreen: React.FC<VideoStartScreenProps> = ({ onStart }) => {
    const [isPressed, setIsPressed] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;
        video.play().catch(() => {});
    }, []);

    const handleStart = () => {
        onStart();
    };

    return (
        <div className="relative w-full h-full overflow-hidden">
            {/* Video fills entire screen */}
            <video
                ref={videoRef}
                src="/video-loop.mp4"
                className="absolute inset-0 w-full h-full object-cover pixelated"
                playsInline
                muted
                loop
                autoPlay
            />

            {/* START button overlaid at bottom center - adjust pb-* to move higher (e.g. pb-32) or lower (e.g. pb-10) */}
            <div className="absolute inset-0 flex flex-col justify-end items-center pb-28 pt-4 pointer-events-none">
                <div className="pointer-events-auto">
                <button
                    type="button"
                    onClick={handleStart}
                    onMouseDown={() => setIsPressed(true)}
                    onMouseUp={() => setIsPressed(false)}
                    onMouseLeave={() => setIsPressed(false)}
                    onTouchStart={() => setIsPressed(true)}
                    onTouchEnd={() => setIsPressed(false)}
                    className="w-40 h-40 flex items-center justify-center transition-transform active:scale-95"
                >
                    <img
                        src={isPressed ? btnStartAfter : btnStartBefore}
                        alt="START"
                        className="w-full h-full object-contain pixelated pointer-events-none"
                        draggable={false}
                    />
                </button>
                </div>
            </div>
        </div>
    );
};

export default VideoStartScreen;
