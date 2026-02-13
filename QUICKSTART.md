# ⚡ Quick Start Guide

## 🎯 Get Running in 5 Minutes

### Step 1: Install Dependencies (2 minutes)
```bash
# Navigate to your project
cd CodeWeaver2

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### Step 2: Start Both Servers (1 minute)

**Terminal 1 - Backend:**
```bash
cd server
npm start
```
Wait for: `🚀 CodeWeaver Server Running`

**Terminal 2 - Frontend:**
```bash
cd client  
npm run dev
```
Wait for: `Local: http://localhost:3000/`

### Step 3: Open & Test (2 minutes)

1. Open http://localhost:3000 in your browser
2. Type in chat: `"Create a dashboard with 3 stat cards"`
3. Wait 10-15 seconds for AI to generate
4. See the result in live preview!

---

## 🎨 Example Prompts to Try

### Beginner
```
"Create a login form with email and password"
"Make a simple contact form"
"Build a profile card with name and bio"
```

### Intermediate
```
"Create a dashboard with navbar and 3 stat cards"
"Build a user table with name, email, and role columns"
"Make a settings page with a sidebar and input fields"
```

### Advanced
```
"Create a todo app with input, button, and table"
"Build a dashboard with charts showing sales data"
"Make a modal that opens when I click a button"
```

### Iteration
```
First: "Create a login form"
Then: "Add a forgot password link"
Then: "Make the button green"
Then: "Add a welcome message above the form"
```

---

## 🐛 Quick Fixes

### Backend won't start?
```bash
# Check if port 3001 is in use
lsof -i :3001  # Mac/Linux
netstat -ano | findstr :3001  # Windows

# Kill the process or change port in server/index.js
```

### Frontend won't start?
```bash
# Check if port 3000 is in use
lsof -i :3000  # Mac/Linux

# Or change port in client/vite.config.js to 3002
```

### "Failed to generate UI"?
- Check server console for errors
- Verify Gemini API key in server/aiAgent.js
- Check internet connection
- Try a simpler prompt

### Nothing shows in preview?
- Check browser console (F12)
- Look for red error messages
- Try refreshing the page
- Check that code panel has generated code

---

## 🎓 Understanding the Code

### Project Structure
```
CodeWeaver2/
├── server/              # Backend (Node.js + Express)
│   ├── aiAgent.js      # 🧠 AI Agent with 3 steps
│   ├── index.js        # 🌐 Express API server
│   └── package.json
│
├── client/              # Frontend (React + Vite)
│   ├── src/
│   │   ├── App.jsx              # 📱 Main UI with 3 panels
│   │   ├── components/
│   │   │   ├── ComponentLibrary.jsx  # 🎨 Fixed 8 components
│   │   │   └── LivePreview.jsx       # 👁️ Safe code renderer
│   │   └── ...
│   └── package.json
│
└── README.md           # 📖 Full documentation
```

### How It Works (Simple Version)

1. **You type:** "Create a login form"

2. **Planner Agent thinks:**
   - "User wants a form"
   - "Need: Card, 2 Inputs, 1 Button"
   - Creates plan as JSON

3. **Generator Agent codes:**
   - Takes the plan
   - Writes React code using only allowed components
   - No custom CSS, just composition

4. **Explainer Agent explains:**
   - "I've created a login form with..."
   - Tells you why it made those choices

5. **You see:**
   - Explanation in left panel
   - Code in middle panel
   - Live UI in right panel

### The Fixed Component Library

**Why fixed components?**
- ✅ Always looks professional
- ✅ No security risks
- ✅ Predictable output
- ✅ Easy to maintain

**Available components:**
- Button (4 variants)
- Card (with header/footer)
- Input (form fields)
- Table (data display)
- Modal (popups)
- Sidebar (navigation)
- Navbar (top bar)
- Chart (bar/line/pie)

---

## 💡 Pro Tips

### Making Better Prompts
```
❌ Bad: "Make something cool"
✅ Good: "Create a user dashboard with stats"

❌ Bad: "Add stuff"
✅ Good: "Add a search bar above the table"

❌ Bad: "Make it better"
✅ Good: "Change the primary button to success variant"
```

### Iterating Effectively
- Start simple, add complexity gradually
- Be specific about changes
- Use version history to try variations
- Edit code manually for quick tweaks

### Debugging
1. Check all 3 panels
2. Look at browser console (F12)
3. Read AI's explanation
4. Check validation badge (✓ or ⚠️)

---

## 🚀 Next Steps

### Local Development
1. ✅ Get it running locally
2. ✅ Try all example prompts
3. ✅ Understand the code flow
4. ✅ Make manual code edits

### Deployment
1. 📖 Read DEPLOYMENT.md
2. 🌐 Deploy frontend to Vercel
3. 🖥️ Deploy backend to Render
4. 🎥 Record demo video
5. 📧 Submit to Ryze AI

### Learning More
- Read full README.md for architecture
- Study server/aiAgent.js to understand AI orchestration
- Explore client/src/App.jsx for React patterns
- Check ComponentLibrary.jsx for component design

---

## 📞 Quick Reference

| What | Where | Command |
|------|-------|---------|
| Start Backend | `/server` | `npm start` |
| Start Frontend | `/client` | `npm run dev` |
| Install Deps | `/server` or `/client` | `npm install` |
| View Backend | Browser | http://localhost:3001/health |
| View Frontend | Browser | http://localhost:3000 |
| Check Logs | Terminal | Look at server console output |
| Stop Servers | Terminal | Press Ctrl+C |

---

## 🎉 You're Ready!

Now you have:
- ✅ Working AI-powered UI generator
- ✅ Understanding of the architecture
- ✅ Knowledge of how to use it
- ✅ Ability to deploy it

**Go build something cool!** 🚀

---

**Questions?** Check:
1. README.md (comprehensive guide)
2. DEPLOYMENT.md (deployment help)
3. Browser console (errors)
4. Server logs (API issues)
