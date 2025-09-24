# Connection System and Edge Behaviors - Complete Specification

## Executive Summary
The connection system forms the backbone of P&ID diagrams, enabling intelligent linking between equipment, instruments, and piping components. This specification details draw.io's complete connection behavior, including edge types, routing algorithms, connection points, and validation rules. Every aspect must be replicated to ensure professional-grade P&ID creation capabilities.

## Connection Points System

### Connection Point Definition
Every shape in the diagram can have multiple connection points that define where edges can attach. These points are invisible by default but become visible as blue dots when hovering near them with a connection tool or while dragging connectors. Each connection point has a specific position relative to the shape's bounds, typically at cardinal and intercardinal positions.

Standard shapes have default connection points at the middle of each edge and at corners. Circular shapes have points at 45-degree intervals around the perimeter. Complex P&ID symbols have connection points at specific locations matching industry standards for inlet, outlet, and auxiliary connections.

Connection points carry metadata including connection type (input, output, bidirectional), size specifications for P&ID applications, pressure ratings, and compatible connection types. This metadata enables intelligent validation during connection creation.

### Dynamic Connection Points
Beyond fixed connection points, shapes support dynamic connection points that appear anywhere along their perimeter. When dragging a connector near a shape's edge, a temporary connection point appears at the nearest location. This allows flexibility while maintaining clean connection angles.

Dynamic points snap to preferred angles like 0, 45, and 90 degrees when near these positions. For rectangular shapes, dynamic points prefer edge midpoints and corners. Circular shapes create dynamic points at regular angular intervals. Custom shapes can define their own dynamic point behavior.

The system maintains a hierarchy where fixed connection points take precedence over dynamic ones. When both types are near the cursor, fixed points win. This ensures that standard connection locations are used when available while providing flexibility when needed.

### Connection Point Behaviors
Connection points exhibit intelligent behaviors during interaction. When hovering near a connection point, it enlarges and highlights to indicate availability. The highlight color indicates compatibility: green for valid connections, yellow for warnings, red for incompatible connections.

Multiple connectors can attach to a single connection point, creating junction scenarios. The point automatically manages spacing between multiple connected edges. For P&ID applications, connection points can enforce limits on the number of connections based on physical constraints.

Connection points can be configured as exclusive, allowing only one connection, or shared, permitting multiple connections. They can also be directional, accepting connections only from specific angles. This is crucial for maintaining proper flow representation in P&ID diagrams.

## Edge Types and Routing

### Straight Edges
Straight edges create direct lines between connection points. These are the simplest edge type but require careful placement to avoid overlapping other diagram elements. Straight edges work best for simple diagrams or when precise routing isn't critical.

The edge draws from the exact connection point on the source to the exact connection point on the target. No automatic routing or obstacle avoidance occurs. Users can add waypoints manually by clicking along the edge path to create bends.

Straight edges support all line styling options including solid, dashed, and dotted patterns. Arrow heads can be added to either or both ends. Labels position at the midpoint by default but can be moved along the edge.

### Orthogonal Edges
Orthogonal edges, also called Manhattan routing, create connections using only horizontal and vertical segments. This is the standard for P&ID diagrams as it represents piping runs accurately. The routing algorithm finds the optimal path with minimal bends.

The algorithm considers multiple path options and selects the one with fewest turns. It attempts to maintain consistent spacing from other edges and shapes. When multiple orthogonal edges run parallel, they automatically space themselves evenly.

Orthogonal routing intelligently handles obstacle avoidance. When a shape blocks the direct path, the edge routes around it. The system maintains minimum clearance distances from shapes. Users can influence routing by adding waypoints that the edge must pass through.

### Curved Edges
Curved edges use Bezier curves to create smooth connections. These are useful for representing flexible hoses, cables, or conceptual relationships. The curve automatically calculates to provide pleasing aesthetics while connecting the points.

Control points determine the curve shape and can be adjusted after creation. By default, the system generates control points that create gentle S-curves or C-curves as appropriate. The curve tangent at connection points aligns with the shape edge for smooth appearance.

Multiple curve styles are available including quadratic and cubic Bezier curves. The system can also generate arc segments for circular routing. Curved edges support the same styling options as other edge types.

