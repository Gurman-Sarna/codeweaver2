import express from 'express';
import cors from 'cors';
import { generateUI, validateComponents } from './aiAgent.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// In-memory version history (in production, use a database)
const versionHistory = new Map();

/**
 * POST /api/generate
 * Main endpoint for UI generation
 */
app.post('/api/generate', async (req, res) => {
  try {
    const { userIntent, existingCode, sessionId } = req.body;
    
    if (!userIntent) {
      return res.status(400).json({ error: 'userIntent is required' });
    }
    
    console.log(`\n📨 Received request for session: ${sessionId}`);
    
    // Generate UI using the AI agent
    const result = await generateUI(userIntent, existingCode);
    
    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }
    
    // Validate components
    const validation = validateComponents(result.code);
    
    if (!validation.valid) {
      console.warn('⚠️  Invalid components detected:', validation.invalidComponents);
      // We'll allow it but warn the user
    }
    
    // Store in version history
    if (sessionId) {
      if (!versionHistory.has(sessionId)) {
        versionHistory.set(sessionId, []);
      }
      
      const versions = versionHistory.get(sessionId);
      versions.push({
        version: versions.length + 1,
        userIntent,
        code: result.code,
        explanation: result.explanation,
        plan: result.plan,
        timestamp: result.timestamp,
        validation
      });
      
      // Keep only last 20 versions to prevent memory issues
      if (versions.length > 20) {
        versions.shift();
      }
    }
    
    res.json({
      ...result,
      validation,
      version: versionHistory.get(sessionId)?.length || 1
    });
    
  } catch (error) {
    console.error('❌ Server error:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
});

/**
 * GET /api/history/:sessionId
 * Retrieve version history for a session
 */
app.get('/api/history/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const history = versionHistory.get(sessionId) || [];
  
  res.json({
    sessionId,
    versions: history.map(v => ({
      version: v.version,
      userIntent: v.userIntent,
      timestamp: v.timestamp,
      validation: v.validation
    }))
  });
});

/**
 * GET /api/version/:sessionId/:version
 * Get specific version code
 */
app.get('/api/version/:sessionId/:version', (req, res) => {
  const { sessionId, version } = req.params;
  const history = versionHistory.get(sessionId) || [];
  const versionNum = parseInt(version);
  
  const versionData = history.find(v => v.version === versionNum);
  
  if (!versionData) {
    return res.status(404).json({ error: 'Version not found' });
  }
  
  res.json(versionData);
});

/**
 * POST /api/validate
 * Validate code against component whitelist
 */
app.post('/api/validate', (req, res) => {
  const { code } = req.body;
  
  if (!code) {
    return res.status(400).json({ error: 'code is required' });
  }
  
  const validation = validateComponents(code);
  res.json(validation);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════╗
║   🚀 CodeWeaver Server Running       ║
║   📍 Port: ${PORT}                      ║
║   🤖 AI Agent: Ready                 ║
║   📚 Components: 8 fixed types       ║
╚═══════════════════════════════════════╝
  `);
});

export default app;
