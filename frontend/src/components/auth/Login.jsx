import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';
import LoadingSpinner from '../common/LoadingSpinner';
import BrandWordmark from '../common/BrandWordmark';

const schema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
});

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: yupResolver(schema) });

  // If already authenticated, redirect to home — ignore browser autofill until explicit submit
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await login(data.email, data.password);
      toast.success('Welcome');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-layout animate-fade-in">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 animate-scale-in">
          <div className="text-center mb-8">
            <div className="mb-4">
              <BrandWordmark as="span" className="text-4xl" />
            </div>
            <h2 className="text-2xl font-bold text-[#0f1419] tracking-tight">
              Sign in to <BrandWordmark as="span" className="text-2xl align-baseline" />
            </h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                {...register('email')}
                type="email"
                className="w-full border border-gray-300 rounded-md p-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200"
                placeholder="name@gmail.com"
                autoComplete="email"
              />
              {errors.email && <p className="text-[#f4212e] text-xs mt-1.5">{errors.email.message}</p>}
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                {...register('password')}
                type="password"
                className="w-full border border-gray-300 rounded-md p-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200"
                placeholder="••••••••"
                autoComplete="current-password"
              />
              {errors.password && <p className="text-[#f4212e] text-xs mt-1.5">{errors.password.message}</p>}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex justify-center items-center gap-2 py-3 mt-2"
            >
              {loading ? <LoadingSpinner size="sm" light /> : 'Sign In'}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-[#536471]">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#1d9bf0] font-semibold hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
