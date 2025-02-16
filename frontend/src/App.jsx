import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';

const App = () => {
    return (
        <Router>
            <div style={styles.container}>
                <h1>Welcome to SkillMate 🎓</h1>
                <div style={styles.buttonContainer}>
                    <Link to="/login">
                        <button style={styles.button}>Login</button>
                    </Link>
                    <Link to="/signup">
                        <button style={styles.button}>Sign Up</button>
                    </Link>
                </div>

                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                </Routes>
            </div>
        </Router>
    );
};

const styles = {
    container: {
        textAlign: 'center',
        marginTop: '50px',
    },
    buttonContainer: {
        margin: '20px 0',
        display: 'flex',
        justifyContent: 'center',
        gap: '20px',
    },
    button: {
        padding: '15px 30px',
        fontSize: '18px',
        cursor: 'pointer',
        borderRadius: '8px',
        border: 'none',
        backgroundColor: '#007BFF',
        color: 'white',
        transition: 'background-color 0.3s',
    },
};

export default App;
