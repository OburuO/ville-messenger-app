import ChatLayout from '@/Layouts/ChatLayout';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useCallback, useEffect, useRef, useState } from 'react';
import ConversationHeader from '@/Components/App/ConversationHeader';
import MessageItem from '@/Components/App/MessageItem';
import MessageInput from '@/Components/App/MessageInput';
import { useEventBus } from '@/EventBus';
import axios from 'axios';
import AttachmentPreviewModal from '@/Components/App/AttachmentPreviewModal';
import { Head, usePage } from '@inertiajs/react';
import WelcomeMessage from '@/Components/App/WelcomeMessage';

function Home({ selectedConversation = null, messages = null }) { 
    const page = usePage();
    const user = page.props.auth.user;
    const [localMessages, setLocalMessages] = useState([]);
    const [noMoreMessages, setNoMoreMessages] = useState(false);
    const [scrollFromBottom, setScrollFromBottom] = useState(0);
    const loadMoreIntersect = useRef(null);
    const messagesCtrRef = useRef(null);
    const [showAttachmentPreview, setShowAttachmentPreview] = useState(false);
    const [previewAttachment, setPreviewAttachment] = useState({});
    const { on } = useEventBus();

    const shouldShowDate = (currentMessage, previousMessage) => {
        if (!previousMessage) return true;

        const currentDate = new Date(currentMessage.created_at).toDateString();
        const previousDate = new Date(previousMessage.created_at).toDateString();

        return currentDate !== previousDate;
    };

    const messageCreated = (message) => {
        if (
            selectedConversation &&
            selectedConversation.is_group &&
            selectedConversation.id == message.group_id
        ) {
            setLocalMessages((prevMessages) => [...prevMessages, message]);
        }

        if (
            selectedConversation &&
            selectedConversation.is_user &&
            (selectedConversation.id == message.sender_id ||
                selectedConversation.id == message.receiver_id)
        ) {
            setLocalMessages((prevMessages) => [...prevMessages, message]);
        }
    };

    const messageDeleted = ({ message }) => {
        if (
            selectedConversation &&
            selectedConversation.is_group &&
            selectedConversation.id == message.group_id
        ) {
            setLocalMessages((prevMessages) => {
                return prevMessages.filter((m) => m.id !== message.id);
            });
        }

        if (
            selectedConversation &&
            selectedConversation.is_user &&
            (selectedConversation.id == message.sender_id ||
                selectedConversation.id == message.receiver_id)
        ) {
            setLocalMessages((prevMessages) => {
                return prevMessages.filter((m) => m.id !== message.id);
            });
        }
    };

    const loadMoreMessages = useCallback(() => {
        if (noMoreMessages) {
            return;
        }

        const firstMessage = localMessages[0];
        axios
            .get(route('message.loadOlder', firstMessage.id))
            .then(({ data }) => {
                if (data.data.length === 0) {
                    setNoMoreMessages(true);
                    return;
                }

                const scrollHeight = messagesCtrRef.current.scrollHeight;
                const scrollTop = messagesCtrRef.current.scrollTop;
                const clientHeight = messagesCtrRef.current.clientHeight;
                const tmpScrollFromBottom = scrollHeight - scrollTop - clientHeight;
                setScrollFromBottom(scrollHeight - scrollTop - clientHeight);

                setLocalMessages((prevMessages) => {
                    return [...data.data.reverse(), ...prevMessages];
                });
            });
    }, [localMessages, noMoreMessages]);

    const onAttachmentClick = (attachments, ind) => {
        setPreviewAttachment({
            attachments, 
            ind,
        });
        setShowAttachmentPreview(true);
    };

    // Update message reactions
    const updateMessageReactions = useCallback((messageId, reactions) => {
        setLocalMessages((prevMessages) =>
            prevMessages.map((message) =>
                message.id === messageId
                    ? { ...message, reactions: reactions }
                    : message
            )
        );
    }, []);

    useEffect(() => {
        setTimeout(() => {
            if (messagesCtrRef.current) {
                messagesCtrRef.current.scrollTop =
                    messagesCtrRef.current.scrollHeight;
            }
        }, 10);

        const offCreated = on('message.created', messageCreated);
        const offDeleted = on('message.deleted', messageDeleted);

        setScrollFromBottom(0);
        setNoMoreMessages(false);

        return () => {
            offCreated();
            offDeleted();
        };
    }, [selectedConversation]);

    useEffect(() => {
        setLocalMessages(messages ? messages.data.reverse() : []);
    }, [messages]);
    
    useEffect(() => {
        if (messagesCtrRef.current && scrollFromBottom !== null) {
            messagesCtrRef.current.scrollTop =
                messagesCtrRef.current.scrollHeight -
                messagesCtrRef.current.offsetHeight -
                scrollFromBottom;
        }

        if (noMoreMessages) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) =>
                entries.forEach(
                    (entry) => entry.isIntersecting && loadMoreMessages()
                ),
            {
                rootMargin: '0px 0px 250px 0px',
            }
        );

        if (loadMoreIntersect.current) {
            setTimeout(() => {
                observer.observe(loadMoreIntersect.current);
            }, 100);
        }

        return () => {
            observer.disconnect();
        };
    }, [localMessages]);

    return (
        <>
            <Head title="Home" />
            
            {!messages && (
                <div className='flex flex-col flex-1 overflow-y-auto mb-16 sm:mb-0'> 
                    <WelcomeMessage />
                </div>
            )}

            {messages && (
                <div className="flex flex-col flex-1 min-h-0">
                    <ConversationHeader selectedConversation={selectedConversation} />
                    <div ref={messagesCtrRef} className='flex-1 overflow-y-auto overflow-x-hidden p-5'>
                        {localMessages.length === 0 && (
                            <div className='text-lg text-slate-200'>No messages found</div>
                        )}
                        {localMessages.length > 0 && (
                            <div className='flex-1 flex flex-col'>
                                <div ref={loadMoreIntersect}></div> 
                                {localMessages.map((message, index) => (
                                    <MessageItem
                                        key={message.id}
                                        message={message}
                                        showDate={shouldShowDate(message, localMessages[index - 1])}
                                        attachmentClick={onAttachmentClick}
                                        onReact={(reactions) => updateMessageReactions(message.id, reactions)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="flex-shrink-0 mb-12 sm:mb-0">
                        <MessageInput conversation={selectedConversation} />
                    </div>
                </div>
            )}
            {previewAttachment.attachments && (
                <AttachmentPreviewModal
                    attachments={previewAttachment.attachments}
                    index={previewAttachment.ind}
                    show={showAttachmentPreview}
                    onClose={() => setShowAttachmentPreview(false)} 
                />
            )}
        </>
    );
}

Home.layout = (page) => {
    return (
        <AuthenticatedLayout user={page.props.auth.user}>
            <ChatLayout children={page} />
        </AuthenticatedLayout>
    );
};

export default Home;