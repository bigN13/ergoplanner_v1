# Engineering Symbols and Stencils - Complete Specification

## Executive Summary
The engineering symbols library forms the core of the P&ID drawing capability. This specification documents every engineering symbol available in draw.io, their properties, connection points, and behaviors. These symbols must be exactly replicated to ensure compatibility with existing diagrams and industry standards.

## P&ID Symbol Categories

### Process Equipment

**Vessels and Tanks**
The vessel category contains over forty distinct symbols representing storage and process vessels. Each vessel symbol maintains specific connection points for inlet, outlet, vent, drain, and instrumentation connections. Horizontal vessels have connection points along the top and bottom centerlines, plus end connections. Vertical vessels provide connections around the perimeter at standard angles.

Atmospheric tanks show vented tops with standard roof representations. Pressurized vessels include elliptical or hemispherical heads as appropriate. Internal components like baffles, agitators, and heating coils are available as child symbols. Tank symbols support level indication areas and measurement connection points.

Special vessel types include spherical storage vessels, bullet tanks, floating roof tanks, and cone roof tanks. Each maintains industry-standard proportions and connection point locations. Vessel symbols can show insulation through double-line representations. Support structures like legs or saddles are included where standard.

**Pumps**
The pump category encompasses thirty-five different pump types, each with distinct symbol representations. Centrifugal pumps show the characteristic volute shape with suction and discharge connections at appropriate angles. Positive displacement pumps use industry-standard shapes for gear, screw, and reciprocating types.

Each pump symbol includes a driver representation area, typically shown as a circle for motors. The connection between pump and driver uses specific line styles to indicate coupling types. Pump symbols maintain consistent orientation with suction on the left and discharge on the right by default.

Specialized pump symbols include vertical turbine pumps with distinctive shaft representations, diaphragm pumps with characteristic chamber shapes, and progressive cavity pumps with rotor/stator indications. Multi-stage pumps show appropriate stage representations. Seal flush and cooling connections appear on pumps where standard.

**Compressors and Blowers**
Twenty different compressor types are available, each with unique symbolic representations. Centrifugal compressors show the characteristic tapered shape with stage indications. Reciprocating compressors display cylinder arrangements for single and multi-stage configurations.

Rotary compressors include screw, vane, and lobe types with distinctive rotor representations. Each compressor symbol includes appropriate connection points for suction, discharge, and inter-stage connections where applicable. Driver representations attach at standard locations.

Blower symbols differentiate from compressors through specific shape variations. Axial flow machines show blade representations. Cooling connections appear on compressed air equipment. Surge control and recycle connections are included where standard.

**Heat Exchangers**
The heat exchanger category provides over forty symbols for thermal equipment. Shell and tube exchangers show standard TEMA representations with clear tube and shell side connections. Fixed head, floating head, and U-tube configurations have distinct symbols.

Plate heat exchangers use the characteristic parallel plate representation. Air coolers show finned tube bundles with fan symbols. Spiral heat exchangers display the unique spiral flow path. Each exchanger type maintains proper connection point locations for process streams.

Specialty exchangers include condensers with appropriate vapor and liquid connections, reboilers with thermosyphon or forced circulation representations, and vaporizers with heating medium connections. Double pipe exchangers show the concentric tube arrangement. Cooling towers and evaporators have distinctive symbols.

### Piping Components

**Valves**
The valve library contains over sixty valve types, each precisely drawn to industry standards. Gate valves show the characteristic wedge shape within the body. Globe valves display the distinctive S-shaped flow path. Ball valves represent the spherical closure element.

Each valve symbol maintains consistent connection points aligned with the flow path. Normally open and normally closed variants exist for automated valves. Actuator symbols attach at standard positions above the valve body. Hand wheels, levers, and gear operators have specific representations.

Control valves show the distinctive diagonal stem with positioner box. Butterfly valves use the lens-shaped disc representation. Check valves indicate flow direction with distinctive internals. Plug valves, diaphragm valves, and needle valves each have unique symbols. Safety relief valves show the spring-loaded mechanism.

Special valve types include three-way valves with appropriate port arrangements, four-way valves for reversing service, angle valves with 90-degree flow paths, and Y-pattern valves. Each maintains proper port identification and flow path indication.

**Fittings and Flanges**
Pipe fittings follow standard drafting conventions for elbows, tees, reducers, and other components. 90-degree elbows show the sharp corner representation. 45-degree elbows display the appropriate angle. Long radius and short radius variants are distinguished.

