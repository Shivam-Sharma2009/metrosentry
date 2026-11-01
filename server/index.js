require('dotenv').config();
const express = require('express');
const path = require('path');
const multer = require('multer');
const { GoogleGenAI } = require('@google/genai');

const app = express();
const PORT = process.env.PORT || 3000;
const MODEL = process.env.GEMMA_MODEL || 'gemma-4-26b-a4b-it';
const MAX_BYTES = 8 * 1024 * 1024;

app.disable('x-powered-by');
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(express.json({ limit: '100kb' }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_BYTES, files: 1 },
  fileFilter(_req, file, cb) {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
      const error = new Error('Upload a JPG, PNG, or WEBP image.');
      error.status = 415;
      return cb(error);
    }
    cb(null, true);
  }
});

function validSignature(buffer, mime) {
  if (mime === 'image/jpeg') return buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255;
  if (mime === 'image/png') return buffer.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
  if (mime === 'image/webp') return buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP';
  return false;
}

app.get('/api/health', (_req, res) => res.json({
  status: 'ok',
  service: 'MetroSentry AI',
  aiConfigured: Boolean(process.env.GEMINI_API_KEY),
  model: process.env.GEMINI_API_KEY ? MODEL : null,
  timestamp: new Date().toISOString()
}));

app.post('/api/analyze/frame', upload.single('image'), async (req, res) => {
  if (!process.env.GEMINI_API_KEY) return res.status(503).json({ error: 'Add GEMINI_API_KEY to your local .env file and restart the server.' });
  if (!req.file) return res.status(400).json({ error: 'Image field is required.' });
  if (!validSignature(req.file.buffer, req.file.mimetype)) return res.status(415).json({ error: 'File content does not match its image type.' });

  const station = typeof req.body.station === 'string' ? req.body.station.slice(0, 100) : 'Unspecified station';
  const prompt = `Review this metro-station image for visible safety concerns only: platform-edge obstacles, a person apparently fallen or in an unsafe position, unusually dense crowding, visible smoke/fire, or platform-door obstruction. Do not invent events or infer facts outside the frame. If unclear, state uncertainty and use riskLevel unknown. This is advisory triage, not a certified safety assessment. Return only JSON with fields: riskLevel (low|medium|high|critical|unknown), summary, observations (string array), category, confidence (0-100 subjective estimate), recommendedAction, limitations (string array). Always require human review. Station context: ${station}.`;

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: [
        { inlineData: { mimeType: req.file.mimetype, data: req.file.buffer.toString('base64') } },
        prompt
      ],
      config: { temperature: 0.2, maxOutputTokens: 1200, responseMimeType: 'application/json' }
    });
    const parsed = JSON.parse(response.text || '{}');
    const risks = ['low', 'medium', 'high', 'critical', 'unknown'];
    const list = value => Array.isArray(value) ? value.filter(x => typeof x === 'string').slice(0, 8).map(x => x.slice(0, 400)) : [];
    const analysis = {
      riskLevel: risks.includes(String(parsed.riskLevel).toLowerCase()) ? String(parsed.riskLevel).toLowerCase() : 'unknown',
      summary: typeof parsed.summary === 'string' ? parsed.summary.slice(0, 1000) : 'No reliable summary.',
      observations: list(parsed.observations),
      category: typeof parsed.category === 'string' ? parsed.category.slice(0, 100) : 'General',
      confidence: Number.isFinite(Number(parsed.confidence)) ? Math.max(0, Math.min(100, Number(parsed.confidence))) : null,
      recommendedAction: typeof parsed.recommendedAction === 'string' ? parsed.recommendedAction.slice(0, 700) : 'Request human review.',
      limitations: list(parsed.limitations),
      humanReviewRequired: true
    };
    res.json({ success: true, model: MODEL, station, analysis, generatedAt: new Date().toISOString() });
  } catch (error) {
    console.error('[Gemma analysis]', error.message);
    res.status(502).json({ error: 'Image analysis failed. Check API key, model availability, and server logs.' });
  }
});

app.use((error, _req, res, _next) => {
  if (error instanceof multer.MulterError) return res.status(error.code === 'LIMIT_FILE_SIZE' ? 413 : 400).json({ error: error.code === 'LIMIT_FILE_SIZE' ? 'Image must be 8 MB or smaller.' : 'Invalid image upload.' });
  res.status(error.status || 500).json({ error: error.status ? error.message : 'Unexpected server error.' });
});

app.get('/{*splat}', (_req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'index.html')));
app.listen(PORT, () => console.log(`MetroSentry running at http://localhost:${PORT} | AI configured: ${Boolean(process.env.GEMINI_API_KEY)}`));
