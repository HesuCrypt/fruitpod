import React, { useEffect, useRef } from 'react';

/**
 * All video URLs used in the app. First video is the initial screen (Part B Slide 2)
 * so it loads first. Preloading starts on mount so assets are cached before use.
 */
const INITIAL_VIDEO_URL = encodeURI('/PART B_SLIDE 2_FINAL LOADING.mp4');
const VIDEO_URLS = [
  INITIAL_VIDEO_URL,
  '/video-loop.mp4',
  encodeURI('/Slide 3 (PART A) - FRUIT JAM (NO AUDIO YET).mp4'),
  encodeURI('/PART B_SLIDE 1.mp4'),
];

interface PreloadVideosProps {
  onInitialVideoReady?: () => void;
}

const PreloadVideos: React.FC<PreloadVideosProps> = ({ onInitialVideoReady }) => {
  const videosRef = useRef<HTMLVideoElement[]>([]);
  const onReadyRef = useRef(onInitialVideoReady);
  onReadyRef.current = onInitialVideoReady;

  useEffect(() => {
    const videos: HTMLVideoElement[] = [];
    const style = 'position:absolute;width:0;height:0;pointer-events:none;opacity:0;';

    VIDEO_URLS.forEach((url, index) => {
      const video = document.createElement('video');
      video.preload = 'auto';
      video.muted = true;
      video.playsInline = true;
      video.setAttribute('style', style);
      video.src = url;

      const isFirst = index === 0;
      if (isFirst && onReadyRef.current) {
        const onReady = () => {
          onReadyRef.current?.();
        };
        video.addEventListener('canplaythrough', onReady, { once: true });
        video.addEventListener('error', onReady, { once: true });
      }

      document.body.appendChild(video);
      video.load();
      videos.push(video);
    });

    videosRef.current = videos;
    return () => {
      videosRef.current.forEach((v) => {
        v.src = '';
        document.body.removeChild(v);
      });
      videosRef.current = [];
    };
  }, []);

  return null;
};

export default PreloadVideos;
