import { useEffect, useState, useCallback } from "react";
import axios from 'axios';


export const formatMessageDateLong = (date) => {
    const now = new Date();
    const inputDate = new Date(date);

    if (isToday(inputDate)) {
        return inputDate.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        });
    } else if (isYesterday(inputDate)) {
        return (
            'Yesterday ' +
            inputDate.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
            })
        );
    } else if (inputDate.getFullYear() === now.getFullYear()) {
        return inputDate.toLocaleTimeString([], {
            day: '2-digit',
            month: 'short',
        });
    } else {
        return inputDate.toLocaleDateString();
    }
};

export const formatMessageDateShort = (date) => {
    const now = new Date();
    const inputDate = new Date(date);

    if (isToday(inputDate)) {
        return inputDate.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        });
    } else if (isYesterday(inputDate)) {
        return (
            'Yesterday'
        );
    }  else if (inputDate.getFullYear() === now.getFullYear()) {
        return inputDate.toLocaleTimeString([], {
            day: '2-digit',
            month: 'short',
        });
    } else {
        return inputDate.toLocaleDateString();
    }
};

export const isToday = (date) => {
    const today = new Date();

    return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
    );
};

export const isYesterday = (date) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    return (
        date.getDate() === yesterday.getDate() &&
        date.getMonth() === yesterday.getMonth() &&
        date.getFullYear() === yesterday.getFullYear()
    );
}; 

export const isImage = (attachment) => {
    let mime = attachment.mime || attachment.type;
    mime = mime.split('/');
    return mime[0].toLowerCase() === 'image';
};

export const isVideo = (attachment) => {
    let mime = attachment.mime || attachment.type;
    mime = mime.split('/');
    return mime[0].toLowerCase() === 'video';
};

export const isAudio = (attachment) => {
    let mime = attachment.mime || attachment.type;
    mime = mime.split('/');
    return mime[0].toLowerCase() === 'audio';
};

export const isPDF = (attachment) => {
    let mime = attachment.mime || attachment.type; 
    return mime === "application/pdf";
};

export const isPreviewable = (attachment) => {
    return (
        isImage(attachment) ||
        isVideo(attachment) ||
        isAudio(attachment) ||
        isPDF(attachment)
    );
};

export const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];

    let i = 0;
    let size = bytes;

    while (size >= k) {
        size /= k;
        i++;
    }

    return parseFloat(size.toFixed(dm)) + ' ' + sizes[i];
};

export const containerVariants = {
    expanded: {
        height: '20em',

    },
    collapsed: {
        height: '2em',
    },
};

export const containerTransition = {
    type: 'spring',
    damping: 22,
    stiffness: 150,
}

/* Hooks */

// Hook to detect clicks outside of a component
// Usage: Pass a ref to the component and a handler function
// that will be called when a click outside is detected
// Example:
// const ref = useRef();
// const handler = () => {
//     console.log('Clicked outside!');
export function useOnClickOutside(ref, handler) {
    useEffect(
        () => {
            const listener = (event) => {
                // Do nothing if clicking ref's element or descendent elements
                if (!ref.current || ref.current.contains(event.target)) {
                    return;
                }

                handler(event);
            };

            document.addEventListener("mousedown", listener);
            document.addEventListener("touchstart", listener);

            return () => {
                document.removeEventListener("mousedown", listener);
                document.removeEventListener("touchstart", listener);
            };
        },
        // Add ref and handler to effect dependencies
        // It's worth noting that because passed in handler is a new ...
        // ... function on every render that will cause this effect ...
        // ... callback/cleanup to run every render. It's not a big deal ...
        // ... but to optimize you can wrap handler in useCallback before ...
        // ... passing it into this hook.
        [ref, handler]
    );
}


export function useDebounce(value, timeout, callback) {
    const [timer, setTimer] = useState(null);

    const clearTimer = () => {
        if (timer) clearTimeout(timer);
    };

    useEffect(() => {
        clearTimer();
        if (value && callback) {
            const newTimer = setTimeout(callback, timeout); 
            setTimer(newTimer);
        };
    }, [value]);
}

// Hook to detect if the device is mobile
// Usage: Call the hook in your component to get a boolean value
// indicating if the device is mobile or not
// Example:
// const isMobile = useDeviceDetect();
// const isMobile = useDeviceDetect();
// if (isMobile) {
//     console.log('This is a mobile device');
// } else {
//     console.log('This is not a mobile device');
export const useDeviceDetect = () => {
    const [isMobileDevice, setIsMobileDevice] = useState(false);

    useEffect(() => {
        const checkMobileDevice = () => {
            const userAgent = navigator.userAgent || navigator.vendor || window.opera;
            const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile|tablet/i.test(userAgent);
            const isTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
            const isSmallScreen = window.innerWidth <= 1024;
            setIsMobileDevice(isMobile || (isTouchScreen && isSmallScreen));
        };

        checkMobileDevice();
        window.addEventListener('resize', checkMobileDevice);
        return () => window.removeEventListener('resize', checkMobileDevice);
    }, []);

    return isMobileDevice;
};

export const useReactions = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const addReaction = useCallback(async (type, id, emoji) => {
        setIsLoading(true);
        setError(null);

        try {
            // Ensure emoji is properly formatted
            const payload = {
                emoji: typeof emoji === 'string' ? emoji : emoji.native || emoji.toString()
            };

            const response = await axios.post(`/${type}/${id}/react`, payload);
            
            setIsLoading(false);
            return {
                success: true,
                data: response.data,
                reactions: response.data.reactions
            };
        } catch (err) {
            console.error('Reaction error:', err);
            const errorMessage = err.response?.data?.message || 'Failed to add reaction';
            setError(errorMessage);
            setIsLoading(false);
            
            return {
                success: false,
                error: errorMessage
            };
        }
    }, []);

    const getReactions = useCallback(async (type, id) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await axios.get(`/${type}/${id}/reactions`);
            setIsLoading(false);
            
            return {
                success: true,
                reactions: response.data.reactions
            };
        } catch (err) {
            console.error('Get reactions error:', err);
            const errorMessage = err.response?.data?.message || 'Failed to get reactions';
            setError(errorMessage);
            setIsLoading(false);
            
            return {
                success: false,
                error: errorMessage
            };
        }
    }, []);

    const groupReactions = useCallback((reactions) => {
        if (!reactions || !Array.isArray(reactions)) return [];
        
        return reactions.reduce((acc, reaction) => {
            const existingGroup = acc.find(group => group.emoji === reaction.emoji);
            
            if (existingGroup) {
                existingGroup.count += 1;
                existingGroup.users.push(reaction.user);
            } else {
                acc.push({
                    emoji: reaction.emoji,
                    count: 1,
                    users: [reaction.user],
                    user_reacted: reaction.user_id === window.Laravel?.user?.id
                });
            }
            
            return acc;
        }, []);
    }, []);

    const hasUserReacted = useCallback((reactions, userId = null) => {
        if (!reactions || !Array.isArray(reactions)) return false;
        
        const targetUserId = userId || window.Laravel?.user?.id;
        return reactions.some(reaction => reaction.user_id === targetUserId);
    }, []);

    const getUserReaction = useCallback((reactions, userId = null) => {
        if (!reactions || !Array.isArray(reactions)) return null;
        
        const targetUserId = userId || window.Laravel?.user?.id;
        return reactions.find(reaction => reaction.user_id === targetUserId) || null;
    }, []);

    return {
        addReaction,
        getReactions,
        groupReactions,
        hasUserReacted,
        getUserReaction,
        isLoading,
        error,
        clearError: () => setError(null)
    };
};
