import React, { useEffect, useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import ConversationItem from '@/Components/App/ConversationItem';
import { useEventBus } from '@/EventBus';
import { useRecoilState } from 'recoil';
import { screenState, convoState, sliderRailState } from '../atoms';
import GroupModal from '@/Components/App/GroupModal'; 
import BottomMenu from '@/Components/App/Footer';
import { PlusIcon } from '@heroicons/react/24/outline';
import Sidebar from '@/Components/App/Sidebar';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/solid';
import Header from '@/Components/App/Header';
import Footer from '@/Components/App/Footer';
import { AlignRight } from 'lucide-react';

function ChatLayout({ children }) { 
    const page = usePage();
    const user = page.props.auth.user;
    const [home] = useRecoilState(screenState);
    const [convo, setConvo] = useRecoilState(convoState);
    const [showSliderRail, setShowSliderRail] = useRecoilState(sliderRailState);
    const conversations = page.props.conversations;
    const selectedConversation = page.props.selectedConversation;
    const [localConversations, setLocalConversations] = useState([]);
    const [sortedConversations,  setSortedConversations] = useState([]); 
    const [onlineUsers, setOnlineUsers] = useState({});
    const [showGroupModal, setShowGroupModal] = useState(false);
    const { emit, on } = useEventBus();
    
    const isUsersOnline = (userId) => onlineUsers[userId]; 

    const onSearch = (ev) => {
        const search = ev.target.value.toLowerCase();
        setLocalConversations(
            conversations.filter((conversation) => {
                return conversation.name.toLowerCase().includes(search)
            })
        );
    };

    const messageCreated = (message) => {
        setLocalConversations((oldUsers) => {
            return oldUsers.map((u) => {
                // if the message is for user
                if (
                    message.receiver_id &&
                    !u.is_group &&
                    (u.id == message.sender_id || 
                        u.id == message.receiver_id)
                ) {
                    u.last_message = message.message;
                    u.last_message_date = message.created_at;
                    return u;
                }

                // if the message is for group
                if (
                    message.group_id && 
                    u.is_group &&
                    u.id == message.group_id
                ) {
                    u.last_message = message.message; 
                    u.last_message_date = message.created_at;
                    return u;
                }

                return u;
            });
        });
    };

    const messageDeleted = ({ prevMessage }) => {
        if (!prevMessage) return;

        // Find the conversation by prevMessage and updated its last_message_id and date
        messageCreated(prevMessage);
    }

    useEffect(() => {
        const offCreated = on('message.created', messageCreated);
        const offDeleted = on('message.deleted', messageDeleted);
        const offModalShow = on('GroupModal.show', (group) => {
            setShowGroupModal(true);
        });

        const offGroupDeleted = on('group.deleted', ({ id, name }) => {
            setLocalConversations((oldConversations) => {
                return oldConversations.filter((con) => con.id != id);
            });

            emit('toast.show', `Group "${name}" was deleted`);

            if (
                !selectedConversation ||
                selectedConversation &&
                selectedConversation.is_group && 
                selectedConversation.id == id
            ) {
                router.visit(route('dashboard'));
            }
        });

        // unsubscribe to a particular event
        return () => {
            offCreated();
            offDeleted();
            offModalShow();
            offGroupDeleted();
        };
    }, [on]);
 
    useEffect(() => {
        setSortedConversations(
            localConversations.sort((a, b) => {
                if (a.blocked_at && b.blocked_at ) {
                    return a.blocked_at > b.blocked_at ? 1 : -1;
                } else if (a.blocked_at) {
                    return 1;
                } else if (b.blocked_at) {
                    return -1;
                }

                if (a.last_message_date && b.last_message_date) {
                    return b.last_message_date.localeCompare(
                        a.last_message_date
                    );
                } else if (a.last_message_date) {
                    return -1;
                } else if (b.last_message_date) {
                    return 1;
                } else {
                    return 0;
                }
            })
        );
    }, [localConversations]); 

    useEffect(() => {
        setLocalConversations(conversations);
    }, [conversations]);
    
    useEffect (() => {
        Echo.join('online')
            .here((users) => {
                const onlineUserObj = Object.fromEntries(
                    users.map((user) => [user.id, user])
                );

                setOnlineUsers((prevOnlineUsers) => {
                    return { ...prevOnlineUsers, ...onlineUserObj };
                })
            })
            .joining((user) => {
                setOnlineUsers((prevOnlineUsers) => {
                    const updatedUsers = {...prevOnlineUsers}; 
                    updatedUsers[user.id] = user;
                    return updatedUsers;
                }); 
            })
            .leaving((user) => {
                setOnlineUsers((prevOnlineUsers) => {
                    const updatedUsers = {...prevOnlineUsers};
                    delete updatedUsers[user.id];
                    return updatedUsers;
                });
            })
            .error((error) => {
                console.error('error', error);
            });
        
        return () => {
            Echo.leave('online');
        }
    }, []);

    return (
        <>
            <div className='flex w-full'>
                <Sidebar />
                <div className='flex flex-col h-screen w-full'>
                    
                    <div className={`flex-1 w-full flex overflow-hidden ${!selectedConversation ? 'mb-16 md:mb-0' : ''}`}>
                        <div className={`transition-all w-full md:w-[300px] md:border-r border-gray-800 flex flex-col overflow-hidden ${selectedConversation || home ? '-ml-[100%] md:ml-0' : ''} ${convo ? 'lg:hidden' : ''}`}>
                            <div className='flex items-center justify-between py- text-2xl font-bold text-gray-100 h-10 px-3 mb-1'>
                                Conversations
                                <div className='flex items-center gap-2'>
                                    <div
                                        className='tooltip tooltip-left hidden md:inline'
                                        data-tip='Create new Group' 
                                    >
                                        <button
                                            onClick={ev => setShowGroupModal(true)}
                                            className='hover:text-gray-200'
                                        >
                                            <PlusIcon className='w-5 h-5 inline-block ml-2'/> 
                                        </button>
                                    </div>
                                    <div
                                        className='tooltip tooltip-left hidden lg:inline'
                                        data-tip='Close Conversations' 
                                    >
                                        <button
                                            onClick={ev => setConvo(!convo)}
                                            className='hover:text-gray-200'
                                        >
                                            <XMarkIcon className='w-5 h-5 inline-block ml-2'/>
                                        </button>
                                    </div>
                                    <AlignRight 
                                        className="w-6 h-6 md:hidden cursor-pointer ml-3"
                                        onClick={() => setShowSliderRail(!showSliderRail)}
                                    />
                                </div>
                            </div>
                            <div className="relative px-3 mb-1">
                                <div className="absolute inset-y-0 pl-3 flex items-center pointer-events-none">
                                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-500" />
                                </div>
                                <input
                                    className="bg-black block w-full pl-10 sm:text-sm border-gray-800 focus:ring-gray-500 focus:border-black rounded-lg py-1"
                                    type="text"
                                    onKeyUp={onSearch}
                                    placeholder="Quick Search..."
                                />
                            </div>
                            <div className='flex-1 overflow-auto mb-16 sm:mb-0'>
                                {sortedConversations && sortedConversations.map((conversation) => (
                                    <ConversationItem
                                        key={`${
                                            conversation.is_group
                                                ? 'group_'
                                                : 'user_' 
                                        }${conversation.id}`}
                                        conversation={conversation}
                                        online={!!isUsersOnline(conversation.id)}
                                        selectedConversation={selectedConversation}
                                    />
                                ))}
                            </div>
                        </div>   
                        
                        <div className="flex-1 flex flex-col overflow-hidden"> 
                            <Header user={user} hidden={selectedConversation} />
                            <div className="flex-1 flex flex-col min-h-0">
                                {children}
                            </div>
                        </div>  
                    </div>
                    
                    <Footer hidden={selectedConversation} />
                </div>
            </div>
            <GroupModal 
                show={showGroupModal} 
                onClose={() => setShowGroupModal(false)} 
            />
        </>
    );
}

export default ChatLayout;