Tees and crosses maintain proper branch connection angles. Reducing fittings show the size transition clearly. Caps and plugs have distinctive termination symbols. Unions and couplings show the disconnection point.

Flange symbols indicate the connection type through specific patterns. Weld neck, slip-on, threaded, and lap joint flanges have unique representations. Gasket indicators appear between flange faces. Blind flanges show the blanked connection. Spectacle blinds display the characteristic figure-8 shape.

**Pipe Supports and Guides**
Support symbols include spring hangers with characteristic coil representation, rigid supports with fixed attachment points, guides that allow axial movement, and anchors that prevent all movement. Each support type uses standard industry symbols.

Expansion joints show the flexible bellows element. Flexible hoses use the corrugated representation. Strainers and filters display the collection element. Steam traps show the distinctive trap symbol with inlet and outlet connections.

### Instrumentation

**Primary Elements**
Flow measurement devices include orifice plates with pressure tap locations, venturi meters with characteristic throat shape, flow nozzles with converging profile, and pitot tubes with impact and static connections. Each maintains proper upstream and downstream requirements.

Temperature sensors show thermowell installations with element types indicated. Pressure instruments display bourdon tubes, diaphragms, or electronic sensors as appropriate. Level instruments include float, displacer, and electronic types with proper vessel connections.

Analytical instruments encompass pH sensors, conductivity probes, gas analyzers, and chromatographs. Each uses standard ISA symbology with appropriate sample and return connections. Inline and sample system configurations are available.

**Control Elements**
Control valve symbols show positioner integration and actuator types. Pneumatic, hydraulic, and electric actuators have distinct representations. Fail-safe positions are clearly indicated through stem position.

Transmitters use the standard square symbol with signal line connections. Controllers show the circular symbol with appropriate input and output connections. Indicators display the characteristic hexagon shape. Recorders include the chart representation.

Control system components include I/P converters, computing relays, and signal conditioners. Each maintains standard ISA symbology. Function blocks can be added to show control strategies. Set point and manual controls have specific symbols.

**Instrument Connections**
Instrument connection symbols show proper tapping points on process lines. Primary element connections maintain standard orientations. Impulse lines use appropriate line styles. Capillary tubing has the distinctive thin representation.

Sample points show the extraction location with valve symbols. Return connections indicate the re-entry point. Purge and flush connections appear where required. Heat tracing on impulse lines uses the standard parallel line indication.

### Electrical Symbols

**Motors and Drivers**
Motor symbols include standard representations for AC and DC types. Three-phase motors show the characteristic three-terminal connection. Variable speed drives display the frequency control indication. Starting equipment has specific symbols.

Turbine drivers use the blade wheel representation. Engine drivers show the piston arrangement. Gear boxes display the gear mesh. Couplings indicate the connection type between driver and driven equipment.

**Power Distribution**
Electrical distribution symbols include transformers with winding representations, switchgear with breaker symbols, motor control centers with compartment indications, and distribution panels. Each maintains standard electrical drafting conventions.

Generators show the rotating machine symbol with excitation connections. Batteries display the cell arrangement. Uninterruptible power supplies include the inverter representation. Grounding symbols show earth connections.

**Control Wiring**
Control wiring diagrams use standard symbols for relays, contacts, switches, and indicators. Push buttons show the momentary action. Selector switches indicate positions. Limit switches display the actuating mechanism.

Terminal blocks show connection points with numbering. Junction boxes indicate wire consolidation points. Cable trays and conduits use specific line styles. Wire numbering and labeling follow standard conventions.

## Symbol Properties and Metadata

### Standard Properties
Every engineering symbol carries essential metadata that travels with the symbol throughout its lifecycle. The tag number serves as the unique identifier, following project-specific naming conventions. This tag becomes the primary reference for equipment lists and documentation.

Equipment type classification enables automatic categorization and filtering. Service descriptions indicate the process fluid or utility handled. Size specifications include nominal dimensions and connection sizes. Material of construction defines wetted parts and pressure boundaries.

Design conditions encompass pressure ratings, temperature ranges, and flow capacities. Operating conditions reflect normal process parameters. These properties integrate with calculation engines and validation rules.

### Connection Point Definitions
Each symbol includes precisely located connection points that define where pipes and instruments attach. Connection points carry metadata including size, rating, connection type, and flow direction. This enables intelligent connection validation during drawing.

Primary process connections typically appear as filled circles when visible. Secondary connections like drains and vents use smaller indicators. Instrument connections show appropriate tap locations. Utility connections for steam, cooling water, or air have designated positions.

