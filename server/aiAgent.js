import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';

// Try loading .env.local from likely locations (server cwd, project root, parent)
const envPaths = [
  path.resolve(process.cwd(), '.env.local'),
  path.resolve(process.cwd(), '..', '.env.local'),
  path.resolve(process.cwd(), '..', '..', '.env.local')
];

for (const p of envPaths) {
  dotenv.config({ path: p });
}

// Also load default .env if present
dotenv.config();

// ============================================
// CONFIGURATION - CHANGE ONLY HERE!
// ============================================
// Support multiple environment variable names for flexibility
let API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GENERATIVE_API_KEY || null;
if (API_KEY && typeof API_KEY === 'string') {
  API_KEY = API_KEY.trim().replace(/;$/, '');
}

if (!API_KEY) {
  throw new Error('Missing Gemini/Generative API key. Set GEMINI_API_KEY or GOOGLE_API_KEY in your environment (or add .env.local in the repo root).');
}

const CONFIG = {
  API_KEY,
  // Models to try in order (will automatically fallback)
  MODELS_TO_TRY: [
    'gemini-2.5-flash',
    'gemini-2.5-pro',
    'gemini-2.5-flash-lite',
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite'
  ]
};

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(API_KEY);

// Cache for working model
let workingModel = null;

/**
 * FIXED COMPONENT LIBRARY
 * These are the ONLY components the AI can use.
 */
const COMPONENT_LIBRARY = {
  Button: {
    props: ['variant', 'size', 'onClick', 'children', 'disabled'],
    description: 'Interactive button - variants: primary, secondary, danger, success'
  },
  Card: {
    props: ['title', 'children', 'footer', 'className'],
    description: 'Container with optional header and footer'
  },
  Input: {
    props: ['type', 'placeholder', 'value', 'onChange', 'label'],
    description: 'Form input field - types: text, email, password, number'
  },
  Table: {
    props: ['headers', 'data', 'onRowClick'],
    description: 'Data table with headers array and data array of objects'
  },
  Modal: {
    props: ['isOpen', 'onClose', 'title', 'children'],
    description: 'Overlay modal dialog'
  },
  Sidebar: {
    props: ['children', 'isOpen', 'onToggle'],
    description: 'Collapsible side navigation'
  },
  Navbar: {
    props: ['title', 'links', 'actions'],
    description: 'Top navigation bar'
  },
  Chart: {
    props: ['type', 'data', 'title'],
    description: 'Data visualization - types: bar, line, pie'
  }
};

/**
 * Get a working Gemini model with automatic fallback
 */
