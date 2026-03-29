import { useState } from 'react';
import { Truck, Box, Ruler, Weight, ShieldCheck, MapPin, Calendar, ArrowRight, PackageOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { useLanguage } from '../contexts/LanguageContext';

export function FreightShipping() {
  const [step, setStep] = useState(1);
  
  const handleQuote = () => {
    toast.success('Quote request sent! Carriers will respond shortly.');
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Freight Shipping</h1>
        <p className="text-muted-foreground">Heavy cargo transport across the GCC region.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Shipment Details</CardTitle>
              <CardDescription>Tell us about your cargo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Origin</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input className="pl-9" placeholder="City or Port" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Destination</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input className="pl-9" placeholder="City or Port" />
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <Label>Pickup Date</Label>
                   <div className="relative">
                     <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                     <Input type="date" className="pl-9" />
                   </div>
                 </div>
                 <div className="space-y-2">
                   <Label>Truck Type</Label>
                   <Select>
                     <SelectTrigger>
                       <SelectValue placeholder="Select vehicle" />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="pickup">Pickup (1 Ton)</SelectItem>
                       <SelectItem value="box">Box Truck (3 Ton)</SelectItem>
                       <SelectItem value="flatbed">Flatbed (12m)</SelectItem>
                       <SelectItem value="reefer">Refrigerated</SelectItem>
                     </SelectContent>
                   </Select>
                 </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                 <h3 className="font-semibold flex items-center gap-2">
                   <PackageOpen className="w-4 h-4" /> Cargo Specifications
                 </h3>
                 <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Weight (kg)</Label>
                      <div className="relative">
                        <Weight className="absolute left-3 top-2.5 h-3 w-3 text-muted-foreground" />
                        <Input className="pl-8" placeholder="0" type="number" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Volume (m³)</Label>
                      <div className="relative">
                        <Box className="absolute left-3 top-2.5 h-3 w-3 text-muted-foreground" />
                        <Input className="pl-8" placeholder="0" type="number" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Items</Label>
                      <Input placeholder="Qty" type="number" />
                    </div>
                 </div>
              </div>
              
              <Button size="lg" className="w-full bg-slate-800 hover:bg-slate-900" onClick={handleQuote}>
                Get Freight Quote
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-slate-900 text-white border-0">
             <CardContent className="p-6">
               <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                 <ShieldCheck className="w-5 h-5 text-green-400" />
                 Wasel Freight Guarantee
               </h3>
               <ul className="space-y-4 text-sm text-slate-300">
                 <li className="flex gap-3">
                   <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center shrink-0">1</div>
                   <span>GPS Tracking for all shipments</span>
                 </li>
                 <li className="flex gap-3">
                   <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center shrink-0">2</div>
                   <span>Cargo Insurance up to JOD 100k</span>
                 </li>
                 <li className="flex gap-3">
                   <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center shrink-0">3</div>
                   <span>Verified Corporate Carriers</span>
                 </li>
               </ul>
             </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Recent Quotes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm border-b pb-2">
                  <div className="flex flex-col">
                    <span className="font-semibold">DXB → RUH</span>
                    <span className="text-xs text-muted-foreground">3 Ton Box Truck</span>
                  </div>
                  <Badge variant="secondary">Pending</Badge>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <div className="flex flex-col">
                    <span className="font-semibold">JED → DAM</span>
                    <span className="text-xs text-muted-foreground">Flatbed</span>
                  </div>
                  <span className="font-mono font-bold">JOD 2,400</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
