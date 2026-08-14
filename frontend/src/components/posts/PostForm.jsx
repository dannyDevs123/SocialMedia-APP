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

const IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const VIDEO_MIME_TYPES = new Set(['video/mp4', 'video/webm', 'video/quicktime']);
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;

const PostForm = ({ onPostCreated }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaType, setMediaType] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
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

    const isImage = IMAGE_MIME_TYPES.has(file.type);
    const isVideo = VIDEO_MIME_TYPES.has(file.type);

    if (!isImage && !isVideo) {
      toast.error('Please select an image or video file');
      return;
    }

    if (isImage && file.size > MAX_IMAGE_SIZE) {
      toast.error('Images must be under 5MB');
      return;
    }

    if (isVideo && file.size > MAX_VIDEO_SIZE) {
      toast.error('Videos must be under 50MB');
      return;
    }

    setSelectedFile(file);
    setMediaType(isVideo ? 'video' : 'image');

    const reader = new FileReader();
    reader.onload = (ev) => setMediaPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const removeMedia = () => {
    setMediaPreview(null);
    setMediaType('');
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = new FormData();
      payload.append('content', data.content.trim());
      if (selectedFile) {
        payload.append('media', selectedFile);
      }

      const res = await postService.createPost(payload);
      onPostCreated(res.data.data.post);
      reset();
      removeMedia();
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

          {mediaPreview && (
            <div className="relative mt-3 rounded-2xl overflow-hidden border border-[#eff3f4]">
              {mediaType === 'video' ? (
                <video
                  src={mediaPreview}
                  controls
                  className="w-full max-h-80 bg-black object-contain"
                />
              ) : (
                <img src={mediaPreview} alt="Preview" className="w-full max-h-80 object-cover" />
              )}
              <button
                type="button"
                onClick={removeMedia}
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
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime,.mov"
                  onChange={handleFileSelect}
                  className="hidden"
                />
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
