# Menu System - Complete Specification

## Executive Summary
The menu system provides comprehensive access to all application features through a traditional menu bar interface. Located below the main toolbar, it organizes functions into logical categories: File, Edit, View, Arrange, Extras, and Help. Every menu item, submenu, and function must be replicated to maintain draw.io's complete functionality and familiar user experience.

## Menu Bar Structure

### Menu Bar Layout
The menu bar spans the full application width directly below the main toolbar. It maintains a height of 30 pixels with consistent spacing between menu titles. The bar uses a light background in light theme and dark background in dark theme, with subtle separation from surrounding interface elements.

Menu titles appear in the standard system font at 13 pixels, with adequate padding for easy clicking. Each menu title shows an underlined accelerator key for keyboard navigation. Hover states provide immediate visual feedback with background highlighting. The active menu title remains highlighted while its dropdown is open.

The menu bar remains visible at all times during normal operation. In full-screen presentation mode, it can be hidden for maximum canvas space. The menu bar responds to window resizing by maintaining consistent positioning. Touch devices may show an adapted menu structure for better interaction.

### Menu Behavior Patterns
Menus open on click rather than hover by default, preventing accidental activation. Once one menu is open, hovering over other menu titles switches to them. Clicking outside any menu or pressing Escape closes all menus. Open menus close automatically when actions are executed.

Submenus appear to the right of parent items with a slight overlap. If insufficient space exists on the right, submenus open to the left instead. Vertical positioning adjusts to keep submenus fully visible on screen. Smooth animations provide visual continuity during menu transitions.

Keyboard navigation follows standard conventions with arrow keys moving through items. Enter or Space activates the highlighted item. Accelerator keys provide direct access to specific items. Tab key exits menu navigation and returns to the canvas.

## File Menu

### New Operations
New creates a blank diagram with default page settings. It can optionally show a template selection dialog first. Recent templates appear for quick access. The new diagram opens in the current tab or window based on preferences.

New Window opens another instance of the application. The new window inherits current application settings. Multiple windows can edit different diagrams simultaneously. Window management follows operating system conventions.

Template gallery provides access to numerous diagram starting points. Templates are categorized by diagram type and industry. Preview shows template contents before creation. Custom templates can be saved and shared.

### Open Functions
Open shows the file browser for local file selection. It supports multiple file format filters for easy location. Recent folders are accessible for quick navigation. Multiple files can be selected for batch opening.

Open Recent displays a list of recently accessed files. The list shows file names, paths, and modification dates. Hovering shows full path information in tooltips. The recent list can be cleared for privacy.

Open From provides access to cloud storage services including Google Drive, OneDrive, Dropbox, and GitHub. Each service requires appropriate authentication. Files open directly without downloading. Auto-save can update cloud copies.

### Save Operations
Save commits changes to the current file location. For new files, it prompts for location and name. Auto-save can be configured to save periodically. Save indicators show when changes are pending.

Save As allows saving to a new name or location. The current file remains open after Save As. Format can be changed during Save As. Compression options are available for some formats.

Save All saves all open modified diagrams at once. It shows progress for multiple file saves. Errors are reported without stopping other saves. Confirmation can be required for overwrites.

Export provides conversion to various formats including PDF, PNG, JPEG, SVG, and XML. Export options control quality and features. Selective export can include only certain pages or selections. Batch export handles multiple formats simultaneously.

### Import Functions
Import adds content from external files to the current diagram. Supported formats include images, SVG, Visio, and others. Import position can be specified or interactive. Import options control scaling and positioning.

Import From URL fetches content from web addresses. It supports direct image URLs and some file services. Preview shows content before importing. Progress indication appears for large downloads.

### File Properties
Rename changes the current file name. The new name is validated for the file system. Extension changes may trigger format warnings. The file path remains unchanged.

Move relocates the file to a different folder. The file remains open after moving. References are updated if possible. Move history can be tracked.

Properties shows file metadata including size, creation date, modification date, and format details. For cloud files, sharing status is shown. Version information appears for supported services.

### Print Functions
Print opens the system print dialog with diagram-specific options. Page range selection for multi-page diagrams is supported. Scaling options fit diagrams to paper sizes. Print preview shows exact output appearance.

Page Setup configures paper size, orientation, and margins. Different settings for different pages are allowed. Templates can save common configurations. Changes apply to current diagram only.

Print Preview displays how the diagram will appear when printed. Navigation between pages is provided for multi-page documents. Zoom controls allow detailed inspection. Print can be initiated from preview.

### File History
Version History shows previous versions for versioned storage. Each version includes timestamp and author. Versions can be compared visually. Restoration of old versions is supported.

