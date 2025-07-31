import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'
import { CameraIcon } from '@heroicons/react/24/outline';
import UserAvatar from '@/Components/App/UserAvatar';
import axios from 'axios';
import { useEventBus } from '@/EventBus';
import { useEffect, useState } from 'react';
import ChatLayout from '@/Layouts/ChatLayout';
import { Link2Icon, UserRoundCheck, UserRoundPlusIcon, MessageCircle } from 'lucide-react';

function View({ mustVerifyEmail, status, success, isCurrentUserFollower, followerCount, followingCount, user, posts, followers, followings }) {
    const authUser = usePage().props.auth.user;
    /* const username = user.name.split(' ').join('').toLocaleLowerCase(); */
    const [showFullBio, setShowFullBio] = useState(false);
    const { emit } = useEventBus();

    const onFollowClick = () => {
        const data = {
            follow: !isCurrentUserFollower,
        };

        axios.post(route('user.follow', user.id), data)
            .then((res) => {
                emit('toast.show', res.data.message);
                console.log(res.data);
                router.reload({
                    only: [
                        'followings',
                        'followers',
                        'isCurrentUserFollower',
                        'followerCount',
                        'followingCount',
                    ]
                })
            })
            .catch((err) => {
                console.error(err);
            });
    }

    return (
        <>
            <Head title={user.name} />
            <div className="w-full">
                <div className='relative mx-2 sm:mx-3 mt-3 mb-16 sm:mb-5'>
                    <div className='flex h-full items-start gap-3 sm:gap-5'>
                        <div className='relative flex-shrink-0'>
                            <UserAvatar user={user} avatar={true} />
                            {authUser && authUser.id === user.id && (
                                <button
                                    className='absolute bottom-0 right-0 bg-gray-800 rounded-full p-1 border border-gray-300'
                                    onClick={() => null}
                                >
                                    <CameraIcon className='w-4 h-4 sm:w-5 sm:h-5 text-gray-500' />
                                </button>
                            )}
                        </div>
                        <div className='flex flex-col gap-1 sm:gap-2 min-w-0 flex-1'>
                            <h1 className='text-xl sm:text-2xl lg:text-3xl text-white font-extrabold truncate'>{user.username}</h1>
                            
                            {/* Stats - responsive layout */}
                            <div className='flex flex-wrap items-center gap-2 sm:gap-3 text-sm'>
                                <div className='flex items-center gap-1'>
                                    <UserRoundCheck className='h-4 w-4 sm:h-5 sm:w-5' />
                                    <span className='text-gray-500'>
                                        <strong className='text-white'>{followerCount}</strong> followers
                                    </span>
                                </div>
                                <span className='text-gray-500'>
                                    <strong className='text-white'>{followingCount}</strong> following
                                </span>
                            </div>

                            {/* Action buttons - responsive layout */}
                            {authUser && authUser.id !== user.id && (
                                <div className='flex flex-wrap gap-2 mt-2'>
                                    <button
                                        className={`flex items-center justify-center text-xs gap-1 sm:gap-2 px-2 sm:px-3 py-1 rounded-full cursor-pointer font-bold border border-solid transition-colors ${isCurrentUserFollower
                                                ? 'bg-gray-500 text-gray-900 border-gray-500 hover:bg-gray-800 hover:text-white'
                                                : 'hover:bg-gray-500 hover:text-gray-900 border-gray-900 hover:border-gray-500'
                                            }`}
                                        onClick={onFollowClick}
                                    >
                                        {isCurrentUserFollower ? (
                                            <>
                                                <UserRoundCheck className='h-3 w-3 sm:h-4 sm:w-4' /> 
                                                <span className='hidden xs:inline'>Unfollow</span>
                                            </>
                                        ) : (
                                            <>
                                                <UserRoundPlusIcon className='h-3 w-3 sm:h-4 sm:w-4' /> 
                                                <span className='hidden xs:inline'>Follow</span>
                                            </>
                                        )}
                                    </button>
                                    <Link
                                        href={route('chat.user', user)}
                                        className="flex items-center justify-center text-xs gap-1 sm:gap-2 px-2 sm:px-3 py-1 rounded-full cursor-pointer font-bold border border-solid hover:bg-gray-500 hover:text-gray-900 border-gray-900 hover:border-gray-500 transition-colors"
                                    >
                                        <MessageCircle className='h-3 w-3 sm:h-4 sm:w-4' /> 
                                        <span className='hidden xs:inline'>Message</span>
                                    </Link>
                                </div>
                            )}

                            {/* Bio section */}
                            {user.bio && (
                                <div className='text-gray-500 text-sm mt-2'>
                                    <p className={showFullBio ? '' : 'line-clamp-3'}>
                                        {showFullBio ? user.bio : `${user.bio.slice(0, 100)}`}
                                        {user.bio.length > 100 && !showFullBio && (
                                            <span>
                                                ...
                                                <button
                                                    className='text-white text-sm font-extrabold ml-1'
                                                    onClick={() => setShowFullBio(true)}
                                                >
                                                    more
                                                </button>
                                            </span>
                                        )}
                                        {showFullBio && user.bio.length > 100 && (
                                            <button
                                                className='text-white text-sm font-extrabold ml-1'
                                                onClick={() => setShowFullBio(false)}
                                            >
                                                less
                                            </button>
                                        )}
                                    </p>
                                </div>
                            )}

                            {/* Link icon */}
                            <Link2Icon className='h-4 w-4 sm:h-5 sm:w-5 text-gray-500 mt-1' />
                        </div>
                    </div>
                </div>

                {/* Tabs section */}
                <div className="w-full">
                    <TabGroup className='mx-2 sm:mx-3'>
                        <TabList className='flex justify-between mx-4'>
                            <div className='flex justify-start gap-3 sm:gap-5'>
                                <Tab
                                    className={({ selected }) =>
                                        `py-2 px-1 text-sm sm:text-base font-extrabold transition-colors ${selected 
                                            ? 'text-white border-b-2 border-white' 
                                            : 'text-gray-500 hover:text-gray-300'
                                        } focus:outline-none focus:ring-0 border-none`
                                    }
                                >
                                    Posts
                                </Tab>
                                <Tab
                                    className={({ selected }) =>
                                        `py-2 px-1 text-sm sm:text-base font-extrabold transition-colors ${selected 
                                            ? 'text-white border-b-2 border-white' 
                                            : 'text-gray-500 hover:text-gray-300'
                                        } focus:outline-none focus:ring-0 border-none`
                                    }
                                >
                                    Events
                                </Tab>
                            </div>
                            <div className='flex items-center justify-end'>
                                {/* Additional content if needed */}
                            </div>
                        </TabList>
                        <TabPanels className="mt-4">
                            <TabPanel>
                                <div className='px-2 sm:px-0'>
                                    {/* Posts implementation */}
                                </div>
                            </TabPanel>
                            <TabPanel>
                                <div className='px-2 sm:px-0'>
                                    {/* Events implementation */}
                                </div>
                            </TabPanel>
                        </TabPanels>
                    </TabGroup>
                </div>
            </div>
        </>
    );
}

View.layout = (page) => {
    return (
        <AuthenticatedLayout user={page.props.auth.user}>
            <ChatLayout children={page} />
        </AuthenticatedLayout>
    );
};

export default View;