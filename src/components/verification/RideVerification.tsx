import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { QrCode, Scan, CheckCircle2, XCircle } from 'lucide-react';
import { TripVerificationService, BoardingPass } from '../../utils/verification/TripVerificationService';
import { toast } from 'sonner';
import { motion } from 'motion/react';

interface RideQRTicketProps {
  tripId: string;
  passengerId: string;
  passengerName: string;
}

export function RideQRTicket({ tripId, passengerId, passengerName }: RideQRTicketProps) {
  const [ticket, setTicket] = useState<BoardingPass | null>(null);

  useEffect(() => {
    // Generate a fresh ticket on mount (simulating fetching from backend)
    const pass = TripVerificationService.generateBoardingPass(tripId, passengerId, passengerName);
    setTicket(pass);
  }, [tripId, passengerId, passengerName]);

  if (!ticket) return null;

  return (
    <Card className="w-full max-w-sm mx-auto border-dashed border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-xl font-mono uppercase tracking-widest text-slate-800 dark:text-slate-200">
          Boarding Pass
        </CardTitle>
        <CardDescription className="text-xs">
          Scan this code to board the vehicle
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center space-y-4 py-6">
        <div className="relative group cursor-pointer">
          {/* Simulated QR Code using an icon for now */}
          <div className="w-48 h-48 bg-slate-900 rounded-xl flex items-center justify-center border-4 border-white shadow-xl">
             <QrCode className="w-32 h-32 text-white" />
          </div>
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
            <span className="text-white text-sm font-bold">Token: {ticket.token.slice(0, 8)}...</span>
          </div>
        </div>
        
        <div className="text-center space-y-1">
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{passengerName}</p>
          <p className="text-xs font-mono text-slate-500">TRIP ID: {tripId.slice(0, 8)}</p>
          <p className="text-xs font-mono text-slate-500">EXPIRES: {new Date(ticket.expiresAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
        </div>
      </CardContent>
      <CardFooter className="bg-slate-50 dark:bg-slate-900 border-t border-dashed border-slate-300 dark:border-slate-700 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Ready for scanning</span>
        </div>
        <Badge variant="outline" className="font-mono text-xs">
          {ticket.token}
        </Badge>
      </CardFooter>
    </Card>
  );
}

export function DriverQRScanner() {
  const [scanning, setScanning] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [scanResult, setScanResult] = useState<{ valid: boolean; message: string; passenger?: string } | null>(null);

  const handleScan = () => {
    setScanning(true);
    // Simulate camera activation
    setTimeout(() => {
      setScanning(false);
      // Simulate scanning a random valid code for demo purposes
      // In a real app, this would use the camera stream
      const mockToken = `PASS-${Math.random().toString(36).substring(2, 8).toUpperCase()}-1234`; 
      // This will fail unless we use a known token, so let's allow manual input for testing mainly.
      toast.error('Camera access denied in demo mode. Please use manual entry.', {
        description: 'Try entering a code from the passenger view.'
      });
    }, 1500);
  };

  const handleManualEntry = () => {
    if (!manualCode) return;

    const result = TripVerificationService.verifyPass(manualCode);
    setScanResult({
      valid: result.valid,
      message: result.message,
      passenger: result.pass?.passengerName
    });

    if (result.valid) {
      toast.success('Passenger Verified', { description: `Welcome aboard, ${result.pass?.passengerName}!` });
      setManualCode('');
    } else {
      toast.error('Verification Failed', { description: result.message });
    }
  };

  return (
    <Card className="w-full max-w-sm mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scan className="w-5 h-5 text-indigo-500" />
          Verify Passenger
        </CardTitle>
        <CardDescription>Scan QR code or enter token manually</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div 
          onClick={handleScan}
          className={`
            h-48 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors
            ${scanning ? 'bg-indigo-50 border-indigo-500 animate-pulse' : 'bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 hover:border-indigo-400'}
          `}
        >
          {scanning ? (
            <div className="text-center text-indigo-600">
              <Scan className="w-10 h-10 mx-auto mb-2 animate-spin-slow" />
              <p className="text-sm font-medium">Scanning...</p>
            </div>
          ) : (
            <div className="text-center text-slate-400">
              <QrCode className="w-10 h-10 mx-auto mb-2" />
              <p className="text-sm font-medium">Tap to Scan QR Code</p>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Input 
            placeholder="Enter token (e.g., PASS-XYZ-1234)" 
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            className="font-mono text-sm"
          />
          <Button onClick={handleManualEntry} disabled={!manualCode}>Verify</Button>
        </div>

        {scanResult && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg flex items-start gap-3 border ${scanResult.valid ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}
          >
            {scanResult.valid ? <CheckCircle2 className="w-5 h-5 mt-0.5" /> : <XCircle className="w-5 h-5 mt-0.5" />}
            <div>
              <p className="font-bold text-sm">{scanResult.valid ? 'Verified' : 'Invalid'}</p>
              <p className="text-xs opacity-90">{scanResult.message}</p>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
