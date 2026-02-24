import React, { createContext, useState, useEffect } from 'react';
import api from '../api/axios';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Load initial user state
    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('accessToken');
            if (token) {
                try {
                    // Try to fetch profile to verify token
                    const { data } = await api.get('/profile');
                    setUser(data.user || data); // Depending on your profile endpoint's response format
                } catch (error) {
                    // If fetching profile fails, maybe token is expired.
                    // The interceptor will try to refresh it. If refresh fails, it will dispatch 'unauthorized'
                    console.error("Failed to fetch initial profile", error);
                }
            }
            setLoading(false);
        };
        initAuth();

        const handleUnauthorized = () => {
            setUser(null);
            localStorage.removeItem('accessToken');
        };

        window.addEventListener('unauthorized', handleUnauthorized);
        return () => window.removeEventListener('unauthorized', handleUnauthorized);
    }, []);

    const login = async (credentials) => {
        const { data } = await api.post('/login', credentials);
        if (data.accessToken) {
            localStorage.setItem('accessToken', data.accessToken);
        }
        setUser(data.user);
        return data;
    };

    const registerStudent = async (studentData) => {
        const { data } = await api.post('/register/student', studentData);
        if (data.accessToken) {
            localStorage.setItem('accessToken', data.accessToken);
        }
        setUser(data.user);
        return data;
    };

    const registerOwner = async (ownerData) => {
        const { data } = await api.post('/register/owner', ownerData);
        if (data.accessToken) {
            localStorage.setItem('accessToken', data.accessToken);
        }
        setUser(data.user);
        return data;
    };

    const logout = async () => {
        try {
            await api.post('/logout');
        } catch (error) {
            console.error("Logout request failed", error);
        } finally {
            localStorage.removeItem('accessToken');
            setUser(null);
        }
    };

    const updateUser = (userData) => {
        setUser(userData);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, registerStudent, registerOwner, updateUser }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
