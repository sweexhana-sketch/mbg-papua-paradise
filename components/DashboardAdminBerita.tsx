import React, { useState, useEffect } from 'react';
import { MOCK_NEWS } from '../constants';
import { NewsItem } from '../types';

const DashboardAdminBerita: React.FC = () => {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [currentNews, setCurrentNews] = useState<Partial<NewsItem>>({});

    useEffect(() => {
        const savedNews = localStorage.getItem('pbd_news_data');
        if (savedNews) {
            setNews(JSON.parse(savedNews));
        } else {
            setNews(MOCK_NEWS);
        }
    }, []);

    const saveNewsToStorage = (updatedNews: NewsItem[]) => {
        setNews(updatedNews);
        localStorage.setItem('pbd_news_data', JSON.stringify(updatedNews));
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Hapus berita ini?')) {
            const updated = news.filter(n => n.id !== id);
            saveNewsToStorage(updated);
        }
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentNews.title || !currentNews.summary) return;

        const newItem: NewsItem = {
            id: currentNews.id || Date.now().toString(),
            title: currentNews.title,
            category: currentNews.category || 'Umum',
            date: currentNews.date || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
            summary: currentNews.summary,
            imageUrl: currentNews.imageUrl || 'https://picsum.photos/800/600',
        };

        let updatedNews;
        if (currentNews.id) {
            updatedNews = news.map(n => n.id === currentNews.id ? newItem : n);
        } else {
            updatedNews = [newItem, ...news];
        }

        saveNewsToStorage(updatedNews);
        setIsEditing(false);
        setCurrentNews({});
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Manajemen Berita</h2>
                    <p className="text-gray-500 mt-1">Publikasi informasi dan artikel terbaru</p>
                </div>
                <button
                    onClick={() => { setCurrentNews({}); setIsEditing(true); }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-transform active:scale-95 flex items-center"
                >
                    <i className="fas fa-plus mr-2"></i> Tambah Berita
                </button>
            </div>

            {/* Editor Modal/Form */}
            {isEditing && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <h3 className="text-2xl font-bold mb-6 text-gray-900">
                            {currentNews.id ? 'Edit Berita' : 'Buat Berita Baru'}
                        </h3>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Judul Berita</label>
                                <input
                                    type="text"
                                    value={currentNews.title || ''}
                                    onChange={e => setCurrentNews({ ...currentNews, title: e.target.value })}
                                    className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Judul menarik..."
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Kategori</label>
                                    <input
                                        type="text"
                                        value={currentNews.category || ''}
                                        onChange={e => setCurrentNews({ ...currentNews, category: e.target.value })}
                                        className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="Contoh: Infrastruktur"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Tanggal</label>
                                    <input
                                        type="text"
                                        value={currentNews.date || ''}
                                        onChange={e => setCurrentNews({ ...currentNews, date: e.target.value })}
                                        className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="24 Mei 2024"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Ringkasan / Isi</label>
                                <textarea
                                    value={currentNews.summary || ''}
                                    onChange={e => setCurrentNews({ ...currentNews, summary: e.target.value })}
                                    className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none h-32"
                                    placeholder="Isi berita singkat..."
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">URL Gambar</label>
                                <input
                                    type="text"
                                    value={currentNews.imageUrl || ''}
                                    onChange={e => setCurrentNews({ ...currentNews, imageUrl: e.target.value })}
                                    className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="https://..."
                                />
                            </div>
                            <div className="flex justify-end space-x-3 pt-4 border-t mt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="px-6 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700"
                                >
                                    Simpan Berita
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* News Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {news.map(item => (
                    <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-shadow">
                        <div className="relative h-48 overflow-hidden">
                            <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute top-2 right-2 flex space-x-1">
                                <button
                                    onClick={() => { setCurrentNews(item); setIsEditing(true); }}
                                    className="p-2 bg-white/90 rounded-full text-blue-600 hover:bg-white shadow-sm"
                                >
                                    <i className="fas fa-edit"></i>
                                </button>
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="p-2 bg-white/90 rounded-full text-red-600 hover:bg-white shadow-sm"
                                >
                                    <i className="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                        <div className="p-5">
                            <span className="text-xs font-bold text-blue-500 uppercase tracking-wider">{item.category}</span>
                            <h3 className="font-bold text-gray-900 mt-2 mb-2 line-clamp-2">{item.title}</h3>
                            <p className="text-sm text-gray-500 line-clamp-3">{item.summary}</p>
                            <div className="mt-4 text-xs text-gray-400 font-medium">
                                {item.date}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DashboardAdminBerita;
