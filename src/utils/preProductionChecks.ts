/**
 * Pre-Production Validation Checks
 * Run these checks before deploying to staging or production
 */

import { projectId, publicAnonKey } from './supabase/info';
import { performHealthCheck } from './healthCheck';
import { appMetadata } from './config';

export interface PreProductionCheckResult {
  passed: boolean;
  category: string;
  check: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  critical: boolean;
}

export interface PreProductionReport {
  timestamp: string;
  environment: string;
  version: string;
  overallStatus: 'pass' | 'fail' | 'warning';
  totalChecks: number;
  passed: number;
  failed: number;
  warnings: number;
  criticalFailures: number;
  checks: PreProductionCheckResult[];
  readyForDeployment: boolean;
}

/**
 * Run all pre-production validation checks
 */
export async function runPreProductionChecks(): Promise<PreProductionReport> {
  const checks: PreProductionCheckResult[] = [];
  const startTime = Date.now();

  console.log('🔍 Starting Pre-Production Validation...\n');

  // Category 1: Environment Configuration
  checks.push({
    passed: !!projectId && projectId !== 'your-project-id',
    category: 'Environment',
    check: 'Supabase Project ID Configured',
    status: projectId && projectId !== 'your-project-id' ? 'pass' : 'fail',
    message: projectId ? `Project ID: ${projectId}` : 'Project ID not configured',
    critical: true,
  });

  checks.push({
    passed: !!publicAnonKey && publicAnonKey.length > 20,
    category: 'Environment',
    check: 'Supabase Anon Key Configured',
    status: publicAnonKey && publicAnonKey.length > 20 ? 'pass' : 'fail',
    message: publicAnonKey ? 'Anon key configured' : 'Anon key missing',
    critical: true,
  });

  checks.push({
    passed: appMetadata.version.includes('staging') || appMetadata.version.includes('prod'),
    category: 'Environment',
    check: 'Version Tagged Correctly',
    status: appMetadata.version.includes('staging') || appMetadata.version.includes('prod') ? 'pass' : 'warning',
    message: `Version: ${appMetadata.version}`,
    critical: false,
  });

  // Category 2: Backend Health
  let backendHealthy = false;
  try {
    const healthResult = await performHealthCheck();
    backendHealthy = healthResult.status === 'healthy';

    checks.push({
      passed: backendHealthy,
      category: 'Backend',
      check: 'Backend Health Check',
      status: healthResult.status === 'healthy' ? 'pass' : healthResult.status === 'degraded' ? 'warning' : 'fail',
      message: `Status: ${healthResult.status}, Latency: ${healthResult.latency.backend || 'N/A'}ms`,
      critical: true,
    });

    checks.push({
      passed: healthResult.checks.auth,
      category: 'Backend',
      check: 'Auth System',
      status: healthResult.checks.auth ? 'pass' : 'fail',
      message: healthResult.checks.auth ? 'Auth system operational' : 'Auth system not responding',
      critical: true,
    });

    checks.push({
      passed: healthResult.checks.database,
      category: 'Backend',
      check: 'Database Connection',
      status: healthResult.checks.database ? 'pass' : 'fail',
      message: healthResult.checks.database ? 'Database connected' : 'Database connection failed',
      critical: true,
    });

    // Check latency
    const latency = healthResult.latency.backend || 0;
    checks.push({
      passed: latency < 1000,
      category: 'Performance',
      check: 'API Latency',
      status: latency < 500 ? 'pass' : latency < 1000 ? 'warning' : 'fail',
      message: latency < 500 ? `${latency}ms (Excellent)` : latency < 1000 ? `${latency}ms (Acceptable)` : `${latency}ms (Slow)`,
      critical: false,
    });
  } catch (error) {
    checks.push({
      passed: false,
      category: 'Backend',
      check: 'Backend Health Check',
      status: 'fail',
      message: `Error: ${error}`,
      critical: true,
    });
  }

  // Category 3: API Endpoints (spot check critical endpoints)
  const criticalEndpoints = [
    { path: '/health', name: 'Health Endpoint' },
  ];

  for (const endpoint of criticalEndpoints) {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0b1f4071${endpoint.path}`,
        {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` },
          signal: AbortSignal.timeout(3000),
        }
      );

      checks.push({
        passed: response.ok,
        category: 'API',
        check: endpoint.name,
        status: response.ok ? 'pass' : 'fail',
        message: response.ok ? `${response.status} OK` : `${response.status} ${response.statusText}`,
        critical: true,
      });
    } catch (error) {
      checks.push({
        passed: false,
        category: 'API',
        check: endpoint.name,
        status: 'fail',
        message: `Error: ${error}`,
        critical: true,
      });
    }
  }

  // Category 4: Security Checks
  checks.push({
    passed: window.location.protocol === 'https:' || window.location.hostname === 'localhost',
    category: 'Security',
    check: 'HTTPS Enabled',
    status: window.location.protocol === 'https:' || window.location.hostname === 'localhost' ? 'pass' : 'warning',
    message: `Protocol: ${window.location.protocol}`,
    critical: appMetadata.environment === 'production',
  });

  checks.push({
    passed: !publicAnonKey.includes('test') && !publicAnonKey.includes('demo'),
    category: 'Security',
    check: 'Production Keys',
    status: !publicAnonKey.includes('test') && !publicAnonKey.includes('demo') ? 'pass' : 'warning',
    message: publicAnonKey.includes('test') || publicAnonKey.includes('demo') ? 'Using test/demo keys' : 'Production keys in use',
    critical: appMetadata.environment === 'production',
  });

  // Category 5: Browser Compatibility
  checks.push({
    passed: typeof window.localStorage !== 'undefined',
    category: 'Browser',
    check: 'LocalStorage Available',
    status: typeof window.localStorage !== 'undefined' ? 'pass' : 'fail',
    message: typeof window.localStorage !== 'undefined' ? 'LocalStorage supported' : 'LocalStorage not available',
    critical: true,
  });

  checks.push({
    passed: typeof window.fetch !== 'undefined',
    category: 'Browser',
    check: 'Fetch API Available',
    status: typeof window.fetch !== 'undefined' ? 'pass' : 'fail',
    message: typeof window.fetch !== 'undefined' ? 'Fetch API supported' : 'Fetch API not available',
    critical: true,
  });

  // Calculate results
  const passed = checks.filter(c => c.status === 'pass').length;
  const failed = checks.filter(c => c.status === 'fail').length;
  const warnings = checks.filter(c => c.status === 'warning').length;
  const criticalFailures = checks.filter(c => c.status === 'fail' && c.critical).length;

  const overallStatus: 'pass' | 'fail' | 'warning' = 
    criticalFailures > 0 ? 'fail' : 
    failed > 0 ? 'warning' : 
    warnings > 0 ? 'warning' : 'pass';

  const readyForDeployment = criticalFailures === 0 && failed === 0;

  const duration = Date.now() - startTime;

  const report: PreProductionReport = {
    timestamp: new Date().toISOString(),
    environment: appMetadata.environment,
    version: appMetadata.version,
    overallStatus,
    totalChecks: checks.length,
    passed,
    failed,
    warnings,
    criticalFailures,
    checks,
    readyForDeployment,
  };

  // Log results
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📊 PRE-PRODUCTION VALIDATION REPORT`);
  console.log(`${'='.repeat(60)}`);
  console.log(`Environment: ${report.environment}`);
  console.log(`Version: ${report.version}`);
  console.log(`Time: ${new Date(report.timestamp).toLocaleString()}`);
  console.log(`Duration: ${duration}ms`);
  console.log(`${'='.repeat(60)}`);
  console.log(`Total Checks: ${report.totalChecks}`);
  console.log(`✅ Passed: ${report.passed}`);
  console.log(`⚠️  Warnings: ${report.warnings}`);
  console.log(`❌ Failed: ${report.failed}`);
  console.log(`🚨 Critical Failures: ${report.criticalFailures}`);
  console.log(`${'='.repeat(60)}`);
  
  // Group by category
  const categories = [...new Set(checks.map(c => c.category))];
  categories.forEach(category => {
    const categoryChecks = checks.filter(c => c.category === category);
    const categoryPassed = categoryChecks.filter(c => c.status === 'pass').length;
    console.log(`\n${category}: ${categoryPassed}/${categoryChecks.length} passed`);
    categoryChecks.forEach(check => {
      const icon = check.status === 'pass' ? '✅' : check.status === 'warning' ? '⚠️' : '❌';
      const critical = check.critical ? ' [CRITICAL]' : '';
      console.log(`  ${icon} ${check.check}${critical}: ${check.message}`);
    });
  });

  console.log(`\n${'='.repeat(60)}`);
  console.log(`DEPLOYMENT STATUS: ${readyForDeployment ? '✅ READY' : '❌ NOT READY'}`);
  if (!readyForDeployment) {
    console.log(`\n⚠️  Fix ${criticalFailures} critical ${criticalFailures === 1 ? 'failure' : 'failures'} before deploying`);
  }
  console.log(`${'='.repeat(60)}\n`);

  return report;
}

/**
 * Run quick health check (non-blocking)
 */
export async function quickHealthCheck(): Promise<boolean> {
  try {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-0b1f4071/health`,
      {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` },
        signal: AbortSignal.timeout(3000),
      }
    );
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Print a simple status badge
 */
export function printStatusBadge(status: 'pass' | 'fail' | 'warning') {
  const badges = {
    pass: '🟢 ALL SYSTEMS GO',
    warning: '🟡 WARNINGS DETECTED',
    fail: '🔴 CRITICAL ISSUES',
  };
  console.log(`\n${badges[status]}\n`);
}
