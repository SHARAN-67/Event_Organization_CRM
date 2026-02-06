import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, MapPin, Users, Edit2, Trash2 } from 'lucide-react';
import VenueModal from '../components/VenueModal';
import VenueViewModal from '../components/VenueViewModal';
import './VenueGallery.css'; // Import the new CSS

const VenueGallery = () => {
    const [venues, setVenues] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedVenue, setSelectedVenue] = useState(null);
    const [viewVenue, setViewVenue] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchVenues = async () => {
        try {
            setLoading(true);
            const res = await axios.get('http://localhost:5000/api/venues');
            setVenues(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVenues();
    }, []);

    const handleAddClick = () => {
        setSelectedVenue(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (venue) => {
        setSelectedVenue(venue);
        setIsModalOpen(true);
    };

    const handleDeleteClick = async (id) => {
        if (window.confirm('Are you sure you want to delete this venue?')) {
            try {
                await axios.delete(`http://localhost:5000/api/venues/${id}`);
                fetchVenues();
            } catch (error) {
                console.error('Error deleting venue', error);
            }
        }
    };

    const handleSave = () => {
        fetchVenues(); // Refresh list
    };

    return (
        <div className="venue-gallery-container">
            <div className="gallery-header">
                <div>
                    <h2 className="gallery-title">Venue Gallery</h2>
                    <p className="gallery-subtitle">Manage your venues, floor plans, and capacity information</p>
                </div>
                <button onClick={handleAddClick} className="add-venue-btn">
                    <Plus className="btn-icon" />
                    Add Venue
                </button>
            </div>

            {loading ? (
                <div className="loading-container">
                    <div className="spinner"></div>
                </div>
            ) : venues.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon-wrapper">
                        <Plus className="empty-icon" />
                    </div>
                    <p className="empty-text-title">No venues yet</p>
                    <p className="empty-text-sub">Get started by adding your first venue</p>
                    <button onClick={handleAddClick} className="add-venue-btn">
                        + Add Venue
                    </button>
                </div>
            ) : (
                <div className="venues-grid">
                    {venues.map((venue) => (
                        <div
                            key={venue._id}
                            onClick={() => setViewVenue(venue)}
                            className="venue-card"
                        >
                            <div className="card-image-container">
                                {venue.thumbnail ? (
                                    <img
                                        src={`http://localhost:5000/${venue.thumbnail.replace(/\\/g, '/')}`}
                                        alt={venue.name}
                                        className="venue-thumbnail"
                                    />
                                ) : (
                                    <div className="no-image-placeholder">
                                        <span>No Image</span>
                                    </div>
                                )}
                                <div className="card-actions">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleEditClick(venue);
                                        }}
                                        className="action-btn edit"
                                        title="Edit"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteClick(venue._id);
                                        }}
                                        className="action-btn delete"
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="card-content">
                                <h3 className="card-title">{venue.name}</h3>
                                {venue.address && (
                                    <div className="card-meta-row">
                                        <MapPin className="meta-icon" />
                                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{venue.address}</span>
                                    </div>
                                )}
                                <div className="card-footer">
                                    <div className="capacity-info">
                                        <Users className="meta-icon" />
                                        <span className="capacity-number">{venue.capacity?.totalCapacity || 0}</span>
                                        <span>Capacity</span>
                                    </div>
                                    {venue.capacity?.standingCapacity > 0 && (
                                        <div className="standing-badge">
                                            {venue.capacity.standingCapacity} Standing
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <VenueModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                venueToEdit={selectedVenue}
                onSave={handleSave}
            />

            <VenueViewModal
                venue={viewVenue}
                onClose={() => setViewVenue(null)}
            />
        </div>
    );
};

export default VenueGallery;
