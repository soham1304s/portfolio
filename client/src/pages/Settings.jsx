import React from 'react';
import { User, Lock, Bell, Palette, Globe, ShieldCheck, Check } from 'lucide-react';
import { useAuth } from '../components/AuthContext';
import './DashboardPages.css';

const Settings = () => {
  const { user } = useAuth();

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1>Settings</h1>
        <p>Manage your account settings, portfolio preferences, and security.</p>
      </div>

      <div className="settings-layout">
        <aside className="settings-nav">
          <button className="settings-nav-item active"><User size={18} /> Profile</button>
          <button className="settings-nav-item"><Lock size={18} /> Password & Security</button>
          <button className="settings-nav-item"><Bell size={18} /> Notifications</button>
          <button className="settings-nav-item"><Palette size={18} /> Appearance</button>
          <button className="settings-nav-item"><Globe size={18} /> SEO & Domain</button>
        </aside>

        <main className="settings-content">
          <section className="settings-section">
            <h3>Public Profile</h3>
            <p className="section-desc">This information will be visible to everyone visiting your portfolio.</p>
            
            <div className="profile-upload">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Soham" alt="Avatar" />
              <div className="upload-actions">
                <button className="add-btn-small">Change Photo</button>
                <button className="text-btn-danger">Remove</button>
              </div>
            </div>

            <div className="settings-form">
              <div className="form-grid">
                <div className="form-field">
                  <label>Full Name</label>
                  <input type="text" defaultValue={user?.name || 'Soham Mondal'} />
                </div>
                <div className="form-field">
                  <label>Email Address</label>
                  <input type="email" defaultValue={user?.email || 'sohammondal1304@gmail.com'} />
                </div>
              </div>
              <div className="form-field">
                <label>Professional Title</label>
                <input type="text" defaultValue="Full Stack Developer & Mobile Engineer" />
              </div>
              <div className="form-field">
                <label>Bio</label>
                <textarea rows="4" defaultValue="Passionate about building scalable web applications and high-performance mobile apps. Focus on React, Node.js, and Flutter." />
              </div>
            </div>
          </section>

          <div className="form-actions">
            <button className="add-btn">Save Changes</button>
            <button className="text-btn">Cancel</button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Settings;
