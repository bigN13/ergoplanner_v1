# Drag and Drop Behaviors - Complete Specification

## Executive Summary
The drag and drop system is fundamental to the drawing experience, enabling users to add shapes from the stencil library to the canvas, move elements within the canvas, and create connections between components. This specification details every aspect of draw.io's drag and drop implementation to ensure perfect replication in the ReactFlow-based system.

## Drag Sources and Targets

### Valid Drag Sources
The system recognizes multiple sources from which drag operations can originate. Each source has specific behaviors and rules that govern how the drag operation proceeds.

**Stencil Library Shapes**: Any shape tile in the left sidebar can be dragged. These represent template shapes that create new instances on the canvas when dropped. The original shape remains in the sidebar after dragging.

**Canvas Elements**: Existing shapes, groups, and connectors on the canvas can be dragged to new positions. These operations move or copy existing elements rather than creating new ones. Selection state affects whether single or multiple elements are dragged.

**External Files**: The system accepts dragged files from the operating system, including images, SVG files, and other supported formats. These create new elements on drop based on file type.

**Text Selections**: Text dragged from external applications creates text shapes. Rich text maintains basic formatting where supported. Plain text creates simple text nodes with default styling.

**URL Drops**: URLs dragged from browser address bars or links create shapes with embedded hyperlinks. The system can optionally fetch preview data for certain URL types.

### Valid Drop Targets

**Main Canvas**: The primary drawing area accepts all draggable elements. Grid snapping applies based on current settings. Elements position relative to the drop point and grid.

**Container Shapes**: Certain shapes like swimlanes, tables, and groups accept drops within their bounds. Dropped elements become children of the container. Containers may enforce layout rules on children.

**Connection Points**: Dropping connectors near connection points creates automatic connections. Visual feedback indicates when connection will occur. Connection validation rules apply based on element types.

**Tabs and Pages**: Multi-page documents accept drops on page tabs to move elements between pages. Cross-page references are maintained when moving connected elements.

**Forbidden Zones**: Certain areas reject drops, such as UI panels, toolbars, and locked layers. Clear visual feedback indicates when dropping is not allowed. Elements return to original position if dropped in forbidden zones.

## Drag Initiation Phase

### Mouse-Based Initiation
Drag operations begin when the user presses the mouse button on a draggable element and moves the cursor beyond a threshold distance. The threshold prevents accidental drags from small movements or clicks.

The system captures the initial mouse position and element position at drag start. This information enables accurate positioning during the drag and potential cancellation. A drag preview appears immediately once the threshold is exceeded.

For stencil shapes, the drag begins with zero delay for immediate responsiveness. Canvas elements may have a small delay to distinguish between selection clicks and drag intentions. The cursor changes to indicate dragging is in progress.

### Touch-Based Initiation
Touch devices require a longer press duration to initiate dragging, preventing conflicts with scrolling gestures. The touch point must remain relatively stationary during the press delay. Visual feedback indicates when the element becomes draggable.

Once initiated, touch dragging follows similar patterns to mouse dragging. The drag preview appears offset from the touch point to remain visible under the finger. Multi-touch is disabled during drag operations to prevent complications.

### Keyboard-Assisted Dragging
While primarily a mouse/touch operation, keyboard modifiers enhance dragging functionality. Holding Shift during drag constrains movement to horizontal or vertical axes. Control/Command indicates copy instead of move operations. Alt temporarily disables snapping for precise positioning.

These modifiers can be pressed or released during the drag operation. Visual indicators show which modifiers are active. The cursor updates to reflect the modified operation type.

## Drag Preview System

### Visual Preview Generation
The drag preview provides visual feedback about what is being dragged. For single shapes, the preview is a semi-transparent copy of the shape. For multiple selections, the preview shows all selected elements with relative positioning preserved.

The preview maintains the original element's styling but with reduced opacity. This allows users to see both the dragged content and the canvas beneath. The opacity level is carefully chosen to balance visibility and transparency.