Revision Compare highlights differences between versions. Added, deleted, and modified elements are shown. Side-by-side or overlay comparison modes are available. Comparison results can be exported.

### File Finalization
Close closes the current diagram with unsaved changes prompt. The application remains open after closing. Recently closed files can be reopened. Batch close can handle multiple files.

Close All closes all open diagrams with save prompts. The application state after closing is configurable. Unsaved changes can be recovered after crashes. Workspace state can be preserved.

Exit/Quit terminates the application completely. All open files prompt for saving. Window positions and settings are preserved. Recovery information is saved for crashes.

## Edit Menu

### Clipboard Operations
Cut removes selected elements to clipboard. The operation is undoable if needed. Cut elements show visual feedback before removal. Clipboard contents persist across diagrams.

Copy duplicates selected elements to clipboard. Multiple elements maintain relative positions. Styles and properties are preserved. Copy format includes various data types.

Paste inserts clipboard contents at cursor position. Smart paste adjusts for context differences. Paste special provides format options. Paste style applies only formatting.

Paste Here positions content at mouse location. It overrides default paste positioning. Grid snapping affects pasted position. Repeated pastes offset automatically.

### Selection Functions
Select All selects every element on current page. Locked elements may be excluded based on settings. Selection across layers is configurable. Performance remains good with many elements.

Select None clears all current selections. It provides a quick way to deselect. The operation is instantaneous. Focus returns to canvas.

Select Vertices selects all shapes excluding edges. This helps with shape-only operations. Selection can be inverted afterwards. Filtering by shape type is possible.

Select Edges selects all connections excluding shapes. This enables edge-only styling. Selection can be refined further. Edge types can be filtered.

### Search and Replace
Find opens search panel for text finding. Search scope includes all text in diagram. Case sensitivity and whole word options are available. Regular expressions provide advanced searching.

Find and Replace enables bulk text changes. Preview shows changes before applying. Selective replacement is supported. Undo reverses all replacements.

### Modification Operations
Delete removes selected elements permanently. Confirmation can be required for many elements. Connected edges adjust automatically. Delete is undoable.

Duplicate creates copies with slight offset. Duplicated elements are selected. Properties and connections are preserved. Duplicate can repeat with Ctrl+D.

### History Management
Undo reverses the last action performed. Multiple undo levels are supported. Undo descriptions show what will be reversed. Undo history persists within session.

Redo reapplies previously undone actions. The redo stack clears after new actions. Multiple redo is available. Redo descriptions show what will be reapplied.

Clear History removes all undo/redo information. This can free memory for large diagrams. Confirmation is required before clearing. The operation cannot be undone.

### Element Editing
Edit Data opens property editor for selected element. Complex properties can be modified. Validation ensures data consistency. Changes apply immediately.

Edit Link modifies hyperlinks on elements. URLs can be internal or external. Link testing is available. Multiple elements can be linked simultaneously.

Edit Tooltip changes hover text for elements. Rich text formatting is supported. Dynamic content can be included. Tooltips can be removed entirely.

Edit Style opens comprehensive style editor. All visual properties are accessible. Styles can be saved as presets. Batch style application is supported.

## View Menu

### Zoom Controls
Zoom In increases magnification by preset increment. The zoom centers on cursor position. Maximum zoom is 5000 percent. Smooth animation transitions between levels.

Zoom Out decreases magnification by preset increment. Minimum zoom shows entire diagram. The zoom maintains cursor position. Performance remains smooth at all levels.

Actual Size resets zoom to 100 percent. This shows true dimensions for printing. The view centers on selection or page. One click returns to default.

Fit Page adjusts zoom to show entire page. Margins are included in the fit. Multi-page diagrams fit current page. Aspect ratio is maintained.

Fit Pages shows all pages simultaneously. This provides diagram overview. Page arrangement is maintained. Individual pages remain identifiable.

Fit Selection zooms to selected elements. Padding ensures elements aren't edge-clipped. Empty selection fits entire diagram. Animation smoothly transitions view.

Custom Zoom allows specific percentage entry. Any value from 10 to 5000 percent is accepted. The view centers appropriately. Custom values can be saved.

### Display Options
Gridlines toggles grid visibility. Grid settings are accessible from here. Grid appears behind all elements. Print inclusion is optional.

Guides toggles ruler and guide visibility. Guide creation and management is enabled. Guides assist with alignment. Guide colors are customizable.

Connection Points shows shape connection indicators. Points appear on hover or always. Point size is adjustable. Different shapes have different points.

Page Breaks displays print boundaries. Breaks show as dashed lines. Multi-page layout is visible. Break positions adjust with page setup.

