import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../../hooks/useAuth';
import authService from '../../services/authService';
import { toast } from 'react-toastify';
import LoadingSpinner from '../common/LoadingSpinner';

const schema = yup.object({
  name: yup.string().required('Name is required').max(50),
  bio: yup.string().max(500, 'Bio too long'),
  avatar: yup.string().url('Must be a valid URL').optional(),
});

const EditProfile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { name: user?.name || '', bio: user?.bio || '', avatar: user?.avatar || '' }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await authService.updateProfile(data);
      updateUser(res.data.data.user);
      toast.success('Profile updated');
      navigate(`/profile/${res.data.data.user?._id || user?._id}`);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to update profile'); }
    finally { setLoading(false); }
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-6 px-4 py-3 border-b border-[#eff3f4] sticky top-0 bg-white/80 backdrop-blur-md z-20">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#eff3f4] transition-colors"
        >
          <svg className="w-5 h-5 text-[#0f1419]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-xl font-bold text-[#0f1419]">Edit profile</h2>
      </div>

      {/* Form */}
      <div className="p-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#536471] mb-1.5">Name</label>
            <input {...register('name')} className="input-field" />
            {errors.name && <p className="text-[#f4212e] text-xs mt-1.5">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-[#536471] mb-1.5">Bio</label>
            <textarea {...register('bio')} rows={4} className="input-field resize-none leading-relaxed" placeholder="Tell us about yourself..." />
            {errors.bio && <p className="text-[#f4212e] text-xs mt-1.5">{errors.bio.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-[#536471] mb-1.5">Avatar URL</label>
            <input {...register('avatar')} className="input-field" placeholder="https://example.com/avatar.jpg" />
            {errors.avatar && <p className="text-[#f4212e] text-xs mt-1.5">{errors.avatar.message}</p>}
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-[#eff3f4]">
            <button type="button" onClick={() => navigate(-1)} className="btn-outline-white text-sm py-2 px-6">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary text-sm py-2 px-8 flex items-center gap-2">
              {loading ? <LoadingSpinner size="sm" light /> : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
