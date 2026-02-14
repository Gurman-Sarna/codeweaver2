# 🧵 CodeWeaver - AI-Powered Deterministic UI Generator

> Transform natural language into working React UIs using AI agents and a fixed component library
> Deployed on Vercel : https://codeweaver23.vercel.app

![CodeWeaver Banner](https://img.shields.io/badge/AI-Powered-blue) ![React](https://img.shields.io/badge/React-18.3-61dafb) ![Node](https://img.shields.io/badge/Node-20+-green)

## 📋 Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [How It Works](#how-it-works)
- [Component System](#component-system)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Known Limitations](#known-limitations)
- [Future Improvements](#future-improvements)
- [Learning Notes](#learning-notes)

---

## 🎯 Overview

CodeWeaver is an AI-powered UI generator that converts natural language descriptions into working React code. Unlike traditional code generators, CodeWeaver uses a **deterministic component library** to ensure consistent, safe, and reproducible outputs.

### Key Concept: Deterministic Generation
- ✅ Fixed component library (no arbitrary CSS or components)
- ✅ Visual consistency across all generations
- ✅ Safe for production (no code injection risks)
- ✅ Fully reproducible outputs

---

## ✨ Features

### Core Capabilities
- 🎨 **Natural Language UI Generation** - Describe UIs in plain English
- 🔄 **Iterative Modifications** - Edit UIs conversationally without full rewrites
- 👁️ **Live Preview** - See changes instantly
- 📝 **Editable Code** - Manually refine generated code
- ⏮️ **Version History** - Rollback to any previous version
- 🛡️ **Component Validation** - Ensures only allowed components are used
- 🤖 **Multi-Step AI Agent** - Planner → Generator → Explainer architecture

### Safety & Reliability
- Component whitelist enforcement
- No inline styles or arbitrary CSS
- Prompt injection protection
- Error boundary for safe rendering
- Validation before rendering

---

## 🏗️ Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (React)                     │
│  ┌────────────┐  ┌────────────┐  ┌─────────────────────┐   │
│  │   Chat     │  │    Code    │  │   Live Preview      │   │
│  │  Interface │  │   Editor   │  │   (Isolated)        │   │
│  └────────────┘  └────────────┘  └─────────────────────┘   │
└───────────────────────────┬─────────────────────────────────┘
                            │ REST API
┌───────────────────────────┴─────────────────────────────────┐
│                       Backend (Node.js)                      │
│                                                               │
│  ┌──────────────────── AI Agent Pipeline ─────────────────┐ │
│  │                                                          │ │
│  │  1️⃣ PLANNER                                            │ │
│  │     • Analyzes user intent                              │ │
│  │     • Selects components                                │ │
│  │     • Creates structured plan                           │ │
│  │                                                          │ │
│  │  2️⃣ GENERATOR                                          │ │
│  │     • Converts plan to React code                       │ │
│  │     • Uses only allowed components                      │ │
│  │     • Handles incremental edits                         │ │
│  │                                                          │ │
│  │  3️⃣ EXPLAINER                                          │ │
│  │     • Explains decisions                                │ │
│  │     • Provides reasoning                                │ │
│  │                                                          │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌──────────────── Validation Layer ──────────────────┐     │
│  │  • Component whitelist check                        │     │
│  │  • Code safety validation                           │     │
│  └─────────────────────────────────────────────────────┘     │
└───────────────────────────────────────────────────────────────┘
                            │
                            ▼
                    Gemini AI API
```

### Why This Architecture?

1. **Separation of Concerns**
   - Frontend: Pure UI/UX
   - Backend: AI logic and validation
   - Components: Fixed, reusable library

2. **Multi-Step Agent (Not Single LLM Call)**
   - **Planner**: Focuses on "what" to build
   - **Generator**: Focuses on "how" to code it
   - **Explainer**: Focuses on "why" decisions were made
   - Each step has a specialized prompt, making outputs more reliable

3. **Deterministic Component System**
   - Components are pre-built and styled
   - AI can only compose, not create
   - Ensures visual consistency

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Gemini API key (included in code for this assignment)

### Installation

```bash
# Clone the repository
git clone https://github.com/Gurman-Sarna/CodeWeaver2.git
cd CodeWeaver2

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Running Locally

```bash
# Terminal 1 - Start backend (from server directory)
cd server
npm start

# Terminal 2 - Start frontend (from client directory)
cd client
npm run dev
```

Visit: `http://localhost:3000`

---

## 🔧 How It Works

### User Flow

1. **User Input**
   ```
   "Create a dashboard with 3 stat cards and a user table"
   ```

2. **AI Agent Processing**
   
   **Step 1: Planner**
   ```json
   {
     "intent": "Dashboard with stats and table",
     "layout": "Grid layout with cards on top, table below",
     "components": [
       {"type": "Card", "purpose": "Show metric 1"},
       {"type": "Card", "purpose": "Show metric 2"},
       {"type": "Card", "purpose": "Show metric 3"},
       {"type": "Table", "purpose": "Display user data"}
     ]
   }
   ```

   **Step 2: Generator**
   ```jsx
   import React from 'react';
   import { Card, Table } from './components/ComponentLibrary';

   export default function GeneratedUI() {
     return (
       <div className="generated-ui">
         <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem'}}>
           <Card title="Total Users">1,234</Card>
           <Card title="Active">856</Card>
           <Card title="Pending">378</Card>
         </div>
         <Table 
           headers={['Name', 'Email', 'Role']}
           data={[
             {Name: 'John Doe', Email: 'john@example.com', Role: 'Admin'},
             {Name: 'Jane Smith', Email: 'jane@example.com', Role: 'User'}
           ]}
         />
       </div>
     );
   }
   ```

   **Step 3: Explainer**
   ```
   I've created a dashboard layout with three stat cards at the top showing 
   Total Users, Active, and Pending metrics. Below that, I added a table 
   displaying user information with Name, Email, and Role columns. The grid 
   layout ensures the cards are evenly spaced.
   ```

3. **Live Preview**
   - Code is safely executed in isolated environment
   - Components render using fixed library
   - User sees working UI immediately

4. **Iteration**
   ```
   User: "Add a search bar above the table"
   ```
   - Agent modifies existing code (doesn't regenerate from scratch)
   - Preserves other elements
   - Adds requested feature

---

## 📦 Component System

### Available Components

| Component | Props | Description |
|-----------|-------|-------------|
| **Button** | `variant`, `size`, `onClick`, `children`, `disabled` | Interactive button with variants: primary, secondary, danger, success |
| **Card** | `title`, `children`, `footer`, `className` | Container with optional header and footer |
| **Input** | `type`, `placeholder`, `value`, `onChange`, `label` | Form input - types: text, email, password, number |
| **Table** | `headers`, `data`, `onRowClick` | Data table with headers array and data objects |
| **Modal** | `isOpen`, `onClose`, `title`, `children` | Overlay modal dialog |
| **Sidebar** | `children`, `isOpen`, `onToggle` | Collapsible side navigation |
| **Navbar** | `title`, `links`, `actions` | Top navigation bar |
| **Chart** | `type`, `data`, `title` | Data visualization - types: bar, line, pie |

### Component Philosophy

**Why Fixed Components?**
1. **Consistency**: Every generation looks professional
2. **Safety**: No arbitrary CSS injection
3. **Predictability**: Same input = same output
4. **Maintainability**: Easy to update all UIs by updating library

**Trade-offs**:
- ✅ Pro: Bulletproof reliability
- ❌ Con: Less flexibility than free-form generation

---

## 🌐 API Documentation

### POST `/api/generate`
Generate or modify UI based on user intent.

**Request:**
```json
{
  "userIntent": "Create a login form",
  "existingCode": null,  // or existing React code string
  "sessionId": "session_12345"
}
```

**Response:**
```json
{
  "success": true,
  "plan": { /* structured plan */ },
  "code": "import React...",
  "explanation": "I've created a login form...",
  "validation": {
    "valid": true,
    "usedComponents": ["Card", "Input", "Button"]
  },
  "version": 1,
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### GET `/api/history/:sessionId`
Retrieve version history for a session.

**Response:**
```json
{
  "sessionId": "session_12345",
  "versions": [
    {
      "version": 1,
      "userIntent": "Create login form",
      "timestamp": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### GET `/api/version/:sessionId/:version`
Get specific version details.

### POST `/api/validate`
Validate code against component whitelist.

**Request:**
```json
{
  "code": "import React from 'react'..."
}
```

**Response:**
```json
{
  "valid": true,
  "allowedComponents": ["Button", "Card", ...],
  "usedComponents": ["Button", "Card"],
  "invalidComponents": []
}
```

---

## 🚢 Deployment

### Environment Variables

Create `.env` file in server directory:
```env
PORT=3001
GEMINI_API_KEY=your_api_key_here
```

### Deploy to Vercel/Netlify

**Frontend (Vercel):**
```bash
cd client
vercel --prod
```

**Backend (Render/Railway):**
```bash
cd server
# Follow platform-specific deployment
```

### Docker Deployment

```dockerfile
# Dockerfile example
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

---

## ⚠️ Known Limitations

1. **Component Library Size**
   - Currently 8 components
   - May not cover all UI patterns
   - **Solution**: Expand library with more components

2. **AI Hallucinations**
   - AI might try to use non-existent props
   - **Mitigation**: Validation layer catches this

3. **Complex Layouts**
   - No CSS Grid/Flexbox customization
   - **Workaround**: Pre-define common layouts in components

4. **State Management**
   - Each generation creates new component
   - State doesn't persist between versions
   - **Future**: Add state preservation

5. **Performance**
   - Multiple AI calls can be slow
   - **Optimization**: Caching, streaming responses

6. **No Authentication**
   - All sessions are anonymous
   - **Production**: Add user auth

---

## 🔮 Future Improvements

### Short Term
- [ ] Streaming AI responses for better UX
- [ ] Diff view between versions
- [ ] Export generated code to file
- [ ] More components (Dropdown, Checkbox, Radio, etc.)

### Medium Term
- [ ] Component schema validation (JSON Schema)
- [ ] Replayable generations (deterministic seeding)
- [ ] Static analysis of AI output
- [ ] Custom theme support
- [ ] Undo/Redo functionality

### Long Term
- [ ] Multi-page application support
- [ ] Database integration for persistence
- [ ] Collaborative editing
- [ ] Component composition builder
- [ ] AI-powered component suggestions
- [ ] A/B testing different AI models

---

## 📚 Learning Notes

### Key Concepts You'll Learn

#### 1. AI Agent Orchestration
**Why multiple steps instead of one?**
- Single prompt = jack of all trades, master of none
- Specialized prompts = better at specific tasks
- Separation allows for targeted improvements

**Code Example:**
```javascript
// Bad: Single mega-prompt
const result = await ai.generate("Do everything");

// Good: Specialized steps
const plan = await planner(intent);
const code = await generator(plan);
const explanation = await explainer(plan, code);
```

#### 2. Deterministic Code Generation
**Problem:** AI is non-deterministic (different outputs each time)
**Solution:** Constrain the output space

```javascript
// Instead of: "Generate any CSS"
// We say: "Use only these 8 components"

const ALLOWED = ['Button', 'Card', 'Input', ...];
// AI can only compose, not create
```

#### 3. Safe Code Execution
**Danger:** `eval()` can execute malicious code
**Solution:** Controlled function creation

```javascript
// Dangerous
eval(aiGeneratedCode);

// Safer
const fn = new Function('React', 'Button', aiGeneratedCode);
const Component = fn(React, Button);
```

#### 4. React Component Composition
**Pattern:** Higher-Order Components
```javascript
// AI generates this structure
function GeneratedUI() {
  return (
    <Card>
      <Button onClick={...}>Click</Button>
    </Card>
  );
}
```

#### 5. API Design for AI Systems
**Principles:**
- Clear request/response contracts
- Validation at every layer
- Error handling with context
- Version tracking for reproducibility

---

## 🧪 Testing the System

### Manual Tests

1. **Basic Generation**
   ```
   Input: "Create a login form with email and password"
   Expected: Card with 2 Inputs and 1 Button
   ```

2. **Iteration**
   ```
   Input 1: "Create a dashboard"
   Input 2: "Add a sidebar"
   Expected: Original dashboard + new Sidebar component
   ```

3. **Validation**
   ```
   Input: "Create a LoginBox component"
   Expected: Error (LoginBox not in component library)
   ```

4. **Version Rollback**
   ```
   Actions: Generate v1 → Generate v2 → Rollback to v1
   Expected: v1 code restored
   ```

---

## 🙏 Acknowledgments

- Google Gemini for AI capabilities
- React team for the framework
- Vite for blazing fast dev experience

---

## 📞 Contact

**Developer:** Gurman Sarna  
**Email:** gurmansarnain@gmail.com 
**GitHub:** [@Gurman-Sarna](https://github.com/Gurman-Sarna)

---

**Built with ❤️ and ☕ for Ryze AI**
