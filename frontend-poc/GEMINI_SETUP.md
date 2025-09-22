# Gemini AI Integration Setup

## Getting Your Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Click "Get API Key" in the top navigation
4. Create a new API key for your project
5. Copy the API key (starts with "AIza...")

## Adding the API Key to the POC

1. Open the POC at `http://localhost:3002`
2. Click the chat bubble in the bottom right
3. Click the settings icon (⚙️) in the chat header
4. Paste your Gemini API key
5. Click "Save Key"

## Testing Complex Commands

Try these commands in the chat:

### Simple Commands (work without API key):
- "Add a pump"
- "Create a valve"
- "Add a tank"
- "List all equipment"

### Complex Commands (require Gemini API):
- "Create pumping station"
- "Build treatment plant"
- "Design a water treatment facility"
- "Create a complete pumping system with 3 pumps and storage tank"

## What Complex Commands Do

**Pumping Station**: Creates a complete pumping facility with:
- 2 main pumps (150 m³/h, 22 kW each)
- 1 storage tank (5000 m³ capacity)
- Isolation valves for each pump
- Professional equipment naming (P-101, P-102, T-101, etc.)

**Treatment Plant**: Creates a water treatment facility with:
- Clarifier tank (10,000 m³)
- Treatment pumps (200 m³/h, 30 kW each)
- Clean water storage tank (8,000 m³)
- Control and isolation valves
- Professional manufacturer assignments

## Features

- **Intelligent positioning**: Equipment is placed logically (tanks at top, pumps below, valves between)
- **Professional naming**: Follows P&ID conventions (P-xxx for pumps, V-xxx for valves, T-xxx for tanks)
- **Realistic specifications**: Uses actual manufacturer names and realistic flow/power ratings
- **Context awareness**: Gemini considers existing equipment when creating new components

## Fallback Mode

If no API key is configured or the API fails, the system falls back to basic local processing that can still handle simple commands and some complex ones like "create pumping station" with predefined configurations.