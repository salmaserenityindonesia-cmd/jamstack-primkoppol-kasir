import 'dotenv/config';

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.log('No API key found in .env');
    return;
  }
  
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
  const data = await res.json();
  if (data.models) {
    console.log('Available models:');
    data.models.forEach(m => console.log(m.name));
  } else {
    console.log('Error fetching models:', data);
  }
}

listModels();
