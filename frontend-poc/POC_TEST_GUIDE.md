# Ergoplanner POC Test Guide

## Access the Application
Open your browser and navigate to: http://localhost:3001

## Features to Test

### 1. ReactFlow Canvas (Main Area)
- [x] Canvas should be visible with grid background
- [x] Toolbar at top with "Add Pump", "Add Valve", "Add Tank" buttons
- [x] Click buttons to add equipment to canvas
- [x] Drag equipment nodes to reposition them
- [x] Click equipment to select (shows property panel)

### 2. Property Panel (Right Side - when equipment selected)
- [x] Shows equipment details
- [x] Edit equipment name
- [x] Edit manufacturer
- [x] Edit model
- [x] Edit flow/capacity (pumps and tanks)
- [x] Edit power (pumps only)
- [x] Change status (offline/online/maintenance)
- [x] Save changes button
- [x] Delete button

### 3. Data Grid (Bottom Section)
- [x] Shows all equipment in table format
- [x] Inline editing of all properties
- [x] Status dropdown with color coding
- [x] Edit and Delete action buttons
- [x] Real-time sync with canvas

### 4. AI Chat Interface (Bottom-right floating button)
- [x] Click chat bubble to open interface
- [x] Configure API key (first time)
- [x] Try commands:
  - "Add a pump"
  - "Create a new valve"
  - "Add a tank at position 400,300"
  - "List all equipment"
- [x] See equipment created on canvas

### 5. Bidirectional Sync
- [x] Change property in grid → updates on canvas
- [x] Change property in panel → updates in grid
- [x] Add equipment on canvas → appears in grid
- [x] Delete from grid → removes from canvas

## Test Scenarios

### Scenario 1: Add Equipment
1. Click "Add Pump" button
2. See pump appear on canvas
3. Verify it shows in data grid
4. Click pump to select
5. Edit properties in panel
6. Save changes
7. Verify updates in grid

### Scenario 2: AI Integration
1. Open chat interface
2. Type "Add a pump called P-101"
3. See pump created
4. Type "List equipment"
5. See list of all equipment

### Scenario 3: Data Grid Editing
1. Edit equipment name in grid
2. See name update on canvas node
3. Change status in grid
4. See color change on canvas

## Known Limitations (POC)
- No pipe connections between equipment
- No save/load functionality
- No real backend persistence
- Limited AI commands
- Basic styling only

## OpenRouter API Setup
1. Get API key from https://openrouter.ai
2. Add funds to account ($5 minimum)
3. Enter key in chat interface when prompted
4. Key is saved in localStorage

## Local Development
- Frontend: http://localhost:3001
- No backend required for POC
- All data in browser memory
- Refresh page resets all data