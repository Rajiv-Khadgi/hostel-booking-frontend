import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../api/axios';
import { socket, connectSocket, disconnectSocket } from '../../utils/socket';
import { FaPaperPlane, FaPaperclip, FaSearch, FaEllipsisV, FaCircle, FaFilePdf, FaFileWord, FaFileAlt, FaDownload, FaCheck, FaCheckDouble } from 'react-icons/fa';

export default function Chat() {
    const { user } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [searching, setSearching] = useState('');
    const [uploading, setUploading] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState(new Set());

    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchConversations();
        connectSocket();

        // Identify user to track online status
        if (user) {
            socket.emit('identify', user.id);
        }

        socket.on('receive_message', (message) => {
            // Only add if it belongs to the active conversation
            setMessages(prev => {
                // If it's for the current conversation, add it
                if (activeConversation && message.conversation_id === activeConversation.conversation_id) {
                    // Automatically mark as read if it's currently active and not from me
                    if (message.sender_id !== user.id) {
                        socket.emit('mark_read', {
                            conversationId: activeConversation.conversation_id,
                            userId: user.id
                        });
                    }
                    return [...prev, message];
                }
                return prev;
            });

            // Update conversations list preview
            setConversations(prev => {
                return prev.map(conv => {
                    if (conv.conversation_id === message.conversation_id) {
                        return {
                            ...conv,
                            messages: [message],
                            last_message_at: message.created_at || message.createdAt
                        };
                    }
                    return conv;
                }).sort((a, b) => new Date(b.last_message_at) - new Date(a.last_message_at));
            });
        });

        socket.on('user_status_change', ({ userId, status }) => {
            setOnlineUsers(prev => {
                const newSet = new Set(prev);
                if (status === 'online') newSet.add(userId);
                else newSet.delete(userId);
                return newSet;
            });
        });

        socket.on('messages_read', ({ conversationId, readerId }) => {
            if (activeConversation && conversationId === activeConversation.conversation_id) {
                setMessages(prev => prev.map(msg =>
                    msg.sender_id !== readerId ? { ...msg, is_read: true } : msg
                ));
            }

            setConversations(prev => prev.map(conv => {
                if (conv.conversation_id === conversationId) {
                    const updatedMessages = conv.messages.map(msg =>
                        msg.sender_id !== readerId ? { ...msg, is_read: true } : msg
                    );
                    return { ...conv, messages: updatedMessages };
                }
                return conv;
            }));
        });

        return () => {
            socket.off('receive_message');
            socket.off('user_status_change');
            socket.off('messages_read');
            disconnectSocket();
        };
    }, [activeConversation, user]);

    useEffect(() => {
        if (activeConversation) {
            fetchMessages(activeConversation.conversation_id);
            socket.emit('join_conversation', activeConversation.conversation_id);

            // Mark all existing as read
            socket.emit('mark_read', {
                conversationId: activeConversation.conversation_id,
                userId: user.id
            });
        }
    }, [activeConversation, user]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchConversations = async () => {
        try {
            setLoading(true);
            const res = await api.get('/chat/conversations');
            setConversations(res.data.conversations);
        } catch (err) {
            console.error('Failed to fetch conversations', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (id) => {
        try {
            const res = await api.get(`/chat/conversations/${id}/messages`);
            setMessages(res.data.messages);
        } catch (err) {
            console.error('Failed to fetch messages', err);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeConversation) return;

        const messageData = {
            conversationId: activeConversation.conversation_id,
            senderId: user.id,
            content: newMessage
        };

        socket.emit('send_message', messageData);
        setNewMessage('');
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !activeConversation) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            setUploading(true);
            const res = await api.post('/chat/upload', formData);

            const messageData = {
                conversationId: activeConversation.conversation_id,
                senderId: user.id,
                content: `Sent a file: ${file.name}`,
                attachmentUrl: res.data.fileUrl
            };

            socket.emit('send_message', messageData);
        } catch (err) {
            console.error('Upload failed', err);
            alert('Failed to upload file');
        } finally {
            setUploading(false);
        }
    };

    const getChatPartner = (conv) => {
        return conv.participant1_id === user.id ? conv.participant2 : conv.participant1;
    };

    const isUserOnline = (userId) => onlineUsers.has(userId);

    const filteredConversations = conversations.filter(conv => {
        const partner = getChatPartner(conv);
        const name = `${partner.first_name} ${partner.last_name}`.toLowerCase();
        return name.includes(searching.toLowerCase());
    });

    const getFullImageUrl = (path) => {
        if (!path) return null;
        const baseUrl = api.defaults.baseURL.replace('/api', '');
        return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
    };

    const isImage = (url) => {
        if (!url) return false;
        const ext = url.split('.').pop().toLowerCase();
        return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
    };

    const getFileIcon = (url) => {
        const ext = url.split('.').pop().toLowerCase();
        if (ext === 'pdf') return <FaFilePdf className="text-red-500 text-2xl" />;
        if (['doc', 'docx'].includes(ext)) return <FaFileWord className="text-blue-500 text-2xl" />;
        return <FaFileAlt className="text-gray-500 text-2xl" />;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-140px)] bg-white rounded-3xl shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100">
            {/* Sidebar - Conversations List */}
            <div className="w-full md:w-80 border-r border-gray-100 flex flex-col bg-gray-50/30">
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Messages</h2>
                    <div className="relative">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search messages..."
                            value={searching}
                            onChange={(e) => setSearching(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-white border-0 ring-1 ring-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all text-sm"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-2 space-y-1 custom-scrollbar">
                    {filteredConversations.length > 0 ? (
                        filteredConversations.map(conv => {
                            const partner = getChatPartner(conv);
                            const isActive = activeConversation?.conversation_id === conv.conversation_id;
                            const lastMsg = conv.messages?.[0];
                            const isOnline = isUserOnline(partner.user_id);

                            return (
                                <button
                                    key={conv.conversation_id}
                                    onClick={() => setActiveConversation(conv)}
                                    className={`w-full flex items-center gap-4 p-4 rounded-3xl transition-all ${isActive
                                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'
                                        : 'hover:bg-white hover:shadow-sm text-gray-600'
                                        }`}
                                >
                                    <div className="relative shrink-0">
                                        <div className={`w-12 h-12 rounded-2xl overflow-hidden border-2 ${isActive ? 'border-white/30' : 'border-emerald-100'}`}>
                                            {partner.profile_image ? (
                                                <img
                                                    src={getFullImageUrl(partner.profile_image)}
                                                    alt={partner.first_name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-emerald-50 text-emerald-700 font-bold">
                                                    {partner.first_name[0]}{partner.last_name[0]}
                                                </div>
                                            )}
                                        </div>
                                        {isOnline && (
                                            <FaCircle className="absolute -bottom-1 -right-1 text-emerald-400 border-2 border-white w-4 h-4" />
                                        )}
                                    </div>
                                    <div className="flex-1 text-left overflow-hidden">
                                        <div className="flex justify-between items-center mb-0.5">
                                            <p className={`font-bold truncate ${isActive ? 'text-white' : 'text-gray-900'}`}>
                                                {partner.first_name} {partner.last_name}
                                            </p>
                                            {lastMsg && (
                                                <span className={`text-[10px] ${isActive ? 'text-emerald-100' : 'text-gray-400'}`}>
                                                    {new Date(lastMsg.created_at || lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            )}
                                        </div>
                                        <p className={`text-xs truncate ${isActive ? 'text-emerald-50' : 'text-gray-500'}`}>
                                            {lastMsg?.content || 'No messages yet'}
                                        </p>
                                    </div>
                                </button>
                            );
                        })
                    ) : (
                        <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <FaSearch className="text-gray-300 text-xl" />
                            </div>
                            <p className="text-sm font-medium text-gray-500">No conversations found</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-white">
                {activeConversation ? (
                    <>
                        {/* Chat Header */}
                        <div className="h-20 px-8 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl overflow-hidden bg-emerald-100">
                                    {getChatPartner(activeConversation).profile_image ? (
                                        <img
                                            src={getFullImageUrl(getChatPartner(activeConversation).profile_image)}
                                            alt="Partner"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-emerald-700 font-bold">
                                            {getChatPartner(activeConversation).first_name[0]}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 leading-none">
                                        {getChatPartner(activeConversation).first_name} {getChatPartner(activeConversation).last_name}
                                    </h3>
                                    <span className={`text-[10px] font-medium flex items-center gap-1 mt-1 ${isUserOnline(getChatPartner(activeConversation).user_id) ? 'text-emerald-500' : 'text-gray-400'}`}>
                                        <FaCircle className="w-1.5 h-1.5" /> {isUserOnline(getChatPartner(activeConversation).user_id) ? 'Online' : 'Offline'}
                                    </span>
                                </div>
                            </div>
                            <button className="text-gray-400 hover:text-gray-600 p-2 rounded-xl transition-colors">
                                <FaEllipsisV />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-gray-50/30 custom-scrollbar">
                            {messages.map((msg, index) => {
                                const isMe = msg.sender_id === user.id;

                                return (
                                    <div key={msg.message_id || index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`flex max-w-[70%] ${isMe ? 'flex-row-reverse' : 'flex-row'} items-end gap-3`}>
                                            <div className="flex flex-col">
                                                <div className={`px-5 py-3 rounded-2xl ${isMe
                                                    ? 'bg-emerald-600 text-white rounded-br-none shadow-lg shadow-emerald-100'
                                                    : 'bg-white text-gray-800 rounded-bl-none shadow-sm'
                                                    }`}>
                                                    {msg.attachment_url && (
                                                        <div className="mb-2">
                                                            {isImage(msg.attachment_url) ? (
                                                                <img
                                                                    src={getFullImageUrl(msg.attachment_url)}
                                                                    alt="Attachment"
                                                                    className="rounded-xl max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                                                                    onClick={() => window.open(getFullImageUrl(msg.attachment_url), '_blank')}
                                                                />
                                                            ) : (
                                                                <div
                                                                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${isMe ? 'bg-white/10 border-white/20 hover:bg-white/20' : 'bg-gray-50 border-gray-100 hover:bg-gray-100'}`}
                                                                    onClick={() => window.open(getFullImageUrl(msg.attachment_url), '_blank')}
                                                                >
                                                                    {getFileIcon(msg.attachment_url)}
                                                                    <div className="flex-1 overflow-hidden">
                                                                        <p className={`text-xs font-medium truncate ${isMe ? 'text-white' : 'text-gray-700'}`}>
                                                                            {msg.attachment_url.split('/').pop().replace(/^chat-\d+-/, '')}
                                                                        </p>
                                                                        <p className={`text-[10px] ${isMe ? 'text-emerald-200' : 'text-gray-400'}`}>
                                                                            {msg.attachment_url.split('.').pop().toUpperCase()} File
                                                                        </p>
                                                                    </div>
                                                                    <FaDownload className={isMe ? 'text-white/60' : 'text-gray-400'} />
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                    <p className="text-sm leading-relaxed">{msg.content}</p>
                                                </div>
                                                <div className={`flex items-center gap-1.5 mt-1.5 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                                    <span className="text-[9px] text-gray-400">
                                                        {new Date(msg.created_at || msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    {isMe && (
                                                        msg.is_read ? (
                                                            <FaCheckDouble className="text-emerald-400 text-[10px]" />
                                                        ) : (
                                                            <FaCheck className="text-gray-300 text-[10px]" />
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message Input */}
                        <div className="p-6 border-t border-gray-100">
                            <form onSubmit={handleSendMessage} className="relative flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-100 transition-colors"
                                    disabled={uploading}
                                >
                                    <FaPaperclip />
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                    className="hidden"
                                />
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 py-4 px-6 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-sm outline-none"
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="p-4 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 hover:shadow-emerald-300 transition-all disabled:opacity-50 disabled:shadow-none"
                                >
                                    <FaPaperPlane />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-gray-50/30">
                        <div className="w-24 h-24 bg-emerald-50 rounded-[40px] flex items-center justify-center rotate-12 mb-8 animate-bounce transition-transform">
                            <FaPaperPlane className="text-3xl text-emerald-600 -rotate-12" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">Your Messages</h3>
                        <p className="text-gray-500 max-w-sm leading-relaxed">
                            Select a conversation from the sidebar to start chatting with students or property owners.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
