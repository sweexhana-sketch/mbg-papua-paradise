
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProjectGrid from './components/ProjectGrid';
import InfraStats from './components/InfraStats';
import GeminiChat from './components/GeminiChat';
import Footer from './components/Footer';
import InfoTataRuang from './components/InfoTataRuang';
import AksesJalan from './components/AksesJalan';
import DataSpasial from './components/DataSpasial';
import SPM from './components/SPM';
import PertekAir from './components/PertekAir';
import PBG from './components/PBG';
import LoginAdmin from './components/LoginAdmin';
import AdminLayout from './components/AdminLayout';
import DashboardAdminAduan from './components/DashboardAdminAduan';
import DashboardAdminBerita from './components/DashboardAdminBerita';
import { MOCK_NEWS } from './constants';
import { useState, useEffect } from 'react';

const NewsSection: React.FC = () => {
  const [news, setNews] = useState(MOCK_NEWS);

  useEffect(() => {
    const savedNews = localStorage.getItem('pbd_news_data');
    if (savedNews) {
      setNews(JSON.parse(savedNews));
    }
  }, []);

  return (
    <div className="grid md:grid-cols-3 gap-8">
      {news.map((item) => (
        <article key={item.id} className="group cursor-pointer">
          <div className="relative h-64 rounded-3xl overflow-hidden mb-6 shadow-lg">
            <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute top-4 left-4 bg-yellow-500 text-blue-900 text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest">
              {item.category}
            </div>
          </div>
          <span className="text-gray-400 text-sm font-medium">{item.date}</span>
          <h3 className="text-xl font-bold text-gray-900 mt-2 mb-4 group-hover:text-blue-900 transition-colors">
            {item.title}
          </h3>
          <p className="text-gray-600 line-clamp-2 leading-relaxed">
            {item.summary}
          </p>
        </article>
      ))}
    </div>
  );
};

