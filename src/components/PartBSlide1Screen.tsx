import React, { useState, useRef, useEffect } from 'react';

import arrowBefore from '../assets/Fruit Jam Arrow Files_Before Click.png';
import arrowAfter from '../assets/Fruit Jam Arrow After Click.png';

const PART_B_SLIDE_1_VIDEO = '/PART B_SLIDE 1.mp4';

interface PartBSlide1ScreenProps {
    onNext: () => void;
}

const PartBSlide1Screen: React.FC<PartBSlide1ScreenProps> = ({ onNext }) => {
    const [isPressed, setIsPressed] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;
        video.play().catch(() => {});
    }, []);

    return (
        <div className="relative w-full h-full overflow-hidden">
            <video
                ref={videoRef}
                src={encodeURI(PART_B_SLIDE_1_VIDEO)}
                className="absolute inset-0 w-full h-full object-cover pixelated"
                playsInline
                muted
                autoPlay
            />

            {/* Next button - lower right */}
            <div className="absolute inset-0 flex flex-col justify-end items-end pointer-events-none pb-8 pr-8">
                <button
                    type="button"
                    onClick={onNext}
                    onMouseDown={() => setIsPressed(true)}
                    onMouseUp={() => setIsPressed(false)}
                    onMouseLeave={() => setIsPressed(false)}
                    onTouchStart={() => setIsPressed(true)}
                    onTouchEnd={() => setIsPressed(false)}
                    className="w-32 h-32 flex items-center justify-center transition-transform pointer-events-auto"
                >
                    <img
                        src={isPressed ? arrowAfter : arrowBefore}
                        alt="Next"
                        className="w-full h-full object-contain pixelated pointer-events-none"
                        draggable={false}
                    />
                </button>
            </div>
        </div>
    );
};

export default PartBSlide1Screen;
