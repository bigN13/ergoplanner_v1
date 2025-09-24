# Main Toolbar - Complete Specification

## Executive Summary
The main toolbar provides immediate access to the most frequently used drawing tools and actions. Located at the top of the application window, it remains visible and accessible throughout the drawing process. Every button, dropdown, and tool must be replicated exactly as it appears in draw.io to maintain user familiarity and productivity.

## Toolbar Layout and Structure

### Overall Dimensions and Positioning
The main toolbar spans the full width of the application window, maintaining a fixed height of 46 pixels. It remains pinned to the top of the viewport, staying visible during canvas scrolling. The toolbar uses a light gray background in light theme and dark gray in dark theme, with a subtle bottom border separating it from the canvas area.

The toolbar organizes tools into logical groups separated by vertical dividers. Each group contains related functions, making tools easy to locate. Groups maintain consistent spacing, with 8 pixels between buttons and 16 pixels between groups. The layout responds to window resizing, with optional tools hiding first when space is constrained.

### Toolbar Sections from Left to Right

**File Operations Section**
The leftmost section contains essential file operations. The New diagram button creates fresh documents with template selection. The Open button accesses existing files from various sources. Save commits changes to the current location, while Save As allows choosing new destinations.

Each file operation button displays both icon and text on desktop widths. On narrower screens, only icons show with tooltips providing text labels. Keyboard shortcuts appear in tooltips for discoverability. Recently used files are accessible through dropdown arrows on relevant buttons.

**Undo/Redo Section**
Separated by a divider, the undo and redo buttons enable quick reversal of actions. These buttons show the familiar curved arrow icons pointing left and right respectively. The buttons enable or disable based on available history. Tooltips indicate the specific action to be undone or redone.

Multiple undo/redo levels are accessible through dropdown arrows, showing a history list. Each history entry describes the action clearly. Clicking an entry jumps to that state directly. The history limit is configurable in settings.

**Clipboard Section**
Cut, copy, and paste buttons provide standard clipboard operations. These maintain familiar icons used across applications. The paste button includes a dropdown for paste special options. Format painter appears here for style copying.

Buttons enable based on selection state and clipboard contents. Cut and copy require selection to activate. Paste enables when compatible content exists in clipboard. Visual feedback indicates successful operations.

**Zoom Controls Section**
The zoom section includes percentage display and adjustment controls. The current zoom percentage shows in an editable field. Plus and minus buttons adjust zoom in preset increments. A dropdown provides common zoom levels and fit options.

Zoom to fit adjusts view to show all content. Zoom to selection focuses on selected elements. Actual size resets to 100% zoom. Custom zoom levels can be entered directly. The zoom range spans from 10% to 5000%.

## Primary Drawing Tools

### Selection Tool
The selection tool, represented by a mouse pointer icon, is the default tool for interacting with existing elements. When active, clicking selects individual shapes, while dragging creates selection rectangles. The tool supports multiple selection through Shift-clicking or Ctrl-clicking elements.

Selected elements display resize handles at corners and edges. A rotation handle appears above the selection for angular adjustments. Multi-selections show a bounding box encompassing all selected elements. The selection tool automatically activates after creating shapes, returning users to manipulation mode.

Right-clicking with the selection tool opens context menus specific to the selected elements. Double-clicking enters edit mode for text or opens property dialogs for complex shapes. The Escape key deactivates selections and returns to default state.

### Text Tool
The text tool, shown as a capital T icon, enables direct text creation on the canvas. Clicking with this tool creates a text object at the click point. Dragging creates a text box with defined dimensions for wrapped text. Existing text can be edited by selecting with this tool.

Text creation begins with a blinking cursor in the new text object. Default font settings apply from current style preferences. The text toolbar activates showing formatting options. Enter key creates line breaks within text objects. Tab key inserts spacing or moves to next text field.

Text objects support rich formatting including bold, italic, and underline. Font family, size, and color can be adjusted per selection. Alignment options include left, center, right, and justified. Line spacing and paragraph settings provide detailed control.

