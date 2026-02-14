import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

const LoginAdmin: React.FC = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // Simulate network delay
        setTimeout(() => {
            const user = authService.login(username, password);
            if (user) {
                navigate('/admin/dashboard');
            } else {
                setError('Username atau password salah');
            }
            setIsLoading(false);
        }, 800);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-8 text-center">
                    <div className="w-20 h-20 bg-white rounded-full mx-auto flex items-center justify-center mb-4 shadow-lg">
                        <img src="/logo-pupr.png" alt="Logo" className="w-12 h-12" onError={(e) => {
                            // Fallback icon if logo not found
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement!.innerHTML = '<i class="fas fa-user-shield text-3xl text-blue-900"></i>';
                        }} />
                    </div>
                    <h2 className="text-2xl font-black text-blue-900 uppercase tracking-wider">Admin Portal</h2>
                    <p className="text-blue-900 font-medium opacity-80 mt-1">Dinas PUPR Papua Barat Daya</p>
                </div>

                <div className="p-8">
                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold flex items-center animate-pulse">
                                <i className="fas fa-exclamation-circle mr-2"></i>
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-gray-700 font-bold mb-2 ml-1">Username</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <i className="fas fa-user text-gray-400"></i>
                                </div>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full pl-11 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-blue-500 focus:ring-0 outline-none transition-all font-medium text-gray-900"
                                    placeholder="Masukkan username"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-gray-700 font-bold mb-2 ml-1">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <i className="fas fa-lock text-gray-400"></i>
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-11 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-blue-500 focus:ring-0 outline-none transition-all font-medium text-gray-900"
                                    placeholder="Masukkan password"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-4 rounded-xl shadow-lg transform transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center">
                                    <i className="fas fa-circle-notch fa-spin mr-2"></i>
                                    Memproses...
                                </span>
                            ) : (
                                'Masuk Dashboard'
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <button
                            onClick={() => navigate('/')}
                            className="text-gray-400 hover:text-blue-600 font-medium text-sm transition-colors"
                        >
                            <i className="fas fa-arrow-left mr-1"></i> Kembali ke Website Utama
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginAdmin;
