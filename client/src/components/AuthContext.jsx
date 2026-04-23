import { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { API_BASE_URL } from '../lib/apiBaseUrl';

const AuthContext = createContext();

const readApiResponse = async (response) => {
    const rawBody = await response.text();
    const contentType = response.headers.get('content-type') || '';

    if (!rawBody) {
        return {
            payload: null,
            rawBody: '',
        };
    }

    if (contentType.includes('application/json')) {
        try {
            return {
                payload: JSON.parse(rawBody),
                rawBody,
            };
        } catch {
            return {
                payload: null,
                rawBody,
            };
        }
    }

    return {
        payload: null,
        rawBody,
    };
};

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    const clearSession = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    useEffect(() => {
        const loadUser = async () => {
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const { payload } = await readApiResponse(response);

                if (response.ok && payload?.success) {
                    setUser(payload.data);
                    return;
                }

                if (response.status === 401) {
                    clearSession();
                }
            } catch (error) {
                console.error('Error loading user:', error);
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, [token]);

    const login = async (email, password) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: String(email || '').trim().toLowerCase(),
                    password,
                }),
            });
            const { payload, rawBody } = await readApiResponse(response);

            if (response.ok && payload?.success) {
                localStorage.setItem('token', payload.token);
                setToken(payload.token);
                setUser(payload.user);
                toast.success(`Welcome back, ${payload.user.name}!`);
                return { success: true };
            }

            const message = payload?.message || rawBody || 'Login failed';
            toast.error(message);
            return { success: false, message };
        } catch (error) {
            toast.error('Server error during login');
            return { success: false, message: 'Server error' };
        }
    };

    const register = async (name, email, password) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: String(name || '').trim(),
                    email: String(email || '').trim().toLowerCase(),
                    password,
                }),
            });
            const { payload, rawBody } = await readApiResponse(response);

            if (response.ok && payload?.success) {
                localStorage.setItem('token', payload.token);
                setToken(payload.token);
                setUser(payload.user);
                toast.success(`Account created! Welcome, ${payload.user.name}`);
                return { success: true };
            }

            const message = payload?.message || rawBody || 'Registration failed';
            toast.error(message);
            return { success: false, message };
        } catch (error) {
            toast.error('Server error during registration');
            return { success: false, message: 'Server error' };
        }
    };

    const logout = () => {
        const currentToken = token;

        if (currentToken) {
            void fetch(`${API_BASE_URL}/api/auth/logout`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${currentToken}`,
                },
            }).catch((error) => {
                console.error('Error logging out:', error);
            });
        }

        clearSession();
        toast.info('Logged out successfully');
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
