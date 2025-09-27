# Product Requirements Document: Engineering Symbols and Stencils System

## Document Information
- **Version**: 1.0.0
- **Date**: September 2024
- **Status**: Approved
- **Owner**: Engineering Team
- **Stakeholders**: Product, Development, Design, QA

## Executive Summary

This PRD defines the comprehensive engineering symbols and stencils system for the Ergoplanner P&ID drawing component. The system provides a complete library of industry-standard symbols for creating professional Piping and Instrumentation Diagrams, with full compatibility with existing industry standards and UK water company specifications.

## Business Requirements

### Objectives
1. **Industry Compliance**: Provide symbols that comply with ISA-5.1, PIP, ISO 14617, and UK water industry standards
2. **Comprehensive Coverage**: Include all symbols required for water treatment and industrial P&ID creation
3. **Intelligent Behavior**: Enable smart connections, validation, and property management
4. **Cross-Standard Support**: Allow seamless conversion between different symbol standards
5. **Performance Excellence**: Maintain high performance with thousands of symbols

### Success Criteria
- Complete symbol library with 500+ unique symbols
- Full ISA-5.1 and UK water company compliance
- Symbol rendering at 60fps with 1000+ instances
- One-click conversion between standards
- 95% user satisfaction with symbol quality

## Functional Requirements

### Symbol Categories

#### Process Equipment Symbols
```yaml
Vessels and Tanks:
  - Horizontal vessels with heads
  - Vertical vessels with supports
  - Atmospheric storage tanks
  - Pressurized vessels
  - Floating roof tanks
  - Cone roof tanks
  - Spherical vessels
  - Internal components (baffles, agitators)
  Total: 40+ variants

Pumps:
  - Centrifugal pumps (horizontal/vertical)
  - Positive displacement pumps
  - Reciprocating pumps
  - Gear pumps
  - Screw pumps
  - Diaphragm pumps
  - Progressive cavity pumps
  - Multi-stage pumps
  Total: 35+ variants

Compressors:
  - Centrifugal compressors
  - Reciprocating compressors
  - Screw compressors
  - Rotary vane compressors
  - Axial compressors
  Total: 20+ variants

Heat Exchangers:
  - Shell and tube (TEMA types)
  - Plate heat exchangers
  - Air coolers
  - Spiral heat exchangers
  - Double pipe exchangers
  - Condensers
  - Reboilers
  - Cooling towers
  Total: 40+ variants
```

#### Piping Components
```yaml
Valves:
  - Gate valves
  - Globe valves
  - Ball valves
  - Butterfly valves
  - Check valves
  - Control valves
  - Plug valves
  - Diaphragm valves
  - Safety relief valves
  - Three-way valves
  - Four-way valves
  Total: 60+ variants

Fittings:
  - Elbows (90°, 45°, long/short radius)
  - Tees (equal, reducing)
  - Reducers (concentric, eccentric)
  - Caps and plugs
  - Unions and couplings
  - Crosses
  Total: 30+ variants

Flanges:
  - Weld neck
  - Slip-on
  - Threaded
  - Lap joint
  - Blind flanges
  - Spectacle blinds
  Total: 15+ variants

Supports:
  - Spring hangers
  - Rigid supports
  - Guides
  - Anchors
  - Expansion joints
  Total: 20+ variants
```

#### Instrumentation Symbols
```yaml
Primary Elements:
  - Orifice plates
  - Venturi meters
  - Flow nozzles
  - Pitot tubes
  - Thermowells
  - Pressure sensors
  - Level instruments
  - Analytical instruments
  Total: 40+ variants

Control Elements:
  - Control valves with actuators
  - Transmitters
  - Controllers
  - Indicators
  - Recorders
  - I/P converters
  - Computing relays
  Total: 30+ variants

Connections:
  - Instrument taps
  - Impulse lines
  - Capillary tubing
  - Sample points
  - Heat tracing
  Total: 15+ variants
```

#### Electrical Symbols
```yaml
Motors and Drivers:
  - AC motors
  - DC motors
  - Variable speed drives
  - Turbine drivers
  - Engine drivers
  - Gear boxes
  Total: 20+ variants

Power Distribution:
  - Transformers
  - Switchgear
  - MCCs
  - Generators
  - Batteries
  - UPS systems
  Total: 25+ variants

Control Wiring:
  - Relays
  - Contacts
  - Switches
  - Push buttons
  - Terminal blocks
  - Junction boxes
  Total: 30+ variants
```

### Symbol Properties and Metadata