### Smart Routing
Smart routing combines multiple routing strategies to find optimal paths. It begins with orthogonal routing but can introduce diagonal segments when beneficial. The algorithm considers diagram density, available space, and existing edges when determining routes.

The system maintains routing consistency across similar connections. Parallel pipes route with consistent spacing. Crossing points are minimized and clearly indicated. When crossings are unavoidable, edges can show jump-over symbols.

Smart routing responds to diagram changes dynamically. Moving connected shapes triggers rerouting to maintain optimal paths. Adding new shapes causes existing edges to reroute around them. The system preserves manual adjustments where possible while adapting to changes.

### Custom Edge Paths
Users can create completely custom edge paths using waypoint editing. Double-clicking on an edge adds a new waypoint at that location. Waypoints can be dragged to any position to create complex routing. This provides complete control when automatic routing isn't sufficient.

Waypoint behavior varies by edge type. Orthogonal edges maintain right angles between waypoint segments. Straight edges create direct lines between waypoints. Curved edges use waypoints as control points for the curve.

Custom paths can be saved as routing templates for reuse. Common routing patterns in P&ID diagrams can be standardized. Templates can include not just the path but also styling and properties.

## Connection Creation Process

### Interactive Connection Creation
Creating connections begins by selecting the connector tool or holding Ctrl while dragging from a shape. The cursor changes to a crosshair to indicate connection mode. Clicking on or near a connection point starts the connection.

As the mouse moves, a preview line shows the potential connection path. The preview updates in real-time following the selected routing style. Valid target connection points highlight when the cursor approaches them. Invalid targets show prohibition indicators.

The connection completes when clicking on a valid target point. If dropped in empty space, the connection ends with a dangling edge that can be connected later. Escape key cancels the connection creation at any time.

### Drag Connection Creation
Connections can also be created by dragging from connection points directly. Hovering over a connection point shows a special cursor indicating drag-connection is available. Dragging from this point starts creating a new edge.

This method is faster than using the connector tool for single connections. It automatically returns to selection mode after creating the connection. The routing style uses the current default or the last used style.

During drag connection, the same validation and preview features apply. The connection point being dragged from remains highlighted. Other compatible connection points are emphasized as the cursor moves.

### Quick Connection Mode
Quick connection mode enables rapid creation of multiple connections. After creating one connection, the tool remains active for the next connection. This continues until explicitly exiting the mode.

In this mode, clicking existing edges creates junction points automatically. New edges can branch from any point along existing edges. This is particularly useful for creating distribution networks or instrumentation connections.

The mode maintains consistent styling across all created connections. Property inheritance ensures new connections match the context. Validation rules apply continuously to prevent invalid networks.

### Auto-Connection Features
Auto-connection activates when dropping shapes near existing elements. If a compatible connection point is within range, the connection creates automatically. This speeds up diagram creation significantly.

The auto-connection range is configurable but defaults to 20 pixels. Visual feedback shows when auto-connection will occur during dragging. Users can disable auto-connection temporarily by holding Alt.

Auto-connection intelligence considers connection types and compatibility. It prioritizes the most logical connections based on shape types. For P&ID symbols, it connects process flows before utility connections.

## Connection Validation

### Type Compatibility
The system validates connection compatibility based on connection point types. Process connections only connect to other process connections. Instrument connections require appropriate signal types. Electrical connections validate voltage and phase compatibility.

Validation rules are configurable per project or organization. Standard rule sets exist for common industries. Custom rules can be defined for specific requirements. Validation can be warning-only or blocking.

When validation fails, clear messages explain the issue. Suggestions for resolution are provided where possible. Override options exist for cases where rules need exceptions. All overrides are logged for review.

### Size and Rating Validation
For P&ID applications, connections validate pipe sizes and pressure ratings. Size mismatches generate warnings with reduction requirements. Pressure rating incompatibilities flag safety concerns. Material compatibility checks prevent corrosion issues.

The validation system understands standard pipe schedules and sizing. It can suggest appropriate reducers or adapters. Calculation of pressure drops across size changes is available. Integration with engineering calculations provides real-time validation.

Size validation considers flow direction and requirements. Pump suction lines validate for NPSH requirements. Control valve connections check for proper sizing. Relief valve outlets ensure adequate discharge capacity.

