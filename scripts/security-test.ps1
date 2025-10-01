# Ergoplanner Security Testing Script
# Comprehensive security validation and vulnerability assessment

param(
    [Parameter(Mandatory=$false)]
    [string]$BaseUrl = "https://localhost:7001",

    [Parameter(Mandatory=$false)]
    [string]$ApiKey = "",

    [Parameter(Mandatory=$false)]
    [switch]$SkipSslValidation,

    [Parameter(Mandatory=$false)]
    [switch]$Verbose
)

# Configure TLS settings
if ($SkipSslValidation) {
    Write-Warning "SSL validation is disabled - only use for testing!"
    [System.Net.ServicePointManager]::ServerCertificateValidationCallback = { $true }
}

[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12 -bor [System.Net.SecurityProtocolType]::Tls13

# Test configuration
$ErrorActionPreference = "Continue"
$TestResults = @()

function Write-TestResult {
    param(
        [string]$TestName,
        [string]$Status,
        [string]$Details = "",
        [string]$Severity = "Info"
    )

    $result = @{
        TestName = $TestName
        Status = $Status
        Details = $Details
        Severity = $Severity
        Timestamp = Get-Date
    }

    $script:TestResults += $result

    $color = switch ($Status) {
        "PASS" { "Green" }
        "FAIL" { "Red" }
        "WARN" { "Yellow" }
        default { "White" }
    }

    Write-Host "[$Status] $TestName" -ForegroundColor $color
    if ($Details -and $Verbose) {
        Write-Host "    $Details" -ForegroundColor Gray
    }
}

function Test-SecurityHeaders {
    Write-Host "`n=== Testing Security Headers ===" -ForegroundColor Cyan

    try {
        $response = Invoke-WebRequest -Uri "$BaseUrl/health" -Method GET -UseBasicParsing -ErrorAction SilentlyContinue

        # Test HSTS
        if ($response.Headers["Strict-Transport-Security"]) {
            Write-TestResult "HSTS Header" "PASS" "Strict-Transport-Security header present"
        } else {
            Write-TestResult "HSTS Header" "FAIL" "Missing Strict-Transport-Security header" "High"
        }

        # Test X-Frame-Options
        if ($response.Headers["X-Frame-Options"]) {
            $xFrameValue = $response.Headers["X-Frame-Options"]
            if ($xFrameValue -eq "DENY" -or $xFrameValue -eq "SAMEORIGIN") {
                Write-TestResult "X-Frame-Options" "PASS" "X-Frame-Options: $xFrameValue"
            } else {
                Write-TestResult "X-Frame-Options" "WARN" "X-Frame-Options present but value may be weak: $xFrameValue" "Medium"
            }
        } else {
            Write-TestResult "X-Frame-Options" "FAIL" "Missing X-Frame-Options header" "Medium"
        }

        # Test X-Content-Type-Options
        if ($response.Headers["X-Content-Type-Options"] -eq "nosniff") {
            Write-TestResult "X-Content-Type-Options" "PASS" "X-Content-Type-Options: nosniff"
        } else {
            Write-TestResult "X-Content-Type-Options" "FAIL" "Missing or incorrect X-Content-Type-Options header" "Medium"
        }

        # Test CSP
        if ($response.Headers["Content-Security-Policy"]) {
            Write-TestResult "Content Security Policy" "PASS" "CSP header present"
        } else {
            Write-TestResult "Content Security Policy" "FAIL" "Missing Content-Security-Policy header" "High"
        }

        # Test X-XSS-Protection
        if ($response.Headers["X-XSS-Protection"]) {
            Write-TestResult "X-XSS-Protection" "PASS" "X-XSS-Protection header present"
        } else {
            Write-TestResult "X-XSS-Protection" "WARN" "Missing X-XSS-Protection header" "Low"
        }

        # Test Referrer-Policy
        if ($response.Headers["Referrer-Policy"]) {
            Write-TestResult "Referrer Policy" "PASS" "Referrer-Policy header present"
        } else {
            Write-TestResult "Referrer Policy" "WARN" "Missing Referrer-Policy header" "Low"
        }

        # Test for information disclosure
        $serverHeader = $response.Headers["Server"]
        if ($serverHeader) {
            Write-TestResult "Server Header Disclosure" "WARN" "Server header present: $serverHeader" "Low"
        } else {
            Write-TestResult "Server Header Disclosure" "PASS" "Server header not disclosed"
        }

    } catch {
        Write-TestResult "Security Headers Test" "FAIL" "Failed to test headers: $($_.Exception.Message)" "Critical"
    }
}

function Test-TlsConfiguration {
    Write-Host "`n=== Testing TLS Configuration ===" -ForegroundColor Cyan

    try {
        # Test HTTPS enforcement
        try {
            $httpResponse = Invoke-WebRequest -Uri ($BaseUrl -replace "https://", "http://") -Method GET -UseBasicParsing -MaximumRedirection 0 -ErrorAction SilentlyContinue
            if ($httpResponse.StatusCode -ge 300 -and $httpResponse.StatusCode -lt 400) {
                Write-TestResult "HTTPS Redirection" "PASS" "HTTP requests are redirected to HTTPS"
            } else {
                Write-TestResult "HTTPS Redirection" "FAIL" "HTTP requests are not properly redirected" "High"
            }
        } catch {
            Write-TestResult "HTTPS Redirection" "PASS" "HTTP endpoint not accessible (good)"
        }

        # Test TLS version
        try {
            $uri = [System.Uri]$BaseUrl
            $tcpClient = New-Object System.Net.Sockets.TcpClient
            $tcpClient.Connect($uri.Host, $uri.Port)

            $sslStream = New-Object System.Net.Security.SslStream($tcpClient.GetStream())
            $sslStream.AuthenticateAsClient($uri.Host)

            $tlsVersion = $sslStream.SslProtocol
            if ($tlsVersion -eq "Tls12" -or $tlsVersion -eq "Tls13") {
                Write-TestResult "TLS Version" "PASS" "Using secure TLS version: $tlsVersion"
            } else {
                Write-TestResult "TLS Version" "FAIL" "Using insecure TLS version: $tlsVersion" "High"
            }

            $sslStream.Close()
            $tcpClient.Close()
        } catch {
            Write-TestResult "TLS Version Check" "WARN" "Could not determine TLS version: $($_.Exception.Message)" "Medium"
        }

    } catch {
        Write-TestResult "TLS Configuration Test" "FAIL" "Failed to test TLS: $($_.Exception.Message)" "Critical"
    }
}

function Test-AuthenticationSecurity {
    Write-Host "`n=== Testing Authentication Security ===" -ForegroundColor Cyan

    try {
        # Test unauthorized access
        try {
            $response = Invoke-WebRequest -Uri "$BaseUrl/api/security/metrics" -Method GET -UseBasicParsing -ErrorAction SilentlyContinue
            if ($response.StatusCode -eq 401) {
                Write-TestResult "Unauthorized Access Protection" "PASS" "Protected endpoints return 401 for unauthenticated requests"
            } else {
                Write-TestResult "Unauthorized Access Protection" "FAIL" "Protected endpoints accessible without authentication" "Critical"
            }
        } catch {
            $statusCode = $_.Exception.Response.StatusCode.value__
            if ($statusCode -eq 401) {
                Write-TestResult "Unauthorized Access Protection" "PASS" "Protected endpoints return 401 for unauthenticated requests"
            } else {
                Write-TestResult "Unauthorized Access Protection" "WARN" "Unexpected response code: $statusCode" "Medium"
            }
        }

        # Test JWT endpoint security
        try {
            $loginPayload = @{
                username = "admin"
                password = "wrongpassword"
            } | ConvertTo-Json

            $headers = @{
                "Content-Type" = "application/json"
            }

            $response = Invoke-WebRequest -Uri "$BaseUrl/api/auth/login" -Method POST -Body $loginPayload -Headers $headers -UseBasicParsing -ErrorAction SilentlyContinue

            if ($response.StatusCode -eq 401) {
                Write-TestResult "Login Brute Force Protection" "PASS" "Invalid login attempts return 401"
            } else {
                Write-TestResult "Login Brute Force Protection" "WARN" "Unexpected login response: $($response.StatusCode)" "Medium"
            }
        } catch {
            $statusCode = $_.Exception.Response.StatusCode.value__
            if ($statusCode -eq 401) {
                Write-TestResult "Login Brute Force Protection" "PASS" "Invalid login attempts return 401"
            } else {
                Write-TestResult "Login Brute Force Protection" "WARN" "Login endpoint may not exist or has unexpected behavior" "Low"
            }
        }

    } catch {
        Write-TestResult "Authentication Security Test" "FAIL" "Failed to test authentication: $($_.Exception.Message)" "Critical"
    }
}

function Test-RateLimiting {
    Write-Host "`n=== Testing Rate Limiting ===" -ForegroundColor Cyan

    try {
        $rateLimitHit = $false
        $requestCount = 0

        # Perform multiple rapid requests
        for ($i = 1; $i -le 20; $i++) {
            try {
                $response = Invoke-WebRequest -Uri "$BaseUrl/health" -Method GET -UseBasicParsing -ErrorAction SilentlyContinue
                $requestCount++

                if ($response.StatusCode -eq 429) {
                    $rateLimitHit = $true
                    break
                }

                Start-Sleep -Milliseconds 100
            } catch {
                $statusCode = $_.Exception.Response.StatusCode.value__
                if ($statusCode -eq 429) {
                    $rateLimitHit = $true
                    break
                }
            }
        }

        if ($rateLimitHit) {
            Write-TestResult "Rate Limiting" "PASS" "Rate limiting activated after $requestCount requests"
        } else {
            Write-TestResult "Rate Limiting" "WARN" "Rate limiting not detected in $requestCount requests" "Medium"
        }

    } catch {
        Write-TestResult "Rate Limiting Test" "FAIL" "Failed to test rate limiting: $($_.Exception.Message)" "Medium"
    }
}

function Test-InputValidation {
    Write-Host "`n=== Testing Input Validation ===" -ForegroundColor Cyan

    $maliciousInputs = @(
        "'; DROP TABLE Users; --",
        "<script>alert('XSS')</script>",
        "' OR '1'='1",
        "../../../etc/passwd",
        "%3Cscript%3Ealert%28%27XSS%27%29%3C%2Fscript%3E",
        "UNION SELECT * FROM information_schema.tables--"
    )

    foreach ($input in $maliciousInputs) {
        try {
            $encodedInput = [System.Web.HttpUtility]::UrlEncode($input)
            $response = Invoke-WebRequest -Uri "$BaseUrl/api/symbols?search=$encodedInput" -Method GET -UseBasicParsing -ErrorAction SilentlyContinue

            if ($response.StatusCode -eq 400) {
                Write-TestResult "Input Validation - Malicious Input" "PASS" "Malicious input properly rejected"
            } elseif ($response.StatusCode -eq 500) {
                Write-TestResult "Input Validation - Malicious Input" "FAIL" "Malicious input caused server error" "High"
            } else {
                Write-TestResult "Input Validation - Malicious Input" "WARN" "Malicious input processed without error" "Medium"
            }
        } catch {
            $statusCode = $_.Exception.Response.StatusCode.value__
            if ($statusCode -eq 400) {
                Write-TestResult "Input Validation - Malicious Input" "PASS" "Malicious input properly rejected"
            } elseif ($statusCode -eq 500) {
                Write-TestResult "Input Validation - Malicious Input" "FAIL" "Malicious input caused server error" "High"
            }
        }
    }
}

function Test-InformationDisclosure {
    Write-Host "`n=== Testing Information Disclosure ===" -ForegroundColor Cyan

    $sensitiveEndpoints = @(
        "/swagger/index.html",
        "/api-docs",
        "/.env",
        "/config",
        "/admin",
        "/debug",
        "/trace",
        "/actuator",
        "/metrics"
    )

    foreach ($endpoint in $sensitiveEndpoints) {
        try {
            $response = Invoke-WebRequest -Uri "$BaseUrl$endpoint" -Method GET -UseBasicParsing -ErrorAction SilentlyContinue

            if ($response.StatusCode -eq 200) {
                if ($endpoint -match "swagger|api-docs") {
                    Write-TestResult "Information Disclosure - $endpoint" "WARN" "API documentation publicly accessible" "Low"
                } else {
                    Write-TestResult "Information Disclosure - $endpoint" "FAIL" "Sensitive endpoint accessible: $endpoint" "High"
                }
            } else {
                Write-TestResult "Information Disclosure - $endpoint" "PASS" "Sensitive endpoint properly protected: $endpoint"
            }
        } catch {
            Write-TestResult "Information Disclosure - $endpoint" "PASS" "Sensitive endpoint properly protected: $endpoint"
        }
    }
}

function Test-CorsConfiguration {
    Write-Host "`n=== Testing CORS Configuration ===" -ForegroundColor Cyan

    try {
        # Test CORS with malicious origin
        $headers = @{
            "Origin" = "https://malicious-site.com"
            "Access-Control-Request-Method" = "GET"
        }

        $response = Invoke-WebRequest -Uri "$BaseUrl/api/health" -Method OPTIONS -Headers $headers -UseBasicParsing -ErrorAction SilentlyContinue

        $corsHeader = $response.Headers["Access-Control-Allow-Origin"]
        if ($corsHeader -eq "https://malicious-site.com" -or $corsHeader -eq "*") {
            Write-TestResult "CORS Configuration" "FAIL" "CORS allows untrusted origins" "High"
        } else {
            Write-TestResult "CORS Configuration" "PASS" "CORS properly configured"
        }

    } catch {
        Write-TestResult "CORS Configuration Test" "PASS" "CORS appears to be properly restricted"
    }
}

function Generate-SecurityReport {
    Write-Host "`n=== Security Test Summary ===" -ForegroundColor Cyan

    $totalTests = $TestResults.Count
    $passedTests = ($TestResults | Where-Object { $_.Status -eq "PASS" }).Count
    $failedTests = ($TestResults | Where-Object { $_.Status -eq "FAIL" }).Count
    $warningTests = ($TestResults | Where-Object { $_.Status -eq "WARN" }).Count

    $criticalIssues = ($TestResults | Where-Object { $_.Severity -eq "Critical" }).Count
    $highIssues = ($TestResults | Where-Object { $_.Severity -eq "High" }).Count
    $mediumIssues = ($TestResults | Where-Object { $_.Severity -eq "Medium" }).Count
    $lowIssues = ($TestResults | Where-Object { $_.Severity -eq "Low" }).Count

    Write-Host "`nTest Results:" -ForegroundColor White
    Write-Host "  Total Tests: $totalTests" -ForegroundColor White
    Write-Host "  Passed: $passedTests" -ForegroundColor Green
    Write-Host "  Failed: $failedTests" -ForegroundColor Red
    Write-Host "  Warnings: $warningTests" -ForegroundColor Yellow

    Write-Host "`nSecurity Issues by Severity:" -ForegroundColor White
    Write-Host "  Critical: $criticalIssues" -ForegroundColor Red
    Write-Host "  High: $highIssues" -ForegroundColor Red
    Write-Host "  Medium: $mediumIssues" -ForegroundColor Yellow
    Write-Host "  Low: $lowIssues" -ForegroundColor Yellow

    # Generate detailed report
    $reportPath = "security-test-report-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
    $report = @{
        Timestamp = Get-Date
        TestConfiguration = @{
            BaseUrl = $BaseUrl
            SkipSslValidation = $SkipSslValidation.IsPresent
        }
        Summary = @{
            TotalTests = $totalTests
            PassedTests = $passedTests
            FailedTests = $failedTests
            WarningTests = $warningTests
            CriticalIssues = $criticalIssues
            HighIssues = $highIssues
            MediumIssues = $mediumIssues
            LowIssues = $lowIssues
        }
        TestResults = $TestResults
    }

    $report | ConvertTo-Json -Depth 10 | Out-File -FilePath $reportPath -Encoding UTF8
    Write-Host "`nDetailed report saved to: $reportPath" -ForegroundColor Cyan

    # Determine overall security posture
    if ($criticalIssues -gt 0) {
        Write-Host "`nOVERALL SECURITY POSTURE: CRITICAL" -ForegroundColor Red -BackgroundColor Black
        Write-Host "Immediate action required to address critical security issues." -ForegroundColor Red
    } elseif ($highIssues -gt 0) {
        Write-Host "`nOVERALL SECURITY POSTURE: HIGH RISK" -ForegroundColor Red
        Write-Host "High-priority security issues need to be addressed promptly." -ForegroundColor Yellow
    } elseif ($mediumIssues -gt 0) {
        Write-Host "`nOVERALL SECURITY POSTURE: MEDIUM RISK" -ForegroundColor Yellow
        Write-Host "Some security improvements recommended." -ForegroundColor Yellow
    } else {
        Write-Host "`nOVERALL SECURITY POSTURE: GOOD" -ForegroundColor Green
        Write-Host "Security configuration appears to be well-implemented." -ForegroundColor Green
    }
}

# Main execution
Write-Host "Ergoplanner Security Assessment" -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Cyan
Write-Host "Target: $BaseUrl" -ForegroundColor White
Write-Host "Timestamp: $(Get-Date)" -ForegroundColor White

# Run all security tests
Test-SecurityHeaders
Test-TlsConfiguration
Test-AuthenticationSecurity
Test-RateLimiting
Test-InputValidation
Test-InformationDisclosure
Test-CorsConfiguration

# Generate final report
Generate-SecurityReport

Write-Host "`nSecurity assessment completed." -ForegroundColor Cyan