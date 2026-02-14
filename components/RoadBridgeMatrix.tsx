import React, { useState, useEffect, useMemo } from 'react';

interface RoadBridgeItem {
    id: string | number;
    name: string;
    location: string;
    dimensions: string;
    condition: string;
    coordinates: string;
    type: 'Jalan Nasional' | 'Jalan Provinsi' | 'Jembatan Nasional';
    raw: any;
}

const RoadBridgeMatrix: React.FC = () => {
    const [data, setData] = useState<RoadBridgeItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<string>('All');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [provRoads, natRoads, natBridges] = await Promise.all([
                    fetch('/data/jlnprov.json').then(res => res.json()).catch(() => ({ features: [] })),
                    fetch('/data/jalan_nasional_v2.json').then(res => res.json()).catch(() => ({ features: [] })),
                    fetch('/data/jembatan nasional.json').then(res => res.json()).catch(() => ({ features: [] }))
                ]);

                const formattedProvRoads: RoadBridgeItem[] = (provRoads.features || []).map((f: any, idx: number) => ({
                    id: `prov-${idx}`,
                    name: f.properties.Nm_Ruas || 'Tidak Ada Nama',
                    location: f.properties.Kab_Kot || '-',
                    dimensions: `${f.properties.Panjang || 0} km x ${f.properties.Lbr_Keras || 0} m`,
                    condition: `Baik: ${f.properties.Kon_Baik || 0}%, Rusak: ${f.properties.Kon_Rusak || 0}%`,
                    coordinates: `${f.properties.Koord_Y_Aw || 0}, ${f.properties.Koord_X_Aw || 0}`,
                    type: 'Jalan Provinsi',
                    raw: f.properties
                }));

                const formattedNatRoads: RoadBridgeItem[] = (natRoads.features || []).map((f: any, idx: number) => ({
                    id: `nat-${idx}`,
                    name: f.properties.LINK_NAME || 'Tidak Ada Nama',
                    location: f.properties.CITY_REGEN || '-',
                    dimensions: `${f.properties.REAL_LENGT || 0} km x - m`,
                    condition: 'Baik', // Default assumption as data is missing
                    coordinates: '-', // Coordinates often embedded in geometry for roads
                    type: 'Jalan Nasional',
                    raw: f.properties
                }));

                const formattedNatBridges: RoadBridgeItem[] = (natBridges.features || []).map((f: any, idx: number) => ({
                    id: `bridge-${idx}`,
                    name: f.properties.BRIDGE_NAM || 'Tidak Ada Nama',
                    location: f.properties.CITY_REGEN || '-',
                    dimensions: `${f.properties.BRIDGE_LEN || 0} m x ${f.properties.BRIDGE_WID || 0} m`,
                    condition: f.properties.BRIDGE_STA === 'N' ? 'Baik' : f.properties.BRIDGE_STA || 'N/A',
                    coordinates: `${f.properties.LATITUDE || 0}, ${f.properties.LONGITUDE || 0}`,
                    type: 'Jembatan Nasional',
                    raw: f.properties
                }));

                setData([...formattedProvRoads, ...formattedNatRoads, ...formattedNatBridges]);
            } catch (error) {
                console.error('Error fetching road and bridge data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const filteredData = useMemo(() => {
        return data.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.location.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = filterType === 'All' || item.type === filterType;
            return matchesSearch && matchesType;
        });
    }, [data, searchTerm, filterType]);

    return (
        <section className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
            <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h2 className="text-3xl font-bold text-blue-900 flex items-center">
                            <i className="fas fa-table mr-3 text-yellow-500"></i>
                            Matriks Status Jalan & Jembatan
                        </h2>
                        <p className="text-gray-600 mt-1">Data inventarisasi infrastruktur terkini di wilayah Papua Barat Daya.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative">
                            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                            <input
                                type="text"
                                placeholder="Cari ruas atau lokasi..."
                                className="pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[280px] transition-all shadow-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select
                            className="px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm bg-white font-semibold text-gray-700"
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                        >
                            <option value="All">Semua Tipe</option>
                            <option value="Jalan Nasional">Jalan Nasional</option>
                            <option value="Jalan Provinsi">Jalan Provinsi</option>
                            <option value="Jembatan Nasional">Jembatan Nasional</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-blue-900 text-white uppercase text-xs font-black tracking-wider">
                            <th className="px-6 py-5">No</th>
                            <th className="px-6 py-5">Nama Ruas / Jembatan</th>
                            <th className="px-6 py-5">Kabupaten/Kota</th>
                            <th className="px-6 py-5">Dimensi (PxL)</th>
                            <th className="px-6 py-5">Kondisi Eksisting</th>
                            <th className="px-6 py-5">Koordinat</th>
                            <th className="px-6 py-5">Handling 2026</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-20 text-center">
                                    <div className="flex flex-col items-center justify-center space-y-4">
                                        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                        <p className="text-gray-500 font-bold animate-pulse">Mengambil data infrastruktur...</p>
                                    </div>
                                </td>
                            </tr>
                        ) : filteredData.length > 0 ? (
                            filteredData.map((item, idx) => (
                                <tr key={item.id} className="hover:bg-blue-50/50 transition-colors group">
                                    <td className="px-6 py-4 font-mono text-sm text-gray-400">{idx + 1}</td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{item.name}</div>
                                        <div className="text-[10px] mt-1">
                                            <span className={`px-2 py-0.5 rounded-full font-black uppercase ${item.type === 'Jalan Nasional' ? 'bg-blue-100 text-blue-700' :
                                                item.type === 'Jalan Provinsi' ? 'bg-red-100 text-red-700' :
                                                    'bg-purple-100 text-purple-700'
                                                }`}>
                                                {item.type}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-700 font-medium">{item.location}</td>
                                    <td className="px-6 py-4 text-gray-600 text-sm">{item.dimensions}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-lg text-xs font-bold ${item.condition.toLowerCase().includes('baik') ? 'bg-green-100 text-green-700' :
                                            item.condition.toLowerCase().includes('rusak') ? 'bg-red-100 text-red-700' :
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {item.condition}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <code className="bg-gray-100 px-2 py-1 rounded text-[11px] text-gray-600">{item.coordinates}</code>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-gray-400 italic text-sm">Pemeliharaan Rutin</span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} className="px-6 py-20 text-center text-gray-500">
                                    <i className="fas fa-search text-4xl mb-4 text-gray-200"></i>
                                    <p className="font-bold">Tidak ada data yang ditemukan</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {!loading && filteredData.length > 0 && (
                <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-sm text-gray-500">Menampilkan <strong>{filteredData.length}</strong> data infrastruktur</span>
                    <div className="flex space-x-2">
                        <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold shadow-sm hover:bg-gray-50 transition-all active:scale-95 disabled:opacity-50" disabled>
                            Previous
                        </button>
                        <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold shadow-sm hover:bg-gray-50 transition-all active:scale-95 disabled:opacity-50" disabled>
                            Next
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
};

export default RoadBridgeMatrix;
