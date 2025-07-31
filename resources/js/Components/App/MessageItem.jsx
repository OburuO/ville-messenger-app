import { usePage } from "@inertiajs/react";
import ReactMarkDown from "react-markdown";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import UserAvatar from "./UserAvatar";
import { formatMessageDateLong } from "@/helpers";
import MessageAttachments from "./MessageAttachments";
import MessageOptionsDropdown from "./MessageOptionsDropdown";
import { useReactions } from "../../../js/helpers";
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { FaceSmileIcon, XMarkIcon } from '@heroicons/react/24/outline'; 

const MessageItem = ({ message, attachmentClick, onReact }) => {
    const currentUser = usePage().props.auth.user;
    const [showPicker, setShowPicker] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [pickerPosition, setPickerPosition] = useState({ 
        top: 0, 
        left: 0, 
        right: 'auto',
        maxHeight: 350,
        preferredPosition: 'top',
        visible: false 
    });
    const messageRef = useRef(null);
    const optionsRef = useRef(null);
    const emojiButtonRef = useRef(null);
    const pickerRef = useRef(null);
    const hoverTimeoutRef = useRef(null);
    const savedScrollPosition = useRef(0);
    
    // Use the reactions hook
    const { 
        addReaction, 
        groupReactions, 
        hasUserReacted, 
        isLoading, 
        error 
    } = useReactions();

    const calculatePickerPosition = useCallback(() => {
        if (!emojiButtonRef.current || !showPicker) return;

        const buttonRect = emojiButtonRef.current.getBoundingClientRect();
        const messageRect = messageRef.current?.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Check if mobile
        const isMobile = viewportWidth < 768;
        
        // For mobile, we'll use drawer - no positioning calculation needed
        if (isMobile) {
            setPickerPosition(prev => {
                if (prev.visible && prev.isMobile) return prev; // Avoid unnecessary updates
                return {
                    visible: true,
                    isMobile: true
                };
            });
            return;
        }
        
        const conversationHeader = document.querySelector('[data-conversation-header]') || 
                                 document.querySelector('.conversation-header') ||
                                 document.querySelector('header') ||
                                 document.querySelector('[class*="header"]');
        
        const messageInput = document.querySelector('[data-message-input]') || 
                           document.querySelector('.message-input') ||
                           document.querySelector('form[data-message-form]') ||
                           document.querySelector('.fixed.bottom-0') ||
                           document.querySelector('.sticky.bottom-0') ||
                           document.querySelector('[class*="input"]');
        
        const headerHeight = conversationHeader ? conversationHeader.getBoundingClientRect().bottom : 80;
        const inputTop = messageInput ? messageInput.getBoundingClientRect().top : viewportHeight - 100;
        
        const pickerWidth = 320;
        const pickerHeight = 350;
        const buffer = 10;
        
        const spaceAbove = buttonRect.top - headerHeight - buffer;
        const spaceBelow = inputTop - buttonRect.bottom - buffer;
        
        let top = 0;
        let left = 'auto';
        let right = 'auto';
        let maxHeight = pickerHeight;
        let preferredPosition = 'top';
        
        if (spaceAbove >= pickerHeight) {
            top = buttonRect.top - pickerHeight - buffer;
            preferredPosition = 'top';
            maxHeight = Math.min(pickerHeight, spaceAbove);
        } else if (spaceBelow >= pickerHeight) {
            top = buttonRect.bottom + buffer;
            preferredPosition = 'bottom';
            maxHeight = Math.min(pickerHeight, spaceBelow);
        } else {
            if (spaceAbove > spaceBelow) {
                top = headerHeight + buffer;
                preferredPosition = 'top';
                maxHeight = Math.max(200, spaceAbove);
            } else {
                top = buttonRect.bottom + buffer;
                preferredPosition = 'bottom';
                maxHeight = Math.max(200, spaceBelow);
            }
        }
        
        // Desktop horizontal positioning
        const isOwnMessage = message.sender_id === currentUser.id;

        if (isOwnMessage) {
            // For own messages, your original working calculation
            left = buttonRect.left + (buttonRect.width) - pickerWidth + (buttonRect.width);
            
            if (left < buffer) {
                left = buffer;
            }
        } else {
            left = buttonRect.left;
            
            if (left + pickerWidth > viewportWidth - buffer) {
                left = viewportWidth - pickerWidth - buffer;
            }
        }

        const newPosition = {
            top,
            left,
            right,
            maxHeight,
            preferredPosition,
            visible: true,
            width: pickerWidth,
            isMobile: false
        };

        // Only update if position actually changed significantly
        setPickerPosition(prev => {
            if (prev.visible && !prev.isMobile && 
                Math.abs(prev.top - newPosition.top) < 5 && 
                Math.abs(prev.left - newPosition.left) < 5 &&
                Math.abs(prev.maxHeight - newPosition.maxHeight) < 10) {
                return prev; // No significant change, don't update
            }
            return newPosition;
        });
    }, [showPicker, message.sender_id, currentUser.id]);

    // Position updates and event handlers
    useEffect(() => {
        if (showPicker) {
            const timer = setTimeout(() => {
                calculatePickerPosition();
            }, 10);
            
            let resizeTimer;
            let scrollTimer; 
            
            const handleResize = () => {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(calculatePickerPosition, 100);
            };
            
            const handleScroll = () => {
                clearTimeout(scrollTimer);
                scrollTimer = setTimeout(calculatePickerPosition, 50);
            };
            
            window.addEventListener('resize', handleResize);
            window.addEventListener('scroll', handleScroll, true);
            
            return () => {
                clearTimeout(timer);
                clearTimeout(resizeTimer);
                clearTimeout(scrollTimer);
                window.removeEventListener('resize', handleResize);
                window.removeEventListener('scroll', handleScroll, true);
            };
        } else {
            setPickerPosition(prev => ({ ...prev, visible: false }));
        }
    }, [showPicker, calculatePickerPosition]);

    // Close picker when clicking outside (desktop only)
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showPicker && 
                pickerRef.current && 
                !pickerRef.current.contains(event.target) &&
                !emojiButtonRef.current?.contains(event.target)) {
                
                // On mobile, only close if clicking the backdrop
                const isMobile = window.innerWidth < 768;
                if (isMobile && !event.target.classList.contains('emoji-drawer-backdrop')) {
                    return;
                }
                
                setShowPicker(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showPicker]);

    // Desktop hover handlers
    const handleEmojiHoverEnter = () => {
        const isMobile = window.innerWidth < 768;
        if (isMobile) return; // No hover on mobile
        
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
        }
        setShowPicker(true);
        setShowOptions(false);
    };

    const handleEmojiHoverLeave = () => {
        const isMobile = window.innerWidth < 768;
        if (isMobile) return;
        
        hoverTimeoutRef.current = setTimeout(() => {
            setShowPicker(false);
        }, 150);
    };

    const handlePickerHoverEnter = () => {
        const isMobile = window.innerWidth < 768;
        if (isMobile) return;
        
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
        }
    };

    const handlePickerHoverLeave = () => {
        const isMobile = window.innerWidth < 768;
        if (isMobile) return;
        
        hoverTimeoutRef.current = setTimeout(() => {
            setShowPicker(false);
        }, 150);
    };

    useEffect(() => {
        return () => {
            if (hoverTimeoutRef.current) {
                clearTimeout(hoverTimeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        const handleMouseLeave = (e) => {
            if (!e.relatedTarget?.closest('.message-options-dropdown') && 
                !e.relatedTarget?.closest('[data-options-dropdown]') &&
                !e.relatedTarget?.closest('[data-options-button]')) {
                setShowOptions(false);
            }
        };

        const element = messageRef.current;
        if (element) {
            element.addEventListener('mouseleave', handleMouseLeave);
            return () => {
                element.removeEventListener('mouseleave', handleMouseLeave);
            };
        }
    }, []);

    const handleReaction = async (emoji) => {
        if (!emoji || (!emoji.native && typeof emoji !== 'string')) {
            console.error('Invalid emoji selection');
            return;
        }

        const emojiString = typeof emoji === 'string' ? emoji : emoji.native;

        try {
            setShowPicker(false);
            
            const result = await addReaction('messages', message.id, emojiString);
            
            if (result.success) {
                onReact(result.reactions);
            } else {
                console.error('Failed to add reaction:', result.error);
            }
        } catch (error) {
            console.error('Error handling reaction:', error);
        }
    };

    const groupedReactions = groupReactions(message.reactions || []);

    const handleOptionsToggle = (newState) => {
        if (newState) {
            setShowPicker(false);
        }
        setShowOptions(newState);
    };

    const handleReactionClick = (reactionEmoji) => {
        handleReaction(reactionEmoji);
    };

    // Mobile Drawer Component
    const MobileEmojiDrawer = () => {
        if (!showPicker || !pickerPosition.visible || !pickerPosition.isMobile) return null;

        return createPortal(
            <div className="fixed inset-0 z-[10000] flex flex-col">
                {/* Backdrop */}
                <div 
                    className="emoji-drawer-backdrop flex-1 bg-black/50 backdrop-blur-sm"
                    onClick={() => setShowPicker(false)}
                />
                
                <div 
                    ref={pickerRef}
                    className="bg-black rounded-t-2xl shadow-2xl animate-slide-up flex flex-col max-h-[70vh]"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Choose an emoji</h3>
                        <button
                            onClick={() => setShowPicker(false)}
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <XMarkIcon className="h-6 w-6 text-gray-500" />
                        </button>
                    </div>
                    
                    <div className="flex-1 overflow-hidden flex items-center justify-center p-4">
                        <Picker
                            data={data}
                            onEmojiSelect={handleReaction}
                            theme="dark"
                            previewPosition="none"
                            skinTonePosition="none"
                            searchPosition="top"
                            perLine={8}
                            maxFrequentRows={2}
                            navPosition="bottom"
                            emojiSize={24}
                            emojiButtonSize={32}
                            categories={["frequent", "people", "nature", "foods", "activity", "objects", "symbols"]}
                            set="native"
                            width="100%"
                            height={400}
                        />
                    </div>
                </div>
            </div>,
            document.body
        );
    };

    const DesktopEmojiPickerPortal = () => {
        if (!showPicker || !pickerPosition.visible || pickerPosition.isMobile) return null;

        const handlePickerMount = (element) => {
            if (element && savedScrollPosition.current > 0) {
                setTimeout(() => {
                    if (element) {
                        element.scrollTop = savedScrollPosition.current;
                    }
                }, 0);
            }
        };

        const handleScroll = (e) => {
            savedScrollPosition.current = e.target.scrollTop;
        };

        return createPortal(
            <div
                ref={pickerRef}
                className="fixed z-[10000] transition-all duration-200 ease-out"
                style={{
                    top: `${pickerPosition.top}px`,
                    left: `${pickerPosition.left}px`,
                    width: `${pickerPosition.width}px`,
                    maxHeight: `${pickerPosition.maxHeight}px`,
                    opacity: pickerPosition.visible ? 1 : 0,
                    transform: pickerPosition.visible ? 'scale(1)' : 'scale(0.95)',
                    transformOrigin: pickerPosition.preferredPosition === 'top' ? 'bottom' : 'top'
                }}
                onClick={(e) => e.stopPropagation()}
                onMouseEnter={handlePickerHoverEnter}
                onMouseLeave={handlePickerHoverLeave}
            >
                <div 
                    ref={handlePickerMount}
                    className="bg-black rounded-lg shadow-2xl overflow-hidden w-fit"
                    style={{
                        maxHeight: `${pickerPosition.maxHeight}px`,
                        overflowY: 'auto'
                    }}
                    onScroll={handleScroll}
                >
                    <Picker
                        data={data}
                        onEmojiSelect={handleReaction}
                        theme="dark"
                        previewPosition="none"
                        skinTonePosition="none"
                        searchPosition="top"
                        perLine={9}
                        maxFrequentRows={1}
                        navPosition="bottom"
                        emojiSize={20}
                        emojiButtonSize={28}
                        categories={["frequent", "people", "nature", "foods", "activity", "objects", "symbols"]}
                        set="native"
                        width={pickerPosition.width}
                        height={Math.min(pickerPosition.maxHeight, 350)}
                    />
                </div>
            </div>,
            document.body
        );
    };

    return (
        <div
            ref={messageRef}
            data-message-item
            className={
                "flex items-start gap-2 mb-4 " +
                (message.sender_id === currentUser.id
                    ? "flex-row-reverse"
                    : "flex-row"
                )
            }
        >
            <div className="flex-shrink-0">
                {<UserAvatar user={message.sender} />}
            </div>
            <div className="flex flex-col max-w-[60%] sm:max-w-[70%] md:max-w-[60%]">
                <div className="flex items-center gap-2 mb-1">
                    {message.sender_id !== currentUser.id && (
                        <span className="text-sm font-medium">
                            {message.sender.name}
                        </span>
                    )}
                </div>
                <div
                    className={
                        "relative group px-4 py-2 " +
                        (message.sender_id === currentUser.id
                            ? "bg-blue-500 text-white rounded-[18px] rounded-tr-sm"
                            : "bg-gray-100 text-gray-900 rounded-[18px] rounded-tl-sm"
                        )
                    }
                >
                    <div className="flex flex-col relative">
                        <div
                            className={
                                "absolute top-0 -translate-y-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center bg-gray-400 px-1 py-[1px] rounded-full " +
                                (message.sender_id === currentUser.id
                                    ? "right-0"
                                    : "left-0"
                                )
                            }
                        >
                            <div className="flex items-center gap-2">
                                {message.sender_id === currentUser.id && ( 
                                    <div
                                        ref={optionsRef}
                                        className="message-options-button flex items-center"
                                    >
                                        <MessageOptionsDropdown
                                            message={message}
                                            className="text-gray-500 hover:text-gray-700"
                                            isOpen={showOptions}
                                            setIsOpen={setShowOptions}
                                        />
                                    </div>
                                )}
                                <div
                                    ref={emojiButtonRef}
                                    className="relative flex items-center justify-center"
                                    onMouseEnter={handleEmojiHoverEnter}
                                    onMouseLeave={handleEmojiHoverLeave}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowPicker(!showPicker);
                                        setShowOptions(false);
                                    }}
                                >
                                    <FaceSmileIcon 
                                        className={`h-5 w-5 text-gray-500 hover:text-gray-700 transition-colors duration-150 ${
                                            isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                                        } ${showPicker ? 'text-blue-500' : ''}`} 
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="chat-message-content break-words">
                            <ReactMarkDown>{message.message}</ReactMarkDown>
                        </div>
                        <MessageAttachments
                            attachments={message.attachments}
                            attachmentClick={attachmentClick}
                        />
                        <div className="flex justify-between items-end mt-1">
                            {groupedReactions.length > 0 && (
                                <div className="-mb-5 ml-1">
                                    <div
                                        className={
                                            "flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs shadow-sm " +
                                            (message.sender_id === currentUser.id
                                                ? "bg-blue-700/95"
                                                : "bg-white border border-gray-200"
                                            )
                                        }
                                    >
                                        {groupedReactions.map((reaction, index) => ( 
                                            <span
                                                key={index}
                                                className={`cursor-pointer text-sm hover:scale-110 transition-transform duration-150 ${
                                                    reaction.user_reacted ? 'ring-1 ring-blue-400 rounded' : ''
                                                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                onClick={() => !isLoading && handleReactionClick(reaction.emoji)}
                                                title={`${reaction.count} reaction${reaction.count > 1 ? 's' : ''}`}
                                            >
                                                {reaction.emoji}
                                            </span>
                                        ))}
                                        <span className={
                                            "ml-0.5 text-[10px] font-medium " +
                                            (message.sender_id === currentUser.id
                                                ? "text-white/90"
                                                : "text-gray-600"
                                            )
                                        }>
                                            {groupedReactions.reduce((sum, reaction) => sum + reaction.count, 0)}
                                        </span>
                                    </div>
                                </div>
                            )}
                            <time className="text-[10px] text-gray-500 ml-auto">
                                {formatMessageDateLong(message.created_at)}
                            </time>
                        </div>
                    </div>
                    
                    {/* Error display */}
                    {error && (
                        <div className="absolute top-full left-0 mt-1 text-xs text-red-500 bg-red-50 px-2 py-1 rounded shadow-sm z-10">
                            {error}
                        </div>
                    )}
                </div>
            </div>
            
            <MobileEmojiDrawer />
            
            <DesktopEmojiPickerPortal />
        </div>
    );
};

export default MessageItem;