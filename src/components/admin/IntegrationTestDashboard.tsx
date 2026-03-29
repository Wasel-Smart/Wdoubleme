import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  Clock,
  Download,
  RefreshCw,
  AlertTriangle,
  Zap
} from 'lucide-react';
import { runIntegrationTests } from '../../tests/integration/integrationTests';

interface TestResult {
  service: string;
  test: string;
  passed: boolean;
  message: string;
  duration: number;
  timestamp: string;
}

export function IntegrationTestDashboard() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [testing, setTesting] = useState(false);
  const [progress, setProgress] = useState(0);

  const runTests = async () => {
    setTesting(true);
    setProgress(0);
    setResults([]);

    try {
      // Simulate progress
      const interval = setInterval(() => {
        setProgress(prev => Math.min(prev + 15, 95));
      }, 500);

      const testResults = await runIntegrationTests();
      
      clearInterval(interval);
      setProgress(100);
      setResults(testResults);
    } catch (error) {
      console.error('Error running tests:', error);
    } finally {
      setTesting(false);
    }
  };

  const downloadResults = () => {
    const dataStr = JSON.stringify(results, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `wasel-integration-tests-${new Date().toISOString()}.json`;
    link.click();
  };

  const stats = {
    total: results.length,
    passed: results.filter(r => r.passed).length,
    failed: results.filter(r => !r.passed).length,
    successRate: results.length > 0 ? Number(((results.filter(r => r.passed).length / results.length) * 100).toFixed(1)) : 0
  };

  const serviceGroups = results.reduce((acc, result) => {
    if (!acc[result.service]) {
      acc[result.service] = [];
    }
    acc[result.service].push(result);
    return acc;
  }, {} as Record<string, TestResult[]>);

  const criticalServices = ['Supabase', 'Backend'];
  const hasCriticalFailures = results.some(
    r => !r.passed && criticalServices.includes(r.service)
  );

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-olive-400 bg-clip-text text-transparent">
            Integration Test Dashboard
          </h1>
          <p className="text-gray-400 mt-2">Verify all API integrations before deployment</p>
        </div>
        <div className="flex gap-2">
          {results.length > 0 && (
            <Button onClick={downloadResults} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Results
            </Button>
          )}
          <Button 
            onClick={runTests} 
            disabled={testing}
            className="bg-gradient-to-r from-teal-500 to-olive-500"
          >
            {testing ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Run All Tests
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Testing Progress */}
      {testing && (
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Running integration tests...</span>
                <span className="text-white font-semibold">{progress}%</span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      {results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Tests</p>
                  <p className="text-3xl font-bold text-white mt-2">{stats.total}</p>
                </div>
                <Zap className="w-10 h-10 text-teal-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Passed</p>
                  <p className="text-3xl font-bold text-green-400 mt-2">{stats.passed}</p>
                </div>
                <CheckCircle className="w-10 h-10 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Failed</p>
                  <p className="text-3xl font-bold text-red-400 mt-2">{stats.failed}</p>
                </div>
                <XCircle className="w-10 h-10 text-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Success Rate</p>
                  <p className="text-3xl font-bold text-teal-400 mt-2">{stats.successRate}%</p>
                </div>
                <div className="text-4xl">
                  {stats.successRate >= 90 ? '🎉' : stats.successRate >= 70 ? '⚠️' : '❌'}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Deployment Status */}
      {results.length > 0 && (
        <Card className={`border-2 ${
          hasCriticalFailures 
            ? 'bg-red-900/20 border-red-500/50' 
            : stats.failed === 0 
            ? 'bg-green-900/20 border-green-500/50'
            : 'bg-yellow-900/20 border-yellow-500/50'
        }`}>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                {hasCriticalFailures ? (
                  <XCircle className="w-12 h-12 text-red-400" />
                ) : stats.failed === 0 ? (
                  <CheckCircle className="w-12 h-12 text-green-400" />
                ) : (
                  <AlertTriangle className="w-12 h-12 text-yellow-400" />
                )}
              </div>
              <div className="flex-1">
                <h3 className={`text-xl font-bold ${
                  hasCriticalFailures ? 'text-red-400' : stats.failed === 0 ? 'text-green-400' : 'text-yellow-400'
                }`}>
                  {hasCriticalFailures 
                    ? '🚫 NOT READY FOR DEPLOYMENT' 
                    : stats.failed === 0 
                    ? '✅ READY FOR DEPLOYMENT'
                    : '⚠️ READY WITH LIMITATIONS'}
                </h3>
                <p className="text-gray-300 mt-2">
                  {hasCriticalFailures 
                    ? 'Critical services (Supabase, Backend) are failing. Fix these issues before deploying.' 
                    : stats.failed === 0 
                    ? 'All integration tests passed! Your application is ready for production deployment.'
                    : 'Core services are working, but some optional integrations are failing. You can deploy with reduced functionality.'}
                </p>
                {stats.failed > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-400 mb-2">Failed tests:</p>
                    <div className="space-y-1">
                      {results.filter(r => !r.passed).map((result, idx) => (
                        <div key={idx} className="text-sm text-red-400">
                          • {result.service} - {result.test}: {result.message}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Results by Service */}
      {results.length > 0 && (
        <div className="grid gap-4">
          {Object.entries(serviceGroups).map(([service, tests]) => {
            const servicePassed = tests.every(t => t.passed);
            const avgDuration = tests.reduce((acc, t) => acc + t.duration, 0) / tests.length;

            return (
              <Card key={service} className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {servicePassed ? (
                        <CheckCircle className="w-6 h-6 text-green-400" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-400" />
                      )}
                      <div>
                        <CardTitle className="text-white">{service}</CardTitle>
                        <CardDescription>
                          {tests.length} test{tests.length > 1 ? 's' : ''} • Avg {avgDuration.toFixed(0)}ms
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className={servicePassed ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                      {tests.filter(t => t.passed).length}/{tests.length} Passed
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {tests.map((test, idx) => (
                      <div 
                        key={idx}
                        className={`p-4 rounded-lg border ${
                          test.passed 
                            ? 'bg-green-500/10 border-green-500/30' 
                            : 'bg-red-500/10 border-red-500/30'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            {test.passed ? (
                              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                            )}
                            <div>
                              <p className={`font-semibold ${test.passed ? 'text-green-400' : 'text-red-400'}`}>
                                {test.test}
                              </p>
                              <p className="text-sm text-gray-400 mt-1">{test.message}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Clock className="w-4 h-4" />
                            {test.duration}ms
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Initial State */}
      {results.length === 0 && !testing && (
        <Card className="bg-gray-900/50 border-gray-800">
          <CardContent className="p-12 text-center">
            <Zap className="w-16 h-16 text-teal-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Ready to Test Integrations</h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Run integration tests to verify all external APIs (Google Maps, Stripe, Twilio, Firebase) 
              are configured correctly and working.
            </p>
            <Button onClick={runTests} className="bg-gradient-to-r from-teal-500 to-olive-500">
              <Play className="w-4 h-4 mr-2" />
              Start Testing
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
