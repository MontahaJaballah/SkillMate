import React, { useState } from "react";
import axios from "axios";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(""); // To handle errors from login

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(""); // Reset the error message

        try {
            // Send POST request to backend
            const response = await axios.post(
                "http://localhost:5000/api/users/login",
                { email, password }
                
            );

            console.log("Login successful:", response.data);
            alert("Login successful!"); // Show success alert

            // You can add redirection logic here, e.g.:
            // window.location.href = '/dashboard'; // Redirect to dashboard or home page

        } catch (err) {
            console.error("Error logging in:", err.response?.data || err.message);
            setError(err.response?.data?.message || "Error logging in."); // Set the error message
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center vh-100" style={{ backgroundColor: '#e9ecef' }}>
            <div className="bg-white p-4 rounded-3 shadow-lg" style={{ width: '100%', maxWidth: '400px' }}>
                <h2 className="text-center mb-4" style={{ color: '#0d6efd', fontWeight: 'bold' }}>Skill Mate</h2>
                {error && <p className="text-danger text-center">{error}</p>} {/* Display error message */}
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="email" className="form-label" style={{ color: '#495057', fontWeight: '500' }}>
                            Email
                        </label>
                        <input
                            type="email"
                            placeholder="Enter Email"
                            autoComplete="off"
                            name="email"
                            className="form-control rounded-2"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{ borderColor: '#ced4da', padding: '10px' }}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="password" className="form-label" style={{ color: '#495057', fontWeight: '500' }}>
                            Password
                        </label>
                        <input
                            type="password"
                            placeholder="Enter Password"
                            name="password"
                            className="form-control rounded-2"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{ borderColor: '#ced4da', padding: '10px' }}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn w-100 rounded-2"
                        style={{
                            backgroundColor: '#0d6efd',
                            color: '#fff',
                            padding: '10px',
                            fontWeight: 'bold',
                            border: 'none',
                            fontSize: '16px'
                        }}
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Login;
