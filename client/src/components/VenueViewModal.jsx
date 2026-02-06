import React from 'react';
import { X, MapPin, Users, ImageIcon } from 'lucide-react';
import '../pages/VenueGallery.css'; // Reusing styles

const VenueViewModal = ({ venue, onClose }) => {
    if (!venue) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="modal-title">{venue.name}</h3>
                    <button className="close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>
                <div className="modal-body">
                    {/* Thumbnail */}
                    {venue.thumbnail && (
                        <div style={{ height: '240px', borderRadius: '12px', overflow: 'hidden', marginBottom: '24px' }}>
                            <img
                                src={`http://localhost:5000/${venue.thumbnail.replace(/\\/g, '/')}`}
                                alt={venue.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        </div>
                    )}

                    {/* Details */}
                    <div style={{ marginBottom: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                            <MapPin size={18} style={{ marginRight: '8px' }} />
                            <span style={{ fontSize: '16px', color: 'var(--text-primary)' }}>{venue.address}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', color: 'var(--text-secondary)' }}>
                            <Users size={18} style={{ marginRight: '8px' }} />
                            <span style={{ fontSize: '16px', color: 'var(--text-primary)' }}>
                                Capacity: {venue.capacity?.totalCapacity || 0}
                            </span>
                        </div>
                    </div>

                    {/* Description */}
                    {venue.description && (
                        <div style={{ marginBottom: '24px' }}>
                            <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>About this Venue</h4>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>{venue.description}</p>
                        </div>
                    )}

                    {/* Gallery */}
                    {venue.images && venue.images.length > 0 && (
                        <div>
                            <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
                                <ImageIcon size={18} style={{ marginRight: '8px' }} /> Gallery
                            </h4>
                            <div className="gallery-preview">
                                {venue.images.map((img, idx) => (
                                    <div key={idx} className="preview-item">
                                        <img
                                            src={`http://localhost:5000/${img.replace(/\\/g, '/')}`}
                                            alt={`Gallery ${idx}`}
                                            className="preview-img"
                                            onClick={() => window.open(`http://localhost:5000/${img.replace(/\\/g, '/')}`, '_blank')}
                                            style={{ cursor: 'pointer' }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <div className="modal-footer">
                    <button className="btn-secondary" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
};

export default VenueViewModal;