Rulers toggles measurement ruler display. Units match diagram settings. Zero point is repositionable. Rulers aid precise positioning.

### Panel Management
Sidebar toggles left panel visibility. More canvas space when hidden. Keyboard shortcut provides quick toggle. Panel state persists across sessions.

Properties toggles right panel visibility. Panel auto-hides when not needed. Selection still updates hidden panel. Floating mode is available.

Layers opens layer management panel. Layer visibility and ordering is controlled. New layers can be created. Layer properties are editable.

Outline displays diagram structure tree. Hierarchical view of all elements. Navigation by clicking items. Search within outline is supported.

### View Modes
Presentation Mode enters full-screen viewing. Interface elements hide automatically. Navigation between pages is supported. Exit returns to normal view.

Print View shows exact printed appearance. Non-printing elements are hidden. Page boundaries are clearly shown. Useful for final review.

Source View displays underlying XML/JSON. Syntax highlighting aids readability. Direct editing is possible for experts. Changes reflect immediately.

## Arrange Menu

### Alignment Operations
Align Left positions elements to leftmost edge. Multiple elements align to the leftmost one. Page alignment uses page boundary. Guide alignment is also supported.

Align Center horizontally centers elements. Centers align to selection center. Page centering uses page middle. Distribution can follow alignment.

Align Right positions elements to rightmost edge. Similar to left but opposite direction. Consistent spacing can be maintained. Works with other alignments.

Align Top positions elements to topmost edge. Vertical equivalent of align left. Page top alignment is available. Combines with horizontal alignment.

Align Middle vertically centers elements. Centers align to selection middle. Page middle uses page center. Even distribution follows.

Align Bottom positions elements to bottommost edge. Completes vertical alignment options. Page bottom alignment is supported. Multi-step alignment is possible.

### Distribution Functions
Distribute Horizontally spaces elements evenly across width. Outer elements remain stationary. Inner elements reposition appropriately. Spacing is calculated automatically.

Distribute Vertically spaces elements evenly across height. Works like horizontal but vertically. Can combine with horizontal distribution. Creates grid arrangements.

Spacing provides exact distance between elements. Specific pixel values can be entered. Applies to selected elements only. Can be horizontal or vertical.

### Order Management
Bring to Front moves elements above all others. Selected elements maintain relative order. Works within current layer. Multiple elements supported.

Send to Back moves elements behind all others. Opposite of bring to front. Preserves internal ordering. Layer assignment unchanged.

Bring Forward moves elements up one level. Incremental ordering adjustment. Can repeat for more movement. Visual feedback shows change.

Send Backward moves elements down one level. Single-step back movement. Complements bring forward. Order changes are undoable.

### Transform Operations
Rotate Right rotates 90 degrees clockwise. Rotation center is selection center. Multiple elements rotate together. Grid snapping affects result.

Rotate Left rotates 90 degrees counterclockwise. Opposite of rotate right. Same center point behavior. Maintains relative positions.

Flip Horizontal mirrors elements horizontally. Mirror axis is selection center. Text remains readable. Connections adjust automatically.

Flip Vertical mirrors elements vertically. Vertical equivalent of horizontal flip. Useful for symmetric diagrams. Preserves element properties.

### Grouping Functions
Group combines selected elements into single unit. Groups can be nested indefinitely. Group properties affect all members. Groups can be edited internally.

Ungroup separates grouped elements. One level of grouping removed. Nested groups remain grouped. Properties may be preserved.

Remove From Group extracts specific elements. Partial ungrouping capability. Group remains otherwise intact. Useful for group editing.

Enter Group allows editing group contents. Other elements temporarily hide. Full editing capabilities available. Exit group returns to normal.

### Layout Functions
Auto Layout arranges diagram automatically. Various layout algorithms available. Tree, hierarchical, circular options. Manual adjustments possible afterward.

Layout Direction controls auto-layout orientation. Top-to-bottom, left-to-right options. Affects tree and hierarchical layouts. Can be changed dynamically.

Flow Direction sets flow diagram direction. Influences connector routing. Can be horizontal or vertical. Affects new connections.

## Extras Menu

### Themes and Styles
Theme selection changes overall diagram appearance. Light, dark, and custom themes available. Themes affect all elements globally. Custom themes can be created.

Style Management opens style library panel. Predefined styles can be applied. Custom styles can be saved. Style inheritance is supported.

Clear All Styles removes custom formatting. Returns elements to defaults. Useful for style reset. Confirmation may be required.

### Diagram Tools
Diagram Statistics shows element counts and metrics. Page count, shape count, connector count displayed. File size information included. Performance metrics available.

