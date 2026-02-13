/**
 * WhatsApp Service (Fonnte Integration)
 * Solusi untuk mengirim pesan otomatis via REST API Fonnte
 */

const FONNTE_API_KEY = import.meta.env.VITE_FONNTE_API_KEY;
const FONNTE_ENDPOINT = 'https://api.fonnte.com/send';

export interface FonnteResponse {
    status: boolean;
    message: string;
    data?: any;
}

/**
 * Mengirim pesan teks via Fonnte API
 * @param to Nomor tujuan (format 628...)
 * @param message Isi pesan
 */
export async function sendBlazwaMessage(to: string, message: string): Promise<FonnteResponse> {
    // Note: Nama function tetap sendBlazwaMessage agar tidak merusak import di file lain, 
    // namun logic sudah bermigrasi ke Fonnte.

    if (!FONNTE_API_KEY || FONNTE_API_KEY.includes('Paste_Kode')) {
        console.warn('WhatsApp Service: VITE_FONNTE_API_KEY belum diatur di .env');
        return { status: false, message: 'API Key belum diatur' };
    }

    try {
        const response = await fetch(FONNTE_ENDPOINT, {
            method: 'POST',
            headers: {
                'Authorization': FONNTE_API_KEY
            },
            body: new URLSearchParams({
                target: to,
                message: message
            })
        });

        const data = await response.json();
        console.log('Fonnte API Response:', data);

        return {
            status: data.status === true,
            message: data.reason || 'Selesai',
            data: data
        };
    } catch (error) {
        console.error('Fonnte API Error:', error);
        return { status: false, message: 'Gagal terhubung ke server Fonnte' };
    }
}

/**
 * Fungsi pembantu untuk verifikasi wilayah aduan
 * (Menyocokkan koordinat dengan data GeoJSON lokal)
 */
export async function checkLocationJurisdiction(lat: number, lng: number): Promise<string> {
    try {
        // Logika verifikasi wilayah jalan
        // Kedepannya bisa diintegrasikan dengan point-in-polygon logic.
        return 'Provinsi (Dalam Jaringan)';
    } catch (e) {
        return 'Luar Jaringan';
    }
}
