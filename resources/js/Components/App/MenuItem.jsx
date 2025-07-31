import React from 'react';
import { usePage } from '@inertiajs/react';

function MenuItem({ icon: Icon, title, onClick, href, className = '', convo }) {
    const { url } = usePage();
    const pathname = new URL(url, window.location.origin).pathname;

    return (
        <button
            onClick={onClick}
            className={`flex items-center justify-center space-x-2 cursor-pointer hover:text-white ${className}`}
        >
            {Icon && <Icon selected={pathname === href} />}
        <p className={`${pathname === href ? 'text-white' : null} hidden  ${!convo ? 'hidden' : 'lg:inline'}`}>{title}</p>
        </button>
    );
}

export default MenuItem;