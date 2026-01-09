import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Profile.css';

function Profile() {
  const [userProfile, setUserProfile] = useState(null);
  const [userReviews, setUserReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [editReviewText, setEditReviewText] = useState('');
  const [editRating, setEditRating] = useState(5);
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const token = localStorage.getItem('authToken');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${token}` };

      const profileRes = await fetch('http://localhost:8080/api/user/profile', { headers });
      if (profileRes.ok) {
        const profile = await profileRes.json();
        // Backend returns nested structure: { id, metadata: { name, username, email, phone, address, role }, auditInfo }
        const mappedProfile = {
          id: profile.id,
          name: profile.metadata?.name || profile.name || '',
          username: profile.metadata?.username || profile.username || '',
          email: profile.metadata?.email || profile.email || '',
          phoneNo: profile.metadata?.phone || profile.phoneNo || profile.phone || '',
          address: profile.metadata?.address || profile.address || '',
          role: profile.metadata?.role || profile.role || '',
        };
        setUserProfile(mappedProfile);
        setFormData({
          name: mappedProfile.name || '',
          email: mappedProfile.email || '',
          phone: mappedProfile.phoneNo || '',
          address: mappedProfile.address || '',
          password: ''
        });

        // Fetch user's reviews using the userId from profile
        if (profile.id) {
          const reviewsRes = await fetch(`http://localhost:8080/api/reviews/user/${mappedProfile.id || profile.id}`, { headers });
          if (reviewsRes.ok) {
            const reviews = await reviewsRes.json();
            setUserReviews(Array.isArray(reviews) ? reviews : []);
          }
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const formDataObj = new FormData();
      if (formData.name) formDataObj.append('name', formData.name);
      if (formData.email) formDataObj.append('email', formData.email);
      if (formData.phone) formDataObj.append('phone', formData.phone);
      if (formData.address) formDataObj.append('address', formData.address);
      if (formData.password) formDataObj.append('password', formData.password);

      const response = await fetch('http://localhost:8080/api/user/profile', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formDataObj
      });

      if (response.ok) {
        setMessage('Profile updated successfully!');
        setEditMode(false);
        loadUserData();
      } else {
        setMessage('Failed to update profile');
      }
    } catch (error) {
      setMessage('Error updating profile');
      console.error('Error:', error);
    }
  };

  if (loading) {
    return <div className="profile-loading">Loading your profile...</div>;
  }

  return (
    <div className="profile-container">
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="profile-tabs">
        <button
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          👤 Profile Information
        </button>
        <button
          className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
          onClick={() => setActiveTab('reviews')}
        >
          ⭐ My Reviews
        </button>
      </div>

      <div className="profile-content">
        {message && (
          <div className="message success-message">{message}</div>
        )}

        {activeTab === 'profile' && (
          <>
            <div className="profile-header">
              <h1>Profile Information</h1>
              {!editMode && (
                <button className="btn-edit" onClick={() => setEditMode(true)}>
                  ✏️ Edit Profile
                </button>
              )}
            </div>

        {!editMode ? (
          <div className="profile-view">
            <div className="profile-field">
              <label>FULL NAME:</label>
              <p>{userProfile?.name || '-'}</p>
            </div>
            <div className="profile-field">
              <label>USERNAME:</label>
              <p>{userProfile?.username || '-'}</p>
            </div>
            <div className="profile-field">
              <label>EMAIL:</label>
              <p>{userProfile?.email || '-'}</p>
            </div>
            <div className="profile-field">
              <label>PHONE:</label>
              <p>{userProfile?.phoneNo || '-'}</p>
            </div>
            <div className="profile-field">
              <label>ADDRESS:</label>
              <p>{userProfile?.address || '-'}</p>
            </div>
            {(userProfile?.role === 'ADMIN' || userProfile?.role === 'MODERATOR') && (
              <div className="profile-field">
                <label>ROLE:</label>
                <div>
                  {userProfile?.role ? (
                    <span className="role-badge">{userProfile.role}</span>
                  ) : (
                    <p style={{ margin: 0 }}>-</p>
                  )}
                </div>
              </div>
            )}
            
          </div>
        ) : (
          <form onSubmit={handleUpdateProfile} className="profile-form">
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your name"
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
              />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Enter your phone"
              />
            </div>
            <div className="form-group">
              <label>Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Enter your address"
              />
            </div>
            <div className="form-group">
              <label>New Password (leave blank to keep current)</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter new password"
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-save">💾 Save Changes</button>
              <button type="button" className="btn-cancel" onClick={() => setEditMode(false)}>
                ✖ Cancel
              </button>
            </div>
          </form>
        )}
          </>
        )}

        {activeTab === 'reviews' && (
          <div className="reviews-section">
            <h2>My Reviews ({userReviews.length})</h2>
            {userReviews.length === 0 ? (
              <div className="empty-state">
                <p>📝 You haven't written any reviews yet.</p>
                <button className="btn-browse" onClick={() => navigate('/')}>
                  Browse Movies
                </button>
              </div>
            ) : (
              <div className="reviews-list">
                {userReviews.map((review) => (
                  <div key={review.reviewId} className="review-card">
                    {editingReview === review.reviewId ? (
                      <div className="review-edit-form">
                        <h3 className="movie-title">{review.movie?.metadata?.title || review.movie?.title || 'Unknown Movie'}</h3>
                        <div className="form-group">
                          <label>Rating</label>
                          <select value={editRating} onChange={(e) => setEditRating(e.target.value)}>
                            <option value="1">1 - Poor</option>
                            <option value="2">2 - Fair</option>
                            <option value="3">3 - Good</option>
                            <option value="4">4 - Very Good</option>
                            <option value="5">5 - Excellent</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Review</label>
                          <textarea
                            value={editReviewText}
                            onChange={(e) => setEditReviewText(e.target.value)}
                            rows="4"
                            placeholder="Write your review..."
                          />
                        </div>
                        <div className="form-actions">
                          <button 
                            className="btn-save"
                            onClick={async () => {
                              try {
                                const formData = new FormData();
                                formData.append('reviewText', editReviewText);
                                formData.append('rating', parseInt(editRating));

                                await fetch(`http://localhost:8080/api/reviews/${review.reviewId}`, {
                                  method: 'PUT',
                                  headers: {
                                    'Authorization': `Bearer ${token}`
                                  },
                                  body: formData
                                });
                                setMessage('Review updated successfully!');
                                setEditingReview(null);
                                loadUserData();
                              } catch (error) {
                                setMessage('Failed to update review');
                                console.error('Error updating review:', error);
                              }
                            }}
                          >
                            💾 Save
                          </button>
                          <button 
                            className="btn-cancel"
                            onClick={() => setEditingReview(null)}
                          >
                            ✖ Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="review-header">
                          <h3 className="movie-title">{review.movie?.metadata?.title || review.movie?.title || 'Unknown Movie'}</h3>
                          <div className="review-actions">
                            <span className="review-rating">⭐ {review.rating}/5</span>
                            <button 
                              className="btn-edit-small"
                              onClick={() => {
                                setEditingReview(review.reviewId);
                                setEditReviewText(review.reviewText || '');
                                setEditRating(review.rating);
                              }}
                            >
                              ✏️ Edit
                            </button>
                          </div>
                        </div>
                        <p className="review-comment">{review.reviewText}</p>
                        <span className="review-date">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
