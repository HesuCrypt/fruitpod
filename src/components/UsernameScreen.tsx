import React, { useState } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import btnSubmit from '../assets/btn_submit.png';
import btnSubmitClicked from '../assets/btn_submit_clicked.png';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface UsernameScreenProps {
    onContinue: (username: string) => void;
}

const UsernameScreen: React.FC<UsernameScreenProps> = ({ onContinue }) => {
    const [username, setUsername] = useState('');
    const [isPressed, setIsPressed] = useState(false);

    const isValid = username.trim().length > 0;

    const handleContinue = () => {
        if (isValid) {
            const trimmed = username.trim();
            console.log('Username submitted:', trimmed);
            onContinue(trimmed);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && isValid) {
            handleContinue();
        }
    };

    return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-issy-pink px-6">
            <div className="relative w-full max-w-[390px] flex flex-col items-center">
                <label
                    htmlFor="username"
                    className="font-pixel text-[10px] mb-8 text-center tracking-tight leading-relaxed uppercase text-white drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                >
                    Enter your Instagram username:
                </label>

                <div className="relative w-full flex items-center mb-8">
                    {/* Custom Pixel Input Container */}
                    <div className="relative flex-1 group">
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                            onKeyPress={handleKeyPress}
                            placeholder="YOUR_USERNAME"
                            className={cn(
                                "w-full h-14 bg-white px-4 pr-20 font-pixel text-[10px] outline-none",
                                "border-4 border-black border-r-0 rounded-l-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]",
                                "placeholder:text-gray-300 transition-all focus:bg-pink-50"
                            )}
                            autoComplete="off"
                            autoFocus
                        />
                    </div>

                    {/* Submit Button - Even bigger as requested */}
                    <button
                        onClick={handleContinue}
                        onMouseDown={() => setIsPressed(true)}
                        onMouseUp={() => setIsPressed(false)}
                        onMouseLeave={() => setIsPressed(false)}
                        onTouchStart={() => setIsPressed(true)}
                        onTouchEnd={() => setIsPressed(false)}
                        className="absolute -right-12 w-36 h-36 flex items-center justify-center transition-all z-20"
                    >
                        <img
                            src={isPressed ? btnSubmitClicked : btnSubmit}
                            alt="SUBMIT"
                            className="w-full h-full object-contain pixelated"
                            draggable={false}
                        />
                    </button>

                </div>

                <p className="font-pixel text-[8px] text-white opacity-60 text-center leading-loose drop-shadow-[1px_1px_0px_rgba(0,0,0,0.5)]">
                    USE ALPHANUMERIC AND UNDERSCORE ONLY
                </p>
            </div>
        </div>
    );
};


export default UsernameScreen;
