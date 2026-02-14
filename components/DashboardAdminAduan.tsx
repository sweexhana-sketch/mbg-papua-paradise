import React, { useState, useEffect, useMemo } from 'react';
import { RoadReport } from '../types'; // Assuming types are centralized or we define here

// Extracted for reusability if needed, but keeping inline for speed
interface ExtendedRoadReport extends RoadReport {
    category: 'Jalan' | 'Tata Ruang' | 'SPM';
    status: 'Baru' | 'Diproses' | 'Selesai' | 'Diteruskan';
}

const DashboardAdminAduan: React.FC = () => {
    const [reports, setReports] = useState<ExtendedRoadReport[]>([]);
    const [filterCategory, setFilterCategory] = useState<'Semua' | 'Jalan' | 'Tata Ruang' | 'SPM'>('Semua');

    // Load initial data
    useEffect(() => {
        // 1. Load Road Reports
        const roadReports = JSON.parse(localStorage.getItem('pbd_road_reports') || '[]').map((r: any) => ({ ...r, category: 'Jalan' }));

        // 2. Mock/Load Tata Ruang Reports (Simulated for Demo)
        const tataRuangReports = [
            { id: 'tr-1', category: 'Tata Ruang', lokasi_jalan: 'Jl. Basuki Rahmat Km 9', deskripsi: 'Pembangunan ruko tanpa IMB di area hijau.', timestamp: new Date().toISOString(), status: 'Baru', jurisdiction: 'Kota Sorong' },
            { id: 'tr-2', category: 'Tata Ruang', lokasi_jalan: 'Kawasan Lindung Km 12', deskripsi: 'Indikasi pembukaan lahan ilegal.', timestamp: new Date(Date.now() - 86400000).toISOString(), status: 'Diproses', jurisdiction: 'Provinsi' }
        ];

        // 3. Mock/Load SPM Reports (Simulated for Demo)
        const spmReports = [
            { id: 'spm-1', category: 'SPM', lokasi_jalan: 'Distrik Aimas', deskripsi: 'Air bersih mati sudah 3 hari.', timestamp: new Date().toISOString(), status: 'Baru', jurisdiction: 'Kab. Sorong' },
            { id: 'spm-2', category: 'SPM', lokasi_jalan: 'Kampung Baru', deskripsi: 'Sampah menumpuk di drainase utama.', timestamp: new Date(Date.now() - 172800000).toISOString(), status: 'Selesai', jurisdiction: 'Kota Sorong' }
        ];

        setReports([...roadReports, ...tataRuangReports, ...spmReports]);
    }, []);

    const updateReportStatus = (id: string, newStatus: ExtendedRoadReport['status']) => {
        const updated = reports.map(r => r.id === id ? { ...r, status: newStatus } : r);
        setReports(updated);

        // Persist only Road reports to their specific key for now
        const roadReports = updated.filter(r => r.category === 'Jalan').map(({ category, ...rest }) => rest);
        localStorage.setItem('pbd_road_reports', JSON.stringify(roadReports));

        // In a real app, we'd persist others too
    };

    const filteredReports = useMemo(() => {
        return filterCategory === 'Semua'
            ? reports
            : reports.filter(r => r.category === filterCategory);
    }, [reports, filterCategory]);

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">Dashboard Pengaduan Masyarakat</h2>
                    <p className="text-gray-500 mt-1">Kelola laporan masuk dari masyarakat</p>
                </div>
                <div className="flex bg-white shadow-sm p-1 rounded-lg border border-gray-200">
                    {(['Semua', 'Jalan', 'Tata Ruang', 'SPM'] as const).map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilterCategory(cat)}
                            className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${filterCategory === cat ? 'bg-blue-900 text-white shadow' : 'text-gray-500 hover:text-blue-900'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Total Laporan</p>
                    <p className="text-3xl font-black text-blue-900 mt-2">{filteredReports.length}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-red-500 text-xs font-bold uppercase tracking-wider">Perlu Tindakan</p>
                    <p className="text-3xl font-black text-red-600 mt-2">{filteredReports.filter(r => r.status === 'Baru').length}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-yellow-600 text-xs font-bold uppercase tracking-wider">Sedang Diproses</p>
                    <p className="text-3xl font-black text-yellow-600 mt-2">{filteredReports.filter(r => r.status === 'Diproses').length}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-green-600 text-xs font-bold uppercase tracking-wider">Selesai</p>
                    <p className="text-3xl font-black text-green-600 mt-2">{filteredReports.filter(r => r.status === 'Selesai').length}</p>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 font-bold text-gray-700 text-sm">Kategori & Waktu</th>
                            <th className="px-6 py-4 font-bold text-gray-700 text-sm">Detail Laporan</th>
                            <th className="px-6 py-4 font-bold text-gray-700 text-sm">Lokasi</th>
                            <th className="px-6 py-4 font-bold text-gray-700 text-sm">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredReports.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                                    Tidak ada laporan ditemukan.
                                </td>
                            </tr>
                        ) : (
                            filteredReports.map((report) => (
                                <tr key={report.id} className="hover:bg-blue-50/50 transition-colors">
                                    <td className="px-6 py-4 align-top">
                                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase mb-1 ${report.category === 'Jalan' ? 'bg-blue-100 text-blue-800' :
                                                report.category === 'Tata Ruang' ? 'bg-purple-100 text-purple-800' :
                                                    'bg-green-100 text-green-800'
                                            }`}>
                                            {report.category}
                                        </span>
                                        <div className="text-xs text-gray-500">{new Date(report.timestamp).toLocaleDateString('id-ID')}</div>
                                        <div className="text-[10px] text-gray-400">{new Date(report.timestamp).toLocaleTimeString('id-ID')}</div>
                                    </td>
                                    <td className="px-6 py-4 align-top">
                                        <p className="font-bold text-gray-800 text-sm mb-1 line-clamp-2">{report.deskripsi}</p>
                                        {report.image_url && (
                                            <a href={report.image_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center">
                                                <i className="fas fa-image mr-1"></i> Lihat Foto
                                            </a>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 align-top">
                                        <div className="text-sm font-medium text-gray-900">{report.lokasi_jalan}</div>
                                        <div className="text-xs text-gray-500">{report.jurisdiction}</div>
                                    </td>
                                    <td className="px-6 py-4 align-top">
                                        <select
                                            value={report.status || 'Baru'}
                                            onChange={(e) => updateReportStatus(report.id!, e.target.value as any)}
                                            className={`text-xs font-bold px-3 py-1.5 rounded-full border-2 outline-none cursor-pointer ${report.status === 'Baru' ? 'border-red-200 text-red-700 bg-red-50' :
                                                    report.status === 'Diproses' ? 'border-yellow-200 text-yellow-700 bg-yellow-50' :
                                                        report.status === 'Selesai' ? 'border-green-200 text-green-700 bg-green-50' :
                                                            'border-gray-200 text-gray-700 bg-gray-50'
                                                }`}
                                        >
                                            <option value="Baru">Baru</option>
                                            <option value="Diproses">Diproses</option>
                                            <option value="Diteruskan">Diteruskan</option>
                                            <option value="Selesai">Selesai</option>
                                        </select>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DashboardAdminAduan;
