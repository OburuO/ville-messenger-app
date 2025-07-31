import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { ChevronDownIcon, XMarkIcon } from '@heroicons/react/24/solid';
import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { containerTransition, containerVariants, useDebounce, useOnClickOutside } from '@/helpers';
import axios from 'axios';
import UserAvatar from './UserAvatar';
import { Link } from '@inertiajs/react';
import { UserRoundSearchIcon } from 'lucide-react';

function Searchbar() {
    const ref = useRef();
    const inputRef = useRef();
    const [isExpanded, setIsExpanded] = useState(false);
    const [searchQuery, setsearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState([]);
    const [noUsers, setNoUsers] = useState(false);

    useOnClickOutside(ref, () => collapseContainer(false));

    const isEmpty = !users || users.length === 0;

    const changeHandler = (e) => {
        e.preventDefault();
        setsearchQuery(e.target.value);
    }

    const expandContainer = () => {
        setIsExpanded(true);
    };

    const collapseContainer = () => {
        setIsExpanded(false);
        setsearchQuery("");
        setLoading(false);
        setNoUsers(false);
        setUsers([]);
        if (inputRef.current) inputRef.current.value = '';
    };

    const searchUser = async () => {
        if (!searchQuery || searchQuery.trim() == '') return;

        setLoading(true);
        setUsers([]);
        setNoUsers(false);

        const response = await axios.post(route('search'), {search: searchQuery})
        .catch((err) => {
            //console.log("Error ", err);
        });

        if (response) {
            if (response.data.data && response.data.data.length === 0) setNoUsers(true);
            setUsers(response.data.data)
        }

        setLoading(false);
    };

    useDebounce(searchQuery, 500, searchUser);

    return (
        <motion.div 
            className={`hidden md:flex absolute top-1 w-screen  md:w-full flex-col bg-gray-900 rounded-lg shadow-lg overflow-hidden z-[999]`}
            animate={isExpanded ? 'expanded' : 'collapsed'}
            variants={containerVariants}
            ref={ref}
            transition={containerTransition}
        >
            <div className='w-full flex items-center justify-center pt-[6px] px-3 mb-3'>
                <MagnifyingGlassIcon className='h-5 w-5 dark:text-gray-600 mr-2'/>
                <input
                    className='w-full h-5 outline-none border-none text-[0.9rem] dark:text-gray-200 rounded-[4px] bg-transparent focus:outline-none focus:placeholder:opacity-0 placeholder:text-gray-600 placeholder:transition-all 250ms ease-in-out'
                    placeholder='Search for users...'
                    onFocus={expandContainer}
                    ref={inputRef}
                    value={searchQuery}
                    onChange={changeHandler}
                />
                <AnimatePresence>
                    {isExpanded && (
                        <motion.span 
                            onClick={collapseContainer}
                            key='close-icon'
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <XMarkIcon className='h-5 w-5 dark:text-gray-600 ml-2'/>
                        </motion.span>
                    )}
                </AnimatePresence>
            </div>
            {isExpanded && <div className='w-full h-full flex flex-col px-[1em]'>
                <div className='flex justify-between items-center text-sm'>
                    <div className='flex items-center justify-center text-xs gap-2 px-3 py-1 hover:bg-gray-500 rounded-full hover:text-gray-900 cursor-pointer font-bold border border-solid border-gray-900 hover:border-gray-500'>
                        <UserRoundSearchIcon className='h-4 w-4' /> Explore More <ChevronDownIcon className='h-3 w-3' />
                    </div>
                </div>
                {loading && (
                    <div className='w-full h-full flex items-center justify-center'>
                        <span className="loading loading-spinner loading-xs"></span>
                    </div>
                )}
                {!loading && isEmpty && !noUsers && <span className='w-full h-full flex items-center justify-center'>
                    Start typing to Search
                </span>}
                {!loading && noUsers && <span className='w-full h-full flex items-center justify-center'>
                    No users found
                </span>}
                {!loading && !isEmpty && <div className='w-full h-full'>
                    {users.map((user) => (
                        <Link key={user.id} href={route('profile', {username: user.username})} onClick={collapseContainer}>
                            <div className='w-full h-12 flex items-center justify-between py-2 px-2 dark:hover:bg-gray-800 rounded-md'>
                                <UserAvatar user={user} />
                                <h3 className='flex-1 ml-4 truncate'>{user.name}</h3>
                            </div>
                        </Link>
                    ))}
                </div>}
            </div>}
        </motion.div>
    );
}

export default Searchbar;