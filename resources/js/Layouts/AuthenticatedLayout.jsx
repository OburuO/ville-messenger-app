import { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { useEventBus } from '@/EventBus';
import Toast from '@/Components/App/Toast';
import NewMessageNotification from '@/Components/App/NewMessageNotification';
import NewUserModal from '@/Components/App/NewUserModal';
import SliderRail from '@/Components/App/SliderRail';
import { useRecoilState } from 'recoil';
import { sliderRailState, createUserModalState } from '@/atoms';

export default function Authenticated({ header, children }) { 
    const page = usePage();
    const user = page.props.auth.user;
    const conversations = page.props.conversations;
    const [showCreateUserModal, setShowCreateUserModal] = useRecoilState(createUserModalState);
    const [showSliderRail, setShowSliderRail] = useRecoilState(sliderRailState);
    const { emit } = useEventBus();

    useEffect(() => {
        conversations.forEach((conversation) => {
            let channel = `message.group.${conversation.id}`; 

            if (conversation.is_user) { 
                channel = `message.user.${[ 
                    parseInt(user.id),
                    parseInt(conversation.id),
                ]
                    .sort((a, b) => a - b)
                    .join('-')}`;
            }

            // console.log('Start listening on channel ', channel);

            Echo.private(channel)
                .error((error) => {
                    console.error(error);
                })
                .listen('SocketMessage', (e) => {
                    // console.log('SocketMessage', e);
                    const message = e.message;

                    // If the conversation with the sender is not selected
                    // then show a notification

                    emit('message.created', message);

                    if (message.sender_id === user.id) {
                        return;
                    }

                    emit('newMessageNotification', {
                        user: message.sender,
                        group_id: message.group_id,
                        message:
                            message.message || 
                            `Shared ${
                                message.attachments.length === 1
                                    ? 'an attachment'
                                    :  message.attachments.length +
                                        ' attachments' 
                            }`,
                    });
                }); 
            if (conversation.is_group) {
                Echo.private(`group.deleted.${conversation.id}`)
                    .listen('GroupDeleted', (e) => {
                        console.log('GroupDeleted', e);
                        emit('group.deleted', {id: e.id, name: e.name});
                    }).error((e) => {
                        console.error(e);
                    });
            }
        });

        return () => {
            conversations.forEach((conversation) => {
                let channel = `message.group.${conversation.id}`;

                if (conversation.is_user) {
                    channel = `message.user.${[
                        parseInt(user.id),
                        parseInt(conversation.id),
                    ]
                        .sort((a, b) => a - b)
                        .join('-')}`;
                }
                Echo.leave(channel);

                if (conversation.is_group) {
                    Echo.leave(`group.deleted.${conversation.id}`);
                }
            });
        };
    }, [conversations]); 

    // Work on this later
    
    /* function toggleDarkMode(){
        const html = window.document.documentElement
        if (html.classList.contains('dark')) {
            html.classList.remove('dark')
            localStorage.setItem('darkMode', '0')
        } else {
            html.classList.add('dark')
            localStorage.setItem('darkMode', '1')
        }
    } */

    return (
        <>
            <div className="min-h-screen bg-gray-100 dark:bg-black flex flex-col h-screen">
                {children}
            </div>
            <Toast />
            <NewMessageNotification />
            <NewUserModal 
                show={showCreateUserModal} 
                onClose={(ev) => setShowCreateUserModal(false)} 
            />
            <SliderRail
                show={showSliderRail}
                onClickOutside={() => {
                    setShowSliderRail(false);
                }}
            />
        </>
    );
}