Compress Diagram optimizes file size. Removes unnecessary data. Maintains diagram appearance. Useful before sharing.

Validate Diagram checks for issues. Connection validation performed. Missing elements identified. Correction suggestions provided.

### Advanced Features
Macros enables recording and playback. Complex operations can be automated. Macro library can be built. Keyboard shortcuts assignable.

Plugins manages add-on functionality. Available plugins can be browsed. Installed plugins are configured here. Updates are handled automatically.

Custom Libraries manages shape libraries. Libraries can be imported/exported. Custom shapes can be created. Organization-specific libraries supported.

### Developer Options
Developer Mode enables advanced features. Additional properties become visible. Debugging tools are activated. Not for general use.

Console opens JavaScript console. For debugging and scripting. Advanced users only. Can modify diagram programmatically.

## Help Menu

### Documentation
User Guide opens comprehensive documentation. Searchable help content. Context-sensitive help available. Tutorials included.

Keyboard Shortcuts displays all shortcuts. Printable reference sheet. Customizable shortcuts shown. Platform-specific variations noted.

Video Tutorials links to training videos. Categorized by topic. Beginner to advanced content. Subtitles available.

### Support Resources
Report Issue opens bug reporting interface. System information included automatically. Screenshots can be attached. Tracking number provided.

Request Feature opens feature request form. Community voting supported. Roadmap visibility provided. Status updates available.

Community Forum links to user discussions. Questions and answers available. Expert users provide help. Searchable archive maintained.

### Application Information
About shows version and license information. Credits and acknowledgments included. Third-party licenses listed. System information displayed.

Check for Updates queries for new versions. Automatic or manual updates. Release notes displayed. Downgrade option available.

License Management handles license activation. License status displayed. Renewal reminders provided. Multiple license support.

## Context Menus

### Shape Context Menu
The shape context menu appears on right-click. It contains the most relevant operations for the selected shape including cut, copy, paste, delete, duplicate, and edit options. Style operations are quickly accessible. Connection options appear for connectable shapes.

Additional options vary by shape type. Grouped shapes show group operations. Locked shapes show unlock option. Container shapes show container-specific options. The menu adapts to selection context.

### Edge Context Menu
Edge context menus focus on connection operations. Edit waypoints, change routing style, reverse direction, and add labels are primary options. Style changes specific to lines are included. Split and join operations appear when applicable.

Connection validation options are available. Reroute suggestions can be requested. Connection type can be changed. Properties specific to edges are accessible.

### Canvas Context Menu
Right-clicking empty canvas shows general operations. Paste is available when clipboard has content. Select all provides quick selection. View options are accessible. Page operations appear here.

Canvas properties can be accessed. Grid and guide toggles are available. Zoom controls provide quick access. Recently used tools appear for convenience.

### Text Context Menu
Text context menus include text-specific operations. Font formatting is quickly accessible. Paragraph alignment can be adjusted. Text direction is changeable. Spell check can be initiated.

Find and replace within text is available. Text can be converted to different formats. Links can be inserted or edited. Special characters can be inserted.

## Menu Customization

### Menu Configuration
Menus can be customized for workflows. Items can be hidden if not needed. Custom items can be added. Menu order can be rearranged.

Keyboard shortcuts are customizable. Conflicts are detected automatically. Platform conventions are respected. Custom shortcuts can be exported.

### User Profiles
Different menu configurations for different users. Role-based menu visibility. Simplified menus for basic users. Full menus for power users.

Profile switching is quick and easy. Profiles can be imported/exported. Organization profiles can be mandated. Personal customization is allowed.

### Localization
Menus support multiple languages. Language can be changed dynamically. All items are properly translated. Keyboard shortcuts adapt appropriately.

Regional variations are supported. Date and number formats adjust. Cultural preferences are respected. Right-to-left languages are handled.

## Performance Specifications

### Menu Responsiveness
Menus must open within 50ms of clicking. Submenus appear without perceptible delay. Large menus scroll smoothly. Keyboard navigation is instantaneous.

Menu actions execute immediately. Long operations show progress. Cancellation is always available. The interface remains responsive.

### Memory Efficiency
Menu structures are loaded on demand. Unused menus can be unloaded. Menu state is minimal. Memory leaks are prevented.

Dynamic menu items are cached appropriately. Recent items are maintained efficiently. Menu history has reasonable limits. Cleanup occurs automatically.

### Reliability
Menus remain functional under all conditions. Error states are handled gracefully. Fallback options exist for failures. Recovery is automatic when possible.

Menu state persists appropriately. Crashes don't corrupt menus. Updates preserve customizations. Backups ensure recoverability.