/**
 * Trip Export Component
 * 
 * Export trip history to CSV/PDF for record keeping.
 */

import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Label } from './ui/label';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/core';
import { toast } from 'sonner';

export function TripExport() {
  const { user } = useAuth();
  const [format, setFormat] = useState<'csv' | 'pdf'>('csv');
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year' | 'all'>('month');
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);

    try {
      // Calculate date range
      const now = new Date();
      let startDate: Date;

      switch (period) {
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'quarter':
          const quarter = Math.floor(now.getMonth() / 3);
          startDate = new Date(now.getFullYear(), quarter * 3, 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(0); // All time
      }

      // Fetch trips
      const { data: trips, error } = await supabase
        .from('trips')
        .select('*')
        .eq('passenger_id', user?.id)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!trips || trips.length === 0) {
        toast.error('No trips found for the selected period');
        return;
      }

      if (format === 'csv') {
        exportToCSV(trips);
      } else {
        exportToPDF(trips);
      }

      toast.success(`Trip history exported successfully (${trips.length} trips)`);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export trip history');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = (trips: any[]) => {
    // CSV headers
    const headers = [
      'Trip ID',
      'Date',
      'Time',
      'From',
      'To',
      'Distance (km)',
      'Duration (min)',
      'Fare (JOD)',
      'Payment Method',
      'Status',
      'Driver',
      'Rating',
    ];

    // CSV rows
    const rows = trips.map(trip => [
      trip.id.slice(0, 8),
      new Date(trip.created_at).toLocaleDateString(),
      new Date(trip.created_at).toLocaleTimeString(),
      trip.from_location || 'N/A',
      trip.to_location || 'N/A',
      trip.distance ? (trip.distance / 1000).toFixed(2) : 'N/A',
      trip.duration ? Math.round(trip.duration / 60) : 'N/A',
      trip.fare?.toFixed(2) || '0.00',
      trip.payment_method || 'N/A',
      trip.status || 'N/A',
      trip.driver_name || 'N/A', // Driver name from joined profile
      trip.driver_rating || 'N/A',
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `wasel-trips-${period}-${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = (trips: any[]) => {
    // In production, use jsPDF or similar library
    // For now, create a printable HTML version

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Wasel Trip History</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          h1 { color: #6366f1; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #6366f1; color: white; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .summary { background: #f0f0f0; padding: 20px; margin: 20px 0; border-radius: 8px; }
        </style>
      </head>
      <body>
        <h1>Wasel Trip History</h1>
        <p>Generated on: ${new Date().toLocaleString()}</p>
        <p>Period: ${period}</p>
        
        <div class="summary">
          <h3>Summary</h3>
          <p>Total Trips: ${trips.length}</p>
          <p>Total Spent: JOD ${trips.reduce((sum, t) => sum + (t.fare || 0), 0).toFixed(2)}</p>
          <p>Total Distance: ${(trips.reduce((sum, t) => sum + (t.distance || 0), 0) / 1000).toFixed(2)} km</p>
        </div>

        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>From</th>
              <th>To</th>
              <th>Distance</th>
              <th>Fare</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${trips.map(trip => `
              <tr>
                <td>${new Date(trip.created_at).toLocaleDateString()}</td>
                <td>${trip.from_location || 'N/A'}</td>
                <td>${trip.to_location || 'N/A'}</td>
                <td>${trip.distance ? (trip.distance / 1000).toFixed(2) + ' km' : 'N/A'}</td>
                <td>JOD ${trip.fare?.toFixed(2) || '0.00'}</td>
                <td>${trip.status || 'N/A'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    // Open in new window for printing
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Auto-print after a short delay
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Export Trip History</CardTitle>
        <CardDescription>
          Download your trip records for personal use or tax purposes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Export Format</Label>
            <Select value={format} onValueChange={(v) => setFormat(v as typeof format)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4" />
                    CSV (Excel)
                  </div>
                </SelectItem>
                <SelectItem value="pdf">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    PDF (Printable)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Time Period</Label>
            <Select value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={handleExport} disabled={loading} className="w-full">
          <Download className="w-4 h-4 mr-2" />
          {loading ? 'Exporting...' : 'Export Trip History'}
        </Button>

        <div className="p-4 bg-muted rounded-lg text-sm text-muted-foreground">
          <p className="font-semibold mb-2">Export includes:</p>
          <ul className="space-y-1">
            <li>• Trip dates and times</li>
            <li>• Pickup and dropoff locations</li>
            <li>• Distance and duration</li>
            <li>• Fare breakdown</li>
            <li>• Payment method</li>
            <li>• Driver ratings</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}