# Left Sidebar Stencil System - Complete Specification

## Executive Summary
The left sidebar is the primary interface for accessing and organizing shapes, symbols, and stencils in the drawing application. It provides a searchable, categorized library of draggable elements that users can add to their canvas. This component is critical for user productivity and must maintain exact parity with draw.io's implementation. The sidebar must be implemented as a dockable, resizable panel that can be repositioned, collapsed, or detached as a floating window.

## Visual Design Requirements

### Container Specifications
The sidebar occupies the left side of the application window with a fixed position. It maintains a default width of 240 pixels but supports user resizing between 120 and 400 pixels. The sidebar extends from below the main toolbar to the bottom of the viewport, creating a full-height panel for maximum content visibility.

The sidebar features a subtle right border to visually separate it from the canvas area. A resize handle on the right edge becomes visible on hover, changing color to indicate it's interactive. The entire sidebar maintains a white background in light theme and dark gray in dark theme, ensuring optimal contrast with the shapes displayed within.

### Layout Structure
The sidebar consists of four primary zones arranged vertically:

**Search Zone**: Located at the top, this zone contains the search input field with an embedded search icon. It remains fixed when scrolling the content below.

**Category Navigation Zone**: Displays collapsible category headers that organize shapes into logical groups. Each category can be expanded or collapsed independently.

**Shape Display Zone**: The main content area showing shape tiles in a responsive grid layout. This zone is scrollable when content exceeds viewport height.

**Scratchpad Zone**: An optional collapsible panel at the bottom for temporary shape storage during diagram creation.

## Search Functionality

### Search Bar Behavior
The search bar provides instant, real-time filtering of all available shapes across all categories. As users type, the system performs substring matching against shape names, tags, and keywords. The search is case-insensitive and begins filtering after the first character is entered.

Search results appear immediately, with matching shapes highlighted and non-matching shapes hidden. Categories automatically collapse if they contain no matching shapes, while categories with matches expand to show results. The match count appears next to each category name in parentheses.

A clear button appears when text is present, allowing users to quickly reset the search. The search field maintains focus after clearing, enabling rapid successive searches. Keyboard navigation with arrow keys allows movement through search results without using the mouse.

### Search Result Presentation
Matching shapes remain in their original categories but non-matching shapes are hidden. The system highlights the matching text portion within shape labels when visible. Empty categories collapse automatically but maintain their header visible with a zero count indicator.

The search preserves the user's scroll position when possible, though it adjusts if the current position would show empty space. Performance remains smooth even with hundreds of shapes, using efficient filtering algorithms.

## Category System

### Category Hierarchy
Categories follow a two-level hierarchy with main categories and optional subcategories. Main categories include General, Engineering, Software, Miscellaneous, and custom user categories. Each main category can contain multiple subcategories for further organization.

The Recently Used category appears first when it contains items, showing up to 20 most recently used shapes. This special category updates dynamically as users work, with newest items appearing first.

### Category Headers
Each category header displays an expand/collapse arrow indicator that rotates smoothly when toggled. The category name appears in bold text with a slightly larger font size than shape labels. When collapsed, the header shows the count of contained shapes in gray text.

Headers respond to hover with a subtle background color change, indicating they're interactive. Clicking anywhere on the header toggles the expansion state. The expansion state persists across sessions, remembering user preferences.

### Category Management
Categories load in a predefined order but users can customize visibility through settings. Custom categories can be added for organization-specific needs. Categories can be hidden if not relevant to the user's work.

The system supports lazy loading of category contents for performance, especially important for large symbol libraries. Search operations load all categories to ensure comprehensive results.

## Shape Library

### Shape Tile Presentation
Each shape appears in a square tile with consistent dimensions. The shape rendering centers within the tile, maintaining aspect ratio. Shapes use black strokes and white fills by default, with some exceptions for specific symbol types.

Tiles feature rounded corners and a subtle border that becomes prominent on hover. The hover state includes a slight scale increase and shadow effect, providing clear feedback. The cursor changes to indicate the shape is draggable.

### Grid Layout System
Shapes arrange in a responsive grid that adjusts column count based on sidebar width. The grid maintains consistent spacing between tiles both horizontally and vertically. Partial rows align to the left, maintaining the grid structure.

The layout recalculates smoothly when the sidebar is resized, without jarring repositioning. Shapes maintain their order within categories regardless of grid changes. The system uses virtualization for large shape libraries, rendering only visible tiles.

