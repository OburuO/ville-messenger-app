import { useState, Fragment, useRef, useEffect } from "react";
import { PaperClipIcon, PhotoIcon, FaceSmileIcon, XCircleIcon, } from "@heroicons/react/24/outline";
import NewMessageInput from "./NewMessageInput";
import axios from "axios";
import { isAudio, isImage } from "@/helpers";
import AttachmentPreview from "./AttachmentPreview";
import CustomAudioPlayer from "./CustomAudioPlayer";
import AudioRecorder from "./AudioRecorder";
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { Send } from "lucide-react";

const MessageInput = ({ conversation = null }) => {
    const [newMessage, setNewMessage] = useState('');
    const [inputErrorMessage, setInputErrorMessage] = useState('');
    const [messageSending, setMessageSending] = useState(false);
    const [chosenFiles, setChosenFiles] = useState([]);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [showPicker, setShowPicker] = useState(false);
    const messageRef = useRef(null);
    const pickerRef = useRef(null);

    const onFileChange = (ev) => {
        const files = ev.target.files;

        const updatedFiles = [...files].map((file) => {
            return {
                file: file,
                url: URL.createObjectURL(file),
            };
        });
        ev.target.value = null;

        setChosenFiles((prevFiles) => {
            return [...prevFiles, ...updatedFiles];
        });
    };

    const onSendClick = () => {
        if (messageSending) return;

        if (newMessage.trim() === '' && chosenFiles.length === 0) {
            setInputErrorMessage('Please provide a message or upload files.')

            setTimeout(() => {
                setInputErrorMessage('');
            }, 3000);

            return;
        }

        const formData = new FormData();
        chosenFiles.forEach((file) => {
            formData.append('attachments[]', file.file);
        })
        formData.append('message', newMessage);

        if (conversation.is_user) {
            formData.append('receiver_id', conversation.id);
        } else if (conversation.is_group) {
            formData.append('group_id', conversation.id);
        }

        setMessageSending(true);
        axios.post(route('message.store'), formData, {
            onUploadProgress: (ProgressEvent) => {
                const progress = Math.round(
                    (ProgressEvent.loaded / ProgressEvent.total) * 100
                );
                setUploadProgress(progress);
            }
        }).then((response) => {
            setNewMessage('');
            setMessageSending(false);
            setUploadProgress(0);
            setChosenFiles([]);
        }).catch((error) => {
            setMessageSending(false);
            setChosenFiles([]);
            const message = error?.response?.data?.message;
            setInputErrorMessage(
                message || 'An error occured while sending message'
            );
            setTimeout(() => {
                setInputErrorMessage('');
            }, 3000);
        });
    }

    const recordedAudioReady = (file, url) => {
        setChosenFiles((prevFiles) => [...prevFiles, { file, url, }]);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                showPicker &&
                pickerRef.current &&
                !pickerRef.current.contains(event.target) &&
                !event.target.closest('.EmojiPickerReact')
            ) {
                setShowPicker(false);
            }
        };

        const handleMouseLeave = () => {
            setShowPicker(false);
        };

        document.addEventListener('mousedown', handleClickOutside);
        const element = messageRef.current;
        if (element) {
            element.addEventListener('mouseleave', handleMouseLeave);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            if (element) {
                element.removeEventListener('mouseleave', handleMouseLeave);
            }
        };
    }, [showPicker]);

    return (
        <div 
            data-message-input 
            className="flex flex-wrap items-start py-3" 
            ref={messageRef}
        >
            <div className="order-2 flex flex-1  px-3">
                <button className=" text-gray-400 hover:text-gray-300 relative flex flex-start justify-center">
                    <PaperClipIcon className="w-5 h-5" />
                    <input
                        type="file"
                        multiple
                        onChange={onFileChange}
                        className="absolute left-0 top-0 right-0 bottom-0 z-20 opacity-0 cursor-pointer"
                    />
                </button>
                <AudioRecorder fileReady={recordedAudioReady} />
            </div>
            <div className="order-1 px-3 sm:mx-2 xs:p-0 min-w-[220px] basis-full  flex-1 relative">
                <div className="flex"> 
                    <NewMessageInput
                        value={newMessage}
                        onSend={onSendClick}
                        onChange={(ev) => setNewMessage(ev.target.value)}
                        placeholder={"Type a message..."}
                        hasFiles={chosenFiles.length > 0}
                    />
                </div>{' '}
                {/* {!!uploadProgress && (
                    <progress
                        className="progress progress-info w-full"
                        value={uploadProgress}
                        max='100'
                    ></progress>
                )} */}
                {inputErrorMessage && (
                    <p className="text-xs text-red-400 mt-2">{inputErrorMessage}</p>
                )}
                <div className="flex flex-wrap gap-1 my-2">
                    {chosenFiles.map((file) => (
                        <div
                            key={file.file.name}
                            className={
                                `relative flex justify-between cursor-pointer` +
                                (!isImage(file.file) ? "w-[240px]" : "")
                            }
                        >
                            {isImage(file.file) && (
                                <img
                                    src={file.url}
                                    alt=""
                                    className="w-16 h-16 object-cover"
                                />
                            )}
                            {isAudio(file.file) && (
                                <CustomAudioPlayer
                                    file={file}
                                    showVolume={false}
                                />
                            )}
                            {!isAudio(file.file) && !isImage(file.file) && (
                                <AttachmentPreview file={file} />
                            )}

                            <button
                                onClick={() =>
                                    setChosenFiles(
                                        chosenFiles.filter(
                                            (f) =>
                                                f.file.name !== file.file.name
                                        )
                                    )
                                }
                                className="absolute w-6 h-6 rounded-full bg-gray-800 -right-2 -top-2 text-gray-300 hover:text-gray-100 z-10 flex items-center justify-center"
                            >
                                <XCircleIcon className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
            <div className="order-3 xs:order-3 pr-3 ">
                <div className="relative ">
                    <button
                        className="text-gray-400 hover:text-gray-300 flex justify-end"
                        onClick={() => setShowPicker(!showPicker)}
                    >
                        <FaceSmileIcon className="w-5 h-5" />
                    </button>
                    {showPicker && (
                        <div
                            className="absolute z-50 bottom-full right-0 mb-2"
                            onClick={(e) => e.stopPropagation()}
                            ref={pickerRef}
                        >
                            <div className="EmojiPickerReact">
                                <Picker
                                    data={data}
                                    onEmojiSelect={(emoji) => {
                                        setNewMessage(newMessage + emoji.native);
                                        setShowPicker(false);
                                    }}
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
                                    width={320}
                                    height={350}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MessageInput;