Complex elements may use simplified previews for performance. Text-heavy shapes might show placeholder text. Large images may use lower resolution versions during dragging.

### Preview Positioning
The preview follows the cursor position but with intelligent offset handling. For stencil shapes, the preview centers on the cursor for intuitive placement. Canvas elements maintain their grab point offset to prevent jumping.

The preview respects canvas boundaries when near edges. Edge scrolling activates when the preview approaches canvas borders. The preview may scale down if the dragged content is very large.

Rotation indicators appear when rotation modifiers are active. Grid alignment guides show when snapping will occur. Connection point highlights appear when near compatible targets.

### Performance Optimization
The preview system uses efficient rendering techniques to maintain smooth 60fps animation. Hardware acceleration is employed where available. Complex shapes may use cached representations.

Preview updates throttle to prevent excessive recalculation. Only essential visual updates occur during rapid movement. The system prioritizes responsiveness over perfect preview accuracy.

Memory management ensures previews don't cause performance degradation. Unused preview data is cleaned up promptly. The system gracefully degrades preview quality if performance issues arise.

## During Drag Behavior

### Canvas Feedback
As the drag proceeds over the canvas, various visual feedback systems activate. Grid lines may appear or intensify to show alignment points. Guide lines emerge when the dragged element aligns with existing shapes.

Smart guides show distances between elements. Alignment indicators appear for center, edge, and distribution alignment. These guides use distinct colors to differentiate alignment types.

The canvas may dim slightly to emphasize the drag operation. Potential drop zones highlight when the cursor enters them. Invalid areas show prohibition indicators or red tinting.

### Auto-Scrolling
When dragging near canvas edges, auto-scrolling activates to reveal more canvas area. The scroll speed increases with proximity to the edge. Diagonal scrolling occurs when near corners.

Auto-scrolling respects maximum canvas bounds if set. The scrolling is smooth and predictable, avoiding jarring movements. Users can control scroll speed through preferences.

Scrolling pauses briefly when the cursor stops moving, allowing precise edge positioning. The preview remains visible during scrolling operations. Scroll indicators show direction and speed.

### Connection Detection
The system continuously checks for nearby connection points during dragging. Compatible connection points highlight when within detection range. The detection range adapts based on zoom level for consistent behavior.

Connection preview lines appear showing potential connections. These previews use distinctive styling to differentiate from existing connections. Invalid connections show different visual feedback.

Multiple potential connections may be indicated simultaneously. The nearest valid connection point takes precedence. Connection type compatibility is validated in real-time.

### Collision Detection
When dragging elements, collision detection prevents overlapping in certain contexts. Container boundaries enforce containment rules. Some elements may push aside others when dropped.

Collision feedback appears before the drop occurs. Red highlights or boundaries indicate collision conflicts. The system may suggest alternative positions to resolve conflicts.

Different element types have different collision rules. Text may flow around shapes in some contexts. Connectors route around obstacles automatically.

## Drop Execution Phase

### Drop Validation
Before accepting a drop, the system validates the operation. Target compatibility is checked based on element and target types. Business rules may prevent certain combinations.

User permissions are verified for the target location. The target may have capacity limits or other constraints. Validation failures trigger appropriate error messages.

The validation occurs quickly to maintain responsive feel. Results are cached when possible for efficiency. Fallback behaviors exist for validation failures.

### Element Creation/Movement
On successful drop, the appropriate action executes. For stencil shapes, new elements are created with unique identifiers. For canvas elements, positions update in the model.

New elements receive default properties from their templates. Positions snap to grid if snapping is enabled. Container relationships are established for drops into containers.

The operation is atomic - either fully succeeds or fully fails. Partial states are prevented through transaction management. The model updates trigger appropriate view refreshes.

### Auto-Connection Execution
When dropping near connection points, auto-connection may occur. The system creates appropriate connector elements. Connection properties are set based on connected element types.

Existing connections may be rerouted to accommodate new elements. Connection validation ensures only valid connections are created. The user can override auto-connections if needed.

