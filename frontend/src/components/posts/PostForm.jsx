import React, { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../../hooks/useAuth';
import postService from '../../services/postService';
import { toast } from 'react-toastify';
import LoadingSpinner from '../common/LoadingSpinner';

const schema = yup.object({
  content: yup.string().required('Content is required').max(500, 'Max 500 characters'),
});

const PostForm = ({ onPostCreated }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });
  const content = watch('content', '');

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = {
        content: data.content.trim(),
        imageUrl: imagePreview || '',
      };

      const res = await postService.createPost(payload);
      onPostCreated(res.data.data.post);
      reset();
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      toast.success('Posted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="card border-b border-[#eff3f4] rounded-none hover:bg-white p-4">
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover avatar-ring" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1d9bf0] to-[#1a8cd8] text-white flex items-center justify-center font-bold text-sm">
              {user.name?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 min-w-0">
          <textarea
            {...register('content')}
            data-composer
            rows={3}
            className="w-full bg-transparent border-none rounded-none p-0
              focus:outline-none focus:ring-0 resize-none
              placeholder:text-[#536471] text-[#0f1419] text-xl leading-relaxed"
            placeholder="What is happening?!"
          />

          {imagePreview && (
            <div className="relative mt-3 rounded-2xl overflow-hidden border border-[#eff3f4]">
              <img src={imagePreview} alt="Preview" className="w-full max-h-80 object-cover" />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 w-8 h-8 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center text-sm transition-colors"
              >
                x
              </button>
            </div>
          )}

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#eff3f4]">
            <div className="flex items-center gap-2">
              <label className="flex items-center justify-center w-9 h-9 rounded-full text-[#1d9bf0] hover:bg-[#1d9bf0]/10 cursor-pointer transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
              </label>
            </div>

            <div className="flex items-center gap-3">
              {content.length > 0 && (
                <div className={`text-sm ${content.length > 450 ? 'text-[#f4212e]' : 'text-[#536471]'}`}>
                  {content.length}/500
                </div>
              )}
              <button
                type="submit"
                disabled={loading || !content.trim()}
                className="btn-primary text-sm py-2 px-5 disabled:opacity-50"
              >
                {loading ? <LoadingSpinner size="sm" light /> : 'Post'}
              </button>
            </div>
          </div>

          {errors.content && <p className="text-[#f4212e] text-xs mt-2">{errors.content.message}</p>}
        </form>
      </div>
    </div>
  );
};

export default PostForm;
