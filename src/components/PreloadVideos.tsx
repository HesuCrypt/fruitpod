import React, { useEffect, useRef } from 'react';

/**
 * All video URLs used in the app. Preloading these on mount ensures they are
 * cached by the time the user reaches each screen, so playback starts immediately.
 */
// Use same URLs (including encoding) as in video components so the browser serves from cache
const VIDEO_URLS = [
  '/video-loop.mp4',
  encodeURI('/Slide 3 (PART A) - FRUIT JAM (NO AUDIO YET).mp4'),
  encodeURI('/PART B_SLIDE 1.mp4'),
  encodeURI('/PART B_SLIDE 2_FINAL LOADING.mp4'),
];

const PreloadVideos: React.FC = () => {
  const videosRef = useRef<HTMLVideoElement[]>([]);

  useEffect(() => {
    const videos: HTMLVideoElement[] = [];
    VIDEO_URLS.forEach((url) => {
      const video = document.createElement('video');
      video.preload = 'auto';
      video.muted = true;
      video.playsInline = true;
      video.setAttribute('style', 'position:absolute;width:0;height:0;pointer-events:none;opacity:0;');
      video.src = url;
      document.body.appendChild(video);
      video.load(); // Force immediate download, don't wait for browser to decide
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
