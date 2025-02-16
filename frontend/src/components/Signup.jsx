import React, { useState } from 'react';
import axios from 'axios';

const Signup = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
        role: 'student', // default value
        certification: '',
        profilePicture: '',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/users/adduser', formData);
            alert(response.data.message);
        } catch (error) {
            alert(error.response?.data?.error || 'Signup failed');
        }
    };

    return (
        <div>
            <h2>Sign Up</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
                <select name="role" value={formData.role} onChange={handleChange}>
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="admin">Admin</option>
                </select>
                <input
                    type="text"
                    name="certification"
                    placeholder="Certification (optional)"
                    value={formData.certification}
                    onChange={handleChange}
                />
                <input
                    type="text"
                    name="profilePicture"
                    placeholder="Profile Picture URL (optional)"
                    value={formData.profilePicture}
                    onChange={handleChange}
                />
                <button type="submit">Sign Up</button>
            </form>
        </div>
    );
};

export default Signup;