### Flow Direction Validation
Connections maintain flow direction consistency throughout the network. Pumps, compressors, and other equipment enforce flow direction. Check valves prevent reverse flow in connections. Flow arrows automatically align with established direction.

The system can analyze entire flow networks for consistency. Dead ends and isolated sections are identified. Flow loops are detected and highlighted. Mass balance validation ensures flow conservation.

Bidirectional flows are supported where appropriate. Flow reversal scenarios can be modeled. Multiple operating cases can be validated independently. Flow direction can be locked to prevent changes.

## Edge Styling and Appearance

### Line Styles
Edges support comprehensive line styling options. Solid lines represent primary process flows. Dashed lines indicate future or optional connections. Dotted lines show instrumentation signals. Custom dash patterns can be defined for special purposes.

Line weight varies from hairline to thick pipes. Standard weights correspond to pipe sizes in P&ID diagrams. Color coding differentiates services like steam, water, or chemicals. Gradient colors can show flow direction or pressure changes.

Special line styles include double lines for insulated pipes, lines with center lines for traced pipes, and hatched lines for underground pipes. Each style maintains clarity at different zoom levels.

### Arrow Heads and Markers
Extensive arrow head options indicate flow direction and connection type. Standard arrows show normal flow direction. Filled arrows indicate primary flow paths. Open arrows represent secondary flows. Double arrows show bidirectional flow.

Special markers include circles for instrumentation connections, diamonds for control points, squares for isolation points, and crosses for terminals. Markers can appear at start, end, or middle of edges. Multiple markers can be combined on a single edge.

Marker size scales appropriately with line weight. Colors can differ from the line color for emphasis. Custom markers can be created for specialized applications. Markers maintain orientation during edge rerouting.

### Edge Labels
Edges support multiple labels at different positions. Labels can be positioned at start, middle, or end of edges. They can be offset from the line for clarity. Rotation can be automatic or manual.

Label content includes line numbers for P&ID diagrams, flow rates and properties, material specifications, and insulation requirements. Labels support rich text formatting. Background colors improve readability.

Labels maintain readability during zoom operations. They avoid overlapping other labels automatically. Label positioning adjusts during edge rerouting. Multiple label styles can be defined and applied.

## Waypoint Management

### Waypoint Creation and Editing
Waypoints define the path that edges follow between connection points. Double-clicking on an edge creates a new waypoint at that location. Waypoints appear as small squares when the edge is selected.

Dragging waypoints modifies the edge path in real-time. Snap-to-grid affects waypoint positioning. Guidelines appear when waypoints align with other elements. Multiple waypoints can be selected and moved together.

Waypoint deletion occurs through selection and delete key. Double-clicking existing waypoints also removes them. The edge automatically smooths the path after waypoint removal. Undo operations restore deleted waypoints.

### Waypoint Behaviors
Different edge types handle waypoints differently. Orthogonal edges maintain right angles at waypoints. Straight edges create direct segments between waypoints. Curved edges use waypoints as control points.

Waypoints can be locked to prevent accidental movement. Locked waypoints show different visual indicators. Bulk operations can lock or unlock multiple waypoints. Locked waypoints still allow edge styling changes.

Smart waypoint adjustment maintains edge clarity. When shapes move, waypoints adjust to prevent overlaps. Waypoint optimization removes unnecessary points. Manual waypoint adjustments are preserved when possible.

### Segment Properties
Individual edge segments between waypoints can have different properties. This enables varied line styles within a single connection. Partial insulation or heat tracing can be represented. Different flow conditions in segments can be shown.

Segment selection occurs by clicking between waypoints. Selected segments highlight for editing. Properties apply to selected segments only. Segment properties override edge defaults.

Segment-level validation ensures consistency. Incompatible segment properties are prevented. Transitions between segments render smoothly. Segment properties export correctly to various formats.

## Connection Interactions

### Edge Selection
Edges are selected by clicking anywhere along their path. Selection tolerance ensures easy selection even for thin lines. Multiple edges can be selected using Shift+click or Ctrl+click. Rectangle selection includes edges that intersect the selection area.

Selected edges show selection indicators at waypoints. The entire edge highlights with a selection color. Properties panel updates to show edge properties. Context menus provide edge-specific operations.

