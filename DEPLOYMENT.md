# 🚀 Deployment Guide for CodeWeaver

## Prerequisites Checklist
- [ ] Node.js 18+ installed
- [ ] npm or yarn package manager
- [ ] Git installed
- [ ] GitHub account
- [ ] Vercel/Netlify account (for frontend)
- [ ] Render/Railway account (for backend)

---

## 📦 Local Setup & Testing

### Step 1: Clone and Setup
```bash
# Clone your repository
git clone https://github.com/Gurman-Sarna/CodeWeaver2.git
cd CodeWeaver2

# Install server dependencies
cd server
npm install

# Install client dependencies  
cd ../client
npm install
```

### Step 2: Test Locally

**Terminal 1 - Backend:**
```bash
cd server
npm start

# You should see:
# ╔═══════════════════════════════════════╗
# ║   🚀 CodeWeaver Server Running       ║
# ║   📍 Port: 3001                      ║
# ╚═══════════════════════════════════════╝
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev

# You should see:
# VITE v5.x.x  ready in xxx ms
# ➜  Local:   http://localhost:3000/
```

### Step 3: Test the Application

1. Open http://localhost:3000
2. You should see the welcome screen
3. Try: "Create a login form with email and password"
4. Check that:
   - AI responds with explanation
   - Code appears in middle panel
   - Live preview shows the form

**Common Issues:**

| Issue | Solution |
|-------|----------|
| Port 3001 in use | Change PORT in server/index.js |
| Port 3000 in use | Change port in client/vite.config.js |
| CORS errors | Check cors() middleware is enabled |
| API not responding | Verify Gemini API key is correct |

---

## 🌐 Deploying to Production

### Option 1: Vercel (Recommended for Frontend)

**Deploy Frontend:**
```bash
cd client

# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts:
# - Link to existing project: Yes
# - Settings: Default (Vite detected)
# - Deploy: Yes
```

**Configure Environment:**
- In Vercel dashboard → Settings → Environment Variables
- Add: `VITE_API_URL=https://your-backend-url.com`

**Update Code:**
```javascript
// client/src/App.jsx
// Replace '/api' with process.env.VITE_API_URL
const API_URL = import.meta.env.VITE_API_URL || '/api';
```

### Option 2: Netlify (Alternative Frontend)

```bash
cd client

# Build
npm run build

# Deploy via Netlify CLI
npm i -g netlify-cli
netlify deploy --prod --dir=dist
```

### Deploy Backend

**Option A: Render.com**

1. Go to https://render.com
2. New → Web Service
3. Connect your GitHub repo
4. Settings:
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment Variables:**
     ```
     GEMINI_API_KEY=your_key_here
     PORT=3001
     ```

**Option B: Railway.app**

1. Go to https://railway.app
2. New Project → Deploy from GitHub
3. Select your repo
4. Settings:
   - **Root Directory:** `/server`
   - **Start Command:** `npm start`
5. Add environment variables in settings

**Option C: Fly.io**

```bash
cd server

# Create Dockerfile
cat > Dockerfile << 'EOF'
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
EOF

# Deploy
fly launch
fly deploy
```

---

## 🔐 Environment Variables

### Backend (.env)
```env
# Server Configuration
PORT=3001
NODE_ENV=production

# AI Configuration
GEMINI_API_KEY=AIzaSyCzRSX8FGEuP2t1ERA8plbrA_LnIMNNjSQ

# Security (optional)
ALLOWED_ORIGINS=https://your-frontend.vercel.app
```

### Frontend (.env.production)
```env
VITE_API_URL=https://your-backend.render.com
```

---

## 🧪 Testing Deployment

### Checklist

- [ ] Frontend loads at deployed URL
- [ ] Home page displays correctly
- [ ] Can send a message in chat
- [ ] Backend API responds (check Network tab)
- [ ] Code generates successfully
- [ ] Live preview renders
- [ ] Can edit code manually
- [ ] Version history works
- [ ] Rollback functionality works

### Test Commands

```bash
# Test backend health
curl https://your-backend-url.com/health

# Expected response:
# {"status":"ok","timestamp":"2024-..."}

# Test API endpoint
curl -X POST https://your-backend-url.com/api/generate \
  -H "Content-Type: application/json" \
  -d '{"userIntent":"Create a button","sessionId":"test"}'
```

---

## 📊 Monitoring & Logs

### Backend Logs
```bash
# Render: View in dashboard → Logs tab
# Railway: railway logs
# Fly.io: fly logs
```

### Frontend Logs
```bash
# Vercel: View in dashboard → Deployments → Logs
# Netlify: Functions tab → Function logs
```

---

## 🐛 Troubleshooting

### Issue: "Failed to generate UI"

**Possible Causes:**
1. Gemini API key invalid/expired
2. Rate limiting
3. Network timeout