async function getWorkingModel() {
  // Return cached model if we found one that works
  if (workingModel) {
    return genAI.getGenerativeModel({ model: workingModel });
  }

  // Try each model in order
  for (const modelName of CONFIG.MODELS_TO_TRY) {
    try {
      console.log(`🔍 Trying model: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      
      // Test if model works with a simple request
      await model.generateContent('test');
      
      // Success! Cache this model
      workingModel = modelName;
      console.log(`✅ Found working model: ${modelName}`);
      return model;
      
    } catch (error) {
      console.log(`❌ Model ${modelName} failed: ${error.message}`);
      continue;
    }
  }

  // If no model works, throw error
  throw new Error('No working Gemini model found. Please check your API key and available models.');
}

/**
 * STEP 1: PLANNER
 * Analyzes user intent and creates a structured plan
 */
async function plannerAgent(userIntent, existingCode = null) {
  const model = await getWorkingModel();
  
  const plannerPrompt = `You are a UI Planning Agent. Your job is to analyze user intent and create a structured plan.

AVAILABLE COMPONENTS (you can ONLY use these):
${Object.entries(COMPONENT_LIBRARY).map(([name, info]) => 
  `- ${name}: ${info.description}\n  Props: ${info.props.join(', ')}`
).join('\n')}

${existingCode ? `EXISTING CODE TO MODIFY:\n${existingCode}\n\n` : ''}

USER REQUEST: "${userIntent}"

${existingCode ? 
  'The user wants to MODIFY the existing UI. Only change what they asked for, preserve everything else.' :
  'The user wants to CREATE a new UI from scratch.'
}

Create a JSON plan with this structure:
{
  "intent": "brief summary of what user wants",
  "layout": "description of overall layout structure",
  "components": [
    {
      "type": "ComponentName",
      "purpose": "why this component is needed",
      "props": {"key": "value"},
      "content": "what goes inside"
    }
  ],
  "modifications": ${existingCode ? '"list of specific changes to make"' : 'null'}
}

Respond ONLY with valid JSON, no markdown, no explanation.`;

  try {
    const result = await model.generateContent(plannerPrompt);
    const response = await result.response.text();
    
    // Clean up response to extract JSON
    let jsonText = response.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    }
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }
    
    return JSON.parse(jsonText);
  } catch (error) {
    console.error('Planner error:', error);
    throw new Error(`Planning failed: ${error.message}`);
  }
}

/**
 * STEP 2: GENERATOR
 * Converts the plan into actual React code
 */
async function generatorAgent(plan, existingCode = null) {
  const model = await getWorkingModel();
  
  const generatorPrompt = `You are a Code Generator Agent. Convert the plan into React code.

STRICT RULES:
1. Use ONLY these components: ${Object.keys(COMPONENT_LIBRARY).join(', ')}
2. NO inline styles
3. NO new component definitions
4. NO Tailwind classes (components are pre-styled)
5. Import components from './components/ComponentLibrary'

PLAN:
${JSON.stringify(plan, null, 2)}

${existingCode ? `EXISTING CODE:\n${existingCode}\n\n` : ''}

Generate a React functional component named 'GeneratedUI'.
${existingCode ? 'MODIFY the existing code based on the plan. Keep unchanged parts as-is.' : 'Create NEW code based on the plan.'}

Include necessary imports and useState hooks.
Return ONLY the complete React code, no markdown, no explanation.

Example structure:
import React, { useState } from 'react';
import { Button, Card, Input } from './components/ComponentLibrary';

export default function GeneratedUI() {
  const [state, setState] = useState('');
  
  return (
    <div className="generated-ui">
      {/* Your components here */}
    </div>
  );
}`;

  try {
    const result = await model.generateContent(generatorPrompt);
    const response = await result.response.text();
    let code = response.trim();
    
    // Clean up markdown code blocks if present
    if (code.startsWith('```')) {
      code = code.replace(/```[a-z]*\n?/g, '').replace(/```\n?$/g, '');
    }
    
    return code;
  } catch (error) {
    console.error('Generator error:', error);
    throw new Error(`Code generation failed: ${error.message}`);
  }
}

/**
 * STEP 3: EXPLAINER
 * Explains the AI's decisions in human terms
 */
async function explainerAgent(plan, code, userIntent) {
  const model = await getWorkingModel();
  
  const explainerPrompt = `You are an Explanation Agent. Explain the UI decisions in simple terms.

USER ASKED FOR: "${userIntent}"

PLAN CREATED:
${JSON.stringify(plan, null, 2)}

Explain in 3-4 sentences:
1. What layout structure was chosen and why
2. Which components were selected and their purpose
3. Any key decisions or tradeoffs made

Be conversational and helpful. Start with "I've created..." or "I've modified..."`;

  try {
    const result = await model.generateContent(explainerPrompt);
    const response = await result.response.text();
    return response.trim();
  } catch (error) {
    console.error('Explainer error:', error);
    throw new Error(`Explanation failed: ${error.message}`);
  }
}

/**
 * ORCHESTRATOR
 * Runs all three agents in sequence with error handling
 */
export async function generateUI(userIntent, existingCode = null) {
  try {
    console.log(`\n🎯 Starting UI generation for: "${userIntent}"`);
    console.log(`📝 Mode: ${existingCode ? 'MODIFY existing' : 'CREATE new'}`);
    
    // Step 1: Plan
    console.log('📋 Step 1: Planning...');
    const plan = await plannerAgent(userIntent, existingCode);
    console.log('✅ Plan created');
    
    // Step 2: Generate
    console.log('⚙️  Step 2: Generating code...');
    const code = await generatorAgent(plan, existingCode);
    console.log('✅ Code generated');
    
    // Step 3: Explain
    console.log('💬 Step 3: Explaining decisions...');
    const explanation = await explainerAgent(plan, code, userIntent);
    console.log('✅ Explanation created');
    
    console.log('✨ UI generation complete!\n');
    
    return {
      success: true,
      plan,
      code,
      explanation,
      timestamp: new Date().toISOString(),
      modelUsed: workingModel
    };
  } catch (error) {
    console.error('❌ Error in UI generation:', error);
    
    // Provide helpful error message
    let errorMessage = error.message;
    if (error.message.includes('API key')) {
      errorMessage = 'Invalid API key. Please check your Gemini API key in server/aiAgent.js';
    } else if (error.message.includes('404')) {
      errorMessage = 'Model not found. The Gemini API models may have changed. Check available models at: https://ai.google.dev/models';
    } else if (error.message.includes('quota')) {
      errorMessage = 'API quota exceeded. Please check your Gemini API usage limits.';
    }
    
    return {
      success: false,
      error: errorMessage,
      fullError: error.message
    };
  }
}

/**
 * Component validation
 * Ensures generated code only uses allowed components
 */
export function validateComponents(code) {
  const allowedComponents = Object.keys(COMPONENT_LIBRARY);
  const componentPattern = /<([A-Z][a-zA-Z]*)/g;
  const usedComponents = [...code.matchAll(componentPattern)].map(match => match[1]);
  
  const invalid = usedComponents.filter(comp => !allowedComponents.includes(comp));
  
  return {
    valid: invalid.length === 0,
    allowedComponents,
    usedComponents: [...new Set(usedComponents)],
    invalidComponents: invalid
  };
}

/**
 * List available models (for debugging)
 */
export async function listAvailableModels() {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${CONFIG.API_KEY}`
    );
    const data = await response.json();
    return data.models?.map(m => m.name) || [];
  } catch (error) {
    console.error('Error listing models:', error);
    return [];
  }
}
