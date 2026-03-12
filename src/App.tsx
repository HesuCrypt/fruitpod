import { useState, useEffect } from 'react';
import UsernameScreen from './components/UsernameScreen';
import VideoStartScreen from './components/VideoStartScreen';
import Slide3Screen from './components/Slide3Screen';
import PartBSlide1Screen from './components/PartBSlide1Screen';
import PartBSlide2FinalLoadingScreen from './components/PartBSlide2FinalLoadingScreen';
import GameContainer from './components/GameContainer';
import PreloadVideos from './components/PreloadVideos';
import LoadingScreen from './components/LoadingScreen';
import MobileBlock from './components/MobileBlock';
import RotateDeviceOverlay from './components/RotateDeviceOverlay';
import { isMobileOrTablet, isPortrait } from './lib/device';
import './styles/globals.css';

function App() {
  const [loadProgress, setLoadProgress] = useState({ loaded: 0, total: 1 });
  const [initialVideoReady, setInitialVideoReady] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [hasCompletedSlide3, setHasCompletedSlide3] = useState(false);
  const [hasCompletedPartBSlide1, setHasCompletedPartBSlide1] = useState(false);
  const [hasCompletedPartBSlide2Final, setHasCompletedPartBSlide2Final] = useState(false);
  const [hasCompletedGame, setHasCompletedGame] = useState(false);
  const [isMobile, setIsMobile] = useState(true);
  const [isPortraitMode, setIsPortraitMode] = useState(true);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const mobileStatus = isMobileOrTablet();
      const portraitStatus = isPortrait();

      setIsMobile(mobileStatus);
      setIsPortraitMode(portraitStatus);
      setIsReady(true);
    };

    // Initial check
    checkDevice();

    // Listen for resize/orientation changes
    window.addEventListener('resize', checkDevice);
    window.addEventListener('orientationchange', checkDevice);

    return () => {
      window.removeEventListener('resize', checkDevice);
      window.removeEventListener('orientationchange', checkDevice);
    };
  }, []);

  const handleUsernameSubmit = (name: string) => {
    setUsername(name);
    // Prepared for next screen later
    console.log('Navigating from Username Screen with:', name);
  };

  if (!isReady) return null;

  // 1. Block Desktop completely
  if (!isMobile) {
    return <MobileBlock />;
  }

  // 2. Force Portrait Mode
  if (!isPortraitMode) {
    return <RotateDeviceOverlay />;
  }

  return (
    <main className="relative w-full h-full overflow-hidden select-none touch-none bg-issy-pink">
      <PreloadVideos
        onProgress={(loaded, total) => setLoadProgress({ loaded, total })}
        onInitialVideoReady={() => setInitialVideoReady(true)}
      />
      {!initialVideoReady ? (
        <LoadingScreen loaded={loadProgress.loaded} total={loadProgress.total} />
      ) : !username ? (
        <UsernameScreen onContinue={handleUsernameSubmit} />
      ) : !hasStarted ? (
        <VideoStartScreen onStart={() => setHasStarted(true)} />
      ) : !hasCompletedSlide3 ? (
        <Slide3Screen onComplete={() => setHasCompletedSlide3(true)} />
      ) : !hasCompletedPartBSlide1 ? (
        <PartBSlide1Screen onNext={() => setHasCompletedPartBSlide1(true)} />
      ) : !hasCompletedPartBSlide2Final ? (
        <PartBSlide2FinalLoadingScreen onComplete={() => setHasCompletedPartBSlide2Final(true)} />
      ) : !hasCompletedGame ? (
        <GameContainer username={username} onDone={() => setHasCompletedGame(true)} />
      ) : (
        <div className="flex flex-col items-center justify-center w-full h-full bg-issy-pink">
          <div className="font-pixel text-lg text-issy-accent uppercase animate-pulse">
            Welcome, {username}!
          </div>
          <div className="mt-4 font-pixel text-base text-gray-500 uppercase">
            Ready for next screen...
          </div>
        </div>
      )}
    </main>
  );
}

export default App;
