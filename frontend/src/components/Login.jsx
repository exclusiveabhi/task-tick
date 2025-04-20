import React, { useState, useContext } from 'react';
import { Button } from "../components/ui/button";
import Input from '../components/ui/input';
import { Label } from "../components/ui/label";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import config from '../config';
import { Loader2 } from "lucide-react";
import { validateFields } from '../utilities/validation'; 
import { showAlert } from '../utilities/toast'; 
export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validation = validateFields(email, password);
    if (!validation.valid) {
      showAlert('error', 'Validation Error', validation.message);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${config.backendUrl}/api/auth/login`, { email, password });
      login(response.data.token, navigate);
      showAlert('success', 'Login Successful', 'You have successfully logged in!');
    } catch (err) {
      showAlert('error', 'Login Failed', 'Invalid email or password!');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupRedirect = () => {
    navigate('/signup');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </div>
          <Button type="submit" className="w-full flex items-center justify-center" disabled={loading}>
            {loading ? <Loader2 className="animate-spin mr-2" /> : null}
            {loading ? '' : 'Login'}
          </Button>
        </form>
        <div className="mt-4 text-center">
          <Button onClick={handleSignupRedirect} className="w-full" disabled={loading}>
            Create new account ?
          </Button>
        </div>
      </div>
    </div>
  );
}