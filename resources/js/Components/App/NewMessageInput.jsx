import { Send } from "lucide-react";
import React, { useEffect, useRef } from "react";

const NewMessageInput = ({ value, onChange, onSend, placeholder, hasFiles = false }) => {
    const input = useRef();

    const onInputKeyDown = (ev) => {
        // Send on Enter if not on mobile/small screen and there's content or files
        if (ev.key === 'Enter' && !ev.shiftKey && window.innerWidth >= 768) { 
            if ((value && value.trim()) || hasFiles) {
                ev.preventDefault();
                onSend();
            }
        }
    };

    const onChangeEvent = (ev) => { 
        setTimeout(() => {
            adjustHeight();
        }, 10); 
        onChange(ev);
    }; 

    const adjustHeight = () => {
        setTimeout(() => {
            const textarea = input.current;
            textarea.style.height = "auto"; 
            textarea.style.height = textarea.scrollHeight + 1 + 'px';
            
            // Add or remove overflow class based on content height
            if (textarea.scrollHeight >= 160) { // 40rem = 160px
                textarea.classList.add('overflow');
            } else {
                textarea.classList.remove('overflow');
            }
        }, 100);
    };

    useEffect(() => {
      adjustHeight();
    }, [value]);
    
    return (
        <div className="relative w-full">
            <textarea 
                ref={input}
                value={value}
                rows='1'
                placeholder={placeholder}
                onKeyDown={onInputKeyDown}
                onChange={(ev) => onChangeEvent(ev)}
                className="input input-bordered w-full bg-black resize-none focus:outline-none max-h-40 custom-scrollbar pr-12"
            />
            {((value && value.trim()) || hasFiles) && (
                <button
                    onClick={onSend}
                    className="absolute top-2 right-3 p-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200 flex items-center justify-center"
                    aria-label="Send message"
                >
                    <Send className="h-4 w-4" />
                </button>
            )}
        </div>
    );
};

export default NewMessageInput;