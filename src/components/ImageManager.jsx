import React, { useState, useRef, useEffect } from 'react';
import api from '../api/axios';

/**
 * ImageManager
 * Handles file drag & drop, uploading, and deleting images for a specific entity.
 * @param {string} entityType - 'hostels' or 'rooms'
 * @param {string|number} entityId - The ID of the hostel or room
 */
export default function ImageManager({ entityType, entityId }) {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchImages();
    }, [entityId]);

    const fetchImages = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/${entityType}/${entityId}`);
            // Depending on the endpoint, the entity is returned under its singular name
            const entity = res.data.hostel || res.data.room;
            if (entity && entity.images) {
                setImages(entity.images);
            }
        } catch (err) {
            setError('Failed to load images.');
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = async (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        await uploadFiles(files);
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        const files = e.dataTransfer.files;
        if (!files || files.length === 0) return;
        await uploadFiles(files);
    };

    const uploadFiles = async (files) => {
        const formData = new FormData();
        Array.from(files).forEach(file => {
            formData.append('images', file);
        });

        try {
            setUploading(true);
            setError('');
            const res = await api.post(`/${entityType}/${entityId}/images`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setImages(res.data.images);
            // reset file input
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to upload images.');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (imageId) => {
        if (!window.confirm("Delete this image?")) return;
        try {
            await api.delete(`/${entityType}/${entityId}/images/${imageId}`);
            setImages(images.filter(img => img.image_id !== imageId));
        } catch (err) {
            alert('Failed to delete image.');
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500 animate-pulse">Loading images...</div>;
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-8">
            <div className="px-6 py-5 border-b border-gray-100">
                <h3 className="text-lg font-medium text-gray-900">Manage Photos</h3>
                <p className="text-sm text-gray-500 mt-1">First photo acts as the cover image.</p>
            </div>

            <div className="p-6">
                {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</div>}

                {/* Grid */}
                {images.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
                        {images.map((img) => (
                            <div key={img.image_id} className="relative group h-32 w-full rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                                <img src={api.defaults.baseURL.replace('/api', '') + img.image_url} alt="Property setup" className="object-cover w-full h-full" />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                                    <button
                                        type="button"
                                        onClick={(e) => { e.preventDefault(); handleDelete(img.image_id); }}
                                        className="bg-red-500 text-white p-2 text-sm rounded-full hover:bg-red-600 shadow-md transform scale-90 group-hover:scale-100 transition-all"
                                    >
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-6 text-gray-500 text-sm mb-4">No photos uploaded yet.</div>
                )}

                {/* Dropzone */}
                <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 hover:border-emerald-400 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <svg className="mx-auto h-10 w-10 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm font-medium text-gray-900">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                    />

                    {uploading && (
                        <div className="mt-4 flex flex-col items-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-600 mb-2"></div>
                            <span className="text-xs text-emerald-600 font-medium">Uploading images...</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
