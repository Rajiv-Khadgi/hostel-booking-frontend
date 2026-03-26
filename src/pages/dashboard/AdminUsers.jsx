import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { 
    FaUser, 
    FaTrash, 
    FaUserSlash, 
    FaUserCheck, 
    FaSearch, 
    FaFilter,
    FaEnvelope,
    FaPhone
} from 'react-icons/fa';

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchUsers();
    }, [roleFilter]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/users', {
                params: { role: roleFilter, search }
            });
            setUsers(res.data.users);
        } catch (err) {
            setError('Failed to fetch users');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (userId, newStatus) => {
        try {
            await api.patch(`/admin/users/${userId}/status`, { status: newStatus });
            setUsers(users.map(u => u.user_id === userId ? { ...u, status: newStatus } : u));
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'active': return 'bg-emerald-100 text-emerald-700';
            case 'suspended': return 'bg-amber-100 text-amber-700';
            case 'deleted': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">User Management</h1>
                <p className="text-gray-500 mt-2">Oversee all students and owners registered on the platform.</p>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
                <div className="relative flex-1 max-w-md w-full">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                        <FaSearch size={14} />
                    </span>
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl leading-5 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-all shadow-sm"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && fetchUsers()}
                    />
                </div>

                <div className="flex items-center gap-2 bg-white p-1 border border-gray-200 rounded-xl shadow-sm">
                    <button 
                        onClick={() => setRoleFilter('')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${!roleFilter ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
                    > All </button>
                    <button 
                        onClick={() => setRoleFilter('student')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${roleFilter === 'student' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
                    > Students </button>
                    <button 
                        onClick={() => setRoleFilter('owner')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${roleFilter === 'owner' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
                    > Owners </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                </div>
            ) : error ? (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center border border-red-100">{error}</div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Contact</th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {users.map((u) => (
                                    <tr key={u.user_id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 font-bold overflow-hidden">
                                                    {u.profile_image ? (
                                                        <img src={`${api.defaults.baseURL.replace('/api', '')}/${u.profile_image}`} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <FaUser size={16} />
                                                    )}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-bold text-gray-900">{u.first_name} {u.last_name}</div>
                                                    <div className="text-xs text-gray-500">Joined {new Date(u.createdAt).toLocaleDateString()}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <FaEnvelope size={12} className="text-gray-400" /> {u.email}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <FaPhone size={12} className="text-gray-400" /> {u.phone || 'N/A'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                                            <span className={`px-2.5 py-1 rounded-lg font-bold text-[10px] uppercase tracking-wider ${u.role === 'owner' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${getStatusStyle(u.status)}`}>
                                                {u.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                            <div className="flex justify-end gap-2">
                                                {u.status === 'active' ? (
                                                    <button 
                                                        onClick={() => handleStatusUpdate(u.user_id, 'suspended')}
                                                        className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                                        title="Suspend User"
                                                    >
                                                        <FaUserSlash size={16} />
                                                    </button>
                                                ) : (
                                                    <button 
                                                        onClick={() => handleStatusUpdate(u.user_id, 'active')}
                                                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                        title="Activate User"
                                                    >
                                                        <FaUserCheck size={16} />
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={() => u.status !== 'deleted' && handleStatusUpdate(u.user_id, 'deleted')}
                                                    className={`p-2 rounded-lg transition-colors ${u.status === 'deleted' ? 'text-gray-300 cursor-not-allowed' : 'text-red-600 hover:bg-red-50'}`}
                                                    title="Mark as Deleted"
                                                >
                                                    <FaTrash size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
