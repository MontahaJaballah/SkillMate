import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import ReCAPTCHA from 'react-google-recaptcha';
import { GoEye, GoEyeClosed } from 'react-icons/go';
import { FaCheck, FaTimes } from 'react-icons/fa';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { Helmet } from "react-helmet";
import useAuth from "../../../hooks/useAuth";
import AOS from "aos";
import "aos/dist/aos.css";
import axios from 'axios';
import { config } from '../../../config/config';

const SignUp = () => {
  const { signUpUser, updateUserProfile, user, handleLinkedInSignUp, handleGoogleSignUp, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    teachingSubjects: [],
    photo: null,
    certificationFile: null
  });

  const [loading, setLoading] = useState(false);
  const [showP, setShowp] = useState(false);
  const [showConfirmP, setShowConfirmP] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [passwordStrength, setPasswordStrength] = useState({
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false
  });
  const [recaptchaValue, setRecaptchaValue] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [certPreview, setCertPreview] = useState(null);
  const [phoneError, setPhoneError] = useState('');
  const navigate = useNavigate();

  // Password validation rules with real-time feedback
  const validatePassword = (password) => {
    const strength = {
      hasMinLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    setPasswordStrength(strength);
    return Object.values(strength).every(Boolean);
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file') {
      handleFileChange(name, files[0]);
    } else if (name === 'password') {
      validatePassword(value);
      setPasswordsMatch(value === formData.confirmPassword);
      setFormData({ ...formData, password: value });
    } else if (name === 'confirmPassword') {
      setPasswordsMatch(value === formData.password);
      setFormData({ ...formData, confirmPassword: value });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleFileChange = (name, file) => {
    if (!file) return;

    if (name === 'photo') {
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        toast.error('Please upload a JPG or PNG file for your photo');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
      }
      setFormData({ ...formData, photo: file });
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result);
      reader.readAsDataURL(file);
    } else if (name === 'certificationFile') {
      if (!['image/jpeg', 'image/png', 'application/pdf'].includes(file.type)) {
        toast.error('Please upload a JPG, PNG, or PDF file for your certification');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
      }
      setFormData({ ...formData, certificationFile: file });
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => setCertPreview(reader.result);
        reader.readAsDataURL(file);
      } else {
        setCertPreview(`PDF File: ${file.name}`);
      }
    }
  };

  const handlePhoneChange = (value, country) => {
    setFormData({
      ...formData,
      phoneNumber: value
    });
    setPhoneError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!recaptchaValue) {
      toast.error("Please complete the reCAPTCHA verification");
      return;
    }

    if (!validatePassword(formData.password)) {
      toast.error("Please ensure your password meets all requirements");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const userData = new FormData();
      userData.append('username', formData.username);
      userData.append('email', formData.email);
      userData.append('password', formData.password);
      userData.append('firstName', formData.firstName);
      userData.append('lastName', formData.lastName);
      userData.append('phoneNumber', formData.phoneNumber);
      userData.append('role', formData.role);
      
      if (formData.role === 'teacher') {
        userData.append('teachingSubjects', JSON.stringify(formData.teachingSubjects));
        if (formData.certificationFile) {
          userData.append('certificationFile', formData.certificationFile);
        }
      }
      
      if (formData.photo) {
        userData.append('photo', formData.photo);
      }

      const response = await axios.post('http://localhost:5000/api/auth/signup', 
        userData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          withCredentials: true
        }
      );

      if (response.data.success) {
        toast.success('Successfully signed up!');
        updateUser(response.data.user);
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast.error(error.response?.data?.error || 'Error during signup');
    } finally {
      setLoading(false);
    }
  };

  const handleShowP = () => {
    setShowp(!showP);
  };

  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);

  const PasswordRequirements = () => {
    if (!showPasswordRequirements) return null;
    
    const requirements = [
      { label: 'At least 8 characters', met: formData.password.length >= 8 },
      { label: 'One uppercase letter (A-Z)', met: /[A-Z]/.test(formData.password) },
      { label: 'One lowercase letter (a-z)', met: /[a-z]/.test(formData.password) },
      { label: 'One number (0-9)', met: /\d/.test(formData.password) },
      { label: 'One special character (!@#$%^&*(),.?":{}|<>)', met: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password) }
    ];

    return (
      <div className="mt-2 space-y-2 text-sm">
        {requirements.map((req, index) => (
          <div key={index} className="flex items-center space-x-2">
            <span className={`h-1.5 w-1.5 rounded-full ${req.met ? 'bg-violet-500' : 'bg-gray-300'}`} />
            <span className={req.met ? 'text-violet-500' : 'text-gray-500'}>
              {req.label}
            </span>
          </div>
        ))}
      </div>
    );
  };

  AOS.init();

  if (user) {
    navigate("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 py-12 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>Sign Up</title>
      </Helmet>
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 space-y-8 transform hover:scale-[1.02] transition-transform duration-300">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-2">
            Join Our Community
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Start your journey of learning and teaching
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Username field */}
            <div className="form-control">
              <label className="label">
                <span className="label-text text-gray-700 dark:text-gray-300 font-medium">Username</span>
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="input input-bordered w-full bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            {/* Email field */}
            <div className="form-control">
              <label className="label">
                <span className="label-text text-gray-700 dark:text-gray-300 font-medium">Email</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input input-bordered w-full bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            {/* First Name field */}
            <div className="form-control">
              <label className="label">
                <span className="label-text text-gray-700 dark:text-gray-300 font-medium">First Name</span>
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="input input-bordered w-full bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            {/* Last Name field */}
            <div className="form-control">
              <label className="label">
                <span className="label-text text-gray-700 dark:text-gray-300 font-medium">Last Name</span>
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="input input-bordered w-full bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            {/* Phone Number with Flag */}
            <div className="form-control">
              <label className="label">
                <span className="label-text text-gray-700 dark:text-gray-300 font-medium">Phone Number</span>
              </label>
              <PhoneInput
                country={'tn'}
                value={formData.phoneNumber}
                onChange={handlePhoneChange}
                inputClass="!w-full !h-12 !bg-gray-50 dark:!bg-gray-700 !text-gray-900 dark:!text-white !border-gray-300 dark:!border-gray-600 focus:!ring-2 focus:!ring-purple-500"
                buttonClass="!bg-gray-50 dark:!bg-gray-700 !border-gray-300 dark:!border-gray-600"
                dropdownClass="!bg-white dark:!bg-gray-800 !text-gray-900 dark:!text-white"
                enableSearch={true}
                searchClass="!bg-gray-50 dark:!bg-gray-700 !text-gray-900 dark:!text-white"
                searchPlaceholder="Search country..."
                containerClass="!w-full"
              />
              {phoneError && <span className="text-red-500 text-sm mt-1">{phoneError}</span>}
            </div>

            {/* Role Selection */}
            <div className="form-control">
              <label className="label">
                <span className="label-text text-gray-700 dark:text-gray-300 font-medium">Role</span>
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="select select-bordered w-full bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-purple-500"
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
              </select>
            </div>
          </div>

          {/* Password Section with Real-time Validation */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-gray-700 dark:text-gray-300 font-medium">Password</span>
                </label>
                <div className="relative">
                  <input
                    type={showP ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-gray-200 mt-2 border focus:border-violet-500 focus:bg-white focus:outline-none"
                    required
                    onFocus={() => setShowPasswordRequirements(true)}
                    onBlur={() => setShowPasswordRequirements(false)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowp(!showP)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showP ? <GoEyeClosed size={20} /> : <GoEye size={20} />}
                  </button>
                </div>
                <PasswordRequirements />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text text-gray-700 dark:text-gray-300 font-medium">Confirm Password</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmP ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`input input-bordered w-full bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-purple-500 pr-10 ${
                      formData.confirmPassword && !passwordsMatch ? 'border-red-500' : ''
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmP(!showConfirmP)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-purple-500"
                  >
                    {showConfirmP ? <GoEyeClosed size={20} /> : <GoEye size={20} />}
                  </button>
                </div>
                {formData.confirmPassword && !passwordsMatch && (
                  <p className="text-red-500 text-sm mt-1">Passwords do not match</p>
                )}
              </div>
            </div>
          </div>

          {/* Profile Picture Upload */}
          <div className="form-control">
            <label className="label">
              <span className="label-text text-gray-700 dark:text-gray-300 font-medium">Profile Picture</span>
            </label>
            <div className="flex flex-col items-center space-y-4">
              <input
                type="file"
                name="photo"
                onChange={handleChange}
                accept="image/jpeg,image/png"
                className="file-input file-input-bordered w-full bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-purple-500"
              />
              {photoPreview && (
                <div className="relative w-32 h-32 rounded-full overflow-hidden shadow-lg">
                  <img
                    src={photoPreview}
                    alt="Profile Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Teacher-specific fields */}
          {formData.role === 'teacher' && (
            <div className="space-y-6 border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Teacher Information</h3>
              
              {/* Teaching Subjects */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-gray-700 dark:text-gray-300 font-medium">Teaching Subjects</span>
                </label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {formData.teachingSubjects.map((subject, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full flex items-center gap-2"
                    >
                      {subject}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(subject)}
                        className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <select
                  value={formData.teachingSubjects}
                  onChange={(e) => setFormData({ ...formData, teachingSubjects: e.target.value })}
                  className="select select-bordered w-full bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-purple-500 mb-2"
                >
                  <option value="">Select a subject</option>
                  <option value="Music">Music</option>
                  <option value="Chess">Chess</option>
                  <option value="Rubik's Cube">Rubik's Cube</option>
                  <option value="IT">IT</option>
                  <option value="Gym">Gym</option>
                  <option value="Cooking">Cooking</option>
                </select>
                <button
                  type="button"
                  onClick={handleAddSkill}
                  disabled={!formData.teachingSubjects}
                  className="btn btn-outline btn-primary w-full hover:bg-purple-600 hover:border-purple-600"
                >
                  Add Subject
                </button>
              </div>

              {/* Certification Upload */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-gray-700 dark:text-gray-300 font-medium">Certification</span>
                </label>
                <div className="flex flex-col items-center space-y-4">
                  <input
                    type="file"
                    name="certificationFile"
                    onChange={handleChange}
                    accept="image/jpeg,image/png,application/pdf"
                    className="file-input file-input-bordered w-full bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-purple-500"
                    required
                  />
                  {certPreview && (
                    <div className="max-w-xs w-full">
                      {typeof certPreview === 'string' && certPreview.startsWith('PDF') ? (
                        <div className="p-4 bg-purple-50 dark:bg-purple-900 rounded-lg text-center">
                          <svg className="w-8 h-8 mx-auto text-purple-600 dark:text-purple-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          <span className="text-purple-800 dark:text-purple-200">{certPreview}</span>
                        </div>
                      ) : (
                        <img
                          src={certPreview}
                          alt="Certification Preview"
                          className="w-full rounded-lg shadow-lg"
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* reCAPTCHA */}
          <div className="flex justify-center">
            <ReCAPTCHA
              sitekey={config.RECAPTCHA_SITE_KEY}
              onChange={setRecaptchaValue}
              theme="light"
              className="transform scale-100 hover:scale-105 transition-transform duration-300"
            />
          </div>

          {/* Social Sign Up Options */}
          <div className="divider text-gray-500 dark:text-gray-400">OR</div>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="button"
              onClick={handleGoogleSignUp}
              className="btn btn-outline flex-1 gap-2 hover:bg-red-600 hover:border-red-600"
            >
              <img src="/google.png" alt="Google" className="w-5 h-5" />
              Sign up with Google
            </button>
            <button
              type="button"
              onClick={handleLinkedInSignUp}
              className="btn btn-outline flex-1 gap-2 hover:bg-blue-600 hover:border-blue-600"
            >
              <img src="/linkedin.png" alt="LinkedIn" className="w-5 h-5" />
              Sign up with LinkedIn
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full btn bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 rounded-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50"
          >
            {loading ? (
              <span className="loading loading-spinner loading-md"></span>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        <p className="text-center text-gray-600 dark:text-gray-400">
          Already have an account?{" "}
          <Link to="/signin" className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 font-medium">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
