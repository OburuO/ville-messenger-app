import React from 'react';

function HeaderItem({ icon: Icon, onClick, count }) {
    return (
        <button 
            onClick={onClick}
            className="relative hidden md:inline"
        >
            <div className='flex items-center gap-1 p-1 hover:bg-gray-500 rounded-full hover:text-gray-900 cursor-pointer'>
                {Icon && <Icon className="h-6 w-6" />}
            </div>
            <div className="absolute -top-1 -right-2 text-xs w-fit bg-red-500 rounded-[0.8rem] px-[0.4rem] py-[0.1rem] flex items-center justify-center animate-pulse text-white">
                {count}
            </div>
        </button>
    );
}

export default HeaderItem;