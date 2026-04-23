import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './auth-context';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a] text-[#ffd700]">
                <div className="animate-pulse text-xl font-bold">Verifying Session...</div>
            </div>
        );
    }

    if (!user) {
        // Redirect to home page but save the location they were trying to access
        // In our case, we'll just redirect to home and let the App handle the modal
        return <Navigate to="/" state={{ from: location, openLogin: true }} replace />;
    }

    return children;
};

export default ProtectedRoute;
