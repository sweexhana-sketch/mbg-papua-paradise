import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import MapComponent from './MapComponent';

const InfoTataRuang: React.FC = () => {
    const navigate = useNavigate();
    // 1. Layer Groups Definition
    const layerGroups = useMemo(() => [
        {
            title: 'Batas Administrasi',
            icon: 'fa-map-marked',
            layers: [
                { id: 'btskab_2', name: 'Batas Kabupaten', url: '/data/btskab_2.json', color: '#dc2626', icon: 'fa-map-marked' },
                { id: 'desapbd2', name: 'Batas Desa', url: '/data/desapbd2.json', color: '#94a3b8', icon: 'fa-map' }
            ]
        },
        {
            title: 'Jaringan Jalan',
            icon: 'fa-road',
            layers: [
                { id: 'jalan_nasional', name: 'Jalan Nasional', url: '/data/jalan_nasional_v2.json', color: '#2563eb', icon: 'fa-road' },
                { id: 'jalan_provinsi', name: 'Jalan Provinsi', url: '/data/jlnprov.json', color: '#dc2626', icon: 'fa-road' }
            ]
        },
        {
            title: 'Kawasan Hutan',
            icon: 'fa-tree',
            layers: [
                {
                    id: 'hutan_lindung',
                    name: 'Hutan Lindung',
                    url: '/data/kwsnhtn 1.json',
                    color: '#166534',
                    icon: 'fa-tree',
                    filter: (feature: any) => feature.properties?.NAMOBJ?.includes('Hutan Lindung')
                },
                {
                    id: 'hutan_produksi',
                    name: 'Hutan Produksi',
                    url: '/data/kwsnhtn 1.json',
                    color: '#facc15',
                    icon: 'fa-tree',
                    filter: (feature: any) => feature.properties?.NAMOBJ?.includes('Hutan Produksi')
                },
                {
                    id: 'hutan_konservasi',
                    name: 'Kawasan Suaka/Pelestarian Alam',
                    url: '/data/kwsnhtn 1.json',
                    color: '#9333ea',
                    icon: 'fa-leaf',
                    filter: (feature: any) => feature.properties?.NAMOBJ?.includes('KSA') || feature.properties?.NAMOBJ?.includes('KPA')
                },
                {
                    id: 'apl',
                    name: 'Areal Penggunaan Lain',
                    url: '/data/kwsnhtn 1.json',
                    color: '#a3a3a3',
                    icon: 'fa-layer-group',
                    filter: (feature: any) => feature.properties?.NAMOBJ?.includes('Areal Penggunaan Lain') || feature.properties?.NAMOBJ?.includes('APL')
                }
            ]
        },
        {
            title: 'Informasi Lainnya',
            icon: 'fa-info-circle',
            layers: [
                { id: 'kemampuan_lahan', name: 'Kemampuan Lahan', url: '/data/kemampuan lahan B.json', color: '#713f12', icon: 'fa-mountain' },
                { id: 'bendungan', name: 'Bendungan', url: '/data/bendungan pbd.json', color: '#1d4ed8', icon: 'fa-water-reduc' },
                { id: 'pengendali_banjir', name: 'Pengendali Banjir', url: '/data/pengendali banjir pbd.json', color: '#0369a1', icon: 'fa-shield-halved' }
            ]
        }
    ], []);

    const documents = [
        { name: 'Perda RTRW Provinsi Papua Barat Daya No. XX Tahun 202X', format: 'PDF' },
        { name: 'Peta Rencana Struktur Ruang (Jalan & Infrastruktur)', format: 'JPG/PDF' },
        { name: 'Peta Rencana Pola Ruang (Zonasi Wilayah)', format: 'JPG/PDF' },
        { name: 'Panduan Teknis Pengajuan KKPR', format: 'PDF' },
    ];

    const legendItems = [
        { color: 'bg-yellow-400', label: 'Kawasan Perumahan/Pemukiman' },
        { color: 'bg-red-500', label: 'Kawasan Perdagangan dan Jasa' },
        { color: 'bg-green-500', label: 'Kawasan Peruntukan Ruang Terbuka Hijau/Hutan' },
        { color: 'bg-purple-500', label: 'Kawasan Industri' },
    ];

    const mapMarkers: Array<{ position: [number, number]; title: string; description?: string }> = [
        { position: [-0.8813, 131.2944], title: "Pusat Kota Sorong", description: "Kawasan Pusat Perdagangan dan Jasa" },
        { position: [-1.4395, 132.2618], title: "Kabupaten Sorong Selatan", description: "Peta RTRW Daerah Sorong Selatan" }
    ];

    // 2. State Management for GIS
    // Initialize active layers (defaulting some to true)
    const [activeLayers, setActiveLayers] = useState<Record<string, boolean>>({
        'Batas Kabupaten': true,
        // No specific forest sub-layers on by default to avoid clutter, allowing user to choose
    });

    // Manage expanded groups state
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
        'Batas Administrasi': true,
        'Jaringan Jalan': true,
        'Kawasan Hutan': true,
        'Informasi Lainnya': true
    });

    const [layerOpacities, setLayerOpacities] = useState<Record<string, number>>({});

    const toggleLayer = (id: string, name: string) => {
        // Use ID for tracking if name is not unique (though names here are unique enough for display, ID is safer for state)
        // But the previous MapComponent logic relies on 'visible' prop derived from state.
        // Let's stick to using ID for state keys to be robust
        setActiveLayers(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const toggleGroup = (groupTitle: string) => {
        setExpandedGroups(prev => ({ ...prev, [groupTitle]: !prev[groupTitle] }));
    };

    const handleOpacityChange = (id: string, value: number) => {
        setLayerOpacities(prev => ({ ...prev, [id]: value }));
    };

    // Flatten layers for MapComponent consumption with OPTIMIZATION for Forest Layer
    const geoJsonLayers = useMemo(() => {
        const layers = [];

        // 1. Process Non-Forest Layers normally
        layerGroups.forEach(group => {
            if (group.title === 'Kawasan Hutan') return; // Skip forest for now

            group.layers.forEach(layer => {
                if (activeLayers[layer.id]) {
                    layers.push({
                        url: layer.url,
                        name: layer.name,
                        visible: true,
                        style: { color: layer.color, weight: 2 },
                        opacity: layerOpacities[layer.id] !== undefined ? layerOpacities[layer.id] : 0.3,
                        filter: layer.filter
                    });
                }
            });
        });

        // 2. Process Forest Layer as a SINGLE consolidated layer if any forest sub-layer is active
        const forestGroup = layerGroups.find(g => g.title === 'Kawasan Hutan');
        const activeForestLayers = forestGroup?.layers.filter(l => activeLayers[l.id]);

        if (activeForestLayers && activeForestLayers.length > 0) {
            layers.push({
                url: '/data/kwsnhtn 1.json',
                name: 'Kawasan Hutan', // Unified name
                visible: true,
                opacity: 0.6, // Default opacity for forest
                _updateKey: activeForestLayers.map(l => l.id).join(','), // Trigger re-render when active sub-layers change
                // Dynamic Style based on feature type
                style: (feature: any) => {
                    const props = feature.properties || {};
                    const namobj = props.NAMOBJ || '';

                    // Find which sub-layer this feature belongs to
                    if (namobj.includes('Hutan Lindung')) return { color: '#166534', weight: 1, fillOpacity: 0.6 };
                    if (namobj.includes('Hutan Produksi')) return { color: '#facc15', weight: 1, fillOpacity: 0.6 };
                    if (namobj.includes('KSA') || namobj.includes('KPA')) return { color: '#9333ea', weight: 1, fillOpacity: 0.6 };
                    if (namobj.includes('Areal Penggunaan Lain') || namobj.includes('APL')) return { color: '#a3a3a3', weight: 1, fillOpacity: 0.6 };

                    return { color: '#15803d', weight: 1 }; // Fallback
                },
                // Dynamic Filter: Only show features that match ACTIVE sub-layers
                filter: (feature: any) => {
                    const props = feature.properties || {};
                    const namobj = props.NAMOBJ || '';

                    // Check if this feature matches any ACTIVE forest sub-layer
                    if (activeLayers['hutan_lindung'] && namobj.includes('Hutan Lindung')) return true;
                    if (activeLayers['hutan_produksi'] && namobj.includes('Hutan Produksi')) return true;
                    if (activeLayers['hutan_konservasi'] && (namobj.includes('KSA') || namobj.includes('KPA'))) return true;
                    if (activeLayers['apl'] && (namobj.includes('Areal Penggunaan Lain') || namobj.includes('APL'))) return true;

                    return false;
                }
            });
        }

        return layers;
    }, [layerGroups, activeLayers, layerOpacities]);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-pupr text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {true && (
                        <button
                            onClick={() => navigate('/')}
                            className="mb-6 flex items-center space-x-2 text-white hover:text-yellow-400 transition-colors group"
                        >
                            <i className="fas fa-arrow-left group-hover:-translate-x-1 transition-transform"></i>
                            <span className="font-semibold">Kembali ke Beranda</span>
                        </button>
                    )}
                    <h1 className="text-4xl font-extrabold mb-4">Informasi Tata Ruang</h1>
                    <p className="text-xl text-blue-100 max-w-3xl">
                        Layanan Informasi Tata Ruang Dinas PUPR Provinsi Papua Barat Daya
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">

                {/* Pendahuluan */}
                <section className="bg-white rounded-3xl shadow-lg p-8 md:p-12">
                    <div className="flex items-start space-x-4 mb-6">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <i className="fas fa-info-circle text-2xl text-blue-900"></i>
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-blue-900 mb-4">Pendahuluan</h2>
                            <p className="text-gray-700 leading-relaxed text-lg">
                                Selamat datang di Layanan Informasi Tata Ruang Dinas PUPR Provinsi Papua Barat Daya.
                                Halaman ini disediakan untuk membantu masyarakat dan pelaku usaha dalam memastikan pemanfaatan
                                ruang yang sesuai dengan Peraturan Daerah guna mewujudkan pembangunan wilayah yang berkelanjutan dan teratur.
                            </p>
                        </div>
                    </div>
                </section>

                {/* 1. Visualisasi Peta RTRW */}
                <section className="bg-white rounded-3xl shadow-lg p-8 md:p-12">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                        <div>
                            <h2 className="text-3xl font-bold text-blue-900">
                                <i className="fas fa-map-marked-alt mr-3 text-yellow-500"></i>
                                Visualisasi Peta RTRW Interaktif
                            </h2>
                            <p className="text-gray-600 mt-2 text-lg">Gunakan panel kontrol untuk mengatur layer tata ruang.</p>
                        </div>
                    </div>

                    {/* Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                        {/* Sidebar / Controls */}
                        <div className="lg:col-span-1 space-y-8">

                            {/* Layer Control Panel */}
                            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                                <div className="bg-blue-900 px-5 py-4 border-b border-blue-800 flex justify-between items-center">
                                    <h3 className="font-bold text-white flex items-center gap-2">
                                        <i className="fas fa-layer-group"></i>
                                        Kontrol Layer
                                    </h3>
                                    <span className="text-xs bg-blue-800 text-blue-200 px-2 py-1 rounded-full">
                                        {Object.values(activeLayers).filter(Boolean).length} Aktif
                                    </span>
                                </div>

                                <div className="p-2 space-y-1 bg-gray-50 max-h-[600px] overflow-y-auto custom-scrollbar">
                                    {layerGroups.map((group) => (
                                        <div key={group.title} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                            <button
                                                onClick={() => toggleGroup(group.title)}
                                                className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                                            >
                                                <div className="flex items-center gap-2 font-semibold text-gray-700">
                                                    <i className={`fas ${group.icon} text-blue-600 w-5 text-center`}></i>
                                                    {group.title}
                                                </div>
                                                <i className={`fas fa-chevron-down transition-transform duration-200 text-gray-400 ${expandedGroups[group.title] ? 'rotate-180' : ''}`}></i>
                                            </button>

                                            {expandedGroups[group.title] && (
                                                <div className="p-2 space-y-2 border-t border-gray-100">
                                                    {group.layers.map((layer) => (
                                                        <div key={layer.id} className="group p-2 rounded-md hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100">
                                                            <div className="flex items-start space-x-3">
                                                                <div className="pt-1">
                                                                    <input
                                                                        type="checkbox"
                                                                        id={layer.id}
                                                                        checked={!!activeLayers[layer.id]}
                                                                        onChange={() => toggleLayer(layer.id, layer.name)}
                                                                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300 cursor-pointer"
                                                                    />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <label htmlFor={layer.id} className="block text-sm font-medium text-gray-700 cursor-pointer select-none">
                                                                        {layer.name}
                                                                    </label>

                                                                    {activeLayers[layer.id] && (
                                                                        <div className="mt-2 pl-1 pr-2">
                                                                            <div className="flex items-center space-x-2">
                                                                                <span className="text-xs text-gray-500">Transparansi</span>
                                                                                <input
                                                                                    type="range"
                                                                                    min="0"
                                                                                    max="1"
                                                                                    step="0.1"
                                                                                    value={layerOpacities[layer.id] !== undefined ? layerOpacities[layer.id] : 0.3}
                                                                                    onChange={(e) => handleOpacityChange(layer.id, parseFloat(e.target.value))}
                                                                                    className="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                                                                />
                                                                                <span className="text-xs font-mono text-gray-600 w-8 text-right">
                                                                                    {Math.round((layerOpacities[layer.id] !== undefined ? layerOpacities[layer.id] : 0.3) * 100)}%
                                                                                </span>
                                                                            </div>
                                                                            <div className="mt-1 flex items-center gap-2">
                                                                                <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-gray-100">
                                                                                    <div
                                                                                        className="h-full rounded-full"
                                                                                        style={{ backgroundColor: layer.color, width: '100%', opacity: layerOpacities[layer.id] !== undefined ? layerOpacities[layer.id] : 0.3 }}
                                                                                    ></div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Panduan Peta Section */}
                            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 mt-6">
                                <div className="bg-blue-900 px-5 py-4 border-b border-blue-800">
                                    <h4 className="font-bold text-white flex items-center gap-2">
                                        <i className="fas fa-info-circle text-yellow-400"></i>
                                        Panduan Peta
                                    </h4>
                                </div>
                                <div className="p-4 bg-blue-800 text-blue-50">
                                    <ul className="space-y-3 text-sm">
                                        <li className="flex items-start">
                                            <i className="fas fa-mouse-pointer mt-1 mr-2 text-yellow-400 text-xs w-4 text-center"></i>
                                            <span>Klik pada objek untuk detail atribut</span>
                                        </li>
                                        <li className="flex items-start">
                                            <i className="fas fa-search-plus mt-1 mr-2 text-yellow-400 text-xs w-4 text-center"></i>
                                            <span>Gunakan scroll untuk zoom in/out</span>
                                        </li>
                                        <li className="flex items-start">
                                            <i className="fas fa-arrows-alt mt-1 mr-2 text-yellow-400 text-xs w-4 text-center"></i>
                                            <span>Klik & tahan untuk menggeser peta</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Interactive Map Area */}
                        <div className="lg:col-span-3 space-y-6">
                            <div className="rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-white h-[600px]">
                                <MapComponent
                                    markers={mapMarkers}
                                    height="100%"
                                    zoom={8}
                                    geoJsonLayers={geoJsonLayers}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-center">
                        <button className="bg-blue-900 hover:bg-blue-800 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg transition-all active:scale-95">
                            <i className="fas fa-expand-arrows-alt mr-2"></i>
                            Buka Peta Mode Layar Penuh
                        </button>
                    </div>
                </section >

                {/* Legend */}
                < section className="bg-gray-50 rounded-2xl p-6" >
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Keterangan Legenda Peta:</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        {legendItems.map((item, idx) => (
                            <div key={idx} className="flex items-center space-x-3">
                                <div className={`w-8 h-8 ${item.color} rounded-lg shadow-md`}></div>
                                <span className="text-gray-700 font-medium">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </section >

                {/* 2. KKPR */}
                < section className="bg-white rounded-3xl shadow-lg p-8 md:p-12" >
                    <h2 className="text-3xl font-bold text-blue-900 mb-6">
                        <i className="fas fa-file-contract mr-3 text-yellow-500"></i>
                        Kesesuaian Kegiatan Pemanfaatan Ruang (KKPR)
                    </h2>

                    <div className="bg-blue-50 border-l-4 border-blue-900 p-6 rounded-r-2xl mb-8">
                        <p className="text-gray-700 leading-relaxed text-lg">
                            <strong>KKPR</strong> adalah dokumen wajib yang menyatakan kesesuaian antara rencana kegiatan
                            pemanfaatan ruang dengan Rencana Struktur Ruang and Rencana Pola Ruang.
                        </p>
                    </div>

                    {/* Prosedur */}
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Prosedur Pengajuan:</h3>
                    <div className="space-y-6 mb-8">
                        <div className="flex items-start space-x-4">
                            <div className="w-10 h-10 bg-yellow-500 text-blue-900 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">
                                1
                            </div>
                            <div>
                                <h4 className="text-xl font-bold text-gray-900 mb-2">Pendaftaran</h4>
                                <p className="text-gray-700">
                                    Melalui sistem OSS RBA (untuk pelaku usaha) atau secara mandiri (non-usaha).
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-4">
                            <div className="w-10 h-10 bg-yellow-500 text-blue-900 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">
                                2
                            </div>
                            <div>
                                <h4 className="text-xl font-bold text-gray-900 mb-2">Verifikasi Teknis</h4>
                                <p className="text-gray-700">
                                    Tim Dinas PUPR akan memeriksa koordinat lokasi terhadap peta RTRW.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-4">
                            <div className="w-10 h-10 bg-yellow-500 text-blue-900 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-lg">
                                3
                            </div>
                            <div>
                                <h4 className="text-xl font-bold text-gray-900 mb-2">Penerbitan</h4>
                                <p className="text-gray-700">
                                    Persetujuan atau penolakan berdasarkan hasil kajian lapangan dan regulasi yang berlaku.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Dokumen Pendukung */}
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Dokumen Pendukung:</h3>
                    <ul className="space-y-3">
                        <li className="flex items-center space-x-3">
                            <i className="fas fa-check-circle text-green-500 text-xl"></i>
                            <span className="text-gray-700 text-lg">Titik Koordinat Lokasi (Polygon/KML)</span>
                        </li>
                        <li className="flex items-center space-x-3">
                            <i className="fas fa-check-circle text-green-500 text-xl"></i>
                            <span className="text-gray-700 text-lg">Rencana Penggunaan Lahan</span>
                        </li>
                        <li className="flex items-center space-x-3">
                            <i className="fas fa-check-circle text-green-500 text-xl"></i>
                            <span className="text-gray-700 text-lg">Identitas Pemohon (KTP/NIB)</span>
                        </li>
                    </ul>
                </section >

                {/* 3. Pusat Unduhan Dokumen */}
                < section className="bg-white rounded-3xl shadow-lg p-8 md:p-12" >
                    <h2 className="text-3xl font-bold text-blue-900 mb-6">
                        <i className="fas fa-download mr-3 text-yellow-500"></i>
                        Pusat Unduhan Dokumen Produk Hukum
                    </h2>
                    <p className="text-gray-700 mb-8 text-lg">
                        Silakan unduh dokumen resmi terkait tata ruang melalui daftar di bawah ini:
                    </p>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-blue-900 text-white">
                                    <th className="px-6 py-4 text-left rounded-tl-xl">Nama Dokumen</th>
                                    <th className="px-6 py-4 text-left">Format</th>
                                    <th className="px-6 py-4 text-center rounded-tr-xl">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {documents.map((doc, idx) => (
                                    <tr key={idx} className={`${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'} border-b border-gray-200 hover:bg-blue-50 transition-colors`}>
                                        <td className="px-6 py-4 text-gray-900">{doc.name}</td>
                                        <td className="px-6 py-4 text-gray-600">{doc.format}</td>
                                        <td className="px-6 py-4 text-center">
                                            <button className="bg-yellow-500 hover:bg-yellow-400 text-blue-900 px-6 py-2 rounded-lg font-bold transition-all active:scale-95 shadow-md">
                                                <i className="fas fa-download mr-2"></i>
                                                Unduh
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section >

                {/* 4. Layanan Konsultasi */}
                < section className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-3xl shadow-lg p-8 md:p-12 text-white" >
                    <h2 className="text-3xl font-bold mb-6">
                        <i className="fas fa-headset mr-3 text-yellow-400"></i>
                        Layanan Konsultasi & Cek Plot
                    </h2>
                    <p className="text-blue-100 mb-8 text-lg">
                        Masih ragu apakah lahan Anda boleh dibangun? Gunakan layanan bantuan kami:
                    </p>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* WhatsApp */}
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                                    <i className="fab fa-whatsapp text-2xl text-white"></i>
                                </div>
                                <h3 className="text-xl font-bold">Layanan WhatsApp (Fast Response)</h3>
                            </div>
                            <p className="text-blue-100 mb-4">
                                Jam operasional: <strong>Senin - Jumat (08.00 - 16.00 WIT)</strong>
                            </p>
                            <button
                                onClick={() => window.open('https://wa.me/6282293234424', '_blank')}
                                className="bg-green-500 hover:bg-green-400 text-white px-6 py-3 rounded-xl font-bold w-full transition-all active:scale-95 shadow-lg"
                            >
                                <i className="fab fa-whatsapp mr-2"></i>
                                Klik untuk Chat: 0822-9323-4424
                            </button>
                        </div>

                        {/* Formulir */}
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                                    <i className="fas fa-clipboard-list text-2xl text-blue-900"></i>
                                </div>
                                <h3 className="text-xl font-bold">Formulir Cek Plot Mandiri</h3>
                            </div>
                            <p className="text-blue-100 mb-4">
                                Kirimkan koordinat lokasi Anda (Google Maps Link) and rencana bangunan untuk mendapatkan jawaban awal mengenai status lahan.
                            </p>
                            <button className="bg-yellow-500 hover:bg-yellow-400 text-blue-900 px-6 py-3 rounded-xl font-bold w-full transition-all active:scale-95 shadow-lg">
                                <i className="fas fa-external-link-alt mr-2"></i>
                                Klik Link Form
                            </button>
                        </div>
                    </div>
                </section >

            </div >
        </div >
    );
};

export default InfoTataRuang;
