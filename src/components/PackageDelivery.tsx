import { useState } from 'react';
import { Locate, CalendarClock, PackageCheck, TruckIcon, Scale, Info, ScanSearch, CircleDollarSign, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { tripsAPI } from '../services/trips';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useLanguage } from '../contexts/LanguageContext';

interface DeliveryResult {
  id: string;
  driver: string;
  rating: number;
  departureTime: string;
  price: number;
  dropoffType: 'door-to-door' | 'station-to-station';
}

export function PackageDelivery() {
  const [step, setStep] = useState<'search' | 'results' | 'details'>('search');
  const [packageSize, setPackageSize] = useState<'small' | 'medium' | 'large'>('small');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [selectedDriver, setSelectedDriver] = useState<DeliveryResult | null>(null);

  // Mock geocoding logic
  const geocodeLocation = (location: string): { lat: number; lng: number } => {
    const mockCoordinates: Record<string, { lat: number; lng: number }> = {
      'dubai': { lat: 25.2048, lng: 55.2708 },
      'abu dhabi': { lat: 24.4539, lng: 54.3773 },
      'riyadh': { lat: 24.7136, lng: 46.6753 },
    };
    const key = location.toLowerCase();
    return mockCoordinates[key] || { lat: 25.2048, lng: 55.2708 }; // Default
  };

  const handleSearch = () => {
    if (!from || !to) {
      toast.error("Please enter pickup and dropoff locations");
      return;
    }
    // Simulate API call
    setTimeout(() => {
      setStep('results');
    }, 1000);
  };

  const handleBook = (driver: DeliveryResult) => {
    setSelectedDriver(driver);
    setStep('details');
  };

  const confirmBooking = async () => {
    // Simulate server-side pricing check
    try {
      const data = await tripsAPI.calculatePrice(
        'package',
        packageSize === 'small' ? 1 : packageSize === 'medium' ? 10 : 25,
        120, // mock
        selectedDriver?.price
      );
      toast.success(`Delivery booked! Total: JOD ${data.price || selectedDriver?.price}`);
      setStep('search');
      setFrom('');
      setTo('');
    } catch (e) {
      toast.error("Booking failed");
    }
  };

  // Mock results
  const results: DeliveryResult[] = [
    { id: '1', driver: 'Ahmed K.', rating: 4.9, departureTime: '14:00', price: 35, dropoffType: 'door-to-door' },
    { id: '2', driver: 'Sarah M.', rating: 4.8, departureTime: '15:30', price: 25, dropoffType: 'station-to-station' },
    { id: '3', driver: 'Faisal R.', rating: 5.0, departureTime: '16:45', price: 40, dropoffType: 'door-to-door' },
  ];

  return (
    <div className="container mx-auto py-8 px-4 space-y-8 max-w-5xl">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        
        {/* Main Content */}
        <div className="flex-1 w-full space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Wasel Delivery</h1>
            <p className="text-muted-foreground mt-2">
              Send packages securely with trusted Captains travelling your way.
            </p>
          </div>

          {step === 'search' && (
            <Card className="border-t-4 border-t-primary shadow-lg">
              <CardHeader className="bg-gradient-to-br from-primary/5 to-transparent">
                <CardTitle className="flex items-center gap-2">
                  <PackageCheck className="h-6 w-6 text-primary" />
                  Ship a Package
                </CardTitle>
                <CardDescription>Choose pickup, dropoff, and package size for instant quotes.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                {/* Location Inputs */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-base">
                      <Locate className="h-4 w-4 text-primary" />
                      Pickup Location
                    </Label>
                    <div className="relative">
                      <Locate className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input 
                        placeholder="Enter city, district, or landmark" 
                        className="pl-10 h-11 border-2 focus:border-primary transition-colors" 
                        value={from}
                        onChange={(e) => setFrom(e.target.value)}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Where should we collect the package?</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-base">
                      <Locate className="h-4 w-4 text-primary" />
                      Dropoff Location
                    </Label>
                    <div className="relative">
                      <Locate className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input 
                        placeholder="Enter destination address" 
                        className="pl-10 h-11 border-2 focus:border-primary transition-colors"
                        value={to}
                        onChange={(e) => setTo(e.target.value)}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Where should we deliver it?</p>
                  </div>
                </div>

                <Separator />

                {/* Package Size Selection */}
                <div className="space-y-4">
                  <Label className="flex items-center gap-2 text-base">
                    <Scale className="h-4 w-4 text-primary" />
                    Package Size
                  </Label>
                  <RadioGroup value={packageSize} onValueChange={(v) => setPackageSize(v as any)} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                      <RadioGroupItem value="small" id="small" className="peer sr-only" />
                      <Label htmlFor="small" className="flex flex-col items-center gap-3 rounded-xl border-2 border-muted bg-background p-5 hover:bg-accent hover:shadow-md cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 peer-data-[state=checked]:shadow-md">
                        <PackageCheck className="h-8 w-8 text-primary" />
                        <div className="text-center space-y-1">
                          <div className="font-semibold">Small</div>
                          <Badge variant="outline" className="text-xs">Under 2kg</Badge>
                          <p className="text-xs text-muted-foreground">Documents & keys</p>
                        </div>
                      </Label>
                    </div>
                    <div className="relative">
                      <RadioGroupItem value="medium" id="medium" className="peer sr-only" />
                      <Label htmlFor="medium" className="flex flex-col items-center gap-3 rounded-xl border-2 border-muted bg-background p-5 hover:bg-accent hover:shadow-md cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 peer-data-[state=checked]:shadow-md">
                        <PackageCheck className="h-9 w-9 text-primary" />
                        <div className="text-center space-y-1">
                          <div className="font-semibold">Medium</div>
                          <Badge variant="outline" className="text-xs">2-18kg</Badge>
                          <p className="text-xs text-muted-foreground">Boxes & bags</p>
                        </div>
                      </Label>
                    </div>
                    <div className="relative">
                      <RadioGroupItem value="large" id="large" className="peer sr-only" />
                      <Label htmlFor="large" className="flex flex-col items-center gap-3 rounded-xl border-2 border-muted bg-background p-5 hover:bg-accent hover:shadow-md cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 peer-data-[state=checked]:shadow-md">
                        <TruckIcon className="h-10 w-10 text-primary" />
                        <div className="text-center space-y-1">
                          <div className="font-semibold">Large</div>
                          <Badge variant="outline" className="text-xs">Over 20kg</Badge>
                          <p className="text-xs text-muted-foreground">Heavy items</p>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <Separator />

                {/* Date Selection */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-base">
                    <CalendarClock className="h-4 w-4 text-primary" />
                    Preferred Delivery Date
                  </Label>
                  <div className="relative">
                    <CalendarClock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <Input type="date" className="pl-10 h-11 border-2 focus:border-primary transition-colors" />
                  </div>
                  <p className="text-xs text-muted-foreground">Select when you need this delivered</p>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex gap-3">
                    <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="space-y-2 text-sm">
                      <p className="font-medium text-blue-900 dark:text-blue-100">Why choose Wasel Delivery?</p>
                      <ul className="space-y-1 text-blue-800 dark:text-blue-200 text-xs">
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-0.5">✓</span>
                          <span>Connect with verified Captains already traveling your route</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-0.5">✓</span>
                          <span>Save up to 60% compared to traditional courier services</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-0.5">✓</span>
                          <span>Track your package in real-time with photo confirmation</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <Button size="lg" className="w-full h-12 text-base shadow-md hover:shadow-lg transition-all" onClick={handleSearch}>
                  <ScanSearch className="mr-2 h-5 w-5" /> Find Available Captains
                </Button>
              </CardContent>
            </Card>
          )}

          {step === 'results' && (
            <div className="space-y-4">
               <Button variant="ghost" onClick={() => setStep('search')} className="mb-2">← Back to Search</Button>
               <h2 className="text-xl font-semibold">Available Captains</h2>
               {results.map((res) => (
                 <Card key={res.id} className="hover:shadow-md transition-shadow">
                   <CardContent className="flex items-center justify-between p-6">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                          {res.driver.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-bold">{res.driver}</h3>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <span className="text-yellow-500 mr-1">★</span> {res.rating}
                            <span className="mx-2">•</span>
                            Leaving at {res.departureTime}
                          </div>
                          <Badge variant="outline" className="mt-1">{res.dropoffType}</Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">JOD {res.price}</div>
                        <Button size="sm" className="mt-2" onClick={() => handleBook(res)}>Book Delivery</Button>
                      </div>
                   </CardContent>
                 </Card>
               ))}
            </div>
          )}

          {step === 'details' && selectedDriver && (
             <Card>
               <CardHeader>
                 <CardTitle>Confirm Delivery</CardTitle>
               </CardHeader>
               <CardContent className="space-y-6">
                 <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">From:</span>
                      <span className="font-medium">{from}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">To:</span>
                      <span className="font-medium">{to}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Captain:</span>
                      <span className="font-medium">{selectedDriver.driver}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span>JOD {selectedDriver.price}</span>
                    </div>
                 </div>
                 <div className="space-y-2">
                   <Label>Package Contents Description</Label>
                   <Input placeholder="e.g., Documents, Clothing, Spare parts..." />
                 </div>
                 <Button className="w-full" size="lg" onClick={confirmBooking}>Confirm & Pay</Button>
               </CardContent>
             </Card>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="hidden md:block w-80 space-y-6">
          <div className="rounded-xl overflow-hidden shadow-lg">
             <ImageWithFallback 
                src="https://images.unsplash.com/photo-1645036828166-0b6a5f3f65ed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYWNrYWdlJTIwZGVsaXZlcnklMjBjYXIlMjB0cnVua3xlbnwxfHx8fDE3NjQ1NTYwMDB8MA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Package Delivery"
                className="w-full h-48 object-cover"
             />
          </div>
          
          {/* Enhanced Pricing Guide */}
          <Card className="border-2 border-primary/20 shadow-lg">
            <CardHeader className="bg-gradient-to-br from-primary/10 to-primary/5 pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <CircleDollarSign className="h-5 w-5 text-primary" />
                </div>
                Transparent Pricing
              </CardTitle>
              <CardDescription className="text-xs">
                Fair rates based on package size and distance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              {/* Small Package */}
              <div className="space-y-3 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <PackageCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <span className="font-semibold text-green-900 dark:text-green-100">Small Package</span>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100">
                    Under 2kg
                  </Badge>
                </div>
                <div className="space-y-1.5 text-sm">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-green-700 dark:text-green-300">JOD 15</span>
                    <span className="text-xs text-green-600 dark:text-green-400">starting price</span>
                  </div>
                  <p className="text-xs text-green-800 dark:text-green-200 leading-relaxed">
                    Perfect for documents, keys, phones, and small items
                  </p>
                </div>
              </div>

              <Separator />

              {/* Medium Package */}
              <div className="space-y-3 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <PackageCheck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    <span className="font-semibold text-blue-900 dark:text-blue-100">Medium Package</span>
                  </div>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100">
                    2-18kg
                  </Badge>
                </div>
                <div className="space-y-1.5 text-sm">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-blue-700 dark:text-blue-300">JOD 35</span>
                    <span className="text-xs text-blue-600 dark:text-blue-400">starting price</span>
                  </div>
                  <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
                    Ideal for bags, boxes, small electronics, and gifts
                  </p>
                </div>
              </div>

              <Separator />

              {/* Large Package */}
              <div className="space-y-3 p-4 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <TruckIcon className="h-7 w-7 text-purple-600 dark:text-purple-400" />
                    <span className="font-semibold text-purple-900 dark:text-purple-100">Large Package</span>
                  </div>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-100">
                    Over 20kg
                  </Badge>
                </div>
                <div className="space-y-1.5 text-sm">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-purple-700 dark:text-purple-300">JOD 60</span>
                    <span className="text-xs text-purple-600 dark:text-purple-400">starting price</span>
                  </div>
                  <p className="text-xs text-purple-800 dark:text-purple-200 leading-relaxed">
                    Great for heavy equipment, suitcases, and large items
                  </p>
                </div>
              </div>

              <Separator className="my-4" />

              {/* Additional Info */}
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                <div className="flex gap-2">
                  <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-amber-900 dark:text-amber-100">
                      Price includes:
                    </p>
                    <ul className="text-xs text-amber-800 dark:text-amber-200 space-y-0.5">
                      <li>• Door-to-door delivery</li>
                      <li>• Insurance up to JOD 5,000</li>
                      <li>• Real-time tracking</li>
                      <li>• Photo proof of delivery</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Distance note */}
              <p className="text-xs text-center text-muted-foreground italic pt-2">
                Final price varies based on distance and route complexity
              </p>
            </CardContent>
          </Card>

          {/* Safety Badge */}
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="p-3 bg-green-100 dark:bg-green-900/40 rounded-full">
                  <Shield className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-green-900 dark:text-green-100">100% Secure</h4>
                  <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                    All Captains are verified and packages are fully insured
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}