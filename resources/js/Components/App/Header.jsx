import React, { useState, useEffect, useRef } from 'react';
import { SunIcon, MoonIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/solid';
import { AnimatePresence, motion } from 'framer-motion';
import Searchbar from './Searchbar';
import { Cog8ToothIcon, BellIcon, ArrowRightStartOnRectangleIcon, LockClosedIcon, QuestionMarkCircleIcon, UserIcon } from '@heroicons/react/24/outline';
import HeaderItem from './HeaderItem'; 
import UserAvatar from './UserAvatar';
import Dropdown from '../Dropdown'; 
import { usePage, Link } from '@inertiajs/react';
import { useRecoilState } from 'recoil';
import { sliderRailState, createUserModalState } from '@/atoms';
import { AlignRight, Search, UserRoundPlus } from 'lucide-react';
import axios from 'axios';

// Mobile Search Modal Component
function MobileSearchModal({ show, onClose }) {
    const inputRef = useRef();
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState([]);
    const [noUsers, setNoUsers] = useState(false);
    const [debounceTimer, setDebounceTimer] = useState(null);

    const isEmpty = !users || users.length === 0;

    const changeHandler = (e) => {
        e.preventDefault();
        setSearchQuery(e.target.value);
    };

    const closeModal = () => {
        setSearchQuery("");
        setLoading(false);
        setNoUsers(false);
        setUsers([]);
        onClose();
    };

    const searchUser = async (query) => {
        if (!query || query.trim() === '') {
            setUsers([]);
            setNoUsers(false);
            return;
        }

        setLoading(true);
        setUsers([]);
        setNoUsers(false);

        try {
            const response = await axios.post(route('search'), { search: query });
            
            if (response.data.data && response.data.data.length === 0) {
                setNoUsers(true);
            }
            setUsers(response.data.data || []);
        } catch (err) {
            console.log("Error ", err);
        } finally {
            setLoading(false);
        }
    };

    // Debounce search functionality
    useEffect(() => {
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }

        const timer = setTimeout(() => {
            searchUser(searchQuery);
        }, 500);

        setDebounceTimer(timer);

        return () => {
            if (timer) {
                clearTimeout(timer);
            }
        };
    }, [searchQuery]);

    // Focus input when modal opens
    useEffect(() => {
        if (show && inputRef.current) {
            setTimeout(() => {
                inputRef.current.focus();
            }, 100);
        }
    }, [show]);

    if (!show) return null; 

    return (
        <div className="fixed inset-0 z-[9999] bg-black bg-opacity-50 flex items-start justify-center pt-4">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="w-full max-w-md mx-4 bg-gray-900 rounded-lg shadow-xl overflow-hidden"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4">
                    {/* Explore More Button */}
                    <div className="flex items-center justify-center text-xs gap-2 px-3 py-2 hover:bg-gray-700 rounded-full cursor-pointer font-bold border border-gray-600 hover:border-gray-500 text-gray-300">
                        <UserIcon className="h-4 w-4" />
                        Explore More
                        <ChevronDownIcon className="h-3 w-3" />
                    </div>
                    <button
                        onClick={closeModal}
                        className="text-gray-400 hover:text-white flex items-center justify-end"
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                {/* Search Input */}
                <div className="px-4 ">
                    <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Search for users..."
                            value={searchQuery}
                            onChange={changeHandler}
                            className="w-full pl-10 pr-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                        />
                    </div>
                </div>

                {/* Search Results */}
                <div className="max-h-96 overflow-y-auto">
                    {loading && (
                        <div className="flex items-center justify-center p-8">
                            <span className="loading loading-spinner loading-xs"></span>
                        </div>
                    )}

                    {!loading && isEmpty && !noUsers && (
                        <div className="text-center text-gray-400 p-8">
                            Start typing to search
                        </div>
                    )}

                    {!loading && noUsers && (
                        <div className="text-center text-gray-400 p-8">
                            No users found
                        </div>
                    )}

                    {!loading && !isEmpty && (
                        <div className="p-2">
                            {users.map((user) => (
                                <Link
                                    key={user.id}
                                    href={route('profile', { username: user.username })}
                                    onClick={closeModal}
                                    className="block"
                                >
                                    <div className="flex items-center p-3 hover:bg-gray-800 rounded-lg transition-colors">
                                        <UserAvatar user={user} />
                                        <div className="ml-3 flex-1">
                                            <h4 className="text-white font-medium truncate">{user.name}</h4>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}

function Header({ hidden }) {
    const page = usePage();
    const user = page.props.auth.user;
    const [isDark, setIsDark] = useState(false);
    const [showCreateUserModal, setShowCreateUserModal] = useRecoilState(createUserModalState); 
    const [showSliderRail, setShowSliderRail] = useRecoilState(sliderRailState);
    const [showMobileSearch, setShowMobileSearch] = useState(false);
    
    const toggleTheme = () => {
        setIsDark(!isDark);
        // Add your theme switching logic here
    };

    return (
        <div className='border-b border-gray-800'>
            <div className={`h-12 bg-black/40 flex items-center justify-between text-white ${hidden ? 'hidden' : ''} mx-3 `}>
                <Link href="/">
                    <h2 className='font-extrabold text-3xl text-white font-pacifico md:hidden'>ville</h2>
                </Link>
                
                
                <div className='flex-1 md:hidden'/>
                <div className='flex-1 relative h-full md:mr-4 mt-1 hidden md:block'>
                    <Searchbar />
                </div>
                
                <button
                    onClick={() => setShowMobileSearch(true)}
                    className='w-5 h-5 md:hidden cursor-pointer hover:text-gray-300 flex items-center justify-center'
                >
                    <MagnifyingGlassIcon className='w-5 h-5' />
                </button>
                
                <div className='hidden md:inline-flex items-center justify-center space-x-4'>
                    {!!user.is_admin && (
                        <button
                            className='hidden md:inline-flex items-center gap-1 px-3 py-1 hover:bg-gray-500 rounded-full hover:text-gray-900 border border-solid border-gray-900 hover:border-gray-500'
                            onClick={() => setShowCreateUserModal(true)}
                        >
                            <UserRoundPlus className='w-5 h-5' />
                            <span className='text-sm'>New user</span>
                        </button>
                    )}
                    <HeaderItem
                        icon={BellIcon}
                        count={'16'} 
                        onClick={() => null}
                        hidden={true}
                    />
                    <Dropdown>
                        <Dropdown.Trigger>
                            <span className="hidden md:inline-flex rounded-md cursor-pointer"> 
                                <UserAvatar user={user} header={true} />
                            </span>
                        </Dropdown.Trigger>

                        <Dropdown.Content contentClasses='hidden md:block bg-gray-800 w-60 absolute right-1 h-max top-1 p-[1em]'>
                            <ul className='relative flex flex-col leading-6'>
                                <li className='flex items-center justify-between'>
                                    <strong className='text-sm'>Toggle Theme</strong>
                                    <button
                                        onClick={toggleTheme}
                                        className="relative w-16 h-8 flex items-center bg-gray-700 rounded-full p-1 cursor-pointer"
                                    >
                                        <div
                                            className={`absolute w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ease-in-out flex items-center justify-center
                                                ${isDark ? 'translate-x-8' : 'translate-x-0'}`}
                                        >
                                            {isDark ? (
                                                <MoonIcon className="h-4 w-4 text-gray-800" />
                                            ) : (
                                                <SunIcon className="h-4 w-4 text-gray-800" />
                                            )}
                                        </div>
                                    </button>
                                </li>
                                <hr className='h-px my-2 bg-gray-200 border-0 dark:bg-gray-700'/>
                                <li className='relative flex items-center gap-2 w-full py-2 rounded-[0.5em]'>
                                    <div className='flex items-center justify-center'>
                                        <UserAvatar user={user} profile={true} />
                                    </div>
                                    <div className='flex flex-col leading-[initial]'>
                                        <strong className='text-sm font-extrabold w-[136px] truncate'>{page.props.auth.user.name}</strong>
                                        <Dropdown.Link href={route('profile', {username: page.props.auth.user.username})}>
                                            <span className='text-sm hover:text-gray-400'>See your profile</span>
                                        </Dropdown.Link>
                                    </div>
                                </li>
                                <hr className='h-px my-2 bg-gray-200 border-0 dark:bg-gray-700'/>
                                <li className='has-child'>
                                    <a href="#" className='group relative flex items-center w-full p-1 rounded-[0.5em] hover:bg-slate-500'>
                                        <LockClosedIcon className='w-4 mr-[0.5em]' />
                                        <span className='text-sm'>Privacy</span>
                                    </a>
                                </li>
                                <li className='has-child'>
                                    <Dropdown.Link href={route('profile.edit')} as="button">   
                                        <a 
                                            href="#" 
                                            className="relative flex items-center w-full p-1 rounded-[0.5em] hover:bg-slate-500"
                                        >
                                            <Cog8ToothIcon className='w-4 mr-[0.5em]' />
                                            <span className='text-sm'>Settings</span> 
                                        </a> 
                                    </Dropdown.Link>
                                </li>
                                <li className='has-child'>
                                    <a href="#" className='relative flex items-center w-full p-1 rounded-[0.5em] hover:bg-slate-500'>
                                        <QuestionMarkCircleIcon className='w-4 mr-[0.5em]' />
                                        <span className='text-sm'>Help & Support</span>
                                    </a>
                                </li>
                                <hr className='h-px my-2 bg-gray-200 border-0 dark:bg-gray-700'/>
                                <li className='has-child'>
                                    <Dropdown.Link href={route('logout')} method="post" as="button">        
                                        <a href="#" className='relative flex items-center w-full p-1 rounded-[0.5em] hover:bg-slate-500'>
                                            <ArrowRightStartOnRectangleIcon className='w-4 mr-[0.5em]' />
                                            <span className='text-sm'>Logout</span>
                                        </a>
                                    </Dropdown.Link>
                                </li>
                            </ul>
                        </Dropdown.Content>
                    </Dropdown>
                </div>
                
                <AlignRight 
                    className="w-6 h-6 md:hidden ml-3 cursor-pointer"
                    onClick={() => setShowSliderRail(!showSliderRail)}
                />
            </div>

            <AnimatePresence>
                {showMobileSearch && (
                    <MobileSearchModal
                        show={showMobileSearch}
                        onClose={() => setShowMobileSearch(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

export default Header;