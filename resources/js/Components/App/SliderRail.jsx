import { useRef, useState } from "react";
import { XMarkIcon, UserIcon, Cog6ToothIcon, Cog8ToothIcon } from '@heroicons/react/24/outline';
import { useOnClickOutside } from "@/helpers";
import { CSSTransition } from 'react-transition-group';
import { Link, usePage } from '@inertiajs/react';
import UserAvatar from '@/Components/App/UserAvatar';
import { CameraIcon, LogOutIcon, UserRoundCheck } from "lucide-react";

function SliderRail({ show, onClickOutside }) {
    const ref = useRef();
    const page = usePage();
    const user = page.props.auth.user;
    
    useOnClickOutside(ref, () => onClickOutside());

    return (
        <>
            {/* Backdrop overlay - only visible on mobile when slider is open */}
            {show && (
                <div 
                    className="fixed inset-0 bg-black/50 z-[998] md:hidden transition-opacity duration-150"
                    onClick={onClickOutside}
                />
            )}
            
            {/* Slider Rail */}
            <div
                className={`fixed bg-gray-950 w-80 max-w-[85vw] z-[999] top-0 bottom-0 right-0 h-screen flex flex-col md:hidden transform transition-transform duration-300 ease-out ${
                    show ? "translate-x-0" : "translate-x-full"
                }`}
                ref={ref}
            >
                {/* Close button */}
                <div className="absolute left-2 top-2 w-8 h-8 rounded-full hover:bg-white/10 transition-all flex items-center justify-center text-gray-100 z-40">
                    <XMarkIcon
                        className="h-5 w-5 cursor-pointer text-white"
                        onClick={() => onClickOutside()}
                    />
                </div>

                {/* User profile section */}
                <div className='flex items-start gap-3 mt-12 mx-4'>
                    <div className='relative'>
                        <UserAvatar user={user} avatar={true} />
                        <button
                            className='absolute bottom-0 right-0 bg-gray-800 rounded-full border border-gray-600 hover:border-gray-400 transition-colors flex items-center justify-center'
                            onClick={() => null}
                        >
                            <CameraIcon className='w-4 h-4 text-gray-400 hover:text-gray-200' />
                        </button>
                    </div>
                    
                    <div className='flex flex-col gap-2 min-w-0 flex-1'>
                        <h1 className='text-xl text-white font-bold truncate'>{user.username}</h1>
                        
                        {/* Stats */}
                        <div className='flex flex-wrap items-center gap-3 text-sm'>
                            <div className='flex items-center gap-1'>
                                <UserRoundCheck className='h-4 w-4 text-gray-400' />
                                <span className='text-gray-400'>
                                    <strong className='text-white'>{user.follower_count}</strong> followers
                                </span>
                            </div>
                            <span className='text-gray-400'>
                                <strong className='text-white'>{user.following_count}</strong> following
                            </span>
                        </div>
                        
                        {/* Action buttons */}
                        <div className='flex gap-2 mt-3'>
                            <Link 
                                href={route('profile.edit')} 
                                as="button"
                                className='flex items-center justify-center gap-1 px-4 py-2 text-[10px] text-gray-200 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-full border border-gray-600 hover:border-gray-500 transition-all duration-200'
                            >
                                <Cog8ToothIcon className='w-4 h-4' />
                                <span>Settings</span>
                            </Link>
                            <Link 
                                href={route('logout')} 
                                method="post" 
                                as="button"
                                className='flex items-center justify-center gap-1 px-4 py-2 text-[10px] text-gray-200 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-full border border-gray-600 hover:border-gray-500 transition-all duration-200'
                            >
                                <LogOutIcon className='w-4 h-4' />
                                <span>Logout</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Additional menu items can be added here */}
                <div className='flex-1 mt-8 px-4'>
                    {/* You can add more menu items here if needed */}
                </div>
            </div>
        </>
    )
}

export default SliderRail;