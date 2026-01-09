import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import './Auth.css';
import './Register.css';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    address: '',
    role: 'VIEWER',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const navigate = useNavigate();

  const roleOptions = [
    {
      id: 'VIEWER',
      name: 'Viewer',
      emoji: '👁️',
      description: 'Browse and watch movies',
      features: ['✓ Browse movies', '✓ Search & filter', '✓ Watch videos', '✓ Add reviews', '✓ Rate movies'],
      badge: 'Popular',
    },
    {
      id: 'MODERATOR',
      name: 'Content Creator',
      emoji: '🎬',
      description: 'Upload and manage your movies',
      features: ['✓ All Viewer features', '✓ Upload movies', '✓ Manage content', '✓ Edit & delete videos'],
      badge: 'Pro',
    },
  ];

  const selectedRole = roleOptions.find((r) => r.id === formData.role); // eslint-disable-next-line no-unused-vars

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  // eslint-disable-next-line no-unused-vars
  const handleRoleSelect = (roleId) => {
    setFormData((prev) => ({
      ...prev,
      role: roleId,
    }));
  };

  const validateStep1 = () => {
    if (!formData.name.trim()) {
      setError('Please enter your full name');
      return false;
    }
    if (!formData.username.trim()) {
      setError('Please enter a username');
      return false;
    }
    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email');
      return false;
    }
    if (!formData.phone.trim()) {
      setError('Please enter a phone number');
      return false;
    }
    if (!formData.address.trim()) {
      setError('Please enter your address');
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (!formData.password.trim()) {
      setError('Please enter a password');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (formStep === 1 && validateStep1()) {
      setFormStep(2);
    } else if (formStep === 2 && validateStep2()) {
      setFormStep(3);
    }
  };

  const handleBack = () => {
    setFormStep(Math.max(1, formStep - 1));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep3()) return;

    setError('');
    setLoading(true);

    try {
      await authAPI.register(formData);
      setSuccess('✅ Registration successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Registration failed. Username or email might already exist.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>🎬 Join MoviesApp</h1>
          <p>Create your account and start streaming amazing movies</p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="form-progress">
          <div className={`progress-step ${formStep >= 1 ? 'active' : ''}`}>
            <span>1</span>
            <p>Account</p>
          </div>
          <div className={`progress-line ${formStep >= 2 ? 'active' : ''}`}></div>
          <div className={`progress-step ${formStep >= 2 ? 'active' : ''}`}>
            <span>2</span>
            <p>Contact</p>
          </div>
          <div className={`progress-line ${formStep >= 3 ? 'active' : ''}`}></div>
          <div className={`progress-step ${formStep >= 3 ? 'active' : ''}`}>
            <span>3</span>
            <p>Security</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Account Info */}
          {formStep === 1 && (
            <div className="form-step">
              <h2>Step 1: Create Your Account</h2>

              <div className="form-group">
                <label htmlFor="name">
                  👤 Full Name <span className="required">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="e.g., John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="username">
                  🔑 Username <span className="required">*</span>
                </label>
                <input
                  id="username"
                  type="text"
                  name="username"
                  placeholder="e.g., johndoe123"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
                {formData.username && (
                  <p className="hint-text">
                    {formData.username.length < 3
                      ? `${3 - formData.username.length} more characters needed`
                      : '✓ Username looks good!'}
                  </p>
                )}
              </div>

              <div className="form-actions">
                <button type="button" className="btn-next" onClick={handleNext}>
                  Next →
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Contact Info */}
          {formStep === 2 && (
            <div className="form-step">
              <h2>Step 2: Contact Information</h2>

              <div className="form-group">
                <label htmlFor="email">
                  📧 Email <span className="required">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="e.g., john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">
                  📱 Phone Number <span className="required">*</span>
                </label>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  placeholder="e.g., 9876543210"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="address">
                  🏠 Address <span className="required">*</span>
                </label>
                <input
                  id="address"
                  type="text"
                  name="address"
                  placeholder="e.g., 123 Main Street, City"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn-back" onClick={handleBack}>
                  ← Back
                </button>
                <button type="button" className="btn-next" onClick={handleNext}>
                  Next →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Security */}
          {formStep === 3 && (
            <div className="form-step">
              <h2>Step 3: Set Your Password</h2>
              <div className="form-group">
                <label htmlFor="password">
                  🔐 Password <span className="required">*</span>
                </label>
                <div className="password-input-wrapper">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="At least 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {formData.password && (
                  <p className="hint-text">
                    {formData.password.length < 6
                      ? `${6 - formData.password.length} more characters needed`
                      : '✓ Password strength: Good'}
                  </p>
                )}
              </div>

              <div className="form-actions">
                <button type="button" className="btn-back" onClick={handleBack}>
                  ← Back
                </button>
                <button
                  type="submit"
                  className="btn-register"
                  disabled={loading}
                >
                  {loading ? '⏳ Registering...' : '✓ Create Account'}
                </button>
              </div>
            </div>
          )}
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <a href="/login" className="auth-link">
              Login here →
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