### Shape Tools Dropdown
The shapes dropdown contains quick access to frequently used basic shapes. Rectangle, rounded rectangle, ellipse, and rhombus appear as primary options. Each shape has a dedicated icon for quick recognition. Selecting a shape activates drawing mode for that shape type.

Drawing shapes involves clicking and dragging to define size. Shapes draw from corner by default but center drawing is available with modifiers. Proportional shapes are created by holding Shift while dragging. Grid snapping affects shape placement and sizing.

After creating a shape, the selection tool automatically activates. The new shape remains selected for immediate property editing. Default styles apply from current theme settings. Quick style variations are accessible through property panels.

### Connector Tool
The connector tool creates lines between shapes with intelligent routing. The tool icon shows a line with arrows indicating connections. Multiple connector types are available through the dropdown including straight, orthogonal, and curved options.

Creating connections involves clicking on a source shape's connection point and dragging to a target. Connection points highlight in blue when hovering nearby. Valid connections show green preview lines while invalid ones appear red. The connection automatically routes around obstacles.

Existing connectors can be modified by selecting and dragging waypoints. Double-clicking on a connector adds new waypoints for custom routing. Connector properties include line style, weight, and arrow types. Labels can be added to connectors for annotations.

### Freehand Drawing Tool
The pen tool enables freehand drawing for custom shapes and annotations. The pencil icon represents this creative tool. Drawing creates smooth paths following mouse or stylus movement. Pressure sensitivity is supported on compatible devices.

Lines draw continuously while the mouse button is pressed. Releasing completes the current path segment. Smoothing algorithms reduce jittery mouse movements. The resulting paths can be edited as vector objects. Closing paths creates filled shapes.

Freehand drawings convert to editable path objects. Individual points can be adjusted after creation. Bezier handles provide curve control for smooth shapes. The simplify function reduces point count while maintaining shape.

## Secondary Tools and Actions

### Insert Menu
The insert dropdown provides access to additional content types. Image insertion supports multiple formats and sources. Tables create structured layouts with adjustable rows and columns. Links add hypertext navigation to shapes or text.

Advanced insertions include mathematical equations with LaTeX support. Diagrams from templates accelerate common drawing tasks. External content can be embedded maintaining live connections. The recent insertions section provides quick re-access.

Each insertion type opens appropriate dialogs for configuration. Preview capabilities show content before committing. Insertion points can be specified precisely. Inserted content becomes part of the diagram model.

### Arrange Menu
The arrange dropdown contains positioning and alignment tools. Align options position elements relative to each other or the page. Distribute commands space elements evenly in various patterns. Order controls adjust stacking of overlapping elements.

Group operations combine multiple elements for collective manipulation. Ungroup separates previously combined elements. Lock prevents accidental modification of positioned elements. Unlock restores editing capability to protected elements.

Rotation presets offer quick 90-degree increments. Flip operations mirror elements horizontally or vertically. Size matching makes multiple elements uniform dimensions. Position coordinates can be entered precisely.

### Format Dropdown
The format menu accesses style and appearance settings. Style copies and applies formatting between elements. Themes switch entire diagram appearance schemes. The style panel opens for detailed adjustments.

Default styles can be set for new elements. Style libraries provide consistent appearance options. Custom styles can be saved for reuse. Global style changes affect all elements simultaneously.

Clear formatting removes custom styling returning to defaults. Format painter mode copies styling between elements. Style inheritance rules determine property propagation. Conditional formatting applies styles based on data.

## View Controls

### Grid Toggle
The grid button shows or hides the background grid pattern. The grid aids in alignment and spacing of elements. Grid size is adjustable through preferences. Multiple grid styles include dots, lines, and crosses.

When enabled, the grid appears behind all diagram elements. Grid opacity can be adjusted for subtlety. Major and minor grid lines provide hierarchical spacing. The grid prints optionally based on settings.

Snap to grid automatically aligns elements to grid points. Snap strength determines the magnetic pull distance. Temporary grid disable is available through modifier keys. Grid visibility can be saved with the diagram.