**Solutions:**
```bash
# Check API key
curl -X POST 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"contents":[{"parts":[{"text":"test"}]}]}'

# If error, get new key from: https://makersuite.google.com/app/apikey
```

### Issue: CORS Errors

**Solution:**
```javascript
// server/index.js
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-frontend.vercel.app'
  ],
  credentials: true
}));
```

### Issue: Code Not Rendering

**Possible Causes:**
1. Component library not imported correctly
2. Syntax error in generated code
3. Error boundary caught it

**Debug:**
```javascript
// Check browser console for errors
// Look for red messages in console

// Check validation response
// Should show: "valid": true
```

---

## 🚀 Performance Optimization

### Backend
```javascript
// Add caching for repeated requests
import NodeCache from 'node-cache';
const cache = new NodeCache({ stdTTL: 600 });

app.post('/api/generate', async (req, res) => {
  const cacheKey = `${req.body.userIntent}_${req.body.existingCode}`;
  
  if (cache.has(cacheKey)) {
    return res.json(cache.get(cacheKey));
  }
  
  const result = await generateUI(...);
  cache.set(cacheKey, result);
  res.json(result);
});
```

### Frontend
```javascript
// Add React.memo for expensive components
export default React.memo(LivePreview);

// Use code splitting
const LivePreview = lazy(() => import('./components/LivePreview'));
```

---

## 📈 Scaling Considerations

### Current Limitations (MVP)
- In-memory session storage (lost on restart)
- Single server instance
- No rate limiting per user

### Production Improvements
1. **Database:** Add PostgreSQL/MongoDB for persistence
2. **Redis:** For session caching
3. **Rate Limiting:** Prevent abuse
4. **Queue System:** For heavy AI operations
5. **CDN:** For static assets

---

## 🎥 Recording Demo Video

### What to Show (5-7 minutes)

1. **Intro (30s)**
   - Show home page
   - Explain what CodeWeaver does

2. **Basic Generation (1min)**
   - Type: "Create a login form"
   - Show all three panels updating
   - Point out the explanation

3. **Iteration (1.5min)**
   - Modify: "Add a forgot password link"
   - Show code changes (not full rewrite)
   - Highlight diff in code

4. **Manual Edit (1min)**
   - Edit code in middle panel
   - Show live preview updates

5. **Version History (1min)**
   - Generate multiple versions
   - Show rollback feature
   - Demonstrate dropdown selector

6. **Component Library (30s)**
   - Create table example
   - Show component validation works

7. **Edge Cases (1min)**
   - Try invalid component request
   - Show error handling
   - Demo the funny empty state

### Recording Tools
- **Free:** OBS Studio, ShareX
- **Paid:** Loom, ScreenFlow, Camtasia
- **Tips:**
  - Use 1920x1080 resolution
  - Record browser + voice
  - Keep cursor movements smooth
  - Zoom in on important details

---

## 📧 Submission Checklist

Before sending to jayant@get-ryze.ai:

- [ ] GitHub repo is public or access granted
- [ ] README.md is comprehensive
- [ ] Both frontend and backend are deployed
- [ ] Demo video is uploaded (Loom/YouTube/Drive)
- [ ] Test deployed version end-to-end
- [ ] Email subject: "AI UI Generator Assignment – [Your Name]"
- [ ] Email includes all 3 links:
  - [ ] GitHub: https://github.com/Gurman-Sarna/CodeWeaver2
  - [ ] Live App: https://...
  - [ ] Demo Video: https://...

---

## 🎓 What You Learned

### Technical Skills
1. **AI Agent Orchestration**
   - Multi-step reasoning
   - Prompt engineering for each step
   - Combining multiple AI calls

2. **Full-Stack Development**
   - Express REST API
   - React with Vite
   - Component architecture

3. **Code Generation Safety**
   - Deterministic systems
   - Component whitelisting
   - Safe code execution

4. **DevOps Basics**
   - Git workflow
   - Environment variables
   - Cloud deployment

### Architecture Patterns
- Separation of concerns
- Three-tier architecture
- API-first design
- Error boundaries
- Version control

---

## 🆘 Need Help?

If something doesn't work:

1. **Check logs:** Backend console, browser console
2. **Read error messages:** They usually tell you what's wrong
3. **Google the error:** You're probably not the first
4. **GitHub Issues:** Check if others had the same problem
5. **Documentation:** Re-read this guide

**Common Commands Reference:**
```bash
# Check node version
node --version

# Check npm version  
npm --version

# Clear npm cache
npm cache clean --force

# Restart server
Ctrl+C then npm start

# Check what's using port
lsof -i :3001  # Mac/Linux
netstat -ano | findstr :3001  # Windows
```

---

**Good luck with your deployment! 🚀**

Remember: The goal isn't perfection, it's learning and demonstrating understanding!
