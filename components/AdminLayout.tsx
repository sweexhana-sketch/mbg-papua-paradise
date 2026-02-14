import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { authService } from '../services/authService';

const AdminLayout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(authService.getCurrentUser());

    useEffect(() => {
        if (!authService.isAuthenticated()) {
            navigate('/admin/login');
            return;
        }
        setUser(authService.getCurrentUser());
    }, [navigate]);

    if (!user) return null;

    const isActive = (path: string) => location.pathname.includes(path);

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-blue-900 text-white flex-shrink-0 hidden md:flex flex-col">
                <div className="p-6 border-b border-blue-800">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center text-blue-900 font-bold text-xl shadow-lg">
                            <i className="fas fa-shield-alt"></i>
                        </div>
                        <div>
                            <h1 className="font-bold text-lg leading-tight">Admin Portal</h1>
                            <p className="text-xs text-blue-300">PUPR Papua Barat Daya</p>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <div className="mb-6">
                        <p className="text-xs text-blue-400 uppercase font-bold tracking-wider mb-2">Menu Utama</p>
                        <nav className="space-y-2">
                            {user.role === 'ADUAN_MANAGER' && (
                                <button
                                    onClick={() => navigate('/admin/aduan')}
                                    className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${isActive('aduan')
                                        ? 'bg-blue-800 text-white shadow-lg border-l-4 border-yellow-500'
                                        : 'text-blue-200 hover:bg-blue-800/50 hover:text-white'
                                        }`}
                                >
                                    <i className="fas fa-clipboard-list w-6"></i>
                                    <span className="font-medium">Pengaduan</span>
                                </button>
                            )}

                            {user.role === 'NEWS_MANAGER' && (
                                <button
                                    onClick={() => navigate('/admin/berita')}
                                    className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${isActive('berita')
                                        ? 'bg-blue-800 text-white shadow-lg border-l-4 border-yellow-500'
                                        : 'text-blue-200 hover:bg-blue-800/50 hover:text-white'
                                        }`}
                                >
                                    <i className="fas fa-newspaper w-6"></i>
                                    <span className="font-medium">Berita & Artikel</span>
                                </button>
                            )}
                        </nav>
                    </div>
                </div>

                <div className="mt-auto p-6 border-t border-blue-800">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-blue-800 flex items-center justify-center">
                            <i className="fas fa-user"></i>
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold truncate">{user.name}</p>
                            <p className="text-xs text-blue-400 truncate">{user.role.replace('_', ' ')}</p>
                        </div>
                    </div>
                    <button
                        onClick={authService.logout}
                        className="w-full bg-red-600/20 hover:bg-red-600 text-red-200 hover:text-white py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                    >
                        <i className="fas fa-sign-out-alt mr-2"></i> Logout
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="w-full mt-2 text-center text-xs text-blue-400 hover:text-white transition-colors"
                    >
                        Ke Website Utama
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <header className="bg-white shadow-sm sticky top-0 z-10 md:hidden">
                    <div className="px-4 py-4 flex justify-between items-center">
                        <div className="font-bold text-blue-900">Admin Portal</div>
                        <button onClick={authService.logout} className="text-red-500">
                            <i className="fas fa-sign-out-alt"></i>
                        </button>
                    </div>
                </header>
                <div className="p-4 md:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