### Guides Toggle  
The guides button controls ruler and guide line visibility. Guides help with precise element alignment. Horizontal and vertical guides can be positioned freely. Guides are created by dragging from rulers.

Guide lines appear as dashed lines across the canvas. Elements snap to guides when moved nearby. Multiple guides can be active simultaneously. Guide positions can be edited numerically for precision.

Smart guides automatically appear showing alignment with other elements. Distance indicators show spacing between elements. Center alignment guides help with symmetrical layouts. Guides can be locked to prevent accidental movement.

### Page View Options
Page view controls how the canvas displays pages. Single page view focuses on one page at a time. Multiple page view shows pages in a grid layout. Continuous view scrolls through pages vertically.

Page boundaries display as subtle lines or shadows. Page breaks affect printing and PDF export. New pages can be added through the page controls. Page order can be rearranged by dragging.

Print preview mode shows exact printed appearance. Page setup controls orientation and margins. Headers and footers can be added to pages. Page numbers automatically update when reordering.

### Layers Panel Toggle
The layers button opens the layers management panel. Layers organize diagram elements into stackable groups. Visibility toggles show or hide entire layers. Lock controls prevent layer modifications.

Active layer receives new elements by default. Layer opacity affects all contained elements. Layer ordering determines stacking precedence. Elements can be moved between layers freely.

Layer filters affect selection and editing operations. Solo mode isolates single layers for editing. Layer colors help identify element assignments. Template layers provide non-editable backgrounds.

## Search and Navigation

### Search Box
The search field in the toolbar enables finding text within diagrams. Search activates with Ctrl+F keyboard shortcut or clicking the search icon. Results highlight in real-time as typing occurs. Navigation arrows move between search results.

Search options include case sensitivity and whole word matching. Regular expressions provide advanced search patterns. Replace functionality allows bulk text changes. Search scope can be limited to selection or layers.

Search history maintains recent queries for reuse. Saved searches store complex patterns. Search results can be selected as a group. The search panel can be detached for persistent visibility.

### Navigation Controls
Navigation buttons provide movement through diagram history and pages. Back and forward buttons navigate through view history. Home button returns to default view position. Page navigation arrows move between diagram pages.

Breadcrumb navigation shows hierarchical position in grouped elements. Quick navigation menu lists all pages and sections. Bookmarks can be set for rapid position access. Navigation history persists across sessions.

Touch gestures provide navigation on compatible devices. Swipe gestures move between pages naturally. Pinch zooming adjusts view magnification. Pan gestures scroll the canvas smoothly.

## Customization Options

### Toolbar Configuration
Users can customize which tools appear in the toolbar. Right-clicking the toolbar opens customization mode. Tools can be added, removed, or reordered through dragging. Custom tool groups can be created for workflows.

Toolbar presets save different configurations for various tasks. Quick switching between presets adapts the interface. Default presets cover common use cases. Custom presets can be shared between users.

Toolbar position can be changed to top, bottom, or sides. Floating toolbars can be positioned freely. Multiple toolbars can be visible simultaneously. Auto-hide options maximize canvas space when needed.

### Button Appearance
Button size can be adjusted for accessibility or preference. Small, medium, and large sizes are available. Icon-only mode saves horizontal space. Text-only mode improves clarity for new users.

Button tooltips can be customized for terminology preferences. Tooltip delay is adjustable for user preference. Extended tooltips show additional help information. Video tutorials can be linked from tooltip help.

Color schemes adapt buttons to various themes. High contrast modes improve visibility. Custom colors can be applied to specific tools. Animation effects can be enabled or disabled.

### Keyboard Shortcuts
Every toolbar action has an associated keyboard shortcut. Shortcuts are customizable through preferences. Conflicts are detected and resolved automatically. Platform-specific shortcuts respect OS conventions.

Shortcut hints appear in tooltips and menus. A shortcuts panel lists all available combinations. Custom shortcuts can be exported and imported. Learning mode helps users memorize shortcuts.

Macro recording creates multi-action shortcuts. Shortcut sequences enable complex operations. Context-sensitive shortcuts change based on selection. Gaming keypads can be configured for shortcuts.

