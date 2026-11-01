/* ═══════════════════════════════════════════
   MetroSentry AI — Express Server (minimal for Phase 1)
   ═══════════════════════════════════════════ */
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname, '..', 'public')));

// JSON body parser (needed for later phases)
app.use(express.json({ limit: '10mb' }));

// Health endpoint (stub for Phase 1)
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'MetroSentry AI',
    model: 'Gemma 4 (not yet connected)',
    timestamp: new Date().toISOString()
  });
});

// Analyze endpoint (stub — returns error until Phase 3)
app.post('/api/analyze', (_req, res) => {
  res.status(503).json({
    error: 'AI analysis is not yet connected. Complete Phase 3 to enable Gemma 4 integration.'
  });
});

// SPA fallback
app.get('/{*splat}', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n  ╔══════════════════════════════════════╗`);
  console.log(`  ║   MetroSentry AI — Server Running    ║`);
  console.log(`  ║   http://localhost:${PORT}              ║`);
  console.log(`  ╚══════════════════════════════════════╝\n`);
});
