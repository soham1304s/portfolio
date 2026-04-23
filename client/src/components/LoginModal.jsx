import { useState, useEffect, useRef } from 'react';
import { X, Mail, Lock, User, ArrowRight, Sparkles, Loader2 } from 'lucide-react';
import { animate } from 'animejs';
import { useAuth } from './AuthContext';
import './LoginModal.css';

const LoginModal = ({ isOpen, onClose, onSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const { login, register } = useAuth();
    
    const modalRef = useRef(null);
    const overlayRef = useRef(null);
    const contentRef = useRef(null);

    useEffect(() => {
        if (isOpen && modalRef.current) {
            document.body.style.overflow = 'hidden';
            
            // Initial states
            modalRef.current.style.display = 'flex';
            
            animate(overlayRef.current, {
                opacity: [0, 1],
                duration: 400,
                ease: 'outQuart'
            });

            animate(contentRef.current, {
                opacity: [0, 1],
                translateY: [20, 0],
                scale: [0.95, 1],
                duration: 600,
                ease: 'outExpo',
                delay: 100
            });
        } else if (!isOpen && modalRef.current) {
            document.body.style.overflow = '';
            
            animate(contentRef.current, {
                opacity: 0,
                translateY: 20,
                scale: 0.95,
                duration: 400,
                ease: 'inQuad'
            });

            animate(overlayRef.current, {
                opacity: 0,
                duration: 300,
                ease: 'inQuad',
                delay: 100,
                onComplete: () => {
                    if (modalRef.current) modalRef.current.style.display = 'none';
                }
            });
        }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        let result;
        if (isLogin) {
            result = await login(formData.email, formData.password);
        } else {
            result = await register(formData.name, formData.email, formData.password);
        }

        setIsLoading(false);
        if (result.success) {
            onSuccess?.();
            onClose();
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="auth-modal-overlay" ref={modalRef} style={{ display: 'none' }}>
            <div className="auth-modal-backdrop" ref={overlayRef} onClick={onClose} />
            <div className="auth-modal-content" ref={contentRef}>
                <button className="auth-modal-close" onClick={onClose}>
                    <X size={20} />
                </button>

                <div className="auth-modal-header">
                    <div className="auth-logo">
                        <Sparkles size={24} className="text-primary" />
                    </div>
                    <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                    <p>{isLogin ? 'Sign in to access your dashboard' : 'Join us to start managing your projects'}</p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    {!isLogin && (
                        <div className="form-group">
                            <label htmlFor="name">Full Name</label>
                            <div className="input-wrapper">
                                <User size={18} className="input-icon" />
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    placeholder="Enter your name"
                                    autoComplete="name"
                                    minLength={2}
                                    maxLength={80}
                                    value={formData.name}
                                    onChange={handleChange}
                                    required={!isLogin}
                                />
                            </div>
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <div className="input-wrapper">
                            <Mail size={18} className="input-icon" />
                            <input
                                type="email"
                                id="email"
                                name="email"
                                placeholder="name@example.com"
                                autoComplete="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <div className="input-wrapper">
                            <Lock size={18} className="input-icon" />
                            <input
                                type="password"
                                id="password"
                                name="password"
                                placeholder="••••••••"
                                autoComplete={isLogin ? 'current-password' : 'new-password'}
                                minLength={6}
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="auth-submit-btn" disabled={isLoading}>
                        {isLoading ? (
                            <Loader2 size={20} className="animate-spin" />
                        ) : (
                            <>
                                {isLogin ? 'Sign In' : 'Create Account'}
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>

                <div className="auth-modal-footer">
                    <p>
                        {isLogin ? "Don't have an account?" : "Already have an account?"}
                        <button onClick={() => setIsLogin(!isLogin)}>
                            {isLogin ? 'Sign Up' : 'Sign In'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginModal;
