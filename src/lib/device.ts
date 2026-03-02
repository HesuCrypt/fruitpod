export const isMobileOrTablet = (): boolean => {
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;

    // Basic mobile/tablet detection
    const isMobileRegex = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isSmallScreen = window.innerWidth <= 1024;

    return isMobileRegex.test(userAgent) || (isTouchDevice && isSmallScreen);
};

export const isPortrait = (): boolean => {
    return window.innerHeight > window.innerWidth;
};

export const getViewportSize = () => {
    return {
        width: window.innerWidth,
        height: window.innerHeight,
    };
};
