INPUT: Component/Page/API to optimize

1. BASELINE MEASUREMENT
   a. Current load time
   b. Current render time
   c. Current memory usage
   d. Current bundle size
   e. Current database query time

2. PROFILING
   a. React DevTools profiling
   b. Chrome Performance tab
   c. Network waterfall analysis
   d. Database query analysis
   e. Memory leak detection

3. BOTTLENECK IDENTIFICATION
   Identify top 3 issues:
   a. Slowest operations
   b. Largest components
   c. Most frequent re-renders
   d. Heaviest queries
   e. Biggest assets

4. OPTIMIZATION STRATEGIES
   For each bottleneck:
   a. Evaluate optimization options
   b. Estimate improvement
   c. Assess implementation effort
   d. Consider trade-offs
   e. Prioritize by impact/effort

5. IMPLEMENTATION
   Common optimizations:
   a. React.memo/useMemo/useCallback
   b. Code splitting/lazy loading
   c. Image optimization
   d. Query optimization/indexing
   e. Caching strategies
   f. Virtualization for lists
   g. Debouncing/throttling
   h. Web Workers for heavy ops

6. VALIDATION
   a. Measure improvement
   b. Verify functionality intact
   c. Check edge cases
   d. Test on slow devices
   e. Monitor memory usage

7. DOCUMENTATION
   a. Document changes made
   b. Record performance gains
   c. Note any trade-offs
   d. Update performance budget
   e. Add to best practices

8. MONITORING SETUP
   a. Add performance metrics
   b. Set up alerts
   c. Create dashboard
   d. Define thresholds
   e. Schedule regular reviews