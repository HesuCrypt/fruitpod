import React, { useEffect, useRef } from 'react';

/**
 * All video URLs used in the app. App does not start until ALL videos
 * have canplaythrough (or error) so playback is smooth with no loading.
 */
const VIDEO_URLS = [
  encodeURI('/PART B_SLIDE 2_FINAL LOADING.mp4'),
  '/video-loop.mp4',
  encodeURI('/Slide 3 (PART A) - FRUIT JAM (NO AUDIO YET).mp4'),
  encodeURI('/PART B_SLIDE 1.mp4'),
  encodeURI('/FINAL PART B_SLIDE 3.mp4'),
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
    let readyCount = 0;
    const total = VIDEO_URLS.length;

    const maybeDone = () => {
      readyCount += 1;
      if (readyCount >= total) {
        onReadyRef.current?.();
      }
    };

    VIDEO_URLS.forEach((url) => {
      const video = document.createElement('video');
      video.preload = 'auto';
      video.muted = true;
      video.playsInline = true;
      video.setAttribute('style', style);
      video.src = url;

      video.addEventListener('canplaythrough', maybeDone, { once: true });
      video.addEventListener('error', maybeDone, { once: true });

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
