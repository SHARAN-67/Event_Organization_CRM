import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import '../pages/VenueGallery.css';

const VenueModal = ({ isOpen, onClose, venueToEdit, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        capacity: {
            totalCapacity: 0,
            seatedCapacity: 0,
            standingCapacity: 0
        },
        description: '',
        thumbnail: null,
        images: [] // Array of File objects
    });
    const [thumbnailPreview, setThumbnailPreview] = useState(null);
    const [galleryPreviews, setGalleryPreviews] = useState([]); // Array of URLs
    const [existingGalleryImages, setExistingGalleryImages] = useState([]); // Array of strings (paths)
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (venueToEdit) {
            setFormData({
                name: venueToEdit.name || '',
                address: venueToEdit.address || '',
                capacity: {
                    totalCapacity: venueToEdit.capacity?.totalCapacity || 0,
                    seatedCapacity: venueToEdit.capacity?.seatedCapacity || 0,
                    standingCapacity: venueToEdit.capacity?.standingCapacity || 0
                },
                description: venueToEdit.description || '',
                thumbnail: null,
                images: []
            });
            if (venueToEdit.thumbnail) {
                setThumbnailPreview(`http://localhost:5000/${venueToEdit.thumbnail.replace(/\\/g, '/')}`);
            } else {
                setThumbnailPreview(null);
            }
            if (venueToEdit.images && Array.isArray(venueToEdit.images)) {
                setExistingGalleryImages(venueToEdit.images);
            } else {
                setExistingGalleryImages([]);
            }
        } else {
            setFormData({
                name: '',
                address: '',
                capacity: { totalCapacity: 0, seatedCapacity: 0, standingCapacity: 0 },
                description: '',
                thumbnail: null,
                images: []
            });
            setThumbnailPreview(null);
            setExistingGalleryImages([]);
        }
        setGalleryPreviews([]);
    }, [venueToEdit, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleThumbnailChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, thumbnail: file }));
            setThumbnailPreview(URL.createObjectURL(file));
        }
    };

    // Drag and Drop Logic
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const handleGalleryChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFiles(e.target.files);
        }
    };

    const handleFiles = (files) => {
        const newFiles = Array.from(files);
        setFormData(prev => ({
            ...prev,
            images: [...prev.images, ...newFiles]
        }));

        const newPreviews = newFiles.map(file => URL.createObjectURL(file));
        setGalleryPreviews(prev => [...prev, ...newPreviews]);
    };

    const removeGalleryImage = (index) => {
        setFormData(prev => {
            const newImages = [...prev.images];
            newImages.splice(index, 1);
            return { ...prev, images: newImages };
        });
        setGalleryPreviews(prev => {
            const newPreviews = [...prev];
            URL.revokeObjectURL(newPreviews[index]); // cleanup
            newPreviews.splice(index, 1);
            return newPreviews;
        });
    };

    const removeExistingImage = (index) => {
        setExistingGalleryImages(prev => {
            const newImages = [...prev];
            newImages.splice(index, 1);
            return newImages;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = new FormData();
        data.append('name', formData.name);
        data.append('address', formData.address);
        data.append('capacity', JSON.stringify(formData.capacity));
        data.append('description', formData.description);
        data.append('existingImages', JSON.stringify(existingGalleryImages));

        if (formData.thumbnail) {
            data.append('thumbnail', formData.thumbnail);
        }

        if (formData.images && formData.images.length > 0) {
            formData.images.forEach(image => {
                data.append('images', image);
            });
        }

        try {
            if (venueToEdit) {
                await axios.put(`http://localhost:5000/api/venues/${venueToEdit._id}`, data);
            } else {
                await axios.post('http://localhost:5000/api/venues', data);
            }
            onSave();
            onClose();
        } catch (error) {
            console.error('Error saving venue:', error);
            alert('Failed to save venue');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="modal-title">{venueToEdit ? 'Edit Venue' : 'Add New Venue'}</h3>
                    <button className="close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="form-group">
                            <label className="form-label">Venue Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="form-input"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Address</label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                className="form-input"
                                required
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group" style={{ flex: 1 }}>
                                <label className="form-label">Total Capacity</label>
                                <input
                                    type="number"
                                    name="capacity.totalCapacity"
                                    value={formData.capacity.totalCapacity}
                                    onChange={handleChange}
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group" style={{ flex: 1 }}>
                                <label className="form-label">Standing</label>
                                <input
                                    type="number"
                                    name="capacity.standingCapacity"
                                    value={formData.capacity.standingCapacity}
                                    onChange={handleChange}
                                    className="form-input"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="form-textarea"
                                rows="3"
                            ></textarea>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Thumbnail Image</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleThumbnailChange}
                                className="form-input"
                            />
                            {thumbnailPreview && (
                                <div style={{ marginTop: '10px', height: '150px', borderRadius: '8px', overflow: 'hidden' }}>
                                    <img src={thumbnailPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                            )}
                        </div>

                        {/* Gallery Drop Zone */}
                        <div className="form-group">
                            <label className="form-label">Gallery Images (Drag & Drop)</label>
                            <div
                                className={`drop-zone ${dragActive ? 'active' : ''}`}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current.click()}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleGalleryChange}
                                    style={{ display: 'none' }}
                                />
                                <Upload className="drop-icon" />
                                <p className="drop-zone-text">Drag & drop files here or click to upload</p>
                            </div>

                            {/* Existing Images (Edit Mode) */}
                            {existingGalleryImages.length > 0 && (
                                <div style={{ marginBottom: '10px' }}>
                                    <label className="form-label" style={{ fontSize: '12px' }}>Existing Images</label>
                                    <div className="gallery-preview">
                                        {existingGalleryImages.map((src, index) => (
                                            <div key={`existing-${index}`} className="preview-item">
                                                <img
                                                    src={`http://localhost:5000/${src.replace(/\\/g, '/')}`}
                                                    alt={`Existing ${index}`}
                                                    className="preview-img"
                                                />
                                                <button type="button" className="remove-img-btn" onClick={() => removeExistingImage(index)}>
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* New Previews */}
                            {galleryPreviews.length > 0 && (
                                <div>
                                    <label className="form-label" style={{ fontSize: '12px' }}>New Images</label>
                                    <div className="gallery-preview">
                                        {galleryPreviews.map((src, index) => (
                                            <div key={`new-${index}`} className="preview-item">
                                                <img src={src} alt={`Preview ${index}`} className="preview-img" />
                                                <button type="button" className="remove-img-btn" onClick={() => removeGalleryImage(index)}>
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-primary">Save Venue</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default VenueModal;