const HomePage: React.FC = () => (
  <main className="flex-grow">
    <Hero />

    {/* Quick Links / Services */}
    <section id="layanan" className="relative -mt-12 z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
        {[
          { title: 'Izin Bangunan (PBG)', icon: 'fa-building', color: 'bg-white text-blue-900', path: '/pbg' },
          { title: 'Pertek Air Permukaan', icon: 'fa-water', color: 'bg-white text-blue-900', path: '/pertek-air' },
          { title: 'Info Tata Ruang', icon: 'fa-map-marked-alt', color: 'bg-white text-blue-900', path: '/info-tata-ruang' },
          { title: 'Akses Jalan', icon: 'fa-road', color: 'bg-white text-blue-900', path: '/akses-jalan' },
          { title: 'Data Spasial', icon: 'fa-database', color: 'bg-blue-900 text-white', path: '/data-spasial' },
        ].map((service, idx) => (
          <a
            key={idx}
            href={service.path}
            className={`${service.color} p-6 rounded-2xl shadow-xl flex flex-col items-center text-center group cursor-pointer hover:scale-105 transition-transform border border-gray-100`}
            onClick={(e) => {
              if (service.path !== '/') {
                // We'll handle internal navigation in Hero.tsx but for the cards here:
                // If it's the home page, just scroll or do nothing special.
              }
            }}
          >
            <div className={`w-12 h-12 rounded-full mb-4 flex items-center justify-center text-2xl ${service.color.includes('bg-white') ? 'bg-blue-50' : 'bg-blue-800'}`}>
              <i className={`fas ${service.icon}`}></i>
            </div>
            <h3 className="font-bold text-sm md:text-base">{service.title}</h3>
          </a>
        ))}
      </div>
    </section>

    {/* Vision Section */}
    <section id="profil" className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-blue-900 mb-4 font-primary">Visi & Misi</h2>
          <div className="w-24 h-1.5 bg-yellow-500 mx-auto rounded-full"></div>
        </div>

        <div className="space-y-12">
          {/* Visi Card - Full Width */}
          <div className="relative p-10 md:p-16 rounded-[40px] bg-gradient-to-br from-blue-900 to-blue-800 text-white shadow-2xl overflow-hidden group">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/5 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
            <div className="relative z-10 max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md mb-8 border border-white/20 shadow-inner">
                <i className="fas fa-eye text-3xl text-yellow-400"></i>
              </div>
              <h3 className="text-2xl font-black uppercase tracking-[0.2em] mb-6 text-blue-100">Visi Kami</h3>
              <p className="text-2xl md:text-3xl font-bold leading-relaxed italic">
                "Masyarakat Papua Barat Daya yang Maju, Mandiri dan Sejahtera Berbasis Pertumbuhan Ekonomi Lokal Sebagai Upaya Pembangunan yang Berkesinambungan dan Berkelanjutan"
              </p>
            </div>
          </div>

          {/* Misi Grid - 5 Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="group p-8 rounded-[32px] bg-gray-50 border border-gray-100 hover:border-blue-200 hover:bg-white hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-900 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <i className="fas fa-user-graduate text-xl"></i>
              </div>
              <h4 className="text-lg font-bold text-blue-900 mb-3">Misi 01</h4>
              <p className="text-gray-600 leading-relaxed font-medium">Mewujudkan SDM yang Berkualitas dan Inovatif Berbasis Modal Sosial.</p>
            </div>

            <div className="group p-8 rounded-[32px] bg-gray-50 border border-gray-100 hover:border-blue-200 hover:bg-white hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-yellow-100 text-yellow-700 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <i className="fas fa-microchip text-xl"></i>
              </div>
              <h4 className="text-lg font-bold text-blue-900 mb-3">Misi 02</h4>
              <p className="text-gray-600 leading-relaxed font-medium">Membangun tata kelola pemerintahan yang baik dengan mengadopsi teknologi berbasis e-goverment.</p>
            </div>

            <div className="group p-8 rounded-[32px] bg-gray-50 border border-gray-100 hover:border-blue-200 hover:bg-white hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-900 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <i className="fas fa-chart-line text-xl"></i>
              </div>
              <h4 className="text-lg font-bold text-blue-900 mb-3">Misi 03</h4>
              <p className="text-gray-600 leading-relaxed font-medium">Pengembangan ekonomi berbasis potensi lokal.</p>
            </div>

            <div className="group p-8 rounded-[32px] bg-gray-50 border border-gray-100 hover:border-blue-200 hover:bg-white hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-yellow-100 text-yellow-700 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <i className="fas fa-network-wired text-xl"></i>
              </div>
              <h4 className="text-lg font-bold text-blue-900 mb-3">Misi 04</h4>
              <p className="text-gray-600 leading-relaxed font-medium">Peningkatan konektivitas wilayah.</p>
            </div>

            <div className="group p-8 rounded-[32px] bg-gray-50 border border-gray-100 hover:border-blue-200 hover:bg-white hover:shadow-xl transition-all duration-300 lg:col-span-1">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-900 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <i className="fas fa-cultural-heritage text-xl"></i>
              </div>
              <h4 className="text-lg font-bold text-blue-900 mb-3">Misi 05</h4>
              <p className="text-gray-600 leading-relaxed font-medium">Penguatan adat dan budaya lokal.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <ProjectGrid />
    <InfraStats />

    {/* Latest News */}
    <section id="news" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-extrabold text-blue-900">Kabar Terkini PUPR</h2>
            <div className="w-16 h-1 bg-yellow-500 mt-4 rounded-full"></div>
          </div>
          <button className="text-blue-900 font-bold flex items-center hover:translate-x-2 transition-transform">
            Lihat Semua Berita <i className="fas fa-arrow-right ml-2"></i>
          </button>
        </div>

        <NewsSection />
      </div>
    </section>

    {/* Contact CTA */}
    <section className="py-20 bg-gradient-pupr text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between text-center md:text-left">
        <div className="mb-8 md:mb-0">
          <h2 className="text-3xl font-extrabold mb-4">Punya Pertanyaan atau Keluhan?</h2>
          <p className="text-blue-100 text-lg">Gunakan layanan aspirasi kami untuk berpartisipasi dalam pembangunan.</p>
        </div>
        <div className="flex space-x-4">
          <button className="bg-yellow-500 hover:bg-yellow-400 text-blue-900 px-8 py-4 rounded-xl font-bold text-lg shadow-xl transition-all active:scale-95">
            Kirim Aspirasi
          </button>
        </div>
      </div>
    </section>
  </main>
);

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/info-tata-ruang" element={<InfoTataRuang />} />
          <Route path="/akses-jalan" element={<AksesJalan />} />
          <Route path="/data-spasial" element={<DataSpasial />} />
          <Route path="/pertek-air" element={<PertekAir />} />
          <Route path="/pbg" element={<PBG />} />
          <Route path="/admin/login" element={<LoginAdmin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<Navigate to="/admin/aduan" replace />} />
            <Route path="aduan" element={<DashboardAdminAduan />} />
            <Route path="berita" element={<DashboardAdminBerita />} />
          </Route>
          <Route path="/spm" element={<SPM />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Footer />
        <GeminiChat />
      </div>
    </Router>
  );
};

export default App;
