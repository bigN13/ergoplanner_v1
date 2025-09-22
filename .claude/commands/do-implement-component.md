INPUT: Component name (e.g., SymbolLibrary, DrawingCanvas)

1. COMPONENT ANALYSIS
   a. Review component requirements
   b. Identify data dependencies
   c. List required props/inputs
   d. Define component outputs/events
   e. Check existing similar components

2. INTERFACE DEFINITION
   a. Create TypeScript interfaces
   b. Define prop types
   c. Define state shape
   d. Define event handlers
   e. Create mock data

3. TEST SPECIFICATION
   Write tests BEFORE implementation:
   a. Unit tests for logic
   b. Component render tests
   c. User interaction tests
   d. Edge case tests
   e. Accessibility tests

4. COMPONENT STRUCTURE
   Create file structure:
   a. Component.tsx (main)
   b. Component.types.ts
   c. Component.test.tsx
   d. Component.stories.tsx (Storybook)
   e. Component.module.css (if needed)

5. IMPLEMENTATION
   a. Create functional component
   b. Implement hooks (useState, useEffect, etc.)
   c. Add error boundaries
   d. Implement loading states
   e. Add accessibility attributes
   f. Optimize re-renders

6. STYLING
   a. Apply design system tokens
   b. Ensure responsive design
   c. Add animations (if needed)
   d. Support dark/light themes
   e. Test on different viewports

7. INTEGRATION
   a. Connect to Redux/Context
   b. Wire up API calls
   c. Handle error states
   d. Add logging
   e. Implement caching

8. DOCUMENTATION
   a. Add JSDoc comments
   b. Create usage examples
   c. Document props
   d. Add to component library
   e. Update Storybook

9. PERFORMANCE CHECK
   a. Check bundle size
   b. Measure render time
   c. Check memory leaks
   d. Optimize heavy operations
   e. Add React.memo if needed

10. FINAL VALIDATION
    a. All tests pass
    b. No console errors
    c. Accessibility check passes
    d. Code review checklist complete
    e. Storybook story works