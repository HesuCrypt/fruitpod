import React from 'react';

const RotateDeviceOverlay: React.FC = () => {
    return (
        <div className="fixed inset-0 bg-issy-pink flex flex-col items-center justify-center p-8 text-center z-[9998]">
            <div className="mb-6 animate-bounce">
                <svg
                    width="64"
                    height="64"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="black"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                    <path d="M12 18h.01" />
                    <path d="M12 6c3 0 5 2 5 2l-2 2" />
                </svg>
            </div>
            <p className="font-pixel text-[10px] leading-loose uppercase">
                Please rotate your device to portrait mode
            </p>
        </div>
    );
};

export default RotateDeviceOverlay;
