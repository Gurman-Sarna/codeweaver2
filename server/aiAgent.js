import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI('AIzaSyCzRSX8FGEuP2t1ERA8plbrA_LnIMNNjSQ');

/**
 * FIXED COMPONENT LIBRARY
 * These are the ONLY components the AI can use.
 * This ensures deterministic, consistent UI generation.
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
 * STEP 1: PLANNER
 * Analyzes user intent and creates a structured plan
 */
async function plannerAgent(userIntent, existingCode = null) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  
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

  const result = await model.generateContent(plannerPrompt);
  const response = result.response.text();
  
  // Clean up response to extract JSON
  let jsonText = response.trim();
  if (jsonText.startsWith('```json')) {
    jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
  }
  
  return JSON.parse(jsonText);
}

/**
 * STEP 2: GENERATOR
 * Converts the plan into actual React code
 */
async function generatorAgent(plan, existingCode = null) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  
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

  const result = await model.generateContent(generatorPrompt);
  let code = result.response.text().trim();
  
  // Clean up markdown code blocks if present
  if (code.startsWith('```')) {
    code = code.replace(/```[a-z]*\n?/g, '').replace(/```\n?$/g, '');
  }
  
  return code;
}

/**
 * STEP 3: EXPLAINER
 * Explains the AI's decisions in human terms
 */
async function explainerAgent(plan, code, userIntent) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  
  const explainerPrompt = `You are an Explanation Agent. Explain the UI decisions in simple terms.

USER ASKED FOR: "${userIntent}"

PLAN CREATED:
${JSON.stringify(plan, null, 2)}

Explain in 3-4 sentences:
1. What layout structure was chosen and why
2. Which components were selected and their purpose
3. Any key decisions or tradeoffs made

Be conversational and helpful. Start with "I've created..." or "I've modified..."`;

  const result = await model.generateContent(explainerPrompt);
  return result.response.text().trim();
}

/**
 * ORCHESTRATOR
 * Runs all three agents in sequence
 */
export async function generateUI(userIntent, existingCode = null) {
  try {
    console.log(`\n🎯 Starting UI generation for: "${userIntent}"`);
    
    // Step 1: Plan
    console.log('📋 Step 1: Planning...');
    const plan = await plannerAgent(userIntent, existingCode);
    
    // Step 2: Generate
    console.log('⚙️  Step 2: Generating code...');
    const code = await generatorAgent(plan, existingCode);
    
    // Step 3: Explain
    console.log('💬 Step 3: Explaining decisions...');
    const explanation = await explainerAgent(plan, code, userIntent);
    
    console.log('✅ UI generation complete!\n');
    
    return {
      success: true,
      plan,
      code,
      explanation,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Error in UI generation:', error);
    return {
      success: false,
      error: error.message
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
