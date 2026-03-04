import React from 'react';

const MobileBlock: React.FC = () => {
    return (
        <div className="fixed inset-0 bg-issy-pink flex items-center justify-center p-8 text-center z-[9999]">
            <div className="pixel-border bg-white p-6 max-w-sm">
                <h1 className="font-pixel text-base mb-4 leading-relaxed uppercase">
                    Device Restricted
                </h1>
                <p className="font-pixel text-sm leading-loose text-gray-700">
                    ISSY Fruit Pod is available on mobile and tablet devices only.
                </p>
            </div>
        </div>
    );
};

export default MobileBlock;
