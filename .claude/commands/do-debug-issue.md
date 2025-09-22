INPUT: Issue description or error message

1. ISSUE REPRODUCTION
   a. Understand expected behavior
   b. Reproduce the issue locally
   c. Document reproduction steps
   d. Capture error logs/screenshots
   e. Check browser console/network tab

2. ISSUE ISOLATION
   a. Identify affected component/service
   b. Check recent changes (git log)
   c. Test in different environments
   d. Test with different data
   e. Isolate minimum reproduction

3. ROOT CAUSE ANALYSIS
   a. Add debug logging
   b. Use debugger/breakpoints
   c. Check state/props values
   d. Verify API responses
   e. Check database queries
   f. Review error stack trace

4. HYPOTHESIS TESTING
   For each potential cause:
   a. Form hypothesis
   b. Design test
   c. Implement test
   d. Document result
   e. Refine hypothesis

5. SOLUTION DEVELOPMENT
   a. Identify fix approach
   b. Consider edge cases
   c. Assess impact on other features
   d. Create fix implementation
   e. Add regression test

6. VALIDATION
   a. Verify fix resolves issue
   b. Run existing tests
   c. Check for side effects
   d. Test edge cases
   e. Performance impact check

7. DOCUMENTATION
   a. Document root cause
   b. Document fix approach
   c. Update troubleshooting guide
   d. Add to known issues if partial fix
   e. Create post-mortem if critical

8. PREVENTION
   a. Add automated test for this case
   b. Add validation/guard clause
   c. Improve error messages
   d. Update monitoring/alerts
   e. Share learnings with team