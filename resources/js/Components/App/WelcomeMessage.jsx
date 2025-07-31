import { MessageCircle, Users, Search, Heart, Trash2, UserPlus, FileImage, Mic, Download, Zap, Shield, Settings } from 'lucide-react';

const WelcomeMessage = () => {
    return (
        <div className="flex flex-col items-center justify-center flex-1 p-8 animate-fade-in">
            <div className="text-center max-w-6xl">
                <MessageCircle className="w-16 h-16 text-blue-400 mx-auto mb-6" />
                <h2 className="text-2xl md:text-3xl font-semibold text-slate-200 mb-4">
                    Welcome to the Ville Real-Time Messenger
                </h2>
                <p className="text-lg text-slate-300 mb-8">
                    Select a conversation to start messaging or explore our comprehensive features powered by Laravel Reverb websockets
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
                    <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                        <div className="flex items-center mb-3">
                            <Search className="w-6 h-6 text-blue-400 mr-3" />
                            <h3 className="text-lg font-medium text-slate-200">Discover Users</h3>
                        </div>
                        <p className="text-slate-400 text-sm">
                            Search for users and follow them to add to your conversation list or send direct messages from their profile
                        </p>
                    </div>
                    
                    <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                        <div className="flex items-center mb-3">
                            <Users className="w-6 h-6 text-green-400 mr-3" />
                            <h3 className="text-lg font-medium text-slate-200">Create Groups</h3>
                        </div>
                        <p className="text-slate-400 text-sm">
                            Start group conversations with multiple users for team collaboration or social chats with advanced member management
                        </p>
                    </div>
                    
                    <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                        <div className="flex items-center mb-3">
                            <Heart className="w-6 h-6 text-red-400 mr-3" />
                            <h3 className="text-lg font-medium text-slate-200">React & Engage</h3>
                        </div>
                        <p className="text-slate-400 text-sm">
                            Express yourself with emoji reactions on messages and markdown-formatted text with rich styling support
                        </p>
                    </div>

                    <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                        <div className="flex items-center mb-3">
                            <Zap className="w-6 h-6 text-yellow-400 mr-3" />
                            <h3 className="text-lg font-medium text-slate-200">Real-Time Messaging</h3>
                        </div>
                        <p className="text-slate-400 text-sm">
                            Send and receive messages instantly using Laravel Reverb websocket server for seamless conversations
                        </p>
                    </div>

                    <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                        <div className="flex items-center mb-3">
                            <FileImage className="w-6 h-6 text-purple-400 mr-3" />
                            <h3 className="text-lg font-medium text-slate-200">Rich Media Support</h3>
                        </div>
                        <p className="text-slate-400 text-sm">
                            Share images, videos, documents, and audio files with full preview capabilities in both small and full-screen modes
                        </p>
                    </div>
                    
                    <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                        <div className="flex items-center mb-3">
                            <Mic className="w-6 h-6 text-emerald-400 mr-3" />
                            <h3 className="text-lg font-medium text-slate-200">Audio Messages</h3>
                        </div>
                        <p className="text-slate-400 text-sm">
                            Record and send audio messages directly within the interface using quick-access buttons for personal communication
                        </p>
                    </div>

                    <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                        <div className="flex items-center mb-3">
                            <Shield className="w-6 h-6 text-cyan-400 mr-3" />
                            <h3 className="text-lg font-medium text-slate-200">User Administration</h3>
                        </div>
                        <p className="text-slate-400 text-sm">
                            Add new users to the system, block/unblock problematic users, and assign or revoke admin permissions
                        </p>
                    </div>
                    
                    <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                        <div className="flex items-center mb-3">
                            <Download className="w-6 h-6 text-indigo-400 mr-3" />
                            <h3 className="text-lg font-medium text-slate-200">Infinite Scroll History</h3>
                        </div>
                        <p className="text-slate-400 text-sm">
                            Access older messages through efficient infinite scroll loading, providing seamless browsing of conversation history
                        </p>
                    </div>
                    
                    <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                        <div className="flex items-center mb-3">
                            <Trash2 className="w-6 h-6 text-orange-400 mr-3" />
                            <h3 className="text-lg font-medium text-slate-200">Message Control</h3>
                        </div>
                        <p className="text-slate-400 text-sm">
                            Delete your own sent messages with full conversation state management to maintain control over your shared content
                        </p>
                    </div>

                    <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                        <div className="flex items-center mb-3">
                            <Settings className="w-6 h-6 text-gray-400 mr-3" />
                            <h3 className="text-lg font-medium text-slate-200">Profile Management</h3>
                        </div>
                        <p className="text-slate-400 text-sm">
                            Update your personal profile details including name, email, password and profile picture to maintain your identity
                        </p>
                    </div>

                    <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                        <div className="flex items-center mb-3">
                            <Zap className="w-6 h-6 text-pink-400 mr-3" />
                            <h3 className="text-lg font-medium text-slate-200">Background Jobs</h3>
                        </div>
                        <p className="text-slate-400 text-sm">
                            Resource-intensive operations like group deletion run as background jobs with real-time websocket notifications
                        </p>
                    </div>

                    <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                        <div className="flex items-center mb-3">
                            <MessageCircle className="w-6 h-6 text-teal-400 mr-3" />
                            <h3 className="text-lg font-medium text-slate-200">Responsive Design</h3>
                        </div>
                        <p className="text-slate-400 text-sm">
                            Fully responsive UI that works seamlessly across all device sizes, from mobile to desktop computers
                        </p>
                    </div>
                </div>
                
                <div className="mt-8 p-4 bg-blue-900/20 rounded-lg border border-blue-700/50">
                    <div className="flex items-center justify-center mb-2">
                        <UserPlus className="w-5 h-5 text-blue-300 mr-2" />
                        <span className="text-blue-300 font-medium">To Get Started</span>
                    </div>
                    <p className="text-blue-200 text-sm">
                        Use the search feature to find users, follow them, and start your first conversation! Built with Laravel Reverb websockets and React for a professional messaging experience.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default WelcomeMessage;