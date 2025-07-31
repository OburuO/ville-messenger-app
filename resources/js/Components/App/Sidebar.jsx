import React from 'react'
import CategoryIcon from '../Icons/category'
import HomeIcon from '../Icons/home'
import MenuItem from './MenuItem';
import ApplicationLogo from '../ApplicationLogo';
import ChatPlusIcon from '../Icons/chat-plus';
import { useRecoilState } from 'recoil'
import { convoState } from '../../atoms'
import { Link, router } from '@inertiajs/react';

function Sidebar() {
    const [convo, setConvo] = useRecoilState(convoState);

    const components = [
        { 
            icon: HomeIcon, 
            title: 'Home', 
            href: '/', 
            onClick: () => router.visit('/') // Navigate to the home page
        },
        { 
            icon: CategoryIcon, 
            title: 'Explore', 
            href: '/explore', 
            onClick: () => router.visit('/explore') // Navigate to the explore page
        },
    ];

    return (
        <div className={`text-gray-500 px-0 md:px-3 text-sm h-screen hidden md:flex flex-col border-r border-gray-800 ${!convo ? 'hidden' : 'lg:w-48'}`}>
            <div className='flex items-center justify-between h-12 w-full -mt-1'>
                <Link href="/">
                    <h2 className={`font-extrabold text-3xl text-white font-pacifico`}>ville</h2>
                </Link>
                <div
                    className={`tooltip tooltip-left cursor-pointer items-center justify-center h-7 w-7 rounded-full bg-blue-600 hover:bg-blue-500 hidden ${!convo ? 'hidden' : 'lg:flex'}`}
                    data-tip='Open Conversations' 
                >
                    <ChatPlusIcon 
                        fill='white' 
                        height={20} 
                        width={20} 
                        onClick={() => setConvo(!convo)}
                    />
                </div>
            </div>
            <div className={`space-y-4 mt-3 overflow-y-auto ${!convo ? 'flex flex-col' : ''}`}>
                {components.map((comp, index) => (
                    <MenuItem
                        key={index}
                        href={comp.href}
                        icon={comp.icon}
                        title={comp.title}
                        onClick={comp.onClick}
                        convo={convo}
                    />
                ))}
            </div>
        </div>
    );
}

export default Sidebar;