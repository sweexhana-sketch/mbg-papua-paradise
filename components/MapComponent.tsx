import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMap, LayersControl, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon issue in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Helper component to fix map sizing and rendering issues
const MapResizer = ({ trigger }: { trigger: any }) => {
    const map = useMap();
    useEffect(() => {
        map.invalidateSize();
    }, [map, trigger]);
    return null;
};

// Helper component to update map view when center/zoom props change
const ChangeView = ({ center, zoom }: { center: [number, number]; zoom: number }) => {
    const map = useMap();
    map.setView(center, zoom);
    return null;
};

// MapEvents component to handle global map interactions
const MapEvents = ({ onMapClick }: { onMapClick: () => void }) => {
    useMapEvents({
        click: () => {
            onMapClick();
        },
    });
    return null;
};

interface GeoJsonLayer {
    url: string;
    name: string;
    style?: L.PathOptions | ((feature: any) => L.PathOptions);
    visible: boolean;
    opacity?: number;
    filter?: (feature: any) => boolean;
    _updateKey?: string;
}

interface MapComponentProps {
    center?: [number, number];
    zoom?: number;
    markers?: Array<{
        position: [number, number];
        title: string;
        description?: string;
    }>;
    height?: string;
    geoJsonLayers?: GeoJsonLayer[];
}

