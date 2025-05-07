/* eslint-disable no-unused-vars */
import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useUser } from '../context/user-context';
import './ProfilePictureUpload.css';

const ProfilePictureUpload = () => {
    const { user, updateUser } = useUser();
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError('Please select an image file');
            return;
        }

        try {
            setIsUploading(true);
            setError(null);

            // Convert file to base64
            const base64Image = await convertToBase64(file);

            // Upload to server using Axios
            const response = await axios.put(
                'https://depi-back-production-fb68.up.railway.app/api/auth/profile-picture',
                { image: base64Image },
                {withCredentials: true},
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            updateUser(response.data.data.user);
        } catch (err) {
            const message = err.response?.data?.message || err.message || 'Failed to upload profile picture';
            setError(message);
            console.error('Error uploading profile picture:', err);
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemovePicture = async () => {
        try {
            setIsUploading(true);
            setError(null);

            const response = await axios.delete(
                'https://depi-back-production-fb68.up.railway.app/api/auth/profile-picture',
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            updateUser(response.data.data.user);
        } catch (err) {
            const message = err.response?.data?.message || err.message || 'Failed to remove profile picture';
            setError(message);
            console.error('Error removing profile picture:', err);
        } finally {
            setIsUploading(false);
        }
    };

    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    };

    return (
        <div className="profile-picture-upload">
            
            <div className="profile-picture-container">
                <img
                    src={user?.profilePicture || '/default-avatar.svg'}
                    alt="Profile"
                    className="profile-picture"
                />
                {isUploading && (
                    <div className="upload-overlay">
                        <i className="fas fa-spinner fa-spin"></i>
                    </div>
                )}
            </div>
            <div className="profile-picture-actions">
                <button
                    className="upload-button"
                    onClick={() => fileInputRef.current.click()}
                    disabled={isUploading}
                >
                    <i className="fas fa-camera"></i>
                    Change Picture
                </button>
                {user?.profilePicture && (
                    <button
                        className="remove-button"
                        onClick={handleRemovePicture}
                        disabled={isUploading}
                    >
                        <i className="fas fa-trash"></i>
                        Remove
                    </button>
                )}
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/*"
                    style={{ display: 'none' }}
                />
            </div>
            {error && <div className="error-message">{error}</div>}
            <div className="profile-info-section">
                <h2>Profile Information</h2>
                <div className="user-info">
                    <div className="info-item">
                        <span className="info-label">Username:</span>
                        <span className="info-value">{user?.fullName}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Email:</span>
                        <span className="info-value">{user?.email}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePictureUpload;