### Shape Metadata
Each shape carries hidden metadata including its unique identifier, category assignment, tags for search, default size for canvas placement, connection point definitions, and style properties. This metadata travels with the shape during drag operations.

Shape labels appear as tooltips on hover after a brief delay, preventing visual clutter. Labels use sentence case and clear, descriptive names. Technical shapes include standard reference numbers where applicable.

## Drag and Drop System

### Drag Initiation
Dragging begins immediately on mouse down without delay, providing instant feedback. The system creates a semi-transparent copy of the shape that follows the cursor. The original shape in the sidebar reduces opacity to indicate it's being dragged.

The drag preview maintains the shape's aspect ratio and approximate size. As the cursor moves over the canvas, the system provides visual feedback about valid drop locations. Grid snap indicators appear when over the canvas, showing where the shape will align.

### During Drag Operations
The cursor changes to indicate the current drag state: grab cursor while dragging, not-allowed cursor over invalid drop zones, copy cursor when holding modifier keys. 

Connection points on existing shapes highlight when the dragged shape comes near, indicating potential auto-connections. The canvas shows a subtle grid overlay in the drop zone area. Invalid drop areas may show a red tint or prohibition indicator.

### Drop Behavior
On successful drop, the shape snaps to the nearest grid point for alignment. The system checks for nearby connection points and auto-connects if within threshold distance. The new shape receives a unique ID and becomes part of the diagram model.

The shape selection transfers to the newly created shape, ready for immediate editing. Properties panels update to show the new shape's settings. The undo system registers the addition for easy reversal.

When dropping with modifier keys: Shift rotates the shape by 90 degrees before placement, Ctrl creates a copy while keeping the original in place, Alt disables grid snapping for precise placement.

### Multi-Shape Operations
Users can select multiple shapes from the library using Shift+click for sequential selection. Selected shapes show a blue border and a count badge. When dragging multiple shapes, they maintain relative positioning.

On drop, multiple shapes arrange in a grid pattern by default, with consistent spacing. The arrangement can be modified through settings or keyboard modifiers during drop.

## Scratchpad Functionality

### Purpose and Usage
The scratchpad provides temporary storage for frequently used shapes during a drawing session. It appears as a collapsible panel at the bottom of the sidebar. Users can drag shapes to the scratchpad for quick access without searching.

The scratchpad persists during the session but clears when the application closes. It supports the same drag and drop operations as the main shape library. Shapes in the scratchpad can be reordered by dragging within the panel.

### Scratchpad Interface
The panel header shows "Scratchpad" with an item count and expand/collapse control. When collapsed, only the header is visible, preserving vertical space. When expanded, it shows shapes in a single row with horizontal scrolling if needed.

A clear button allows removing all shapes from the scratchpad at once. Individual shapes can be removed by right-clicking and selecting remove. The scratchpad supports up to 50 shapes before requiring removal of old items.

## Interaction Patterns

### Mouse Interactions
Left-click on category headers toggles expansion. Left-click and drag on shapes initiates drag and drop. Right-click on shapes opens a context menu with options like "Add to Scratchpad" or "Add to Favorites". Double-click on a shape adds it to the canvas at default position.

Hover states provide visual feedback for all interactive elements. The scroll wheel scrolls the shape library when the mouse is over it. Middle-click and drag allows panning within the sidebar if content exceeds viewport.

### Keyboard Navigation
Tab key moves focus through sidebar elements in logical order. Arrow keys navigate between shapes when shape library has focus. Enter key on a focused shape adds it to canvas. Space bar on category headers toggles expansion.

Escape key cancels drag operations in progress. Type-ahead searching focuses the search bar and begins filtering. Keyboard shortcuts maintain consistency with overall application patterns.

### Touch Interactions
Touch and drag initiates shape dragging similar to mouse interaction. Long press on shapes opens context menu. Pinch gestures in the sidebar area could resize the sidebar width. Swipe gestures scroll the content vertically.

Touch targets meet minimum size requirements for accessibility. Multi-touch is disabled to prevent accidental actions. Touch feedback includes visual highlighting of touched elements.

## Performance Considerations

### Loading and Rendering
The sidebar implements lazy loading for shape categories, loading only visible content initially. Shape rendering uses efficient SVG caching to prevent repeated parsing. Virtualization ensures only visible shapes are rendered in the DOM.

Search operations use optimized algorithms for real-time filtering. The system maintains responsive interaction even with thousands of shapes. Memory management includes clearing unused shape data periodically.

