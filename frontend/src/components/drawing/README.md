# P&ID Drawing Component

A comprehensive P&ID (Piping & Instrumentation Diagram) drawing component built with ReactFlow v11.11.4 for the Ergoplanner AI Suite.

## Features

### Core Drawing Capabilities

- **Interactive Canvas**: Infinite zoom/pan with smooth navigation
- **Grid System**: Toggle-able grid with snap-to-grid functionality
- **Symbol Library**: Comprehensive P&ID symbols following ISA-5.1 standards
- **Drag & Drop**: Intuitive drag-and-drop from symbol library to canvas
- **Connection System**: Smart pipe routing between components
- **Property Panel**: Edit component properties in real-time
- **Undo/Redo**: Full history management with keyboard shortcuts

### P&ID Symbols Included

- **Pumps & Compressors**: Centrifugal pumps, compressors with specifications
- **Valves**: Gate, ball, butterfly, control, and check valves
- **Tanks & Vessels**: Storage tanks, pressure vessels with level indicators
- **Piping**: Horizontal, vertical, elbows, tees, and crosses
- **Instruments**: Flow meters, pressure gauges with real-time values
- **Heat Transfer**: Shell & tube heat exchangers

### Data Management

- **Local Storage**: Save/load drawings to browser storage
- **Import/Export**: JSON format for data exchange
- **Export Options**: PNG and SVG export capabilities
- **Auto-save**: Tracks unsaved changes

### User Interface

- **Toolbar**: Complete drawing tools and file operations
- **MiniMap**: Bird's eye view for navigation
- **Controls**: Zoom in/out, fit to view
- **Keyboard Shortcuts**:
  - `Ctrl/Cmd + Z`: Undo
  - `Ctrl/Cmd + Y`: Redo
  - `Delete`: Delete selected element
  - `Ctrl/Cmd + A`: Select all

## Usage

### Basic Usage

Navigate to `/drawing` in your browser to access the P&ID drawing interface.

### Creating a Drawing

1. **Add Components**: Drag symbols from the left sidebar onto the canvas
2. **Connect Components**: Click and drag from connection points to create pipes
3. **Edit Properties**: Select any component and use the right panel to modify properties
4. **Save Drawing**: Click the save button in the toolbar to save to browser storage

### Symbol Properties

Each symbol type has specific properties that can be edited:

- **Pumps**: Flow rate, head, power, type
- **Valves**: Type, state (open/closed), size
- **Tanks**: Capacity, level percentage, type
- **Pipes**: Diameter, material, orientation
- **Instruments**: Current value, units, ranges

### Exporting Drawings

The component supports multiple export formats:

- **JSON**: Complete diagram data for reimporting
- **PNG**: High-resolution image export
- **SVG**: Vector format for scaling

## Architecture

### Components Structure

```
drawing/
├── DrawingCanvas.tsx       # Main canvas component with ReactFlow
├── SymbolLibrary.tsx       # Draggable symbol palette
├── Toolbar.tsx             # Top toolbar with actions
├── PropertyPanel.tsx       # Right panel for editing
├── nodes/                  # Custom ReactFlow nodes
│   ├── PumpNode.tsx
│   ├── ValveNode.tsx
│   ├── TankNode.tsx
│   └── ...
└── index.ts               # Component exports
```

### State Management

Uses Zustand for global drawing state:

- Node and edge management
- History for undo/redo
- Drawing metadata
- UI preferences

## Customization

### Adding New Symbols

1. Create a new node component in `nodes/`:

```tsx
const CustomNode = ({ data, selected }) => {
  return (
    <div className={selected ? "selected" : ""}>
      {/* Your SVG symbol */}
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
};
```

2. Register in `DrawingCanvas.tsx`:

```tsx
const nodeTypes = {
  // ...existing types
  customNode: CustomNode,
};
```

3. Add to symbol library in `SymbolLibrary.tsx`

### Styling

Styles can be customized in:

- Component-level Tailwind classes
- `globals.css` for ReactFlow-specific styles
- Theme variables in CSS

## Performance

- Optimized for drawings with 500+ components
- Lazy loading of symbols
- Efficient rendering with React.memo
- Virtual scrolling in symbol library
- Debounced property updates

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Keyboard Shortcuts

| Shortcut         | Action          |
| ---------------- | --------------- |
| Ctrl/Cmd + Z     | Undo            |
| Ctrl/Cmd + Y     | Redo            |
| Delete/Backspace | Delete selected |
| Ctrl/Cmd + S     | Save drawing    |
| Ctrl/Cmd + O     | Open drawing    |
| Ctrl/Cmd + N     | New drawing     |

## Future Enhancements

- [ ] Real-time collaboration
- [ ] Cloud storage integration
- [ ] AI-powered auto-routing
- [ ] DXF/DWG export
- [ ] Component templates
- [ ] Advanced validation rules
- [ ] Version control
- [ ] Multi-sheet support
