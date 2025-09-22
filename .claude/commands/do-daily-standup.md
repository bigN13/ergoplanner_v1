## Daily Standup Command - Task Master Integration

This command facilitates daily standup with task-master integration and quality metrics tracking.

### STANDUP WORKFLOW

#### 1. QUALITY STATUS CHECK
```bash
# Start with system health
./scripts/run-quality-gates.sh
# Review any blocking issues
```

#### 2. YESTERDAY'S PROGRESS
```bash
# Check completed tasks
task-master list --status=done --since=yesterday

# Review commits
git log --since=yesterday --oneline

# Check quality metrics
- Build status: Pass/Fail
- Test coverage: Current %
- Open issues: Count
```

#### 3. TODAY'S PLAN
```bash
# Get next priority tasks
task-master next

# Review task details
task-master show <task-id>

# Check dependencies
task-master validate-dependencies
```

#### 4. BLOCKERS & RISKS
Identify and document:
- 🚨 **Critical Blockers**
  - Build failures
  - Failing tests
  - Missing dependencies
  - Resource unavailable

- ⚠️ **Risks**
  - Technical debt
  - Performance issues
  - Security concerns
  - Timeline risks

#### 5. TASK-MASTER UPDATE
```bash
# Update current task status
task-master set-status --id=<current-task> --status=in-progress

# Log standup notes
task-master update-task --id=<task-id> --prompt="Standup: [notes]"

# Update .taskmaster/state.json
task-master sync
```

#### 6. METRICS TRACKING
Track daily:
- Tasks completed: X
- Story points burned: Y
- Test coverage: Z%
- Build success rate: %
- Blocker resolution time

#### 7. TEAM SYNC POINTS
Document:
- Dependencies on others
- Help needed
- Knowledge sharing opportunities
- Review requests pending

#### 8. QUALITY COMMITMENTS
Today's quality goals:
- [ ] Zero build warnings
- [ ] All tests passing
- [ ] Coverage maintained/increased
- [ ] Documentation updated
- [ ] Code reviewed before merge

#### 9. OUTPUT GENERATION
Create `standup-[date].md`:
```markdown
## Daily Standup - [Date]

### Yesterday
- Completed: [tasks]
- Challenges: [issues]
- Metrics: Coverage X%, Build 100%

### Today
- Focus: [main task]
- Goals: [specific outcomes]
- Quality targets: [metrics]

### Blockers
- [List any blockers]

### Help Needed
- [Any assistance required]

### Notes
- [Additional context]
```

#### 10. INTEGRATION POINTS
Update:
- .taskmaster/tasks/tasks.json
- Project board
- Team calendar
- Sprint burndown
- Risk register

**Remember: Quality metrics are part of daily accountability!**