### State Management
The sidebar maintains its own state including category expansion states, search query, scroll position, scratchpad contents, and recently used items. This state persists appropriately, with some elements saved across sessions.

State updates trigger minimal re-renders for performance. The system uses immutable data structures for efficient change detection. Event handlers are optimized to prevent excessive firing during interactions.

## Accessibility Requirements

### Screen Reader Support
All interactive elements include appropriate ARIA labels and roles. Category headers announce expansion state changes. Shape counts are announced when categories expand or collapse. Search results announce the number of matches found.

The sidebar structure uses semantic HTML with proper heading hierarchy. Navigation landmarks help screen reader users understand the layout. Focus management ensures logical tab order through elements.

### Keyboard Accessibility
All sidebar functions are accessible via keyboard alone. Focus indicators clearly show the current focused element. Keyboard shortcuts are discoverable and consistent. Modal dialogs from the sidebar trap focus appropriately.

Skip links allow jumping to main content areas quickly. The sidebar can be collapsed/expanded via keyboard command. All drag and drop operations have keyboard alternatives.

### Visual Accessibility
The sidebar maintains sufficient color contrast ratios for all text and icons. The interface remains usable when browser zoom is increased to 200%. Color is not the sole indicator of any state or function. High contrast mode support ensures visibility for users with visual impairments.

Focus indicators use multiple visual cues beyond color alone. Animations respect user preferences for reduced motion. Text remains readable at minimum font sizes.

## Integration Points

### Canvas Integration
The sidebar communicates with the canvas for drag and drop operations, sending shape data during drags. It receives feedback about valid drop zones and connection points. The canvas notifies the sidebar of successful drops for recently used tracking.

The sidebar updates when shapes are selected on canvas to show properties. It can highlight the source category of selected shapes. Search can be triggered from canvas operations needing specific shapes.

### Property Panel Integration
Dropping a shape updates the property panel to show its settings. The sidebar can trigger property panel tabs based on shape type. Property changes may update sidebar representation of custom shapes.

The sidebar respects property panel space when both are visible. Coordinated animations occur when panels open or close. State synchronization ensures consistency across panels.

### Menu Integration
File menu operations may affect available shape libraries. Edit menu commands like "Insert Shape" can open sidebar categories. View menu controls sidebar visibility and position. Tools menu may add custom shapes to the sidebar.

The sidebar registers its keyboard shortcuts with the global shortcut system. Menu commands can trigger sidebar search with predefined queries. Import operations can add new shape libraries to the sidebar.

## Customization Options

### User Preferences
Users can set default sidebar width within allowed range. Category expansion states can be saved per user. Favorite shapes can be marked for quick access section. Recently used item count is configurable.

Search behavior can be customized for exact vs. fuzzy matching. Grid column count can be adjusted independent of sidebar width. Shape label display can be set to always show, never, or on hover.

### Organizational Customization
Organizations can add custom shape libraries specific to their industry. Standard shapes can be hidden if not relevant. Custom categories can be created for organizational needs. Default shapes can be preset for new diagrams.

Branding can be applied to custom shape categories. Integration with external symbol libraries is supported. Access controls can limit available shapes based on user role.

## Error Handling

### Loading Errors
If shape libraries fail to load, the sidebar shows an error message with retry option. Partial loads display available content while indicating issues. Offline mode uses cached shapes when available. The system logs errors for debugging while maintaining usability.

### Drag and Drop Errors
Failed drops show clear error messages explaining why. The shape returns to sidebar if drop fails. Invalid drop zones show prohibition indicators during drag. Recovery is always possible without losing work.

### Search Errors
Search continues functioning even if some categories fail to load. Error messages appear inline without blocking search. The system gracefully handles malformed search queries. Performance degrades gracefully with very large result sets.

## Performance Metrics

### Target Performance
Search results appear within 100ms of typing. Shape dragging begins within 16ms of mouse down. Category expansion completes within 150ms. Sidebar resize is smooth at 60 frames per second.

The sidebar loads initial content within 500ms of application start. Scrolling remains smooth even with 1000+ shapes visible. Memory usage stays under 50MB for typical shape libraries. CPU usage remains under 5% during idle states.

### Monitoring Points
The system tracks search query response times. Drag and drop operation success rates are logged. Category loading times are measured and optimized. User interaction patterns are analyzed for improvement opportunities.

Error rates are monitored for each operation type. Performance degradation triggers alerts for investigation. User feedback is collected on sidebar responsiveness. A/B testing validates performance improvements.