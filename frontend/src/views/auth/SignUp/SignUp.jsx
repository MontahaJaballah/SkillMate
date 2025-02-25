import { useState } from "react";
import { GoEye, GoEyeClosed } from "react-icons/go";
import { Link, useHistory } from "react-router-dom";
import { Helmet } from "react-helmet";
import toast from "react-hot-toast";
import useAuth from "../../../hooks/useAuth";
import AOS from "aos";
import "aos/dist/aos.css";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import axios from 'axios';

const SignUp = () => {
  const { signUpUser, updateUserProfile, user, handleLinkedInSignUp, handleGoogleSignUp, updateUser } = useAuth();
  const [showP, setShowp] = useState(false);
  const [showConfirmP, setShowConfirmP] = useState(false);
  const history = useHistory();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    role: 'student',
    teachingSubjects: [],
    photo: null,
    certificationFile: null
  });
  const [loading, setLoading] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [passwordStrength, setPasswordStrength] = useState({
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false
  });

  // Password validation rules
  const validatePassword = (password) => {
    return {
      hasMinLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
  };

  const isPasswordValid = (strength) => {
    return Object.values(strength).every(Boolean);
  };

  const [showSkillInput, setShowSkillInput] = useState(false);
  const [currentSkill, setCurrentSkill] = useState('');
  const [photoPreview, setPhotoPreview] = useState(null);

  const subjects = [
    'Music',
    'Chess',
    "Rubik's Cube",
    'IT',
    'Gym',
    'Cooking'
  ];

  const notify = () =>
    toast.success("Sign Up Successful.", {
      style: {
        border: "1px solid #007456",
        padding: "20px",
        color: "#007456",
      },
      iconTheme: {
        primary: "#007456",
        secondary: "#FFFAEE",
      },
    });

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file') {
      if (name === 'photo') {
        const file = files[0];
        if (file) {
          // Check file type
          if (!['image/jpeg', 'image/png', 'application/pdf'].includes(file.type)) {
            toast.error('Please upload a JPG, PNG, or PDF file');
            return;
          }
          // Check file size (max 5MB)
          if (file.size > 5 * 1024 * 1024) {
            toast.error('File size should be less than 5MB');
            return;
          }

          setFormData({
            ...formData,
            photo: file
          });

          // Create preview for image files
          if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
              setPhotoPreview(reader.result);
            };
            reader.readAsDataURL(file);
          } else {
            // For PDF files, show a placeholder or filename
            setPhotoPreview('PDF File: ' + file.name);
          }
        }
      } else {
        setFormData({
          ...formData,
          [name]: files[0]
        });
      }
    } else {
      const newFormData = {
        ...formData,
        [name]: value
      };
      setFormData(newFormData);

      // Check password match and strength when password changes
      if (name === 'password') {
        setPasswordStrength(validatePassword(value));
        setPasswordsMatch(value === formData.confirmPassword);
      } else if (name === 'confirmPassword') {
        setPasswordsMatch(value === formData.password);
      }
    }
  };

  const handleAddSkill = () => {
    if (currentSkill && !formData.teachingSubjects.includes(currentSkill)) {
      setFormData({
        ...formData,
        teachingSubjects: [...formData.teachingSubjects, currentSkill]
      });
      setCurrentSkill('');
      setShowSkillInput(false);
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      teachingSubjects: formData.teachingSubjects.filter(skill => skill !== skillToRemove)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.username || !formData.email || !formData.password || !formData.firstName || !formData.lastName) {
        toast.error('Please fill in all required fields');
        setLoading(false);
        return;
      }

      // Validate password strength
      if (!isPasswordValid(passwordStrength)) {
        toast.error('Please ensure your password meets all requirements');
        setLoading(false);
        return;
      }

      // Validate password confirmation
      if (formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match');
        setLoading(false);
        return;
      }

      // Additional validation for teachers
      if (formData.role === 'teacher') {
        if (!formData.certificationFile) {
          toast.error('Please upload your certification');
          setLoading(false);
          return;
        }
        if (!formData.teachingSubjects || formData.teachingSubjects.length === 0) {
          toast.error('Please select at least one teaching subject');
          setLoading(false);
          return;
        }

        // Validate certificate
        try {
          const certificateFormData = new FormData();
          certificateFormData.append('certificate', formData.certificationFile);

          const certificateResponse = await axios.post(
            'http://localhost:5000/api/certificates/validate',
            certificateFormData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
              withCredentials: true
            }
          );

          if (!certificateResponse.data.success) {
            toast.error('Invalid certificate. Please upload a valid certification document.');
            setLoading(false);
            return;
          }
        } catch (error) {
          console.error('Certificate validation error:', error);
          toast.error('Error validating certificate. Please try again.');
          setLoading(false);
          return;
        }
      }

      const formDataToSubmit = new FormData();
      formDataToSubmit.append('username', formData.username);
      formDataToSubmit.append('email', formData.email);
      formDataToSubmit.append('password', formData.password);
      formDataToSubmit.append('firstName', formData.firstName);
      formDataToSubmit.append('lastName', formData.lastName);
      formDataToSubmit.append('phoneNumber', formData.phoneNumber || '');
      formDataToSubmit.append('role', formData.role);
      
      if (formData.role === 'teacher') {
        formDataToSubmit.append('teachingSubjects', JSON.stringify(formData.teachingSubjects));
        formDataToSubmit.append('certificationFile', formData.certificationFile);
      }

      if (formData.photo) {
        formDataToSubmit.append('photo', formData.photo);
      }

      const response = await axios.post(
        'http://localhost:5000/api/auth/signup',
        formDataToSubmit,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true
        }
      );

      if (response.data.success) {
        toast.success('Signup successful!');
        // Update auth context with the new user
        if (updateUser) {
          updateUser(response.data.user);
        }
        // Redirect to dashboard
        history.push('/dashboard');
      }
    } catch (error) {
      console.error('Signup error:', error);
      const errorMessage = error.response?.data?.error || 'Error during signup';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type based on field
      const allowedTypes = fieldName === 'photo' 
        ? ['image/jpeg', 'image/png']
        : ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

      if (!allowedTypes.includes(file.type)) {
        toast.error(fieldName === 'photo' 
          ? 'Please upload a JPG or PNG image'
          : 'Please upload a PDF or Word document');
        e.target.value = ''; // Clear the file input
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        e.target.value = ''; // Clear the file input
        return;
      }

      setFormData(prev => ({
        ...prev,
        [fieldName]: file
      }));
      toast.success(`${fieldName === 'photo' ? 'Photo' : 'Certification'} file uploaded successfully`);
    }
  };

  const handleShowP = () => {
    setShowp(!showP);
  };

  AOS.init();

  if (user) {
    history.push("/");
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>SkillMate | Sign Up</title>
      </Helmet>
      <div className="min-h-screen flex items-center justify-center">
        <div
          data-aos="zoom-in"
          data-aos-offset="200"
          data-aos-duration="600"
          data-aos-mirror="true"
          data-aos-once="false"
          data-aos-anchor-placement="top"
          className="hero-content flex-col md:w-auto w-[99vw] md:my-auto my-10 md:shadow-[0_0_10px_1px_#D1D1D1] dark:shadow-[0_0_50px_#122827] md:px-10 bg-white dark:bg-gray-900 bg-opacity-70 rounded-xl p-8"
        >
          <h1 className="text-5xl font-bold text-main pt-4 pb-6">Sign Up now!</h1>
          <div className="card w-96">
            <div className="card-body p-0">
              {/* LinkedIn Sign Up Button */}
              <div className="flex flex-col gap-4 mt-6">
                <button
                  type="button"
                  onClick={handleLinkedInSignUp}
                  className="btn btn-outline flex items-center justify-center gap-2 dark:text-white dark:hover:text-white"
                >
                  <img src="/linkedin.svg" alt="LinkedIn" className="w-6 h-6" />
                  Sign up with LinkedIn
                </button>

                <button
                  type="button"
                  onClick={handleGoogleSignUp}
                  className="btn btn-outline flex items-center justify-center gap-2 dark:text-white dark:hover:text-white"
                >
                  <img src="/google.svg" alt="Google" className="w-6 h-6" />
                  Sign up with Google
                </button>
              </div>

              <div className="divider text-gray-500 dark:text-gray-400">OR</div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="form-control">
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Username *"
                    className="input input-bordered dark:bg-gray-800"
                    required
                  />
                </div>

                <div className="form-control">
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="First Name *"
                    className="input input-bordered dark:bg-gray-800"
                    required
                  />
                </div>

                <div className="form-control">
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Last Name *"
                    className="input input-bordered dark:bg-gray-800"
                    required
                  />
                </div>

                <div className="form-control">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email *"
                    className="input input-bordered dark:bg-gray-800"
                    required
                  />
                </div>

                <div className="form-control">
                  <PhoneInput
                    country={'tn'}
                    value={formData.phoneNumber}
                    onChange={phone => setFormData({...formData, phoneNumber: '+' + phone})}
                    inputClass="input input-bordered dark:bg-gray-800 w-full"
                    containerClass="w-full"
                    buttonClass="dark:bg-gray-700"
                    dropdownClass="dark:bg-gray-800 dark:text-white"
                    placeholder="Phone Number"
                  />
                </div>

                <div className="space-y-4">
                  {/* Password input with requirements */}
                  <div className="relative">
                    <input
                      type={showP ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Password *"
                      className="input input-bordered dark:bg-gray-800 w-full"
                      required
                    />
                    <div
                      className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
                      onClick={() => setShowp(!showP)}
                    >
                      {showP ? <GoEyeClosed /> : <GoEye />}
                    </div>
                  </div>

                  {/* Password requirements checklist */}
                  <div className="text-sm space-y-1 text-[var(--text-secondary)] bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    <h4 className="font-semibold mb-2 text-[var(--text-primary)]">Password Requirements:</h4>
                    <div className={`flex items-center ${passwordStrength.hasMinLength ? 'text-green-600 dark:text-green-400' : ''}`}>
                      <span className="mr-2">{passwordStrength.hasMinLength ? '✓' : '○'}</span>
                      At least 8 characters
                    </div>
                    <div className={`flex items-center ${passwordStrength.hasUpperCase ? 'text-green-600 dark:text-green-400' : ''}`}>
                      <span className="mr-2">{passwordStrength.hasUpperCase ? '✓' : '○'}</span>
                      One uppercase letter (A-Z)
                    </div>
                    <div className={`flex items-center ${passwordStrength.hasLowerCase ? 'text-green-600 dark:text-green-400' : ''}`}>
                      <span className="mr-2">{passwordStrength.hasLowerCase ? '✓' : '○'}</span>
                      One lowercase letter (a-z)
                    </div>
                    <div className={`flex items-center ${passwordStrength.hasNumber ? 'text-green-600 dark:text-green-400' : ''}`}>
                      <span className="mr-2">{passwordStrength.hasNumber ? '✓' : '○'}</span>
                      One number (0-9)
                    </div>
                    <div className={`flex items-center ${passwordStrength.hasSpecialChar ? 'text-green-600 dark:text-green-400' : ''}`}>
                      <span className="mr-2">{passwordStrength.hasSpecialChar ? '✓' : '○'}</span>
                      One special character {'(!@#$%^&*(),.?":{}|)'}
                    </div>
                    <div className="mt-2 text-[var(--text-tertiary)] text-xs">
                      Example: "SkillMate2024!"
                    </div>
                  </div>

                  {/* Confirm Password input */}
                  <div className="relative">
                    <input
                      type={showConfirmP ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm Password *"
                      className={`input input-bordered dark:bg-gray-800 w-full ${!passwordsMatch && formData.confirmPassword ? 'border-red-500' : ''}`}
                      required
                    />
                    <div
                      className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer text-[var(--text-secondary)]"
                      onClick={() => setShowConfirmP(!showConfirmP)}
                    >
                      {showConfirmP ? <GoEyeClosed /> : <GoEye />}
                    </div>
                    {!passwordsMatch && formData.confirmPassword && (
                      <p className="text-red-500 text-sm mt-1">Passwords do not match</p>
                    )}
                  </div>
                </div>

                <div className="form-control">
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="select select-bordered w-full dark:bg-gray-800"
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                  </select>
                </div>

                {formData.role === 'teacher' && (
                  <div className="space-y-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Teaching Subjects</span>
                      </label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {formData.teachingSubjects.map((subject, index) => (
                          <span
                            key={index}
                            className="bg-main text-white px-2 py-1 rounded-md flex items-center gap-2"
                          >
                            {subject}
                            <button
                              type="button"
                              onClick={() => handleRemoveSkill(subject)}
                              className="text-sm hover:text-red-300"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                      {showSkillInput ? (
                        <div className="flex gap-2">
                          <select
                            value={currentSkill}
                            onChange={(e) => setCurrentSkill(e.target.value)}
                            className="select select-bordered flex-1 dark:bg-gray-800"
                          >
                            <option value="">Select a subject</option>
                            {subjects.map((subject) => (
                              <option key={subject} value={subject}>
                                {subject}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={handleAddSkill}
                            className="btn btn-main"
                          >
                            Add
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setShowSkillInput(true)}
                          className="btn btn-outline btn-main"
                        >
                          Add Subject
                        </button>
                      )}
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Certification (PDF, DOC, DOCX)</span>
                      </label>
                      <input
                        type="file"
                        name="certificationFile"
                        onChange={(e) => handleFileChange(e, 'certificationFile')}
                        accept=".pdf,.doc,.docx"
                        className="file-input file-input-bordered w-full dark:bg-gray-800"
                        required={formData.role === 'teacher'}
                      />
                    </div>
                  </div>
                )}

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Profile Photo (JPG, PNG, PDF)</span>
                  </label>
                  <input
                    type="file"
                    name="photo"
                    onChange={(e) => handleFileChange(e, 'photo')}
                    accept="image/jpeg,image/png,application/pdf"
                    className="file-input file-input-bordered w-full dark:bg-gray-800"
                  />
                  {photoPreview && (
                    <div className="mt-2">
                      {typeof photoPreview === 'string' && photoPreview.startsWith('PDF') ? (
                        <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded">
                          {photoPreview}
                        </div>
                      ) : (
                        <img
                          src={photoPreview}
                          alt="Preview"
                          className="max-w-xs rounded-lg shadow-lg"
                        />
                      )}
                    </div>
                  )}
                </div>

                <div className="form-control mt-6">
                  <button type="submit" className="btn btn-main" disabled={loading}>
                    {loading ? 'Signing up...' : 'Sign Up'}
                  </button>
                </div>

                <p className="text-center mt-2">
                  Already have an account?{" "}
                  <Link to="/auth/signin" className="text-main hover:underline">
                    Sign In
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
