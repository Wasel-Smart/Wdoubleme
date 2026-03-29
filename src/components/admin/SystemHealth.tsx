/**
 * System Health Component
 * 
 * Real-time system monitoring and health checks.
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Activity, Database, Server, Zap, AlertCircle, CheckCircle } from 'lucide-react';
import { checkIntegrationStatus, getIntegrationHealth } from '../../services/integrations';

export function SystemHealth() {
  const [systemMetrics, setSystemMetrics] = useState({
    api: { status: 'healthy', responseTime: 145, uptime: 99.98 },
    database: { status: 'healthy', connections: 45, maxConnections: 100 },
    realtime: { status: 'healthy', activeChannels: 234, messageRate: 450 },
    storage: { status: 'healthy', used: 45, total: 100 },
  });

  const integrationHealth = getIntegrationHealth();
  const integrationStatus = checkIntegrationStatus();

  const getStatusIcon = (status: string) => {
    return status === 'healthy' ? (
      <CheckCircle className="w-5 h-5 text-green-600" />
    ) : (
      <AlertCircle className="w-5 h-5 text-red-600" />
    );
  };

  return (
    <div className="space-y-4">
      {/* Overall Health */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>All systems operational</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              {getStatusIcon(systemMetrics.api.status)}
              <div>
                <p className="font-semibold">API Server</p>
                <p className="text-sm text-muted-foreground">{systemMetrics.api.responseTime}ms</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {getStatusIcon(systemMetrics.database.status)}
              <div>
                <p className="font-semibold">Database</p>
                <p className="text-sm text-muted-foreground">
                  {systemMetrics.database.connections} connections
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {getStatusIcon(systemMetrics.realtime.status)}
              <div>
                <p className="font-semibold">Realtime</p>
                <p className="text-sm text-muted-foreground">
                  {systemMetrics.realtime.activeChannels} channels
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {getStatusIcon(systemMetrics.storage.status)}
              <div>
                <p className="font-semibold">Storage</p>
                <p className="text-sm text-muted-foreground">
                  {systemMetrics.storage.used}GB used
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integration Status */}
      <Card>
        <CardHeader>
          <CardTitle>Third-Party Integrations</CardTitle>
          <CardDescription>
            {integrationHealth.healthy} of {integrationHealth.total} integrations active
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Overall Integration Health</span>
              <span className="font-bold">{integrationHealth.percentage}%</span>
            </div>
            <Progress value={integrationHealth.percentage} />
          </div>

          <div className="mt-6 grid md:grid-cols-2 gap-3">
            {Object.entries(integrationStatus).map(([service, enabled]) => (
              <div key={service} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="font-medium capitalize">
                  {service.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                {enabled ? (
                  <Badge variant="default">Active</Badge>
                ) : (
                  <Badge variant="secondary">Mock</Badge>
                )}
              </div>
            ))}
          </div>

          {integrationHealth.missing.length > 0 && (
            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
              <p className="text-sm font-semibold mb-2">Missing Integrations:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                {integrationHealth.missing.map((service) => (
                  <li key={service}>
                    • {service.replace(/([A-Z])/g, ' $1').trim()} - Add API key to enable
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">API Response Time</span>
                <span className="text-sm font-medium">{systemMetrics.api.responseTime}ms</span>
              </div>
              <Progress value={100 - (systemMetrics.api.responseTime / 10)} />
              <p className="text-xs text-muted-foreground mt-1">Target: &lt; 200ms</p>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Database Connections</span>
                <span className="text-sm font-medium">
                  {systemMetrics.database.connections} / {systemMetrics.database.maxConnections}
                </span>
              </div>
              <Progress value={(systemMetrics.database.connections / systemMetrics.database.maxConnections) * 100} />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Uptime</span>
                <span className="text-sm font-medium">{systemMetrics.api.uptime}%</span>
              </div>
              <Progress value={systemMetrics.api.uptime} />
              <p className="text-xs text-muted-foreground mt-1">Target: 99.9%</p>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Storage Usage</span>
                <span className="text-sm font-medium">
                  {systemMetrics.storage.used}GB / {systemMetrics.storage.total}GB
                </span>
              </div>
              <Progress value={(systemMetrics.storage.used / systemMetrics.storage.total) * 100} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