Connection creation is integrated with the undo system. Both the element and its connections can be undone together. Connection styles match the current theme and preferences.

### Post-Drop Selection
After successful drop, selection behavior follows predictable patterns. Newly created elements become selected automatically. Moved elements maintain their selection state.

Multi-element drops select all dropped elements. The property panel updates to show selected element properties. Tools and menus enable based on selection.

Selection feedback appears immediately after drop. Resize handles and rotation controls activate. The canvas focus ensures keyboard commands work immediately.

## Modifier Key Behaviors

### Shift Key Modifications
Holding Shift during drag constrains movement to 45-degree angles. This enables perfect horizontal, vertical, or diagonal movement. The constraint activates dynamically during drag.

For shape drops, Shift rotates the shape in 90-degree increments. Each Shift press rotates further while dragging. The rotation preview updates in real-time.

Shift-drag from stencils may create multiple copies in a line. The spacing between copies is consistent and configurable. This enables rapid creation of repeated elements.

### Control/Command Key Modifications
Control (Windows/Linux) or Command (Mac) indicates copy operations. The original element remains in place while a copy is created. Visual feedback shows the copy operation with a plus badge.

For multi-selections, all selected elements are copied together. Relative positioning is preserved in the copies. The copies receive new unique identifiers.

This modifier can be toggled during the drag operation. The preview updates to show copy or move mode. The cursor changes to indicate the current mode.

### Alt/Option Key Modifications
Alt (Windows/Linux) or Option (Mac) disables snapping temporarily. This allows precise positioning between grid points. All alignment guides are suppressed while Alt is held.

Alt-drag may also trigger special behaviors for certain shapes. Symmetric shapes might maintain center point while resizing. Connectors might create waypoints when Alt-dragging.

The Alt key state is clearly indicated in the UI. Status bar text may show "Snapping disabled" while active. The behavior reverts immediately when Alt is released.

### Combined Modifiers
Multiple modifiers can be combined for complex operations. Shift+Control creates constrained copies. Alt+Shift allows precise constrained movement.

The system prioritizes modifiers when conflicts exist. Clear documentation explains modifier combinations. Visual feedback indicates all active modifiers.

Some combinations may be reserved for system functions. The application prevents conflicting shortcuts. Context determines which combinations are available.

## Multi-Element Drag Operations

### Selection Group Dragging
When multiple elements are selected, dragging moves them as a group. The group maintains relative positioning between elements. All elements move the same distance and direction.

The drag preview shows all selected elements. Performance optimizations may simplify the preview for large selections. A count badge indicates the number of elements being dragged.

Group dragging respects individual element constraints. If any element cannot be placed, the entire operation may fail. Clear feedback indicates which element causes issues.

### Maintaining Relationships
Connected elements maintain their connections during group drags. Connectors automatically reroute to preserve connections. Connection points move with their parent elements.

Hierarchical relationships are preserved during movement. Children move with their parent containers. Grouped elements remain grouped after movement.

The system prevents breaking critical relationships. Warnings appear if operations would damage the diagram structure. Users can override warnings if necessary.

### Distribution During Drop
Multi-element drops from the stencil can use special distribution patterns. Grid distribution places elements in rows and columns. Line distribution creates evenly spaced sequences.

Circle distribution arranges elements in circular patterns. Custom distributions can be defined through settings. Distribution previews show the final arrangement before drop.

Spacing and alignment are configurable for distributions. The distribution can be modified after initial drop. Smart distribution analyzes canvas space for optimal placement.

## Special Drag Scenarios

### Cross-Page Dragging
Elements can be dragged between pages in multi-page documents. Page tabs highlight when hovering with dragged elements. A preview pane may show the target page during hover.

The system maintains element IDs across pages. Connected elements may prompt to move connections too. Cross-references update automatically after cross-page moves.

Undo operations work correctly across pages. The view switches to the target page after drop. Navigation history tracks cross-page operations.

### External Application Drops
Content dragged from external applications requires special handling. Images are converted to appropriate format on drop. Text is parsed and formatted based on source application.

