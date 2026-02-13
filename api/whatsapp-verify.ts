
// api/whatsapp-verify.ts
// Serverless function untuk menangani Webhook dari Fonnte
import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import * as turf from '@turf/turf';
import fs from 'fs';
import path from 'path';

// Load provincial roads data
function loadProvincialRoads() {
    try {
        const filePath = path.join(process.cwd(), 'public', 'data', 'jlnprov.json');
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading road data:', error);
        return { type: 'FeatureCollection', features: [] };
    }
}

// Check if point is on provincial road
function isPointOnProvincialRoad(lat: number, lng: number, thresholdInKm: number = 0.1): { result: boolean, roadName?: string } {
    const provincialRoads = loadProvincialRoads();
    const pt = turf.point([lng, lat]);
    let minDistance = Infinity;
    let nearestRoadName = 'Unknown Road';

    for (const feature of provincialRoads.features) {
        if (feature.geometry.type === 'LineString' || feature.geometry.type === 'MultiLineString') {
            const distance = turf.pointToLineDistance(pt, feature);
            if (distance < minDistance) {
                minDistance = distance;
                nearestRoadName = feature.properties?.Nm_Ruas || 'Ruas Jalan Tanpa Nama';
            }
        }
    }

    const isOnRoad = minDistance <= thresholdInKm;

    return {
        result: isOnRoad,
        roadName: isOnRoad ? nearestRoadName : undefined
    };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // IMPORTANT: Always return 200 to Fonnte webhook, otherwise it will retry
    // Log semua request untuk debugging
    console.log('=== WEBHOOK RECEIVED ===');
    console.log('Method:', req.method);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Body:', JSON.stringify(req.body, null, 2));

    if (req.method !== 'POST') {
        console.log('Method not allowed:', req.method);
        return res.status(200).json({ status: 'error', message: 'Method not allowed' });
    }

    try {
        const { sender, message, location, from, phone } = req.body;
        // Fonnte bisa mengirim dengan field berbeda, coba semua kemungkinan
        const targetNumber = sender || from || phone;
        const FONNTE_API_KEY = process.env.VITE_FONNTE_API_KEY || process.env.FONNTE_API_KEY;
        const WEB_URL = "https://mbg-papua-paradise-main.vercel.app/akses-jalan";

        console.log('Parsed Data:');
        console.log('- Target Number:', targetNumber);
        console.log('- Message:', message);
        console.log('- Location:', location);
        console.log('- API Key Present:', !!FONNTE_API_KEY);
        console.log('- API Key Length:', FONNTE_API_KEY?.length || 0);

        if (!targetNumber) {
            console.error('ERROR: No sender number found in webhook payload');
            return res.status(200).json({ status: 'ok', message: 'No sender' });
        }

        if (!FONNTE_API_KEY || FONNTE_API_KEY.includes('Paste_Kode')) {
            console.error('ERROR: Fonnte API Key not configured properly');
            return res.status(200).json({ status: 'error', message: 'API Key not configured' });
        }

        // 1. Logika: Jika warga kirim Lokasi (Fonnte location format: "lat,long")
        if (location && typeof location === 'string' && location.includes(',')) {
            const [latStr, lngStr] = location.split(',').map((s: string) => s.trim());
            const lat = parseFloat(latStr);
            const lng = parseFloat(lngStr);

            console.log('Parsed coordinates:', { lat, lng });

            // Verifikasi Spasial Otomatis
            const verification = isPointOnProvincialRoad(lat, lng);

            console.log('Verification result:', verification);

            let balasan = '';

            if (verification.result) {
                // Berada di Jalan Provinsi
                balasan = `*VERIFIKASI BERHASIL* ✅
    
Halo Pace/Mace, koordinat tersebut teridentifikasi berada di:
📍 *Ruas:* ${verification.roadName} (Jalan Provinsi)

*Status:* LAPORAN DITERIMA & DITERUSKAN. Tim teknis akan segera menindaklanjuti laporan Anda di lapangan. 

Cek posisi Anda di peta:
🔗 ${WEB_URL}?lat=${lat}&lng=${lng}`;
            } else {
                // Tidak berada di Jalan Provinsi
                balasan = `*VERIFIKASI JARINGAN* ⚖️
    
Halo Pace/Mace, koordinat yang Anda kirim (${lat}, ${lng}) berada di luar wewenang ruas Jalan Provinsi Papua Barat Daya.

*Status:* LAPORAN DI-HOLD (Ditunda). Laporan ini akan kami teruskan ke instansi terkait (Kabupaten/Kota atau Nasional) sesuai kewenangannya.

Anda tetap bisa memantau peta kami di sini:
🔗 ${WEB_URL}?lat=${lat}&lng=${lng}`;
            }

            console.log('Sending reply to:', targetNumber);

            try {
                const response = await axios.post('https://api.fonnte.com/send',
                    new URLSearchParams({
                        target: targetNumber,
                        message: balasan
                    }).toString(),
                    {
                        headers: {
                            'Authorization': FONNTE_API_KEY,
                            'Content-Type': 'application/x-www-form-urlencoded'
                        }
                    }
                );

                console.log('Fonnte API Response:', response.data);
                console.log('Reply sent successfully');
            } catch (sendError: any) {
                console.error('Error sending message via Fonnte:', sendError.response?.data || sendError.message);
            }

            return res.status(200).json({ status: 'ok', message: 'Location reply sent', verification });
        }

        // 2. Logika: Auto-reply standar untuk pesan teks (Jika tidak menyertakan lokasi)
        const msgLower = (message || "").toLowerCase();
        if (msgLower.includes('pengaduan') || msgLower.includes('jalan rusak') || msgLower.includes('halo') || msgLower.includes('lapor') || msgLower.length > 0) {
            const balasanStandar = `*LAPORAN DITERIMA (PUPR PBD)* 📥
        
Halo Pace/Mace, terima kasih sudah menghubungi Dinas PUPR Papua Barat Daya.

Agar laporan dapat diverifikasi otomatis oleh sistem peta kami, mohon kirimkan *Share Location* (Lokasi Terkini) Anda dari WhatsApp.

Klik tombol lampiran (klip) -> Pilih 'Lokasi' -> 'Kirim lokasi Anda saat ini'.

Terima kasih atas partisipasi Anda! ✊`;

            console.log('Sending text reply to:', targetNumber);

            try {
                const response = await axios.post('https://api.fonnte.com/send',
                    new URLSearchParams({
                        target: targetNumber,
                        message: balasanStandar
                    }).toString(),
                    {
                        headers: {
                            'Authorization': FONNTE_API_KEY,
                            'Content-Type': 'application/x-www-form-urlencoded'
                        }
                    }
                );

                console.log('Fonnte API Response:', response.data);
                console.log('Text reply sent successfully');
            } catch (sendError: any) {
                console.error('Error sending message via Fonnte:', sendError.response?.data || sendError.message);
            }

            return res.status(200).json({ status: 'ok', message: 'Text reply sent' });
        }

        return res.status(200).json({ status: 'ok', message: 'Webhook received' });
    } catch (error: any) {
        console.error("Gagal proses webhook Fonnte:", error.message);
        console.error("Error stack:", error.stack);
        // Still return 200 to prevent Fonnte from retrying
        return res.status(200).json({ status: 'error', reason: 'Internal failure', error: error.message });
    }
}
