require('dotenv').config();
const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('node:fs/promises');
const os = require('node:os');

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

  let tempDir;
  try {
    const { GoogleGenAI, createUserContent, createPartFromUri } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // Use Google's documented Files API image flow for Gemma 4.
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'metrosentry-'));
    const extension = req.file.mimetype === 'image/png' ? '.png' : req.file.mimetype === 'image/webp' ? '.webp' : '.jpg';
    const imagePath = path.join(tempDir, `evidence${extension}`);
    await fs.writeFile(imagePath, req.file.buffer);
    const uploadedImage = await ai.files.upload({
      file: imagePath,
      config: { mimeType: req.file.mimetype }
    });

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: createUserContent([
        createPartFromUri(uploadedImage.uri, uploadedImage.mimeType),
        prompt
      ]),
      // Avoid responseMimeType: JSON mode can be rejected by some hosted model routes.
      config: { temperature: 0.2, maxOutputTokens: 1200 }
    });

    const rawText = String(response.text || '').trim();
    const jsonText = rawText.replace(/^\`\`\`(?:json)?\s*/i, '').replace(/\s*\`\`\`$/, '');
    const jsonStart = jsonText.indexOf('{');
    const jsonEnd = jsonText.lastIndexOf('}');
    if (jsonStart < 0 || jsonEnd <= jsonStart) throw new Error('Gemma returned no JSON object. Raw response: ' + rawText.slice(0, 500));
    const parsed = JSON.parse(jsonText.slice(jsonStart, jsonEnd + 1));
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
    // Log useful diagnostics locally; never log the API key or request image.
    const diagnostic = {
      name: error?.name || 'Error',
      message: String(error?.message || 'Unknown Google GenAI error').slice(0, 1200),
      status: error?.status || error?.statusCode || null,
      code: error?.code || null
    };
    console.error('[Gemma analysis failed]', diagnostic);
    if (error?.stack) console.error(error.stack);

    // Return the provider's error message so the UI/Network response can help
    // identify invalid keys, unavailable models, quota limits, and bad requests.
    const details = diagnostic.message.replace(/\s+/g, ' ').trim();
    res.status(502).json({
      error: 'Gemma image analysis failed.',
      details,
      providerStatus: diagnostic.status,
      providerCode: diagnostic.code
    });
  } finally {
    if (tempDir) await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
  }
});

app.use((error, _req, res, _next) => {
  if (error instanceof multer.MulterError) return res.status(error.code === 'LIMIT_FILE_SIZE' ? 413 : 400).json({ error: error.code === 'LIMIT_FILE_SIZE' ? 'Image must be 8 MB or smaller.' : 'Invalid image upload.' });
  res.status(error.status || 500).json({ error: error.status ? error.message : 'Unexpected server error.' });
});

app.get('/{*splat}', (_req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'index.html')));
app.listen(PORT, () => console.log(`MetroSentry running at http://localhost:${PORT} | AI configured: ${Boolean(process.env.GEMINI_API_KEY)}`));
