import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../../hooks/useAuth';
import authService from '../../services/authService';
import { toast } from 'react-toastify';
import LoadingSpinner from '../common/LoadingSpinner';
import Avatar from '../common/Avatar';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const schema = yup.object({
  name: yup.string().required('Name is required').max(50),
  bio: yup.string().max(500, 'Bio too long'),
});

const EditProfile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [avatarFile, setAvatarFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(user?.avatar || '');
  const [avatarError, setAvatarError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { name: user?.name || '', bio: user?.bio || '' },
  });

  useEffect(() => {
    return () => {
      if (avatarFile && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [avatarFile, previewUrl]);

  const validateAvatarFile = (file) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Invalid format. Please upload a JPEG, PNG, GIF, or WebP image.';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'Image is too large. Maximum file size is 5MB.';
    }
    return '';
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    setAvatarError('');

    if (!file) {
      return;
    }

    const validationError = validateAvatarFile(file);
    if (validationError) {
      setAvatarError(validationError);
      setAvatarFile(null);
      event.target.value = '';
      return;
    }

    if (previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }

    setAvatarFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleRemoveAvatar = () => {
    if (previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setAvatarFile(null);
    setPreviewUrl(user?.avatar || '');
    setAvatarError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = async (data) => {
    if (avatarError) {
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      let payload = data;

      if (avatarFile) {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('bio', data.bio || '');
        formData.append('avatar', avatarFile);
        payload = formData;
      }

      const res = await authService.updateProfile(payload, (progressEvent) => {
        if (progressEvent.total) {
          setUploadProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
        }
      });

      updateUser(res.data.data.user);
      toast.success('Profile updated');
      navigate(`/profile/${res.data.data.user?._id || user?._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const displayInitial = user?.name?.charAt(0)?.toUpperCase() || '?';

  return (
    <div className="animate-fade-in">
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

      <div className="p-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#536471] mb-3">Profile photo</label>
            <div className="flex items-center gap-5">
              <div className="relative shrink-0">
                {previewUrl ? (
                  <Avatar
                    src={previewUrl}
                    name={user?.name}
                    size="lg"
                    className={loading ? 'opacity-70' : ''}
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#1d9bf0] to-[#1a8cd8] text-white flex items-center justify-center text-3xl font-bold avatar-ring">
                    {displayInitial}
                  </div>
                )}
                {loading && (
                  <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                    <LoadingSpinner size="sm" light />
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleAvatarChange}
                  disabled={loading}
                  className="block w-full text-sm text-[#536471] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#eff3f4] file:text-[#0f1419] hover:file:bg-[#e1e8ed] disabled:opacity-50"
                />
                <p className="text-xs text-[#536471]">JPEG, PNG, GIF, or WebP. Max 5MB.</p>
                {(avatarFile || previewUrl !== (user?.avatar || '')) && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    disabled={loading}
                    className="text-sm text-[#f4212e] hover:underline disabled:opacity-50"
                  >
                    Remove selected photo
                  </button>
                )}
                {avatarError && <p className="text-[#f4212e] text-xs">{avatarError}</p>}
              </div>
            </div>

            {loading && uploadProgress > 0 && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-[#536471] mb-1.5">
                  <span>Uploading photo...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-1.5 bg-[#eff3f4] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#1d9bf0] transition-all duration-200"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#536471] mb-1.5">Name</label>
            <input {...register('name')} className="input-field" disabled={loading} />
            {errors.name && <p className="text-[#f4212e] text-xs mt-1.5">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#536471] mb-1.5">Bio</label>
            <textarea
              {...register('bio')}
              rows={4}
              className="input-field resize-none leading-relaxed"
              placeholder="Tell us about yourself..."
              disabled={loading}
            />
            {errors.bio && <p className="text-[#f4212e] text-xs mt-1.5">{errors.bio.message}</p>}
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-[#eff3f4]">
            <button type="button" onClick={() => navigate(-1)} className="btn-outline-white text-sm py-2 px-6" disabled={loading}>
              Cancel
            </button>
            <button type="submit" disabled={loading || !!avatarError} className="btn-primary text-sm py-2 px-8 flex items-center gap-2">
              {loading ? <LoadingSpinner size="sm" light /> : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
