import { Fragment, useEffect, useRef, useState } from "react";
import { TrashIcon } from "@heroicons/react/24/solid";
import axios from "axios";
import { Menu, Transition } from "@headlessui/react";
import { useEventBus } from "@/EventBus";
import { EllipsisHorizontalCircleIcon } from "@heroicons/react/24/outline";
import { createPortal } from "react-dom";

export default function MessageOptionsDropdown({ message, isOpen, setIsOpen, onMouseLeave }) {
    const { emit } = useEventBus();
    const buttonRef = useRef(null);
    const menuRef = useRef(null);
    const closeTimeoutRef = useRef(null);
    const [dropdownPosition, setDropdownPosition] = useState({
        top: 0,
        left: 0,
        right: 'auto',
        preferredPosition: 'bottom',
        visible: false,
        width: 192 // w-48 = 12rem = 192px
    });

    // Calculate optimal dropdown position
    const calculateDropdownPosition = () => {
        if (!buttonRef.current || !isOpen) return;

        const buttonRect = buttonRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Get references to key elements with better fallbacks
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
        
        // Calculate boundaries with safe defaults
        const headerHeight = conversationHeader ? conversationHeader.getBoundingClientRect().bottom : 80;
        const inputTop = messageInput ? messageInput.getBoundingClientRect().top : viewportHeight - 100;
        
        // Dropdown dimensions
        const dropdownWidth = 192; // w-48
        const dropdownHeight = 60; // Approximate height for single item
        const buffer = 8;
        
        // Calculate available spaces within conversation boundaries
        const spaceAbove = buttonRect.top - headerHeight - buffer;
        const spaceBelow = inputTop - buttonRect.bottom - buffer;
        const spaceLeft = buttonRect.left;
        const spaceRight = viewportWidth - buttonRect.right;
        
        let top = 0;
        let left = 'auto';
        let right = 'auto';
        let preferredPosition = 'bottom';
        
        // Determine vertical position within conversation boundaries
        if (spaceBelow >= dropdownHeight) {
            // Position below (preferred)
            top = buttonRect.bottom + buffer;
            preferredPosition = 'bottom';
        } else if (spaceAbove >= dropdownHeight) {
            // Position above
            top = buttonRect.top - dropdownHeight - buffer;
            preferredPosition = 'top';
        } else {
            // Choose the larger space but constrain to conversation area
            if (spaceAbove > spaceBelow) {
                top = Math.max(headerHeight + buffer, buttonRect.top - dropdownHeight - buffer);
                preferredPosition = 'top';
            } else {
                top = Math.min(inputTop - dropdownHeight - buffer, buttonRect.bottom + buffer);
                preferredPosition = 'bottom';
            }
        }
        
        // Ensure dropdown doesn't extend beyond conversation boundaries
        top = Math.max(headerHeight + buffer, Math.min(top, inputTop - dropdownHeight - buffer));
        
        // Determine horizontal position - align with button
        // Position dropdown to align with the button (typically right-aligned for own messages)
        if (spaceRight >= dropdownWidth) {
            // Position to the right of the button
            left = buttonRect.left;
        } else if (spaceLeft >= dropdownWidth) {
            // Position to the left of the button (align right edge)
            left = buttonRect.right - dropdownWidth;
        } else {
            // Center or fit within viewport
            left = Math.max(buffer, Math.min(
                buttonRect.left,
                viewportWidth - dropdownWidth - buffer
            ));
        }
        
        setDropdownPosition({
            top,
            left,
            right,
            preferredPosition,
            visible: true,
            width: dropdownWidth
        });
    };

    // Update position when dropdown opens or window changes
    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                calculateDropdownPosition();
            }, 10);
            
            let resizeTimer;
            let scrollTimer;
            
            const handleResize = () => {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(calculateDropdownPosition, 100);
            };
            
            const handleScroll = () => {
                clearTimeout(scrollTimer);
                scrollTimer = setTimeout(calculateDropdownPosition, 50);
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
            setDropdownPosition(prev => ({ ...prev, visible: false }));
        }
    }, [isOpen]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isOpen && 
                menuRef.current && 
                !menuRef.current.contains(event.target) &&
                !buttonRef.current?.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, setIsOpen]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (closeTimeoutRef.current) {
                clearTimeout(closeTimeoutRef.current);
            }
        };
    }, []);

    function onMessageDelete() {
        //console.log('Delete message');
        axios
            .delete(route('message.destroy', message.id)) 
            .then((res) => {
                emit('message.deleted', {
                    message, 
                    prevMessage: res.data.message, 
                });
                setIsOpen(false);
                //console.log(res.data);
            })
            .catch((err) => {                     
                console.error(err);
            }); 
    }

    // Handle mouse enter - cancel any pending close
    const handleMouseEnter = () => {
        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current);
            closeTimeoutRef.current = null;
        }
        setIsOpen(true);
    };

    // Handle mouse leave with delay
    const handleMouseLeave = (event) => {
        // Check if mouse is moving to button or staying within the dropdown area
        const relatedTarget = event.relatedTarget;
        
        // If moving back to the button, don't close
        if (relatedTarget && (
            relatedTarget.closest('.message-options-button') ||
            relatedTarget.closest('[data-options-button]') ||
            menuRef.current?.contains(relatedTarget)
        )) {
            return;
        }

        // Set a delay before closing
        closeTimeoutRef.current = setTimeout(() => {
            setIsOpen(false);
        }, 150);
    };

    // Portal-based dropdown for proper positioning
    const DropdownPortal = () => {
        if (!isOpen || !dropdownPosition.visible) return null;

        return createPortal(
            <div
                ref={menuRef}
                className="message-options-dropdown fixed z-[10000] transition-all duration-100 ease-out"
                data-options-dropdown
                style={{
                    top: `${dropdownPosition.top}px`,
                    left: `${dropdownPosition.left}px`,
                    width: `${dropdownPosition.width}px`,
                    opacity: dropdownPosition.visible ? 1 : 0,
                    transform: dropdownPosition.visible ? 'scale(1)' : 'scale(0.95)',
                    transformOrigin: dropdownPosition.preferredPosition === 'top' ? 'bottom' : 'top'
                }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <div className="w-48 rounded-md bg-gray-800 shadow-lg border border-gray-700">
                    <div className="px-1 py-1">
                        <button
                            onClick={onMessageDelete}
                            className="group flex w-full items-center rounded-md px-2 py-2 text-sm text-gray-100 hover:bg-black/30 hover:text-white transition-colors duration-150"
                        >
                            <TrashIcon className="w-4 h-4 mr-2" />
                            Delete
                        </button>
                    </div>
                </div>
            </div>,
            document.body
        );
    };
    
    return (
        <>
            <div 
                ref={buttonRef}
                className="flex justify-center items-center cursor-pointer"
                data-options-button
                onClick={(e) => {
                    e.stopPropagation();
                    // Cancel any pending close when clicking
                    if (closeTimeoutRef.current) {
                        clearTimeout(closeTimeoutRef.current);
                        closeTimeoutRef.current = null;
                    }
                    setIsOpen(!isOpen);
                }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <EllipsisHorizontalCircleIcon className="h-5 w-5 rotate-90" />
            </div>
            
            {/* Portal-based Dropdown */}
            <DropdownPortal />
        </>
    );
}