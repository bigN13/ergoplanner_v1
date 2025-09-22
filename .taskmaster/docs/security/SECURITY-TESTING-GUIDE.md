# Security Testing Guide

## Overview

This guide provides comprehensive instructions for conducting security testing on the Ergoplanner AI Suite. The security testing framework covers OWASP Top 10 vulnerabilities, authentication/authorization mechanisms, infrastructure security, and compliance validation.

## Table of Contents

1. [Testing Framework Architecture](#testing-framework-architecture)
2. [Running Security Tests](#running-security-tests)
3. [Test Categories](#test-categories)
4. [Security Tools Integration](#security-tools-integration)
5. [CI/CD Integration](#cicd-integration)
6. [Interpreting Results](#interpreting-results)
7. [Remediation Guidelines](#remediation-guidelines)

## Testing Framework Architecture

The security testing framework is structured across multiple layers:

### Backend Security Tests (.NET Core)

```
backend/tests/Ergoplanner.SecurityTests/
├── Security/
│   ├── SecurityTestBase.cs          # Base class for all security tests
│   └── SecurityWebApplicationFactory.cs  # Test application factory
├── OWASP/
│   └── OwaspTop10SecurityTests.cs   # OWASP Top 10 vulnerability tests
├── Vulnerabilities/
│   ├── SqlInjectionTests.cs        # SQL injection detection tests
│   └── XssVulnerabilityTests.cs    # XSS vulnerability tests
├── Authentication/
│   └── AuthenticationSecurityTests.cs  # Authentication security validation
├── Authorization/
│   └── AuthorizationSecurityTests.cs   # Authorization and RBAC tests
├── TokenSecurity/
│   └── JwtSecurityTests.cs         # JWT token security validation
├── FileUpload/
│   └── FileUploadSecurityTests.cs  # File upload security tests
├── Infrastructure/
│   └── InfrastructureSecurityTests.cs  # Infrastructure security assessment
└── Reporting/
    └── SecurityReportGenerator.cs  # Security report generation
```

### Frontend Security Tests (React/TypeScript)

```
frontend/tests/security/
├── xss-protection.test.ts           # XSS protection tests
├── authentication.security.test.ts  # Frontend authentication security
└── playwright-security.test.ts     # E2E security tests with Playwright
```

## Running Security Tests

### Prerequisites

1. **.NET 8.0 SDK** installed
2. **Node.js 20.x** with npm
3. **Docker** for containerized testing
4. **PostgreSQL** for database tests
5. **Redis** for caching tests

### Backend Security Tests

```bash
# Run all security tests
dotnet test backend/tests/Ergoplanner.SecurityTests/ --configuration Release

# Run specific test categories
dotnet test --filter "Category=OWASP"
dotnet test --filter "Category=Authentication"
dotnet test --filter "Category=Infrastructure"

# Run with detailed logging
dotnet test --logger "console;verbosity=detailed"

# Generate coverage report
dotnet test --collect:"XPlat Code Coverage"
```

### Frontend Security Tests

```bash
# Navigate to frontend directory
cd frontend/

# Run Jest security tests
npm test -- --testPathPattern="security"

# Run with coverage
npm test -- --testPathPattern="security" --coverage

# Run Playwright E2E security tests
npx playwright test --grep="Security E2E Tests"
```

### Full Security Test Suite

```bash
# Run the complete security test suite
./scripts/run-security-tests.sh

# Or using the GitHub Actions workflow locally
act -j security-testing
```

## Test Categories

### 1. OWASP Top 10 2021 Tests

Tests the application against the most critical web application security risks:

- **A01:2021 – Broken Access Control**
- **A02:2021 – Cryptographic Failures**
- **A03:2021 – Injection**
- **A04:2021 – Insecure Design**
- **A05:2021 – Security Misconfiguration**
- **A06:2021 – Vulnerable and Outdated Components**
- **A07:2021 – Identification and Authentication Failures**
- **A08:2021 – Software and Data Integrity Failures**
- **A09:2021 – Security Logging and Monitoring Failures**
- **A10:2021 – Server-Side Request Forgery (SSRF)**

### 2. SQL Injection Tests

Comprehensive SQL injection vulnerability testing:

```csharp
[Theory]
[MemberData(nameof(GetSqlInjectionPayloads))]
public async Task TestSqlInjectionInQueryParameters(string payload, string description)
{
    // Test SQL injection in various input vectors
}
```

**Test Vectors:**
- Classic SQL injection with table drop
- Authentication bypass attempts
- Union-based data extraction
- Time-based injection
- Boolean-based injection
- Error-based injection

### 3. XSS Protection Tests

Cross-Site Scripting vulnerability detection:

```typescript
test('should sanitize basic script tags', () => {
  const maliciousContent = '<script>alert("xss")</script><p>Safe content</p>';
  const sanitized = purify.sanitize(maliciousContent);

  expect(sanitized).not.toContain('<script>');
  expect(sanitized).toContain('<p>Safe content</p>');
});
```

**Test Coverage:**
- Reflected XSS
- Stored XSS
- DOM-based XSS
- Content Security Policy validation
- Output encoding verification

### 4. Authentication Security Tests

Validates authentication mechanisms:

```csharp
[Fact]
public async Task TestAccountLockout_ShouldLockAfterFailedAttempts()
{
    // Test account lockout after multiple failed attempts
}
```

**Test Areas:**
- Password policy enforcement
- Account lockout mechanisms
- Rate limiting
- Authentication bypass attempts
- Session management
- Password security

### 5. Authorization Tests

Role-based access control validation:

```csharp
[Theory]
[MemberData(nameof(GetRoleBasedAccessTests))]
public async Task TestRoleBasedAccess(string userRole, string endpoint,
    HttpMethod method, HttpStatusCode expectedStatus)
{
    // Test RBAC enforcement
}
```

**Test Scenarios:**
- Horizontal privilege escalation
- Vertical privilege escalation
- Resource access control
- Parameter tampering
- JWT token security

### 6. File Upload Security Tests

File upload vulnerability testing:

```csharp
[Theory]
[MemberData(nameof(GetMaliciousFileTypes))]
public async Task TestFileTypeValidation_ShouldRejectMaliciousFiles(
    string fileName, byte[] content, string description)
{
    // Test malicious file upload prevention
}
```

**Security Checks:**
- File type validation
- Size limits
- Path traversal protection
- Malicious content detection
- Extension bypass attempts

### 7. Infrastructure Security Tests

Server and infrastructure security validation:

```csharp
[Fact]
public async Task TestSecurityHeaders_ShouldHaveRequiredHeaders()
{
    // Validate security headers are present
}
```

**Assessment Areas:**
- SSL/TLS configuration
- Security headers
- Server information disclosure
- Configuration security
- Network security
- Database security

## Security Tools Integration

### 1. OWASP Dependency Check

Scans for vulnerable dependencies:

```yaml
- name: OWASP Dependency Check
  uses: dependency-check/Dependency-Check_Action@main
  with:
    project: 'Ergoplanner'
    path: '.'
    format: 'ALL'
```

### 2. Trivy Vulnerability Scanner

Container and filesystem vulnerability scanning:

```yaml
- name: Run Trivy vulnerability scanner
  uses: aquasecurity/trivy-action@master
  with:
    scan-type: 'fs'
    scan-ref: '.'
    format: 'sarif'
```

### 3. Semgrep Static Analysis

Static code analysis for security issues:

```yaml
- name: Run Semgrep static analysis
  uses: returntocorp/semgrep-action@v1
  with:
    config: >-
      p/security-audit
      p/secrets
      p/owasp-top-ten
```

### 4. OWASP ZAP Penetration Testing

Dynamic application security testing:

```bash
zap.sh -cmd -quickurl http://localhost:3000 -quickattack -quickprogress
```

### 5. CodeQL Analysis

Microsoft's semantic code analysis:

```yaml
- name: Run CodeQL Analysis
  uses: github/codeql-action/init@v3
  with:
    languages: javascript, csharp
```

## CI/CD Integration

### GitHub Actions Workflow

The security testing pipeline runs automatically on:

- **Push to main/develop branches**
- **Pull requests**
- **Daily scheduled runs**
- **Manual workflow dispatch**

### Workflow Jobs

1. **Dependency Vulnerability Scan**
2. **Backend Security Tests**
3. **Frontend Security Tests**
4. **Security Tools Scan**
5. **Docker Security Scan**
6. **Penetration Testing** (scheduled only)
7. **Security Report Consolidation**

### Conditional Execution

Tests can be run selectively:

```yaml
inputs:
  test_type:
    description: 'Type of security tests to run'
    type: choice
    options:
    - all
    - owasp
    - authentication
    - infrastructure
    - frontend
```

## Interpreting Results

### Security Score Calculation

The security score is calculated based on:

```csharp
private double CalculateSecurityScore()
{
    var weights = new Dictionary<SecuritySeverity, double>
    {
        { SecuritySeverity.Critical, 1.0 },
        { SecuritySeverity.High, 0.8 },
        { SecuritySeverity.Medium, 0.5 },
        { SecuritySeverity.Low, 0.2 }
    };

    var maxScore = _testResults.Sum(r => weights[r.Severity]);
    var actualScore = _testResults.Where(r => r.Passed).Sum(r => weights[r.Severity]);

    return (actualScore / maxScore) * 100;
}
```

### Severity Levels

| Severity | Description | Action Required |
|----------|-------------|-----------------|
| **Critical** | Immediate security risk | Fix immediately (0-24 hours) |
| **High** | Significant security risk | Fix within 1-7 days |
| **Medium** | Moderate security risk | Fix within 1-30 days |
| **Low** | Minor security risk | Fix in next release cycle |

### Report Formats

Security reports are generated in multiple formats:

- **JSON** - Machine-readable format for automation
- **HTML** - Human-readable comprehensive report
- **CSV** - Data analysis and tracking
- **Markdown** - GitHub PR comments and documentation

## Remediation Guidelines

### Critical Issues

**Immediate Actions Required:**

1. **Stop deployment** if critical issues are found
2. **Isolate affected systems** if in production
3. **Implement emergency patches**
4. **Conduct incident response** if data may be compromised

### SQL Injection Remediation

```csharp
// ❌ Vulnerable code
string query = $"SELECT * FROM Users WHERE Email = '{email}'";

// ✅ Secure code
string query = "SELECT * FROM Users WHERE Email = @email";
command.Parameters.AddWithValue("@email", email);
```

### XSS Protection Remediation

```typescript
// ❌ Vulnerable code
element.innerHTML = userInput;

// ✅ Secure code
element.textContent = userInput;
// or
element.innerHTML = DOMPurify.sanitize(userInput);
```

### Authentication Security Remediation

1. **Implement strong password policies**
2. **Add multi-factor authentication**
3. **Use secure session management**
4. **Implement account lockout**
5. **Add rate limiting**

### File Upload Security Remediation

1. **Validate file types** by content, not extension
2. **Implement size limits**
3. **Scan for malicious content**
4. **Store uploads outside web root**
5. **Use virus scanning**

## Security Testing Best Practices

### 1. Test Early and Often

- Run security tests in development
- Include security tests in pull request validation
- Schedule regular comprehensive scans

### 2. Maintain Test Coverage

- Add security tests for new features
- Update tests when security requirements change
- Review and update test data regularly

### 3. Follow Secure Development Lifecycle

1. **Requirements** - Define security requirements
2. **Design** - Conduct threat modeling
3. **Implementation** - Secure coding practices
4. **Testing** - Comprehensive security testing
5. **Deployment** - Secure configuration
6. **Maintenance** - Regular security updates

### 4. Monitor and Respond

- Set up alerts for security test failures
- Have incident response procedures ready
- Regularly review and update security measures

## Troubleshooting

### Common Issues

**Test Database Connection Issues:**
```bash
# Ensure PostgreSQL is running
docker run -d --name postgres-test -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:15
```

**JWT Token Generation Errors:**
```bash
# Set required environment variables
export JWT__Secret="your-test-secret-key-here"
export JWT__Issuer="ErgoPlannerTest"
export JWT__Audience="ErgoPlannerTest"
```

**Frontend Test Dependencies:**
```bash
# Install all dependencies including dev dependencies
npm install
npx playwright install
```

### Debug Mode

Enable verbose logging for debugging:

```bash
# Backend tests
dotnet test --logger "console;verbosity=diagnostic"

# Frontend tests
npm test -- --verbose
```

## Contributing

When adding new security tests:

1. Follow the existing naming conventions
2. Include comprehensive test data
3. Add appropriate documentation
4. Update this guide if needed
5. Ensure tests are reliable and deterministic

## References

- [OWASP Top 10 2021](https://owasp.org/Top10/)
- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [CIS Controls](https://www.cisecurity.org/controls/)
- [Microsoft Security Development Lifecycle](https://www.microsoft.com/en-us/securityengineering/sdl/)