## Responsive Behavior

### Window Resizing
The toolbar adapts to various window widths intelligently. Wide screens show all tools with labels. Medium screens show icons with selective labels. Narrow screens use icons only with tooltips.

Tool groups collapse into dropdown menus when space is limited. Priority tools remain visible longest during compression. Overflow menus contain hidden tools accessibly. The toolbar height remains constant during resizing.

Responsive breakpoints are carefully tuned for usability. Transitions between states are smooth and predictable. Tool availability is never completely lost. Mobile layouts optimize for touch interaction.

### Touch Adaptations
Touch devices receive larger hit targets for accuracy. Touch-and-hold replaces right-click for context menus. Gesture shortcuts provide quick tool access. The toolbar can be hidden for full-screen drawing.

Tool selection feedback is enhanced for touch interaction. Dragging tools shows preview of operation. Multi-touch gestures enable advanced operations. Palm rejection prevents accidental tool activation.

Stylus devices receive pressure-sensitive tool variants. Stylus buttons map to tool shortcuts. Hover previews work with stylus proximity. Tool switching can follow stylus orientation.

### Accessibility Features
The toolbar fully supports keyboard navigation. Tab order follows logical tool progression. Arrow keys navigate within tool groups. Enter or Space activates focused tools.

Screen readers announce tool names and states. Tool states are communicated through ARIA attributes. Keyboard shortcuts are discoverable through screen readers. Visual feedback supplements audio announcements.

High contrast themes improve tool visibility. Focus indicators clearly show active elements. Color-blind safe icons differentiate tools. Large cursor options work with all tools.

## State Management

### Tool States
Each tool maintains various states affecting appearance and behavior. Enabled state indicates the tool is available for use. Disabled state shows the tool cannot be currently used. Active state indicates the tool is currently selected.

Hover state provides visual feedback for mouse position. Pressed state shows during click operations. Loading state indicates asynchronous operations. Error state communicates operation failures.

State transitions follow predictable patterns. Visual transitions smooth state changes. State persistence maintains across page navigation. State synchronization keeps multiple views consistent.

### Contextual Availability
Tool availability changes based on diagram context. Selection-dependent tools enable with appropriate selection. Mode-dependent tools appear in relevant editing modes. Permission-based tools respect user access levels.

Dynamic tool loading adds tools based on diagram type. Plugin tools integrate seamlessly when installed. Feature flags control experimental tool availability. License levels affect premium tool access.

Context menus duplicate toolbar functions appropriately. Radial menus provide quick tool access. Command palette enables tool search and activation. Voice commands can trigger tool selection.

### History and Undo Integration
Every tool action integrates with the undo system. Tool operations create discrete undo steps. Complex tools may create multiple undo entries. Undo descriptions clearly identify tool actions.

The redo stack maintains forward history properly. Tool state reverts correctly through undo operations. Selection state preserves through history navigation. Document state remains consistent during undo/redo.

History limits prevent excessive memory usage. Old history entries age out gracefully. Important operations can be marked as savepoints. History can be cleared manually if needed.

## Performance Specifications

### Response Times
Tool activation must occur within 16 milliseconds of click. Visual feedback appears immediately on interaction. Tool switching shows no perceptible delay. Complex tool operations show progress indicators.

Dropdown menus open instantly when clicked. Menu navigation remains smooth and responsive. Tool tips appear after appropriate hover delay. Animations complete within 200 milliseconds.

Batch operations on multiple elements remain responsive. Long-running operations allow cancellation. Background operations don't block the interface. Tool performance scales with diagram complexity.

### Memory Management
Tools release resources when deactivated. Unused tool assets unload after timeout. Tool icons use shared memory where possible. Memory leaks are prevented through proper cleanup.

Tool state memory is bounded and predictable. History memory has configurable limits. Cache memory is managed automatically. Memory pressure triggers appropriate reductions.

Tool initialization is lazy where appropriate. Resource loading is progressive and prioritized. Heavy resources load asynchronously. Fallback options exist for resource failures.