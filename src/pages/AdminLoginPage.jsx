import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { loginAdmin } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const result = await loginAdmin(formData.email, formData.password);
      
      if (result.success) {
        toast({
          title: 'Login Successful',
          description: 'Welcome to the admin dashboard',
        });
        navigate('/admin/dashboard');
      } else {
        toast({
          title: 'Login Failed',
          description: result.error || 'Invalid credentials',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred during login',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin Login - InstantCare</title>
        <meta name="description" content="Admin login portal for InstantCare healthcare management system" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Portal</h1>
              <p className="text-gray-600">Sign in to access the dashboard</p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="admin@instantcare.com"
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-600 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.password && (
                  <p className="text-red-600 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-base"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5 mr-2" />
                    Sign In
                  </>
                )}
              </Button>
            </form>

            {/* Security Notice */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 text-center">
                <Lock className="inline w-3 h-3 mr-1" />
                Secure admin access. All activities are logged and monitored.
              </p>
            </div>

            {/* Back to Home */}
            <div className="mt-4 text-center">
              <button
                onClick={() => navigate('/')}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                ← Back to Home
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default AdminLoginPage;