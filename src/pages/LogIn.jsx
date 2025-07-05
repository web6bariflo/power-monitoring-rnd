import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const LogIn = () => {
    const navigate = useNavigate();
    const apiUrl = import.meta.env.VITE_BASE_URL;
    console.log(apiUrl)

    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');



    const onSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(`${apiUrl}/signin/`, {
                identifier,
                password,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = response.data;

            localStorage.setItem('token', data.access);
            localStorage.setItem('name', data.name);
            localStorage.setItem('Mob', data.Mob);
            localStorage.setItem('id', data.id);

            console.log('Login successful:', data);
            navigate('/masterpage');
        } catch (err) {
            console.error('Login failed:', err);
            setError('Login failed. Please check your credentials.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-md">
                <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
                    Sign in to your account
                </h2>

                <form className="space-y-6" onSubmit={onSubmit}>
                    {/* Email or Mobile */}
                    <div>
                        <label htmlFor="identifier" className="block text-sm font-medium text-gray-700">
                            Email address / Mobile no
                        </label>
                        <input
                            id="identifier"
                            name="identifier"
                            type="text"
                            // autoComplete="username"
                            required
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Email or Mobile number"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            // autoComplete="current-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Your password"
                        />
                    </div>

                    {/* Options */}
                    <div className="flex items-center justify-between">
                        <label className="flex items-center text-sm">
                            <input
                                type="checkbox"
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-gray-700">Remember me</span>
                        </label>
                        <Link to="/forgetpassword" className="text-sm text-blue-600 hover:underline">
                            Forgot password?
                        </Link>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="text-red-600 text-sm text-center">
                            {error}
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg shadow"
                    >
                        Sign In
                    </button>
                </form>
                <p className="text-sm text-center mt-4">
                    Don’t have an account? <Link to="/signup" className="text-blue-600 hover:underline">Sign Up</Link>
                </p>


            </div>
        </div>
    );
};

export default LogIn;