Files are processed based on their type and content. Unsupported formats show clear error messages. Large files may show progress during processing.

Security validations prevent malicious content. Sandboxing protects against dangerous operations. User consent may be required for certain content types.

### Template and Library Drops
Dropping template sets creates multiple related elements. The template structure is preserved on canvas. Relative positioning and connections are maintained.

Library elements may include complex behaviors. Scripts or constraints may be part of library items. The system validates library compatibility on drop.

Custom libraries can define special drop behaviors. Documentation accompanies library elements. Version compatibility is checked for library items.

## Error Handling and Recovery

### Drop Failure Scenarios
When drops fail, clear feedback explains the reason. Elements return to their original position smoothly. No partial states remain after failed drops.

Common failure reasons include permission issues, validation failures, and capacity limits. Each failure type has specific error messages. Users receive actionable guidance for resolution.

The undo system doesn't record failed operations. Canvas state remains consistent after failures. Retry is possible immediately after failure.

### Recovery Mechanisms
The system provides multiple recovery options for drag operations. Escape key cancels drags in progress. Dropping outside valid areas cancels the operation.

Undo immediately reverses successful but unwanted drops. Multiple undo levels allow reverting complex operations. Redo is available if undo was mistaken.

Auto-save prevents loss of work during system issues. Recovery mode can restore from recent states. Crash recovery preserves as much work as possible.

### Conflict Resolution
When drops create conflicts, resolution options are presented. Users can choose to replace existing elements. Merging may be available for compatible elements.

Automatic conflict resolution uses configurable rules. Smart placement finds alternative positions. User preferences guide automatic resolution.

Conflicts are logged for later review. Patterns in conflicts inform system improvements. Training materials address common conflict scenarios.

## Performance Optimization

### Drag Performance Targets
Drag operations must maintain 60fps smooth animation. Preview generation completes within 16ms. Drop validation executes in under 50ms.

Large element groups drag without stuttering. Complex shapes use optimized preview rendering. Memory usage remains bounded during operations.

Performance scales linearly with element count. The system degrades gracefully under load. User experience remains responsive even with thousands of elements.

### Optimization Techniques
Preview caching reduces repeated rendering. Viewport culling limits processed elements. Hardware acceleration is used where available.

Drag operations use request animation frame for smoothness. Calculations are minimized during drag movement. Complex operations defer until drop completion.

Memory pools prevent allocation overhead. Unused resources are released promptly. The system monitors and reports performance metrics.

### Progressive Enhancement
Basic drag functionality works on all supported browsers. Enhanced features activate based on capabilities. Performance features enable on capable hardware.

The system adapts to device limitations automatically. Mobile devices may use simplified previews. Low-end devices receive optimized experiences.

Feature detection ensures compatibility. Polyfills provide missing functionality where possible. Graceful degradation maintains core usability.

## Accessibility Considerations

### Keyboard Alternatives
All drag operations have keyboard equivalents. Cut/copy/paste provides element movement. Arrow keys with modifiers allow precise positioning.

Tab navigation reaches all draggable elements. Enter or Space keys initiate element actions. Context menus provide movement options.

Keyboard shortcuts are discoverable and customizable. Documentation covers keyboard-only workflows. Training emphasizes accessible techniques.

### Screen Reader Support
Drag operations are announced to screen readers. Source and target information is provided. Success and failure states are communicated.

Alternative text describes drag operations. ARIA attributes indicate draggable elements. Live regions announce drag progress.

Screen reader users can complete all tasks. Documentation includes screen reader guides. Testing validates screen reader compatibility.

### Visual Accommodations
High contrast modes remain functional during drags. Color is not the sole indicator of drag states. Focus indicators are clearly visible.

Drag previews respect reduced motion preferences. Alternative feedback replaces motion when needed. Static indicators show drag progress.

Large cursor options work with drag operations. Zoom doesn't interfere with drag functionality. Visual aids can be enabled for precision.