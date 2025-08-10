import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Signup from './components/Signup';
import Login from './components/Login';
import App from './App';
import AuthContext, { AuthProvider } from './context/AuthContext';
import { Loader2 } from 'lucide-react'; 

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-gray-500 w-12 h-12" />
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};


function AppRoutes() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><App /></PrivateRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default AppRoutes;