// frontend/src/components/user/profile.js
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '../layout/Layout';
import './profile.css';

function Profile() {
  const navigate = useNavigate();
  // You would typically get this data from your authentication context or API
  const [userData, setUserData] = useState({
    email: "ketaki.mahajan@somaiya.edu",
    name: "Km",
    memberSince: "January 2023",
    lastLogin: "April 24, 2023 14:30"
  });
  
  const [formData, setFormData] = useState({
    name: userData.name
  });

  // State for starred algorithms
  const [starredAlgos, setStarredAlgos] = useState([]);

  // Load starred algorithms on component mount
  useEffect(() => {
    const loadStarredAlgos = () => {
      const saved = localStorage.getItem('starredAlgorithms');
      if (saved) {
        setStarredAlgos(JSON.parse(saved));
      }
    };
    
    loadStarredAlgos();
  }, []);

  // Remove algorithm from starred list
  const removeFromStarred = (algoId) => {
    const updatedStarred = starredAlgos.filter(algo => algo.id !== algoId);
    setStarredAlgos(updatedStarred);
    localStorage.setItem('starredAlgorithms', JSON.stringify(updatedStarred));
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Update user data (this would typically involve an API call)
    setUserData({
      ...userData,
      name: formData.name
    });
    alert("Profile updated successfully!");
  };

  const handleLogout = () => {
    // Handle logout logic here
    // Clear tokens, user data, etc.
    alert("Logged out successfully!");
    navigate('/login');
  };

  return (
    <Layout breadcrumb=" / Profile">
      <div className="profile-wrapper">
        <div className="profile-container">
          <h1 className="profile-heading">User Profile of</h1>
          <h2 className="profile-email">{userData.email}</h2>
          
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-row">
              <label htmlFor="name">Name</label>
              <div className="colon">:</div>
              <input 
                type="text" 
                id="name" 
                name="name" 
                value={formData.name} 
                onChange={handleInputChange}
                className="profile-input"
              />
            </div>
            
            <div className="form-row">
              <label htmlFor="email">Email</label>
              <div className="colon">:</div>
              <input 
                type="email" 
                id="email" 
                value={userData.email} 
                disabled
                className="profile-input disabled"
              />
            </div>
            
            <div className="form-row">
              <label htmlFor="memberSince">Member Since</label>
              <div className="colon">:</div>
              <input 
                type="text" 
                id="memberSince" 
                value={userData.memberSince} 
                disabled
                className="profile-input disabled"
              />
            </div>
            
            <div className="form-row">
              <label htmlFor="lastLogin">Last Login</label>
              <div className="colon">:</div>
              <input 
                type="text" 
                id="lastLogin" 
                value={userData.lastLogin} 
                disabled
                className="profile-input disabled"
              />
            </div>
            
            <div className="profile-actions">
              <button type="submit" className="save-btn">Save Changes</button>
              <button type="button" className="logout-btn" onClick={handleLogout}>Logout</button>
            </div>
          </form>
          
          {/* Starred Algorithms Section */}
          <div className="starred-algorithms-section">
            <h2 className="section-title">Revision List</h2>
            
            {starredAlgos.length === 0 ? (
              <p className="no-starred">You haven't added any algorithms to your revision list yet.</p>
            ) : (
              <div className="starred-algorithms-container">
                {starredAlgos.map(algo => (
                  <div className="starred-algo-box" key={algo.id}>
                    <div className="starred-algo-header">
                      <Link to={`/visualizer/${algo.id}`} className="starred-algo-title">
                        {algo.title}
                      </Link>
                      <button 
                        className="remove-star-btn" 
                        onClick={() => removeFromStarred(algo.id)}
                        title="Remove from revision list"
                      >
                        <span className="material-symbols-outlined">close</span>
                      </button>
                    </div>
                    
                    <div className="starred-algo-content">
                      <div className="starred-algo-image">
                        <Link to={`/visualizer/${algo.id}`}>
                          <img src={algo.image} alt={algo.title} />
                        </Link>
                      </div>
                      
                      <div className="starred-algo-info">
                        <div className="starred-algo-tags">
                          {algo.tags.map((tag, index) => (
                            <span className="tag" key={index}>{tag}</span>
                          ))}
                        </div>
                        <div className="starred-date">
                          Added: {new Date(algo.starredAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Profile;