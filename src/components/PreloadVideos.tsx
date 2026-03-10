import React, { useEffect, useRef } from 'react';
import arrowBefore from '../assets/Fruit Jam Arrow Files_Before Click.png';
import arrowAfter from '../assets/Fruit Jam Arrow After Click.png';

/**
 * All video and image URLs used before/during the game. The app does not start
 * until every asset has loaded (canplaythrough for videos, onload for images)
 * so playback and UI are instant with no buffering.
 */
const VIDEO_URLS = [
  encodeURI('/PART B_SLIDE 2_FINAL LOADING.mp4'),
  '/video-loop.mp4',
  encodeURI('/Slide 3 (PART A) - FRUIT JAM (NO AUDIO YET).mp4'),
  encodeURI('/PART B_SLIDE 1.mp4'),
  encodeURI('/FINAL PART B_SLIDE 3.mp4'),
];

const FRUIT_IMAGE_NAMES = [
  'GRAPES FULL.png',
  'NEW PEACH.png',
  'WATERMELON FULL.png',
  'STRAWBERRY.png',
  'FIG FULL.png',
];
const GAME_IMAGE_URLS = [
  ...FRUIT_IMAGE_NAMES.map((n) => `/fruits/${encodeURIComponent(n)}`),
  `/fruits/${encodeURIComponent('BOMB.png')}`,
  `/fruits/${encodeURIComponent('BOMB EXPLOSION 2.png')}`,
  `/fruits/${encodeURIComponent('CREME CHEEK FRENZY.png')}`,
];

const IMAGE_URLS = [arrowBefore, arrowAfter];
const TOTAL_ASSETS = VIDEO_URLS.length + IMAGE_URLS.length + GAME_IMAGE_URLS.length;

export interface AssetLoaderProps {
  onProgress?: (loaded: number, total: number) => void;
  onInitialVideoReady?: () => void;
}

const PreloadVideos: React.FC<AssetLoaderProps> = ({ onProgress, onInitialVideoReady }) => {
  const videosRef = useRef<HTMLVideoElement[]>([]);
  const onReadyRef = useRef(onInitialVideoReady);
  const onProgressRef = useRef(onProgress);
  onReadyRef.current = onInitialVideoReady;
  onProgressRef.current = onProgress;

  useEffect(() => {
    const videos: HTMLVideoElement[] = [];
    const style = 'position:absolute;width:0;height:0;pointer-events:none;opacity:0;';
    let readyCount = 0;

    const reportProgress = () => {
      onProgressRef.current?.(readyCount, TOTAL_ASSETS);
    };

    const markVideoDone = (video: HTMLVideoElement, done: () => void) => {
      let called = false;
      const doneOnce = () => {
        if (called) return;
        called = true;
        video.removeEventListener('canplaythrough', onCanPlay);
        video.removeEventListener('progress', onProgress);
        done();
      };
      const onCanPlay = () => {
        if (video.readyState >= 4) doneOnce();
      };
      const onProgress = () => {
        if (video.readyState >= 4) doneOnce();
      };
      video.addEventListener('canplaythrough', onCanPlay, { once: true });
      video.addEventListener('progress', onProgress);
      if (video.readyState >= 4) doneOnce();
    };

    const maybeDone = () => {
      readyCount += 1;
      reportProgress();
      if (readyCount >= TOTAL_ASSETS) {
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

      video.addEventListener('error', maybeDone, { once: true });
      markVideoDone(video, maybeDone);

      document.body.appendChild(video);
      video.load();
      videos.push(video);
    });

    IMAGE_URLS.forEach((url) => {
      const img = new Image();
      img.onload = maybeDone;
      img.onerror = maybeDone;
      img.src = url;
    });

    GAME_IMAGE_URLS.forEach((url) => {
      const img = new Image();
      img.onload = maybeDone;
      img.onerror = maybeDone;
      img.src = url;
    });

    videosRef.current = videos;
    reportProgress();

    return () => {
      videosRef.current.forEach((v) => {
        v.src = '';
        if (v.parentNode) document.body.removeChild(v);
      });
      videosRef.current = [];
    };
  }, []);

  return null;
};

export default PreloadVideos;
