const UserAvatar = ({ user, online = null, profile = false, avatar = false, header = false }) => {
    let onlineClass = online === true ? 'online' : online === false ? 'offline' : '';
    const sizeClass = profile ? 'w-[44px] h-[44px]' : avatar ? 'w-[84px] h-[84px] border-2 border-gray-700' : header ? 'w-8 h-8' : 'w-8 h-8';

    return (
        <>
            {user.avatar_url && ( 
                <div className={`chat-image avatar ${onlineClass}`}>
                    <div className={`rounded-full ${sizeClass}`}>
                        <img className="rounded-full border p-[2px]" src={user.avatar_url}/>
                    </div>
                </div>
            )}
            {!user.avatar_url && (
                <div className={`chat-image avatar placeholder ${onlineClass}`}>
                    <div className={`bg-gray-400 text-gray-800 rounded-full border p-[1px] ${sizeClass}`}>
                        <span className="text-xl font-extrabold">
                            {user.name.substring(0, 1)}
                        </span>
                    </div>
                </div>
            )}
        </>
    );
};

export default UserAvatar; 
