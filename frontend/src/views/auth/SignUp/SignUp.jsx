import { useState } from "react";
import { GoEye, GoEyeClosed } from "react-icons/go";
import { Link, useHistory } from "react-router-dom";
import { Helmet } from "react-helmet";
import toast from "react-hot-toast";
import useAuth from "../../../hooks/useAuth";
import AOS from "aos";
import "aos/dist/aos.css";

const SignUp = () => {
  const { signUpUser, updateUserProfile, user, handleLinkedInLogin } = useAuth();
  const [showP, setShowp] = useState(false);
  const history = useHistory();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    role: 'student',
    teachingSubjects: [],
    photo: null,
    certificationFile: null
  });

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
      setFormData({
        ...formData,
        [name]: value
      });
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

  const handleSignUp = async (e) => {
    e.preventDefault();

    // Validate required fields
    const requiredFields = ['username', 'email', 'password', 'firstName', 'lastName'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    // Validate phone number format
    if (formData.phoneNumber && !formData.phoneNumber.startsWith('+')) {
      toast.error('Phone number must start with + and use international format (e.g., +1234567890)');
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (!/[A-Z]/.test(formData.password)) {
      toast.error("Password must contain at least one uppercase letter");
      return;
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
      toast.error("Password must contain at least one special character");
      return;
    }

    try {
      // Create FormData object to handle file upload
      const submitData = new FormData();
      for (const key in formData) {
        if (formData[key] !== null && formData[key] !== '') {
          if (key === 'teachingSubjects') {
            submitData.append(key, JSON.stringify(formData[key]));
          } else {
            submitData.append(key, formData[key]);
          }
        }
      }

      await signUpUser(submitData);
      notify();
      history.push("/");
    } catch (error) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Error during sign up. Please try again.");
      }
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
    <div className="dark:bg-[#0f1729] min-h-screen">
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
              <button
                type="button"
                onClick={handleLinkedInLogin}
                className="w-full mb-4 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm bg-[#0077B5] text-white rounded-md hover:bg-[#006097] transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.68 1.68 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                </svg>
                <span>Sign up with LinkedIn</span>
              </button>

              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-900 text-gray-500">Or register with email</span>
                </div>
              </div>

              <form onSubmit={handleSignUp} className="space-y-4">
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
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="Phone Number (e.g., +1234567890)"
                    className="input input-bordered dark:bg-gray-800"
                  />
                </div>

                <div className="form-control relative">
                  <input
                    type={showP ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Password *"
                    className="input input-bordered dark:bg-gray-800"
                    required
                  />
                  <div
                    onClick={handleShowP}
                    className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer"
                  >
                    {showP ? <GoEyeClosed /> : <GoEye />}
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
                        onChange={handleChange}
                        accept=".pdf,.doc,.docx"
                        className="file-input file-input-bordered w-full dark:bg-gray-800"
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
                    onChange={handleChange}
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
                  <button type="submit" className="btn btn-main">
                    Sign Up
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
