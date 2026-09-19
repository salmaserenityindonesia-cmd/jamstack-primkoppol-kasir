import { analyzeShiftTransactions } from '../src/supervisor/aiAuditEngine.js';

// Mock fetch globally
global.fetch = async (url, options) => {
  if (url === '/api/env') {
    return {
      json: async () => ({ GEMINI_API_KEY: 'test-key-123' })
    };
  }
  
  if (url.includes('generativelanguage')) {
    const payload = JSON.parse(options.body);
    const promptText = payload.contents[0].parts[0].text;
    console.log('--- Prompt Dikirim ---');
    console.log(promptText);
    console.log('----------------------');

    return {
      ok: true,
      json: async () => ({
        candidates: [{
          content: {
            parts: [{
              text: `\`\`\`json
{
  "status": "Aman",
  "summary": "Kasir beroperasi dengan wajar. Tidak ada anomali terdeteksi.",
  "recommendations": ["Lanjutkan pengawasan rutin."]
}
\`\`\``
            }]
          }
        }]
      })
    };
  }
};

async function runTest() {
  const dummyTransactions = {
    totalCash: 1500000,
    totalCredit: 500000,
    voidCount: 2,
    overLimitAttempts: 0
  };

  console.log('Menjalankan uji isolasi AI Audit...');
  try {
    const result = await analyzeShiftTransactions(dummyTransactions);
    console.log('Hasil Parse JSON:', result);
    if (result.status && result.summary && result.recommendations) {
      console.log('✅ Uji parser respons JSON berhasil.');
    } else {
      console.log('❌ Format hasil tidak sesuai ekspektasi.');
    }
  } catch (err) {
    console.error('❌ Gagal:', err);
  }
}

runTest();