#### Core Properties
Every symbol must support the following metadata:
```typescript
interface SymbolMetadata {
  // Identification
  tagNumber: string;           // Unique identifier
  name: string;                // Display name
  description: string;         // Detailed description
  category: string;            // Primary category
  subcategory: string;         // Secondary category

  // Technical Properties
  type: string;                // Equipment type
  size?: string;               // Nominal size
  rating?: string;             // Pressure/temperature rating
  material?: string;           // Construction material

  // Process Data
  service?: string;            // Process fluid
  designPressure?: number;     // Design pressure
  designTemperature?: number;  // Design temperature
  flowRate?: number;           // Flow capacity

  // Standards
  standard: 'ISA' | 'PIP' | 'ISO' | 'DIN' | 'BS';
  symbolCode: string;          // Standard symbol code
  revision?: string;           // Standard revision
}
```

#### Connection Points
Each symbol defines precise connection points:
```typescript
interface ConnectionPoint {
  id: string;                  // Unique identifier
  type: 'process' | 'utility' | 'instrument' | 'electrical';
  position: { x: number; y: number };  // Relative position
  angle: number;               // Connection angle
  size?: string;               // Connection size
  rating?: string;             // Connection rating
  direction?: 'in' | 'out' | 'bidirectional';
  validation?: {
    allowedTypes: string[];    // Compatible connection types
    sizeRange?: [min: string, max: string];
    ratingRequired?: boolean;
  };
}
```

### UK Water Industry Standards

#### Water Company Symbol Sets
```yaml
Thames Water:
  - Clarifiers with mechanisms
  - Rapid gravity filters
  - GAC filters
  - Chlorine contact tanks
  - UV disinfection units
  - Pumping station components
  Total: 50+ symbols

Severn Trent Water:
  - Primary settlement tanks
  - Activated sludge systems
  - Final clarifiers
  - Digesters
  - Dewatering equipment
  Total: 45+ symbols

Welsh Water (Dŵr Cymru):
  - Distribution components
  - PRV stations
  - Flow meters
  - Chlorination points
  - Reservoir controls
  Total: 40+ symbols

United Utilities:
  - Telemetry outstations
  - SCADA components
  - Actuated valves
  - Control interfaces
  - Network elements
  Total: 35+ symbols

Northumbrian Water:
  - Sampling points
  - Analyzer shelters
  - Quality monitors
  - Laboratory connections
  Total: 30+ symbols
```

#### Symbol Conversion System
```typescript
interface ConversionMapping {
  sourceStandard: string;
  targetStandard: string;
  mappings: Map<string, string>;  // Source ID -> Target ID
  propertyTransforms: Map<string, (value: any) => any>;
  unmappedHandling: 'flag' | 'preserve' | 'remove';
}
```

### Symbol Behaviors

#### Intelligent Connection
- **Auto-snap**: Connections snap to nearest compatible point within 10px
- **Validation**: Real-time validation of connection compatibility
- **Auto-routing**: Intelligent path finding between connection points
- **Multi-connection**: Support for manifolds and headers
- **Direction flow**: Automatic flow arrow generation

#### Transformation Capabilities
```yaml
Rotation:
  - 15-degree increments
  - Quick 90° rotations
  - Text auto-orientation
  - Connection point preservation

Flipping:
  - Horizontal/vertical mirroring
  - Text readability maintenance
  - Connection point adjustment

Resizing:
  - Aspect ratio locking
  - Proportional scaling
  - LOD adjustments
  - Text size management
```

#### Dynamic Properties
- **Status indication**: Running/stopped/standby states
- **Live data**: Display process values
- **Conditional formatting**: Visual alerts for parameters
- **Auto-numbering**: Sequential tag generation
- **Property inheritance**: From parent systems

### Symbol Library Organization

#### Category Structure
```yaml
Primary Categories:
  - Process Equipment
  - Piping Components
  - Instrumentation
  - Electrical
  - UK Water Industry
  - Custom Symbols

Organization Features:
  - Hierarchical categories
  - Favorites system
  - Recent items tracking
  - Smart categories
  - Custom categories
```

#### Search and Discovery
```yaml
Search Capabilities:
  - Full-text search
  - Metadata search
  - Visual similarity
  - Tag-based filtering
  - Advanced filters

Filter Options:
  - By category
  - By standard
  - By size range
  - By pressure rating
  - By material
  - By company standard
```

## Technical Requirements

### Performance Specifications

#### Rendering Performance
| Metric | Requirement | Measurement |
|--------|------------|-------------|
| Initial render | <50ms | Time to first paint |
| Zoom performance | 60fps | Frame rate during zoom |
| Pan performance | 60fps | Frame rate during pan |
| Symbol count | 1000+ | Simultaneous symbols |
| Memory usage | <500MB | For 1000 symbols |

#### Interaction Performance
| Operation | Response Time | Notes |
|-----------|--------------|--------|
| Selection | <16ms | Click to highlight |
| Drag start | <50ms | Click to movement |
| Connection snap | <16ms | Proximity detection |
| Property update | <100ms | Change to display |
| Batch select | <500ms | For 100 symbols |

### Data Management