Connection points support automatic pipe routing, ensuring smooth flow lines between equipment. The connection point properties propagate to attached piping, maintaining consistency. Connection validation prevents mismatched sizes or incompatible services.

### Dynamic Properties
Symbols support dynamic properties that update based on context. Operating status can show equipment as running, stopped, or standby through color or pattern changes. Flow direction arrows update based on connected piping orientation.

Instrumentation bubbles attached to equipment automatically number based on loop assignments. Equipment numbers increment according to project standards. Reference designations update when symbols are copied or instantiated.

Performance data can display on symbols when enabled, showing flows, pressures, or temperatures. These values can link to external databases or calculation results. Conditional formatting highlights out-of-range parameters.

## Industry Standard Compliance

### ISA-5.1 Standards
All instrumentation symbols strictly follow ISA-5.1 standards for identification and symbols. Letter combinations correctly represent measured variables and functions. First letters indicate measured or initiating variables. Succeeding letters show readout, passive, or output functions.

Instrument bubbles maintain the standard 7/16 inch diameter at printed scale. Line symbols differentiate between pneumatic, hydraulic, electric, and data signals. Balloon locations follow standard practices for field versus panel mounting.

Tag numbering follows the ISA convention with appropriate prefixes and loop numbers. Typical loop arrangements are available as templates. Standard abbreviations are used consistently throughout the symbol library.

### PIP Symbols
Process Industry Practices symbols are included for companies following these standards. PIP drafting practices differ slightly from ISA in certain representations. Valve symbols may show more detail in body configuration.

Equipment symbols follow PIP dimensional standards for consistency. Nozzle projections and orientations match PIP requirements. Line designations use PIP nomenclature where applicable.

The symbol library allows switching between ISA and PIP representations. Conversion maintains connection points and properties. Projects can specify which standard to follow by default.

### International Standards
ISO 14617 graphical symbols provide international alternatives. DIN symbols serve European market requirements. British Standards symbols are available for UK projects. Each standard maintains its unique conventions while preserving functionality.

Symbol libraries can mix standards where necessary, though consistency within diagrams is recommended. Conversion between standards is possible for existing diagrams. Property mappings ensure data integrity during conversion.

Regional preferences can be set at the organization level. New projects inherit the organizational standard. Users can override standards for specific project requirements.

## UK Water Industry Standards

### Water Company Specific Symbols
Thames Water standard symbols include specific representations for water treatment equipment. Clarifiers show rake mechanisms and flow patterns. Filters display media layers and backwash connections. Chemical dosing points have standardized symbols.

Severn Trent Water symbols encompass sewage treatment processes. Primary settlement tanks show scraper mechanisms. Activated sludge systems display aeration equipment. Digesters indicate gas collection and mixing systems.

Welsh Water symbols cover distribution network components. Pressure reducing valves show set point indications. Flow meters display totalizer connections. Chlorination points have specific symbols.

United Utilities symbols include network control elements. Telemetry outstations show communication links. Actuated valves indicate control interfaces. Reservoir level controls display operating ranges.

Northumbrian Water symbols address water quality monitoring. Sampling points show automated and manual types. Analyzer shelters indicate housed instrumentation. Quality parameter displays use standard formats.

### Symbol Conversion System
The one-click conversion system translates between water company standards. Mapping tables define equivalent symbols across standards. Properties transfer automatically during conversion. Non-mapped symbols are flagged for manual review.

Conversion preserves all connection points and flow paths. Tag numbering adapts to target standard conventions. Drawing notes update to reference the new standard. Conversion history tracks all changes made.

Batch conversion handles multiple drawings simultaneously. Preview mode shows changes before committing. Partial conversion allows mixed standards during transition. Rollback capability enables reverting if needed.

## Symbol Behaviors

### Intelligent Connection
Symbols exhibit intelligent behavior when connecting to other elements. Pipe connections automatically align to connection points within snap range. Multiple pipes can connect to the same point for manifold arrangements.

Connection validation prevents incompatible connections. Size mismatches generate warnings but allow override. Service incompatibilities flag for review. Pressure rating validation ensures system integrity.

Auto-routing selects appropriate path types based on connection types. Process lines route differently from instrument lines. Utility connections may use different line styles. Signal lines avoid crossing process pipes where possible.

### Rotation and Flipping
Symbols support rotation in 15-degree increments for precise positioning. Common rotations (90, 180, 270 degrees) are accessible through quick commands. Rotation maintains connection point relationships and text orientation.