const MapComponent: React.FC<MapComponentProps> = ({
    center = [-1.3361, 132.2375],
    zoom = 9,
    markers = [],
    height = '400px',
    geoJsonLayers = []
}) => {
    const [loadedLayers, setLoadedLayers] = useState<Record<string, any>>({});
    const [selectedFeature, setSelectedFeature] = useState<{ id: string | number; layerUrl: string } | null>(null);

    // Fetch GeoJSON data
    useEffect(() => {
        let mounted = true;
        geoJsonLayers.forEach(layer => {
            if (layer.visible && !loadedLayers[layer.url]) {
                fetch(layer.url)
                    .then(res => res.json())
                    .then(data => {
                        if (mounted) {
                            // Inject unique ID to each feature for absolute isolation
                            const enrichedFeatures = (data.features || []).map((f: any, idx: number) => ({
                                ...f,
                                properties: { ...f.properties, _ant_id: `${layer.name}-${idx}` }
                            }));
                            setLoadedLayers(prev => ({ ...prev, [layer.url]: { ...data, features: enrichedFeatures } }));
                        }
                    })
                    .catch(err => console.error(`Error loading layer ${layer.name}:`, err));
            }
        });
        return () => { mounted = false; };
    }, [geoJsonLayers, loadedLayers]);

    // Helper to get a unique identifier for a feature
    const getFeatureId = useCallback((feature: any) => {
        return feature.properties?._ant_id || (feature.id !== undefined ? feature.id : JSON.stringify(feature.geometry?.coordinates).substring(0, 50));
    }, []);

    const getFeatureStyle = useCallback((feature: any, layer: GeoJsonLayer) => {
        const featId = getFeatureId(feature);
        const isSelected = selectedFeature &&
            selectedFeature.id === featId &&
            selectedFeature.layerUrl === layer.url;

        const baseStyle = typeof layer.style === 'function' ? layer.style(feature) : (layer.style || { color: '#3b82f6', weight: 2 });
        const isPolygon = feature.geometry && (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon');

        // For polygons, we use a near-zero fillOpacity (0) so they remain clickable but look hollow
        // This honors "tengah poligonnya tidak ada"
        const defaultFillOpacity = isPolygon ? 0.0001 : (layer.opacity !== undefined ? layer.opacity : 0.3);
        const currentOpacity = layer.opacity !== undefined ? layer.opacity : 1.0;

        if (isSelected) {
            return {
                ...baseStyle,
                color: '#ffff00', // Bright Yellow
                opacity: currentOpacity, // "menyalanya mengikuti transparansi"
                weight: 8,       // Thick steady line
                fillOpacity: 0.0001, // Hollow even when selected
                dashArray: '',
                className: 'feature-selected'
            };
        }

        return {
            ...baseStyle,
            fillOpacity: defaultFillOpacity,
            weight: baseStyle.weight || 2,
            opacity: currentOpacity
        };
    }, [selectedFeature, getFeatureId]);

    return (
        <div style={{ height, width: '100%', borderRadius: '1rem', overflow: 'hidden', background: '#f8fafc', position: 'relative' }}>
            <style>
                {`
                .feature-selected {
                    stroke: #ffff00 !important;
                    stroke-width: 8 !important;
                    z-index: 1000 !important;
                    stroke-opacity: inherit !important;
                }
                `}
            </style>
            <MapContainer
                center={center}
                zoom={zoom}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
                preferCanvas={true}
            >
                <ChangeView center={center as [number, number]} zoom={zoom} />
                <MapEvents onMapClick={() => setSelectedFeature(null)} />
                <LayersControl position="topright">
                    <LayersControl.BaseLayer checked name="OpenStreetMap Standard">
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                    </LayersControl.BaseLayer>
                    <LayersControl.BaseLayer name="Satelit">
                        <TileLayer
                            attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
                            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                        />
                    </LayersControl.BaseLayer>
                    <LayersControl.BaseLayer name="Topografi">
                        <TileLayer
                            attribution='&copy; <a href="https://opentopomap.org">OpenTopoMap</a> contributors'
                            url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
                        />
                    </LayersControl.BaseLayer>
                </LayersControl>

                <MapResizer trigger={geoJsonLayers} />
                {geoJsonLayers.map((layer, idx) => (
                    layer.visible && loadedLayers[layer.url] && (
                        <GeoJSON
                            key={`${layer.name}-${idx}-${layer.visible}-${layer.opacity}-${selectedFeature?.id || 'none'}-${layer._updateKey || ''}`}
                            data={loadedLayers[layer.url]}
                            filter={layer.filter}
                            style={(feature) => getFeatureStyle(feature, layer)}
                            onEachFeature={(feature, leafletLayer) => {
                                leafletLayer.on({
                                    click: (e) => {
                                        L.DomEvent.stopPropagation(e);
                                        const featId = getFeatureId(feature);
                                        setSelectedFeature({
                                            id: featId,
                                            layerUrl: layer.url
                                        });
                                    }
                                });

                                if (feature.properties) {
                                    const props = feature.properties;
                                    let popupContent = '';

                                    // Check if this is a Batas Desa layer
                                    if (layer.name === 'Batas Desa' && props.WADMKD) {
                                        popupContent = `
                                            <div style="font-family: inherit; font-size: 13px; line-height: 1.5; text-align: left; min-width: 200px;">
                                                <div style="background-color: #f1f5f9; padding: 8px 12px; border-radius: 6px; border-left: 4px solid #94a3b8; margin-bottom: 8px;">
                                                    <div style="font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; font-size: 10px; margin-bottom: 2px;">
                                                        Kelurahan/Kampung
                                                    </div>
                                                    <div style="font-weight: 700; font-size: 14px; color: #1f2937;">
                                                        ${props.WADMKD}
                                                    </div>
                                                </div>
                                                
                                                <div style="display: grid; grid-template-columns: auto 1fr; gap: 4px 12px; padding: 0 4px;">
                                                    ${props.WADMKC ? `<span style="color: #64748b; font-weight: 500;">Kecamatan:</span> <span style="font-weight: 600; color: #334155;">${props.WADMKC}</span>` : ''}
                                                    ${props.WADMKK ? `<span style="color: #64748b; font-weight: 500;">Kabupaten:</span> <span style="font-weight: 600; color: #334155;">${props.WADMKK}</span>` : ''}
                                                    ${props.LUAS ? `<span style="color: #64748b; font-weight: 500;">Luas:</span> <span style="font-weight: 600; color: #334155;">${props.LUAS.toFixed(2)} km²</span>` : ''}
                                                </div>
                                            </div>
                                        `;
                                    }
                                    // Check if this is a Batas Kabupaten layer
                                    else if (layer.name === 'Batas Kabupaten' && props.WADMKK) {
                                        popupContent = `
                                            <div style="font-family: inherit; font-size: 13px; line-height: 1.5; text-align: left; min-width: 200px;">
                                                <div style="background-color: #fef2f2; padding: 8px 12px; border-radius: 6px; border-left: 4px solid #dc2626; margin-bottom: 8px;">
                                                    <div style="font-weight: 800; color: #991b1b; text-transform: uppercase; letter-spacing: 0.5px; font-size: 10px; margin-bottom: 2px;">
                                                        Kabupaten/Kota
                                                    </div>
                                                    <div style="font-weight: 700; font-size: 14px; color: #1f2937;">
                                                        ${props.WADMKK}
                                                    </div>
                                                </div>
                                                
                                                <div style="display: grid; grid-template-columns: auto 1fr; gap: 4px 12px; padding: 0 4px;">
                                                    ${props.WADMPR ? `<span style="color: #64748b; font-weight: 500;">Provinsi:</span> <span style="font-weight: 600; color: #334155;">${props.WADMPR}</span>` : ''}
                                                    ${props.LUAS ? `<span style="color: #64748b; font-weight: 500;">Luas:</span> <span style="font-weight: 600; color: #334155;">${props.LUAS.toFixed(2)} km²</span>` : ''}
                                                </div>
                                            </div>
                                        `;
                                    }
                                    // Check if this is a Kemampuan Lahan layer
                                    else if (layer.name === 'Kemampuan Lahan') {
                                        popupContent = `
                                            <div style="font-family: inherit; font-size: 13px; line-height: 1.5; text-align: left; min-width: 220px;">
                                                <div style="background-color: #fef3c7; padding: 8px 12px; border-radius: 6px; border-left: 4px solid #d97706; margin-bottom: 8px;">
                                                    <div style="font-weight: 800; color: #92400e; text-transform: uppercase; letter-spacing: 0.5px; font-size: 10px; margin-bottom: 2px;">
                                                        Kemampuan Lahan
                                                    </div>
                                                    <div style="font-weight: 700; font-size: 14px; color: #1f2937;">
                                                        ${props.PL_SNI2014 || 'Tidak tersedia'}
                                                    </div>
                                                </div>
                                                
                                                <div style="background-color: #f0fdf4; padding: 6px 10px; border-radius: 4px; margin-bottom: 6px;">
                                                    <div style="font-size: 10px; color: #166534; font-weight: 600; margin-bottom: 2px;">JENIS BENTANG LAHAN</div>
                                                    <div style="font-weight: 600; color: #15803d; font-size: 12px;">${props.Nama_BL || 'Tidak tersedia'}</div>
                                                </div>

                                                ${props.C_DDP ? `
                                                <div style="background-color: #eff6ff; padding: 6px 10px; border-radius: 4px; margin-bottom: 6px;">
                                                    <div style="font-size: 10px; color: #1e40af; font-weight: 600; margin-bottom: 2px;">TINGKAT KEPENTINGAN</div>
                                                    <div style="font-weight: 600; color: #1d4ed8; font-size: 12px;">${props.C_DDP}</div>
                                                </div>
                                                ` : ''}

                                                ${props.LUASHA ? `
                                                <div style="padding: 4px 0; border-top: 1px solid #e5e7eb; margin-top: 6px;">
                                                    <span style="color: #64748b; font-weight: 500; font-size: 11px;">Luas Area:</span> 
                                                    <span style="font-weight: 600; color: #334155; font-size: 11px;">${props.LUASHA.toFixed(2)} Ha</span>
                                                </div>
                                                ` : ''}
                                            </div>
                                        `;
                                    }
                                    // Check if this is a Kawasan Hutan layer
                                    else if (layer.name === 'Kawasan Hutan') {
                                        popupContent = `
                                            <div style="font-family: inherit; font-size: 13px; line-height: 1.5; text-align: left; min-width: 220px;">
                                                <div style="background-color: #f0fdf4; padding: 8px 12px; border-radius: 6px; border-left: 4px solid #15803d; margin-bottom: 8px;">
                                                    <div style="font-weight: 800; color: #166534; text-transform: uppercase; letter-spacing: 0.5px; font-size: 10px; margin-bottom: 2px;">
                                                        Kawasan Hutan
                                                    </div>
                                                    <div style="font-weight: 700; font-size: 14px; color: #1f2937;">
                                                        ${props.NAMOBJ || 'Kawasan Hutan'}
                                                    </div>
                                                </div>
                                                
                                                ${props.FUNGSIKWS ? `
                                                <div style="background-color: #ecfdf5; padding: 6px 10px; border-radius: 4px; margin-bottom: 6px;">
                                                    <div style="font-size: 10px; color: #047857; font-weight: 600; margin-bottom: 2px;">FUNGSI KAWASAN</div>
                                                    <div style="font-weight: 600; color: #059669; font-size: 12px;">${props.FUNGSIKWS === 1 ? 'Kawasan Konservasi' : 'Kawasan Lindung'}</div>
                                                </div>
                                                ` : ''}

                                                ${props.LUAS_HA ? `
                                                <div style="padding: 4px 0; border-top: 1px solid #e5e7eb; margin-top: 6px;">
                                                    <span style="color: #64748b; font-weight: 500; font-size: 11px;">Luas Area:</span> 
                                                    <span style="font-weight: 600; color: #334155; font-size: 11px;">${props.LUAS_HA.toFixed(2)} Ha</span>
                                                </div>
                                                ` : ''}
                                            </div>
                                        `;
                                    }
                                    // Check if this is a Bendungan layer
                                    else if (layer.name === 'Bendungan') {
                                        popupContent = `
                                            <div style="font-family: inherit; font-size: 13px; line-height: 1.5; text-align: left; min-width: 220px;">
                                                <div style="background-color: #eff6ff; padding: 8px 12px; border-radius: 6px; border-left: 4px solid #1d4ed8; margin-bottom: 8px;">
                                                    <div style="font-weight: 800; color: #1e40af; text-transform: uppercase; letter-spacing: 0.5px; font-size: 10px; margin-bottom: 2px;">
                                                        Bendungan
                                                    </div>
                                                    <div style="font-weight: 700; font-size: 14px; color: #1f2937;">
                                                        ${props.Bendung || 'Bendungan'}
                                                    </div>
                                                </div>
                                                
                                                ${props.Nama_DI ? `
                                                <div style="background-color: #dbeafe; padding: 6px 10px; border-radius: 4px; margin-bottom: 6px;">
                                                    <div style="font-size: 10px; color: #1e40af; font-weight: 600; margin-bottom: 2px;">DAERAH IRIGASI</div>
                                                    <div style="font-weight: 600; color: #1d4ed8; font-size: 12px;">${props.Nama_DI}</div>
                                                </div>
                                                ` : ''}
                                            </div>
                                        `;
                                    }
                                    // Check if this is a Pengendali Banjir layer
                                    else if (layer.name === 'Pengendali Banjir') {
                                        popupContent = `
                                            <div style="font-family: inherit; font-size: 13px; line-height: 1.5; text-align: left; min-width: 220px;">
                                                <div style="background-color: #ecfeff; padding: 8px 12px; border-radius: 6px; border-left: 4px solid #0369a1; margin-bottom: 8px;">
                                                    <div style="font-weight: 800; color: #0c4a6e; text-transform: uppercase; letter-spacing: 0.5px; font-size: 10px; margin-bottom: 2px;">
                                                        Pengendali Banjir
                                                    </div>
                                                    <div style="font-weight: 700; font-size: 14px; color: #1f2937;">
                                                        ${props.NAME || 'Pengendali Banjir'}
                                                    </div>
                                                </div>
                                                
                                                ${props.Lokasi ? `
                                                <div style="background-color: #cffafe; padding: 6px 10px; border-radius: 4px; margin-bottom: 6px;">
                                                    <div style="font-size: 10px; color: #0c4a6e; font-weight: 600; margin-bottom: 2px;">LOKASI</div>
                                                    <div style="font-weight: 600; color: #0369a1; font-size: 12px;">${props.Lokasi}</div>
                                                </div>
                                                ` : ''}
                                            </div>
                                        `;
                                    }
                                    // Check if this is a Jalan Nasional layer
                                    else if (layer.name === 'Jalan Nasional') {
                                        const roadName = props.nm_jalan || props.Nm_Ruas || 'Jalan Nasional';
                                        const length = props.panjang_km || props.Panjang;
                                        const width = props.lebar_jalan_m || props.Lbr_Keras;

                                        popupContent = `
                                            <div style="font-family: inherit; font-size: 13px; line-height: 1.5; text-align: left; min-width: 220px;">
                                                <div style="background-color: #eff6ff; padding: 8px 12px; border-radius: 6px; border-left: 4px solid #2563eb; margin-bottom: 8px;">
                                                    <div style="font-weight: 800; color: #1e40af; text-transform: uppercase; letter-spacing: 0.5px; font-size: 10px; margin-bottom: 2px;">
                                                        Jalan Nasional
                                                    </div>
                                                    <div style="font-weight: 700; font-size: 14px; color: #1f2937;">
                                                        ${roadName}
                                                    </div>
                                                </div>
                                                
                                                <div style="display: grid; grid-template-columns: auto 1fr; gap: 4px 12px; padding: 0 4px;">
                                                    ${length ? `<span style="color: #64748b; font-weight: 500;">Panjang:</span> <span style="font-weight: 600; color: #334155;">${typeof length === 'number' ? length.toFixed(2) : length} km</span>` : ''}
                                                    ${width ? `<span style="color: #64748b; font-weight: 500;">Lebar:</span> <span style="font-weight: 600; color: #334155;">${typeof width === 'number' ? width.toFixed(2) : width} m</span>` : ''}
                                                </div>
                                            </div>
                                        `;
                                    }
                                    // Check if this is a Jalan Provinsi layer
                                    else if (layer.name === 'Jalan Provinsi') {
                                        const roadName = props.nm_jalan || props.Nm_Ruas || 'Jalan Provinsi';
                                        const length = props.panjang_km || props.Panjang;
                                        const width = props.lebar_jalan_m || props.Lbr_Keras;

                                        popupContent = `
                                            <div style="font-family: inherit; font-size: 13px; line-height: 1.5; text-align: left; min-width: 220px;">
                                                <div style="background-color: #fef2f2; padding: 8px 12px; border-radius: 6px; border-left: 4px solid #dc2626; margin-bottom: 8px;">
                                                    <div style="font-weight: 800; color: #991b1b; text-transform: uppercase; letter-spacing: 0.5px; font-size: 10px; margin-bottom: 2px;">
                                                        Jalan Provinsi
                                                    </div>
                                                    <div style="font-weight: 700; font-size: 14px; color: #1f2937;">
                                                        ${roadName}
                                                    </div>
                                                </div>
                                                
                                                <div style="display: grid; grid-template-columns: auto 1fr; gap: 4px 12px; padding: 0 4px;">
                                                    ${length ? `<span style="color: #64748b; font-weight: 500;">Panjang:</span> <span style="font-weight: 600; color: #334155;">${typeof length === 'number' ? length.toFixed(2) : length} km</span>` : ''}
                                                    ${width ? `<span style="color: #64748b; font-weight: 500;">Lebar:</span> <span style="font-weight: 600; color: #334155;">${typeof width === 'number' ? width.toFixed(2) : width} m</span>` : ''}
                                                </div>
                                            </div>
                                        `;
                                    }
                                    // For other layers (default fallback)
                                    else {
                                        // Extract common properties
                                        const name = props.nm_jalan || props.Nm_Ruas || props.BRIDGE_NAM || props.NAME || 'Informasi';
                                        const length = props.panjang_km || props.Panjang || props.BRIDGE_LEN;
                                        const width = props.lebar_jalan_m || props.Lbr_Keras || props.BRIDGE_WID;
                                        const condition = props.kondisi || props.Kon_Baik ? `Baik: ${props.Kon_Baik}%` : (props.BRIDGE_STA === 'N' ? 'Baik' : props.BRIDGE_STA) || '-';

                                        popupContent = `
                                            <div style="font-family: inherit; font-size: 13px; line-height: 1.5; text-align: left; min-width: 200px;">
                                                <div style="background-color: #f8fafc; padding: 8px 12px; border-radius: 6px; border-left: 4px solid #64748b; margin-bottom: 8px;">
                                                    <div style="font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; font-size: 10px; margin-bottom: 2px;">
                                                        ${layer.name}
                                                    </div>
                                                    <div style="font-weight: 700; font-size: 14px; color: #1f2937;">
                                                        ${name}
                                                    </div>
                                                </div>

                                                <div style="display: grid; grid-template-columns: auto 1fr; gap: 4px 12px; padding: 0 4px;">
                                                    ${length ? `<span style="color: #64748b; font-weight: 500;">Panjang:</span> <span style="font-weight: 600; color: #334155;">${length} km</span>` : ''}
                                                    ${width ? `<span style="color: #64748b; font-weight: 500;">Lebar:</span> <span style="font-weight: 600; color: #334155;">${width} m</span>` : ''}
                                                    ${condition ? `<span style="color: #64748b; font-weight: 500;">Kondisi:</span> <span style="font-weight: 600; color: ${condition.toString().toLowerCase().includes('baik') ? '#166534' : '#b91c1c'};">${condition}</span>` : ''}
                                                </div>
                                                
                                                <div style="margin-top: 8px; font-size: 10px; color: #94a3b8; text-align: right; border-top: 1px dashed #e2e8f0; padding-top: 4px;">
                                                    Klik untuk detail
                                                </div>
                                            </div>
                                        `;
                                    }

                                    if (popupContent) {
                                        leafletLayer.bindPopup(popupContent, { maxWidth: 300, className: 'custom-popup' });
                                    }
                                }
                            }}
                        />
                    )
                ))}

                {markers.map((marker, idx) => (
                    <Marker key={`marker-${idx}`} position={marker.position}>
                        <Popup>
                            <div style={{ minWidth: '150px' }}>
                                <h3 style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: 'bold' }}>{marker.title}</h3>
                                {marker.description && <p style={{ margin: 0, fontSize: '13px', color: '#475569' }}>{marker.description}</p>}
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {/* Loading Overlay */}
            {geoJsonLayers.some(l => l.visible && !loadedLayers[l.url]) && (
                <div className="absolute top-4 left-12 z-[1000] bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-xl shadow-2xl border border-blue-200 flex items-center space-x-3 transition-all">
                    <div className="w-5 h-5 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm font-extrabold text-blue-900 tracking-tight">Memuat Layer Spasial...</span>
                </div>
            )}
        </div>
    );
};

export default MapComponent;
