
import React, { useState, useRef, useEffect } from 'react';
import { chatWithGemini, analyzeRoadImage } from '../services/geminiService';
import { checkJurisdiction } from '../services/verificationService';
import { sendBlazwaMessage } from '../services/whatsappService';

interface Message {
  role: 'user' | 'ai' | 'admin';
  text: string;
  image?: string;
  isImageAnalysis?: boolean;
  type?: 'receipt';
  receiptData?: {
    id: string;
    roadName: string;
    jurisdiction: string;
    coordinates: string;
    timestamp: string;
  };
}

const GeminiChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: 'Halo, Pace Mace! Selamat datang di layanan Asisten Anti-Gravity Dinas PUPR Papua Barat Daya. Saya siap membantu Kaka/Abang untuk melaporkan jalan rusak agar segera ditangani. \n\nBisa dibantu, di mana lokasi jalan yang rusak tersebut? Mohon cantumkan nama jalan atau bagikan koordinat GPS jika ada.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [complaintData, setComplaintData] = useState({
    lokasi_jalan: '',
    latitude: '',
    longitude: '',
    deskripsi: '',
    image_url: '',
    jurisdiction: ''
  });

  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (overrideText?: string) => {
    const userMsg = overrideText || input.trim();
    if (!userMsg && !overrideText) return;

    if (isLoading) return;

    const newMessage: Message = { role: 'user', text: userMsg };
    const updatedMessages = [...messages, newMessage];

    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    // Coordinate Parsing Logic
    const coordRegex = /(-?\d+\.\d+),\s*(-?\d+\.\d+)/;
    const match = userMsg.match(coordRegex);
    if (match) {
      const lat = parseFloat(match[1]);
      const lng = parseFloat(match[2]);

      const verification = await checkJurisdiction(lat, lng);
      setComplaintData(prev => ({
        ...prev,
        latitude: lat.toString(),
        longitude: lng.toString(),
        jurisdiction: verification.jurisdiction,
        lokasi_jalan: verification.roadName || prev.lokasi_jalan
      }));

      let verificationMsg = '';
      if (verification.jurisdiction === 'Provinsi') {
        verificationMsg = `📍 Koordinat terdeteksi di **${verification.roadName}**. Ini adalah wewenang **Provinsi**, laporan Kaka akan diprioritaskan oleh Dinas PUPR PBD!`;
      } else if (verification.jurisdiction === 'Nasional') {
        verificationMsg = `📍 Koordinat terdeteksi di **${verification.roadName}**. Ini adalah **Jalan Nasional**, kami akan membantu meneruskan ke Balai Pelaksana Jalan Nasional.`;
      } else {
        verificationMsg = `📍 Koordinat terdeteksi. Lokasi ini tampaknya berada di luar jaringan jalan utama provinsi/nasional. Namun kami tetap akan mencatat laporan Kaka.`;
      }

      setMessages(prev => [...prev, { role: 'ai', text: verificationMsg + "\n\nSekarang, mohon unggah foto bukti kerusakan jalannya menggunakan tombol kamera di bawah." }]);
      setIsLoading(false);
      return;
    }

    // AI Response logic
    const aiResponse = await chatWithGemini(userMsg, updatedMessages);

    // Heuristic: Capture description if previous AI msg asked for it
    const lastAiMsg = messages.filter(m => m.role === 'ai').pop();
    if (lastAiMsg && (lastAiMsg.text.toLowerCase().includes('deskripsi') || lastAiMsg.text.toLowerCase().includes('jelaskan'))) {
      setComplaintData(prev => ({ ...prev, deskripsi: userMsg }));
    }

    // Capture location if it's the first response (after greeting)
    if (messages.length === 1) {
      setComplaintData(prev => ({ ...prev, lokasi_jalan: userMsg }));
    }

    if (!aiResponse || aiResponse.includes('gangguan pada sistem')) {
      setMessages(prev => [...prev, { role: 'ai', text: 'Maaf Bapa/Mama, Asisten sedang ada gangguan koneksi. \n\nMohon pastikan Kakak sudah mengatur API Key di file .env (VITE_GEMINI_API_KEY) atau coba lagi sebentar ya.' }]);
    } else {
      setMessages(prev => [...prev, { role: 'ai', text: aiResponse }]);
    }
    setIsLoading(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Image = event.target?.result as string;

      setMessages(prev => [...prev, {
        role: 'user',
        text: 'Mengirimkan foto bukti fisik...',
        image: base64Image
      }]);

      setIsLoading(true);

      // Perform AI Analysis
      const analysisResult = await analyzeRoadImage(base64Image);

      if (analysisResult.includes('YA')) {
        setComplaintData(prev => ({ ...prev, image_url: base64Image }));
        setMessages(prev => [...prev, {
          role: 'ai',
          text: 'Terima kasih! Foto telah kami verifikasi sebagai laporan valid. Sekarang, mohon jelaskan sedikit mengenai tingkat kerusakannya (misal: jalan putus, lubang dalam, dll).'
        }]);
      } else {
        setMessages(prev => [...prev, {
          role: 'ai',
          text: `Maaf, foto yang dikirimkan tidak terdeteksi sebagai jalan rusak. ${analysisResult.replace('TIDAK', '').trim()} \n\nMohon kirimkan foto asli kondisi jalan yang rusak.`
        }]);
      }

      setIsLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const syncToGoogleSheets = async (data: any) => {
    console.log("Syncing to Google Sheets:", data);
    // Deployment URL for Google Apps Script (Placeholder)
    // To implement this, create a GAS with doPost(e) and deploy as Web App
    const scriptUrl = 'https://script.google.com/macros/s/AKfycby-YOUR-SCRIPT-ID/exec';

    try {
      // For demonstration, we'll just log the final object
      // const response = await fetch(scriptUrl, { method: 'POST', body: JSON.stringify(data) });
      return true;
    } catch (e) {
      console.error("GAS Sync Error:", e);
      return false;
    }
  };

  const handleSubmitFinal = async () => {
    const isJalanPutus = messages.some(m => m.text.toLowerCase().includes('putus'));
    const finalDescription = isJalanPutus ? `[PRIORITAS TINGGI] ${complaintData.deskripsi || 'Sesuai Foto'}` : (complaintData.deskripsi || 'Sesuai Foto');

    const finalReport = {
      ...complaintData,
      deskripsi: finalDescription,
      timestamp: new Date().toISOString(),
      source: 'Asisten Anti-Gravity'
    };

    // Construct WhatsApp Message
    const phoneNumber = '6282293234424';
    const statusJalan = finalReport.jurisdiction === 'Provinsi' ? '🔴 JALAN PROVINSI' : (finalReport.jurisdiction === 'Nasional' ? '🔵 JALAN NASIONAL' : '⚪ LUAR JARINGAN');

    const message = `Halo Dinas PUPR Papua Barat Daya, saya Pace/Mace ingin melaporkan jalan rusak melalui Asisten Anti-Gravity.
    
*STATUS:* ${statusJalan}
📌 *Lokasi:* ${finalReport.lokasi_jalan}
📍 *Koordinat:* ${finalReport.latitude}, ${finalReport.longitude}
📝 *Deskripsi:* ${finalReport.deskripsi}
📦 *Data ID:* PBD-${Math.floor(Math.random() * 10000)}`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    const reportId = `PBD-${Math.floor(Math.random() * 10000)}`;
    const finalReportFinal = {
      ...finalReport,
      id: reportId,
      status: 'Baru'
    };

    // Save to LocalStorage for Admin Dashboard
    const existingReports = JSON.parse(localStorage.getItem('pbd_road_reports') || '[]');
    localStorage.setItem('pbd_road_reports', JSON.stringify([...existingReports, finalReportFinal]));

    setIsLoading(true);
    await syncToGoogleSheets(finalReportFinal);
    setIsLoading(false);

    // Add Digital Receipt to Chat
    setMessages(prev => [...prev, {
      role: 'ai',
      text: 'Berikut adalah Resi Digital laporan Bapa/Mama:',
      type: 'receipt',
      receiptData: {
        id: reportId,
        roadName: finalReport.lokasi_jalan || 'Tidak Terdeteksi',
        jurisdiction: finalReport.jurisdiction || 'Luar Jaringan',
        coordinates: `${finalReport.latitude}, ${finalReport.longitude}`,
        timestamp: new Date().toLocaleString('id-ID')
      }
    }]);

    // Simulated Admin Auto-Reply based on Jurisdiction
    setTimeout(() => {
      let adminText = '';
      if (finalReport.jurisdiction === 'Provinsi') {
        adminText = '📢 **BALASAN OTOMATIS ADMIN PUPR PBD**:\n\nLaporan diterima. Status jalan adalah **Kewenangan Provinsi**. Laporan Kaka akan segera kami proses untuk penanganan lebih lanjut. Terima kasih!';
      } else {
        adminText = '📢 **BALASAN OTOMATIS ADMIN PUPR PBD**:\n\nLaporan diterima. Status jalan **bukan kewenangan Provinsi**. Kami akan menampung laporan ini untuk tetap diteruskan ke instansi yang berwenang (Balai Jalan/Kabupaten). Terima kasih!';
      }

      setMessages(prev => [...prev, {
        role: 'admin',
        text: adminText
      }]);
    }, 1500);

    // Send automated WhatsApp notification (BlazWA Integration)
    const waResponse = await sendBlazwaMessage(phoneNumber, message);
    if (waResponse.status) {
      console.log('BlazWA: Notifikasi otomatis berhasil dikirim');
    }

    window.open(whatsappUrl, '_blank');

    setMessages(prev => [...prev, {
      role: 'ai',
      text: 'Laporan sudah diteruskan ke WhatsApp Dinas PUPR. Ada lagi yang PACE MACE mau laporkan?'
    }]);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-blue-900 text-white rounded-full shadow-2xl flex items-center justify-center z-50 hover:scale-110 transition-transform"
      >
        <i className={`fas ${isOpen ? 'fa-times' : 'fa-comment-alt'} text-2xl`}></i>
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-yellow-500"></span>
          </span>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 md:w-[450px] h-[600px] bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden border border-gray-100 animate-slide-up">
          <div className="bg-blue-900 p-4 text-white flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-blue-900">
                <i className="fas fa-robot text-xl"></i>
              </div>
              <div>
                <h4 className="font-bold">Asisten Anti-Gravity</h4>
                <p className="text-xs text-blue-200">Dinas PUPR PBD | Online</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-300">
              <i className="fas fa-times"></i>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.role === 'user'
                  ? 'bg-blue-900 text-white rounded-tr-none'
                  : msg.role === 'admin'
                    ? 'bg-yellow-100 text-blue-900 border-2 border-yellow-400 rounded-tl-none font-medium'
                    : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-tl-none'
                  }`}>
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {msg.type === 'receipt' && msg.receiptData && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900">
                      <div className="flex items-center justify-between mb-2 border-b border-blue-100 pb-1">
                        <span className="font-bold text-xs">RESI DIGITAL PUPR</span>
                        <span className="text-[10px] opacity-70">#{msg.receiptData.id}</span>
                      </div>
                      <div className="space-y-1 text-xs">
                        <p><strong>📍 Lokasi:</strong> {msg.receiptData.roadName}</p>
                        <p><strong>🏢 Status:</strong> {msg.receiptData.jurisdiction}</p>
                        <p><strong>🧭 GPS:</strong> {msg.receiptData.coordinates}</p>
                        <p><strong>🕒 Waktu:</strong> {msg.receiptData.timestamp}</p>
                      </div>
                      <div className="mt-2 text-center text-[10px] font-bold text-blue-600">
                        STATUS: TERVERIFIKASI SISTEM
                      </div>
                    </div>
                  )}

                  {msg.image && (
                    <img src={msg.image} alt="Upload bukti" className="mt-2 rounded-lg max-h-48 w-full object-cover" />
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-gray-100">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-900 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-900 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-blue-900 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-4 bg-white border-t border-gray-100">
            {messages.length > 5 && !messages[messages.length - 1].text.includes('berhasil') && (
              <button
                onClick={handleSubmitFinal}
                className="w-full mb-3 bg-yellow-500 text-blue-900 font-bold py-2 rounded-lg shadow-md hover:bg-yellow-400 transition-colors"
              >
                <i className="fas fa-paper-plane mr-2"></i> Kirim Laporan ke Database
              </button>
            )}

            <div className="flex space-x-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-gray-100 text-gray-600 p-2 rounded-lg hover:bg-gray-200 transition-colors"
                title="Unggah Foto"
              >
                <i className="fas fa-camera"></i>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Tulis pesan..."
                className="flex-1 bg-gray-100 border-none rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-900 outline-none"
              />
              <button
                onClick={() => handleSend()}
                disabled={isLoading}
                className="bg-blue-900 text-white p-2 rounded-lg hover:bg-blue-800 disabled:opacity-50 transition-colors"
              >
                <i className="fas fa-paper-plane"></i>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GeminiChat;
