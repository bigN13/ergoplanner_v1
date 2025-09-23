1. INITIALIZATION
   a. Load all project documentation
   b. Parse task-master.md for total task count
   c. Initialize progress tracking
   d. Setup logging with timestamps
   e. Create session ID for this run
   f. Verify critical services are running

2. CONFIGURATION
   Set execution parameters:
   a. MAX_ITERATIONS = 1000 (prevent infinite loops)
   b. MAX_ERRORS_BEFORE_HALT = 3
   c. AUTO_COMMIT = true/false
   d. AUTO_MERGE = false (recommend manual review)
   e. BREAK_INTERVAL = 10 tasks (health check)
   f. COMPLEXITY_THRESHOLD = 4 (tasks >4 need review)

3. MAIN EXECUTION LOOP
WHILE (incomplete_tasks > 0 AND iterations < MAX_ITERATIONS):
  a. TASK SELECTION
     - Get next task from task-master.md
     - Check dependencies are complete
     - Estimate complexity (1-5)
     - If complexity > COMPLEXITY_THRESHOLD, flag for review
  
  b. PRE-EXECUTION CHECKS
     - Git status clean?
     - All tests passing?
     - No critical alerts?
     - Disk space > 10GB?
     - Memory usage < 80%?
     
  c. EXECUTE TASK
     - Run do-taskmaster-list.md for current task
     - Capture output and logs
     - Track execution time
     
  d. VALIDATION GATE
     - Build successful?
     - Tests passing (>80% coverage)?
     - No new security vulnerabilities?
     - Performance benchmarks met?
     - Documentation updated?
     
  e. ERROR HANDLING
     IF task fails:
        - Increment error_count
        - Log detailed error with context
        - Attempt automatic fix (do-quick-fix.md)
        - IF fix successful, retry task
        - ELSE IF error_count >= MAX_ERRORS_BEFORE_HALT:
           - HALT EXECUTION
           - Generate error report
           - Notify for manual intervention
        - ELSE:
           - Mark task as blocked
           - Continue to next task
  
  f. SUCCESS HANDLING
     IF task succeeds:
        - Update task-master.md
        - Commit changes (if AUTO_COMMIT)
        - Update progress metrics
        - Log success with metrics
        
  g. HEALTH CHECKS (every BREAK_INTERVAL tasks)
     - Check system resources
     - Run integration tests
     - Verify database consistency
     - Check for memory leaks
     - Review error logs
     - PAUSE for review if issues detected
     
  h. PROGRESS REPORTING
     - Tasks completed: X/Y
     - Success rate: Z%
     - Average task time: N minutes
     - Estimated completion: timestamp
     - Current velocity: tasks/hour
     
  i. BREAK MANAGEMENT
     IF tasks_completed % BREAK_INTERVAL == 0:
        - Generate progress report
        - Commit all changes
        - Create restore point
        - Optional: Pause for human review
        - Log session checkpoint
        
  j. INCREMENT
     - iterations++
     - Update metrics

4. QUALITY ASSURANCE GATES
   Between each task:
   a. Code quality check (linting, formatting)
   b. Test coverage verification
   c. Security scan
   d. Performance regression check
   e. Documentation completeness

5. EMERGENCY STOP CONDITIONS
   Halt immediately if:
   a. Critical security vulnerability detected
   b. Database corruption detected
   c. Test coverage drops below 70%
   d. Performance degradation > 50%
   e. Disk space < 1GB
   f. Manual stop signal received (Ctrl+C)
   g. MAX_ITERATIONS reached

6. COMMIT STRATEGY
   After each successful task:
   a. Stage only source files (no generated)
   b. Create detailed commit message:
  auto: Complete task #X - [task description]
  
  - Implementation details
  - Tests added/modified
  - Documentation updated
  
  Session: [session_id]
  Task: X/Y completed
  Time: Z minutes
   c. Push to feature branch (never direct to main)

7. PARALLEL EXECUTION (Advanced)
   For independent tasks:
   a. Identify tasks without dependencies
   b. Spawn parallel execution threads (max 3)
   c. Monitor resource usage
   d. Synchronize on shared resources
   e. Merge results

8. RECOVERY MECHANISM
   If execution is interrupted:
   a. On restart, check session log
   b. Identify last successful task
   c. Verify repository state
   d. Clean any partial changes
   e. Resume from last checkpoint

9. COMPLETION REPORT
   When all tasks complete or max iterations:
   a. Generate comprehensive report:
      - Total tasks completed
      - Success/failure ratio
      - Total execution time
      - Performance metrics
      - Code quality metrics
      - Test coverage delta
      - Files changed statistics
      - Commit history
   
   b. Create PR if all successful:
      - Branch: feature/auto-complete-[session]
      - Description: Full task list
      - Test results attached
      - Review checklist completed
   
   c. Archive session logs

10. POST-EXECUTION CLEANUP
    a. Clean temporary files
    b. Optimize Docker images
    c. Clear build caches
    d. Archive logs
    e. Update project metrics
    f. Generate lessons learned

11. CONTINUOUS MONITORING
    During execution, monitor:
    a. CPU usage (alert if >90% sustained)
    b. Memory usage (alert if >85%)
    c. Disk I/O (alert if queue depth >10)
    d. Network latency (alert if >1000ms)
    e. Error rate (alert if >10%)

12. HUMAN INTERVENTION POINTS
    Require human review for:
    a. Tasks marked high complexity (5)
    b. Tasks modifying critical paths
    c. Tasks affecting security
    d. Tasks changing APIs
    e. Tasks with previous failures
    f. Merge to main branch

USAGE:
claude do-task-master-advanced.md [options]
  --max-iterations=1000
  --auto-commit=true
  --break-interval=10
  --complexity-threshold=4
  --parallel=false
  --dry-run=false