Edge selection respects layer visibility and locking. Edges on hidden layers cannot be selected. Locked edges show different selection indicators. Selection through edges selects underlying elements.

### Edge Modification
Selected edges can be modified in multiple ways. The Delete key removes selected edges completely. Style changes apply to all selected edges simultaneously. Property modifications update connected elements appropriately.

Edge reversal swaps source and target connections. This updates flow directions and arrow heads. Connected elements may update based on reversal. Validation runs after reversal to ensure consistency.

Edge splitting creates junction points for branching. The split point becomes a new waypoint. New edges can connect at split points. Split operations are undoable as a unit.

### Connection Rerouting
Edges can be rerouted by dragging their endpoints to different connection points. The source or target can be changed independently. During endpoint dragging, valid targets highlight. The edge path updates continuously during dragging.

Rerouting validates the new connection before completing. Invalid reroutes are prevented with clear feedback. The edge maintains its properties during rerouting. Waypoints adjust intelligently to the new path.

Batch rerouting handles multiple edges simultaneously. Pattern-based rerouting updates similar connections. Global rerouting optimizes all edges in the diagram. Manual routes can be protected from automatic rerouting.

## Advanced Connection Features

### Junction Points
Junction points allow multiple edges to connect at a single location. They appear as dots where edges meet. Junction points can be created explicitly or form automatically when edges cross.

Different junction styles indicate different physical configurations. Tee junctions show three-way connections. Cross junctions indicate four-way connections. Welded junctions differ from mechanical connections.

Junction points can have properties like size and type. They participate in validation like other connections. Junction points can be converted to proper fitting symbols. They maintain connectivity during diagram modifications.

### Edge Bundling
Multiple edges following similar paths can be bundled for clarity. Bundled edges appear as a single thick line with multiplicity indicators. Individual edges can be extracted from bundles when needed.

Automatic bundling identifies edges with common paths. Manual bundling allows user-defined groupings. Bundle properties aggregate from constituent edges. Bundles can be styled distinctly from regular edges.

Bundle management includes splitting and merging operations. Partial bundles handle edges that diverge midway. Bundle labels show constituent edge information. Bundles improve performance for dense diagrams.

### Connection Bridges
When edges cross, bridge symbols can show which edge passes over. Bridge styles include arc jumps, gaps, and none. Bridge size and style are configurable. Automatic bridge placement follows consistent rules.

Bridge rendering considers edge importance and direction. Process lines typically bridge over instrument lines. Bridge direction can be manually overridden. Multiple crossing edges create nested bridges.

Bridge visibility can be toggled globally or per edge. Print and export settings control bridge appearance. Bridge rendering maintains clarity at all zoom levels. Performance optimizations handle many bridges efficiently.

## Performance Optimization

### Rendering Performance
Edge rendering must maintain 60fps even with hundreds of connections. Level-of-detail adjustments simplify edges when zoomed out. GPU acceleration utilizes hardware where available. Caching strategies minimize recalculation.

Viewport culling only renders visible edges. Edge simplification reduces point count for complex paths. Batch rendering combines similar edges. Progressive rendering prioritizes important edges.

Memory management prevents edge data accumulation. Unused edge data is cleaned up promptly. Edge updates trigger minimal rerendering. Change detection optimizes update cycles.

### Routing Performance
Path calculation must complete within 100ms for typical connections. Complex routing uses progressive algorithms. Cached routes avoid recalculation when possible. Background routing handles complex scenarios.

Routing parallelization utilizes multiple CPU cores. Approximate routing provides quick previews. Final routing refines the path accurately. Routing cancellation prevents long calculations.

Batch routing optimizes multiple simultaneous connections. Incremental routing updates only affected edges. Routing quality adjusts based on diagram complexity. Performance monitoring identifies bottlenecks.

### Interaction Responsiveness
Edge selection must respond within 16ms of clicking. Waypoint dragging maintains smooth 60fps movement. Preview generation during connection creation is instantaneous. Property updates reflect immediately in the diagram.

Touch interactions receive appropriately sized hit targets. Gesture recognition responds quickly to user input. Multi-touch edge operations work smoothly. Stylus input enables precise edge editing.

Batch operations on multiple edges remain responsive. Long-running operations show progress indicators. Operations can be cancelled at any point. The interface remains responsive during processing.