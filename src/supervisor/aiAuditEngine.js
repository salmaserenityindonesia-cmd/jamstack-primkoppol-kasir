/**
 * aiAuditEngine.js
 * Modul On-Demand AI Audit menggunakan Gemini API (Google AI Studio).
 */

let geminiApiKey = null;

async function getApiKey() {
  if (geminiApiKey) return geminiApiKey;
  try {
    const res = await fetch('/api/env');
    const env = await res.json();
    geminiApiKey = env.GEMINI_API_KEY;
  } catch (error) {
    console.error('Failed to fetch env:', error);
  }
  return geminiApiKey;
}

export async function analyzeShiftTransactions(transactionsSummary) {
  const apiKey = await getApiKey();
  if (!apiKey) {
    throw new Error('API Key Gemini (VITE_GEMINI_API_KEY) belum dikonfigurasi.');
  }

  // Token-efficient prompt
  const prompt = `Anda adalah Auditor Cerdas PRIMKOPPOL.
Analisis ringkasan transaksi kasir berikut:
${JSON.stringify(transactionsSummary)}

Fokus pada 3 hal:
1. Potensi anomali diskon manual atau harga yang tidak wajar.
2. Pola pembatalan (void) yang mencurigakan.
3. Kepatuhan batas limit piutang anggota.

Berikan response DALAM FORMAT JSON SAJA (tanpa markdown), dengan struktur:
{
  "status": "Aman" | "Waspada",
  "summary": "Ringkasan perilaku kasir (maks 2 kalimat)",
  "recommendations": ["Rekomendasi 1", "Rekomendasi 2"]
}`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-pro-preview:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }]
    })
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Gemini API Error (${response.status}): ${errorData}`);
  }

  const data = await response.json();
  const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!textResponse) {
    throw new Error('Format respons Gemini tidak valid.');
  }

  // Bersihkan teks dari format markdown JSON jika ada
  const cleanJson = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
  
  return JSON.parse(cleanJson);
}
