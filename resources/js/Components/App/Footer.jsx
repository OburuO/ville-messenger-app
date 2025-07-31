import React from 'react'
import { HomeIcon, PlusCircleIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { useRecoilState } from 'recoil'
import { screenState } from '../../atoms'
import { ArrowBigLeft } from 'lucide-react';

function Footer({ hidden }) {
    const [home, setHome] = useRecoilState(screenState);

    // Don't render the footer at all when hidden (during conversations)
    if (hidden) {
        return null;
    }

    return (
        <div className="fixed md:hidden z-[900] left-0 right-0 bottom-0 h-16 bg-black/90 backdrop-blur-sm border-t border-gray-800">
            <nav className="h-full">
                <ul className='flex h-full'>
                    <li 
                        onClick={() => {setHome(true)}}
                        className='flex-1 flex flex-col items-center justify-center py-2 cursor-pointer text-gray-300 hover:text-white transition-colors'
                    >
                        <ArrowBigLeft className='w-6 h-6 mb-1' />
                        <span className='text-xs'>Back</span>
                    </li>
                    <li 
                        onClick={() => (true)}
                        className='flex-1 flex flex-col items-center justify-center py-2 cursor-pointer text-gray-300 hover:text-white transition-colors'
                    >
                        <PlusCircleIcon className='w-6 h-6 mb-1' />
                        <span className='text-xs'>Create</span>
                    </li>
                    <li 
                        onClick={() => {setHome(false)}}
                        className='flex-1 flex flex-col items-center justify-center py-2 cursor-pointer text-gray-300 hover:text-white transition-colors'
                    >
                        <ChatBubbleLeftRightIcon className='w-6 h-6 mb-1' />
                        <span className='text-xs'>Chats</span>
                    </li>
                </ul>
            </nav>
        </div>
    )
}

export default Footer;