import React from 'react';
import ChatLayout from '@/Layouts/ChatLayout';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

function Explore() {
    return (
        <>
            <Head title="Explore" />
            <div className="h-screen flex flex-col items-center justify-center text-white">
                <h1 className="text-4xl font-bold mb-4">Explore</h1>
                <p className="text-lg text-gray-400">
                    Discover new people, groups, and conversations.
                </p>
                <div className="mt-6">
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-full text-white font-semibold">
                        Explore Now
                    </button>
                </div>
            </div>
        </>
    );
}

Explore.layout = (page) => {
    return (
        <AuthenticatedLayout user={page.props.auth.user}>
            <ChatLayout children={page} />
        </AuthenticatedLayout>
    );
};

export default Explore;