#### Symbol Storage
```typescript
interface SymbolDefinition {
  id: string;
  version: string;
  geometry: SVGElement | Path2D;
  thumbnail: string;  // Base64 or URL
  metadata: SymbolMetadata;
  connectionPoints: ConnectionPoint[];
  behaviors: SymbolBehavior[];
  validation: ValidationRules;
}
```

#### Library Management
- **Versioning**: Semantic versioning for symbols
- **Migration**: Automatic updates for deprecated symbols
- **Import/Export**: Support for symbol packages
- **Sharing**: Team and organization libraries
- **Backup**: Automatic library backups

### Integration Requirements

#### CAD Systems
- **DWG/DXF**: Full symbol preservation
- **Symbol mapping**: Cross-system compatibility
- **Layer preservation**: Maintain organization
- **Property mapping**: Metadata translation

#### Data Systems
- **Database integration**: Symbol metadata storage
- **API access**: RESTful symbol management
- **Synchronization**: Real-time updates
- **Caching**: Client-side symbol cache

## User Experience

### Symbol Panel Design
```yaml
Layout:
  - Collapsible categories
  - Grid/list view toggle
  - Adjustable thumbnail size
  - Drag handle indicators
  - Search bar prominence

Interactions:
  - Single-click preview
  - Double-click insertion
  - Drag to canvas
  - Right-click menu
  - Keyboard navigation
```

### Symbol Insertion Workflow
1. **Browse/Search**: Find symbol in library
2. **Preview**: View symbol details and properties
3. **Configure**: Set initial properties (optional)
4. **Place**: Drag to canvas or click to place
5. **Connect**: Auto-snap to nearby connections
6. **Adjust**: Fine-tune position and properties

### Property Editing
```yaml
Property Panel:
  - Contextual property display
  - Grouped property sections
  - Quick edit fields
  - Validation feedback
  - Batch editing support

Property Types:
  - Text fields
  - Dropdowns
  - Number inputs
  - Checkboxes
  - Color pickers
  - File browsers
```

## Quality Assurance

### Testing Requirements

#### Symbol Accuracy
- Visual comparison with standards
- Connection point precision
- Property data integrity
- Scaling accuracy
- Print quality verification

#### Performance Testing
- Load testing with 1000+ symbols
- Memory leak detection
- Rendering benchmarks
- Interaction latency
- Library loading times

#### Compatibility Testing
- Standards compliance validation
- Cross-browser testing
- CAD import/export verification
- Database synchronization
- API integration testing

### Validation Rules

#### Symbol Validation
```typescript
interface ValidationRules {
  required: string[];          // Required properties
  connections: {
    min: number;               // Minimum connections
    max: number;               // Maximum connections
    types: string[];           // Allowed types
  };
  properties: {
    [key: string]: {
      type: string;
      range?: [min: any, max: any];
      pattern?: RegExp;
      custom?: (value: any) => boolean;
    };
  };
}
```

## Implementation Priorities

### Phase 1: Core Symbols (Month 1)
- Basic process equipment (vessels, pumps, exchangers)
- Common valves (gate, globe, ball, check)
- Essential instrumentation (transmitters, indicators)
- Basic piping components

### Phase 2: Complete ISA Library (Month 2)
- Full ISA-5.1 symbol set
- Advanced instrumentation
- Control system components
- Electrical symbols

### Phase 3: UK Water Standards (Month 3)
- Thames Water symbols
- Severn Trent symbols
- Common water treatment equipment
- Conversion system foundation

### Phase 4: Advanced Features (Month 4)
- Remaining water company symbols
- Symbol intelligence
- Performance optimization
- Custom symbol support

## Success Metrics

### Quantitative Metrics
- Symbol library completeness: 500+ symbols
- Rendering performance: 60fps maintained
- Conversion accuracy: 99% successful
- Load time: <2 seconds for full library
- User efficiency: 40% faster diagram creation

### Qualitative Metrics
- User satisfaction with symbol quality
- Ease of finding required symbols
- Accuracy of symbol representations
- Completeness for industry needs
- Professional appearance of output

## Risk Mitigation

### Technical Risks
| Risk | Mitigation |
|------|------------|
| Performance degradation | Progressive loading, LOD system |
| Browser compatibility | Fallback rendering modes |
| Symbol accuracy | Industry expert validation |
| Standard changes | Versioned symbol libraries |
| Large library size | Lazy loading, compression |

## Appendices

### A. Symbol Standards References
- ISA-5.1-2022 Instrumentation Symbols
- ISO 14617 Graphical Symbols
- PIP Drafting Standards
- UK Water Industry Standards
- Company-specific requirements

### B. Symbol Inventory
- Complete symbol listing by category
- Connection point specifications
- Property definitions
- Conversion mappings

### C. Performance Benchmarks
- Rendering performance data
- Memory usage analysis
- Load time measurements
- Interaction latency results

---

**Document Approval**

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Product Manager | | | |
| Technical Lead | | | |
| Design Lead | | | |
| QA Manager | | | |
| Industry Expert | | | |