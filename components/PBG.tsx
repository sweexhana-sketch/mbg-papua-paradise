import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PBG: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'info' | 'kewenangan'>('info');

    return (
        <div className="min-h-screen bg-gray-50">
            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>

            {/* Header */}
            <div className="bg-gradient-pupr text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <button
                        onClick={() => navigate('/')}
                        className="mb-6 flex items-center space-x-2 text-white hover:text-yellow-400 transition-colors group"
                    >
                        <i className="fas fa-arrow-left group-hover:-translate-x-1 transition-transform"></i>
                        <span className="font-semibold">Kembali ke Beranda</span>
                    </button>
                    <h1 className="text-4xl font-extrabold mb-4">Izin Bangunan Gedung (PBG)</h1>
                    <p className="text-xl text-blue-100 max-w-3xl">
                        Standar Operasional Prosedur dan Kewenangan Persetujuan Bangunan Gedung
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Deskripsi Layanan */}
                <section className="bg-white rounded-3xl shadow-lg p-8 md:p-12 mb-12">
                    <h2 className="text-2xl font-bold text-blue-900 mb-6 flex items-center">
                        <span className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4 text-blue-600">
                            <i className="fas fa-info-circle"></i>
                        </span>
                        Deskripsi Layanan
                    </h2>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        Persetujuan Bangunan Gedung (PBG) adalah perizinan yang diberikan kepada pemilik bangunan gedung untuk membangun baru, mengubah, memperluas, mengurangi, dan/atau merawat bangunan gedung sesuai dengan standar teknis bangunan gedung.
                    </p>
                    <p className="text-gray-600 leading-relaxed">
                        Layanan ini bertujuan untuk memastikan bahwa setiap bangunan gedung yang dibangun memenuhi persyaratan administratif dan teknis, termasuk keselamatan, kesehatan, kenyamanan, dan kemudahan, serta sesuai dengan rencana tata ruang wilayah.
                    </p>
                </section>

                {/* Tab Navigation */}
                <div className="bg-white rounded-3xl shadow-lg overflow-hidden mb-12">
                    <div className="flex border-b border-gray-200">
                        <button
                            className={`flex-1 pb-4 pt-6 px-6 font-bold text-lg transition-colors relative ${activeTab === 'info' ? 'text-blue-900' : 'text-gray-400 hover:text-gray-600'
                                }`}
                            onClick={() => setActiveTab('info')}
                        >
                            Persyaratan & SOP
                            {activeTab === 'info' && <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-900 rounded-t-full"></div>}
                        </button>
                        <button
                            className={`flex-1 pb-4 pt-6 px-6 font-bold text-lg transition-colors relative ${activeTab === 'kewenangan' ? 'text-blue-900' : 'text-gray-400 hover:text-gray-600'
                                }`}
                            onClick={() => setActiveTab('kewenangan')}
                        >
                            Kewenangan
                            {activeTab === 'kewenangan' && <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-900 rounded-t-full"></div>}
                        </button>
                    </div>

                    <div className="p-8 md:p-12">
                        {activeTab === 'info' ? (
                            <div className="animate-fadeIn">
                                <div className="grid md:grid-cols-2 gap-12">
                                    {/* Persyaratan Administrasi */}
                                    <div>
                                        <h3 className="text-xl font-bold text-blue-900 mb-4 border-b-2 border-yellow-500 inline-block pb-1">
                                            Persyaratan Administrasi
                                        </h3>
                                        <ul className="space-y-3">
                                            {[
                                                'Surat Permohonan Bermaterai',
                                                'KTP/Identitas Pemohon',
                                                'Sertifikat/Bukti Kepemilikan Tanah',
                                                'Gambar Rencana Arsitektur (Site Plan, Denah, Tampak, Potongan)',
                                                'Gambar Rencana Struktur',
                                                'Gambar Rencana MEP (Mekanikal, Elektrikal, Plumbing)',
                                                'Perhitungan Struktur oleh Ahli',
                                                'Dokumen Lingkungan (AMDAL/UKL-UPL/SPPL)',
                                                'Surat Pernyataan Kebenaran Dokumen'
                                            ].map((item, idx) => (
                                                <li key={idx} className="flex items-start">
                                                    <i className="fas fa-check-circle text-green-500 mt-1 mr-3"></i>
                                                    <span className="text-gray-700">{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Alur Pelayanan (SOP) */}
                                    <div>
                                        <h3 className="text-xl font-bold text-blue-900 mb-4 border-b-2 border-yellow-500 inline-block pb-1">
                                            Alur Pelayanan (SOP)
                                        </h3>
                                        <ol className="relative border-l border-blue-200 ml-3 space-y-6">
                                            {[
                                                { title: 'Pengajuan Permohonan', desc: 'Pemohon mengajukan berkas lengkap melalui loket pelayanan atau sistem online.' },
                                                { title: 'Verifikasi Administrasi', desc: 'Petugas memeriksa kelengkapan dokumen administrasi (1-2 hari kerja).' },
                                                { title: 'Pemeriksaan Teknis', desc: 'Tim Teknis melakukan desk evaluation terhadap gambar dan perhitungan struktur.' },
                                                { title: 'Peninjauan Lapangan', desc: 'Peninjauan lokasi untuk memastikan kesesuaian dengan dokumen (jika diperlukan).' },
                                                { title: 'Penerbitan PBG', desc: 'Kepala Dinas menerbitkan Persetujuan Bangunan Gedung jika memenuhi syarat.' }
                                            ].map((step, idx) => (
                                                <li key={idx} className="ml-6">
                                                    <span className="absolute flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full -left-4 ring-4 ring-white">
                                                        <span className="text-blue-600 font-bold text-sm">{idx + 1}</span>
                                                    </span>
                                                    <h4 className="flex items-center mb-1 text-lg font-semibold text-gray-900">{step.title}</h4>
                                                    <p className="mb-2 text-base font-normal text-gray-500">{step.desc}</p>
                                                </li>
                                            ))}
                                        </ol>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="animate-fadeIn">
                                <h3 className="text-2xl font-bold text-blue-900 mb-6">Pembagian Kewenangan Penerbitan PBG</h3>
                                <p className="text-gray-600 mb-8 leading-relaxed">
                                    Berdasarkan Undang-Undang Nomor 28 Tahun 2002 tentang Bangunan Gedung dan peraturan turunannya, kewenangan penerbitan PBG dibagi berdasarkan fungsi dan klasifikasi bangunan gedung:
                                </p>

                                <div className="space-y-6">
                                    {/* Kewenangan Provinsi */}
                                    <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-r-2xl">
                                        <div className="flex items-start">
                                            <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                                                <i className="fas fa-landmark text-xl"></i>
                                            </div>
                                            <div>
                                                <h4 className="text-xl font-bold text-blue-900 mb-3">Kewenangan Pemerintah Provinsi</h4>
                                                <ul className="space-y-2 text-gray-700">
                                                    <li className="flex items-start">
                                                        <i className="fas fa-chevron-right text-blue-600 mt-1 mr-3 text-sm"></i>
                                                        <span><strong>Bangunan Gedung Fungsi Khusus</strong> (monumen, bangunan bersejarah, dll)</span>
                                                    </li>
                                                    <li className="flex items-start">
                                                        <i className="fas fa-chevron-right text-blue-600 mt-1 mr-3 text-sm"></i>
                                                        <span><strong>Bangunan dengan luas lebih dari 5.000 m²</strong></span>
                                                    </li>
                                                    <li className="flex items-start">
                                                        <i className="fas fa-chevron-right text-blue-600 mt-1 mr-3 text-sm"></i>
                                                        <span><strong>Bangunan bertingkat tinggi</strong> (lebih dari 8 lantai)</span>
                                                    </li>
                                                    <li className="flex items-start">
                                                        <i className="fas fa-chevron-right text-blue-600 mt-1 mr-3 text-sm"></i>
                                                        <span><strong>Bangunan yang lokasinya lintas kabupaten/kota</strong></span>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Kewenangan Kabupaten/Kota */}
                                    <div className="bg-green-50 border-l-4 border-green-600 p-6 rounded-r-2xl">
                                        <div className="flex items-start">
                                            <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                                                <i className="fas fa-building text-xl"></i>
                                            </div>
                                            <div>
                                                <h4 className="text-xl font-bold text-green-900 mb-3">Kewenangan Pemerintah Kabupaten/Kota</h4>
                                                <ul className="space-y-2 text-gray-700">
                                                    <li className="flex items-start">
                                                        <i className="fas fa-chevron-right text-green-600 mt-1 mr-3 text-sm"></i>
                                                        <span><strong>Bangunan gedung dengan luas kurang dari 5.000 m²</strong></span>
                                                    </li>
                                                    <li className="flex items-start">
                                                        <i className="fas fa-chevron-right text-green-600 mt-1 mr-3 text-sm"></i>
                                                        <span><strong>Bangunan bertingkat rendah dan sedang</strong> (maksimal 8 lantai)</span>
                                                    </li>
                                                    <li className="flex items-start">
                                                        <i className="fas fa-chevron-right text-green-600 mt-1 mr-3 text-sm"></i>
                                                        <span><strong>Bangunan rumah tinggal, ruko, dan bangunan komersial skala kecil-menengah</strong></span>
                                                    </li>
                                                    <li className="flex items-start">
                                                        <i className="fas fa-chevron-right text-green-600 mt-1 mr-3 text-sm"></i>
                                                        <span><strong>Bangunan yang lokasinya dalam satu wilayah kabupaten/kota</strong></span>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Catatan Penting */}
                                    <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-2xl">
                                        <div className="flex items-start">
                                            <i className="fas fa-exclamation-triangle text-yellow-600 text-2xl mr-4 mt-1"></i>
                                            <div>
                                                <h4 className="text-lg font-bold text-yellow-900 mb-2">Catatan Penting</h4>
                                                <p className="text-gray-700 leading-relaxed">
                                                    Untuk bangunan gedung yang memerlukan koordinasi lintas wilayah atau memiliki dampak strategis provinsi,
                                                    Pemerintah Provinsi Papua Barat Daya dapat memberikan rekomendasi teknis kepada Pemerintah Kabupaten/Kota
                                                    dalam proses penerbitan PBG.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Info Cards */}
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="bg-white p-8 rounded-2xl shadow-lg border-t-4 border-blue-600">
                        <div className="text-blue-600 text-3xl mb-4"><i className="fas fa-clock"></i></div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Waktu Layanan</h3>
                        <p className="text-gray-600">Estimasi 7 - 14 Hari Kerja (setelah dokumen dinyatakan lengkap dan memenuhi syarat teknis)</p>
                    </div>
                    <div className="bg-white p-8 rounded-2xl shadow-lg border-t-4 border-yellow-500">
                        <div className="text-yellow-500 text-3xl mb-4"><i className="fas fa-coins"></i></div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Biaya</h3>
                        <p className="text-gray-600">Sesuai Peraturan Daerah tentang Retribusi Izin Mendirikan Bangunan (IMB/PBG)</p>
                    </div>
                    <div className="bg-white p-8 rounded-2xl shadow-lg border-t-4 border-green-500">
                        <div className="text-green-500 text-3xl mb-4"><i className="fas fa-file-contract"></i></div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Dasar Hukum</h3>
                        <p className="text-gray-600 text-sm">UU No. 28 Tahun 2002 tentang Bangunan Gedung, Peraturan Menteri PUPR terkait Bangunan Gedung</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PBG;