Horizontal and vertical flipping creates mirror images for opposite-hand installations. Pumps commonly require flipping for suction orientation. Valves may flip to show actuator position. Text automatically adjusts to remain readable after flipping.

Custom rotation centers can be defined for complex symbols. Group rotation maintains relative positioning of elements. Connected pipes adjust automatically during rotation. Rotation history enables quick return to standard orientations.

### Dynamic Resizing
While maintaining standard proportions, symbols support resizing for different drawing scales. Aspect ratio locks prevent distortion during resize. Connection points scale proportionally with the symbol.

Text within symbols maintains readability through intelligent scaling. Small sizes may hide internal details while preserving outline. Large sizes reveal additional detail levels. Line weights adjust to maintain visibility at all scales.

Batch resizing updates multiple symbols simultaneously. Scale factors can be saved as presets. Different symbol categories may have different scaling rules. Print scaling ensures standard sizes on output.

### Grouping and Ungrouping
Complex symbols can be ungrouped to access individual elements. This enables customization of standard symbols for special cases. Ungrouped elements maintain their relationships through grouping metadata.

Modified symbols can be saved as custom variants. Custom symbols appear in user libraries for reuse. Sharing mechanisms distribute custom symbols across teams. Version control tracks symbol modifications.

Nested groups preserve hierarchy during ungrouping. Partial ungrouping exposes specific elements. Regrouping restores original configuration if unchanged. Group properties cascade to child elements appropriately.

## Symbol Libraries Organization

### Category Hierarchy
The symbol library organizes into logical categories and subcategories. Primary categories separate major equipment types. Secondary categories divide by specific functions. Search capabilities span all categories simultaneously.

Equipment categories include rotating equipment, static equipment, and package units. Piping categories separate valves, fittings, and specialties. Instrumentation follows ISA measurement and control classifications.

Custom categories can be added for project-specific needs. Frequently used symbols can be marked as favorites. Recently used symbols appear in a special category. Smart categories automatically populate based on usage patterns.

### Symbol Search and Filtering
Comprehensive search functionality helps users quickly find needed symbols. Search terms match against symbol names, descriptions, tags, and metadata. Fuzzy matching handles spelling variations and partial matches.

Advanced filters narrow results by properties like size, pressure rating, or material. Boolean operators combine multiple search criteria. Search history enables quick re-execution of common queries.

Visual search allows finding symbols by appearance. Users can sketch approximate shapes for matching. Similar symbol suggestions appear for selected symbols. Cross-reference tables link related symbols.

### Library Management
Symbol libraries can be imported from various sources. Standard libraries ship with the application. Industry libraries are available for download. Custom libraries can be created and shared.

Version control tracks library changes over time. New symbol additions are highlighted after updates. Deprecated symbols are marked but remain available. Migration tools update old symbols to new standards.

Access control restricts library modifications. Read-only libraries prevent accidental changes. Library validation ensures symbol integrity. Backup systems preserve library configurations.

## Performance Specifications

### Rendering Performance
Symbols must render quickly even in complex diagrams. Initial symbol display completes within 50 milliseconds. Zoom operations maintain 60fps with hundreds of symbols. Pan operations show no lag or stuttering.

Level of detail adjusts based on zoom level. Distant symbols use simplified representations. Close symbols show full detail. Text hides below readability thresholds.

Hardware acceleration utilizes GPU capabilities where available. Software rendering provides fallback for compatibility. Caching strategies minimize repeated rendering. Memory usage remains bounded regardless of symbol count.

### Interaction Responsiveness
Symbol selection responds within 16 milliseconds of click. Drag operations begin immediately without delay. Connection point highlighting appears instantly on approach. Property panel updates reflect selection without lag.

Batch operations handle multiple symbols efficiently. Select all operations complete quickly even with thousands of symbols. Global property changes propagate rapidly. Find and replace operations use optimized algorithms.

Background processing handles complex operations. Progress indicators show long-running tasks. Operations remain cancellable at any point. The interface stays responsive during processing.

### Library Loading
Symbol libraries load progressively for quick startup. Essential symbols load first for immediate use. Background loading continues for remaining symbols. Lazy loading defers unused category loading.

Symbol preview generation happens asynchronously. Thumbnail caching accelerates subsequent displays. Network libraries load with appropriate progress indication. Offline mode uses cached libraries when available.

Search indexing occurs in the background. Index updates handle library changes efficiently. Search performance remains constant regardless of library size. Memory constraints trigger appropriate cache management.