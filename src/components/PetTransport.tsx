import { useState } from 'react';
import { PawPrint, CheckCircle2, AlertCircle, Calendar, MapPin, Dog, Cat } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
import { useLanguage } from '../contexts/LanguageContext';

export function PetTransport() {
  const [petType, setPetType] = useState('dog');
  
  const handleSearch = () => {
    toast.success('Searching for pet-friendly captains...');
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <PawPrint className="w-8 h-8 text-orange-600" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Pet Transport</h1>
        <p className="text-muted-foreground">Safe and comfortable rides for your furry friends.</p>
      </div>

      <Card className="border-t-4 border-t-orange-500 shadow-lg">
        <CardHeader>
          <CardTitle>Book a Ride</CardTitle>
          <CardDescription>Tell us about your pet and journey</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          
          {/* Pet Details */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <span className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center text-xs font-bold text-orange-600">1</span>
              Pet Details
            </h3>
            
            <RadioGroup defaultValue="dog" onValueChange={setPetType} className="grid grid-cols-2 gap-4">
              <div>
                <RadioGroupItem value="dog" id="dog" className="peer sr-only" />
                <Label htmlFor="dog" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-orange-500 [&:has([data-state=checked])]:border-orange-500 cursor-pointer">
                  <Dog className="mb-2 h-6 w-6" />
                  Dog
                </Label>
              </div>
              <div>
                <RadioGroupItem value="cat" id="cat" className="peer sr-only" />
                <Label htmlFor="cat" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-orange-500 [&:has([data-state=checked])]:border-orange-500 cursor-pointer">
                  <Cat className="mb-2 h-6 w-6" />
                  Cat / Small Pet
                </Label>
              </div>
            </RadioGroup>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                 <Label>Breed (Optional)</Label>
                 <Input placeholder="e.g. Golden Retriever" />
              </div>
              <div className="space-y-2">
                 <Label>Size</Label>
                 <Select>
                   <SelectTrigger>
                     <SelectValue placeholder="Select size" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="small">Small (under 10kg)</SelectItem>
                     <SelectItem value="medium">Medium (10-25kg)</SelectItem>
                     <SelectItem value="large">Large (25kg+)</SelectItem>
                   </SelectContent>
                 </Select>
              </div>
            </div>
          </div>

          {/* Requirements */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <span className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center text-xs font-bold text-orange-600">2</span>
              Requirements
            </h3>
            <div className="grid gap-3">
               <div className="flex items-start space-x-2">
                 <Checkbox id="crate" />
                 <div className="grid gap-1.5 leading-none">
                   <Label htmlFor="crate" className="font-medium cursor-pointer">My pet travels in a crate/carrier</Label>
                   <p className="text-xs text-muted-foreground">Required for cats and small dogs</p>
                 </div>
               </div>
               <div className="flex items-start space-x-2">
                 <Checkbox id="vaccine" />
                 <div className="grid gap-1.5 leading-none">
                   <Label htmlFor="vaccine" className="font-medium cursor-pointer">Up-to-date vaccinations</Label>
                   <p className="text-xs text-muted-foreground">Must provide proof if requested</p>
                 </div>
               </div>
               <div className="flex items-start space-x-2">
                 <Checkbox id="accompanied" />
                 <div className="grid gap-1.5 leading-none">
                   <Label htmlFor="accompanied" className="font-medium cursor-pointer">I will accompany my pet</Label>
                   <p className="text-xs text-muted-foreground">Uncheck if sending pet alone (requires specialized captain)</p>
                 </div>
               </div>
            </div>
          </div>

          {/* Route */}
          <div className="space-y-4">
             <h3 className="font-semibold flex items-center gap-2">
              <span className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center text-xs font-bold text-orange-600">3</span>
              Journey
            </h3>
             <div className="grid gap-4">
               <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>From</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input className="pl-9" placeholder="Pickup Address" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>To</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input className="pl-9" placeholder="Dropoff Address" />
                    </div>
                  </div>
               </div>
               <div className="space-y-2">
                 <Label>Date & Time</Label>
                 <div className="relative">
                   <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                   <Input type="datetime-local" className="pl-9" />
                 </div>
               </div>
             </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg flex gap-3 text-sm text-blue-900">
             <AlertCircle className="w-5 h-5 text-blue-600 shrink-0" />
             <p>
               All pet transport captains are screened for pet-friendliness. Vehicles are equipped with protective covers and safety harnesses.
             </p>
          </div>

          <Button size="lg" className="w-full bg-orange-600 hover:bg-orange-700 text-white" onClick={handleSearch}>
             Find Pet-Friendly Ride
          </Button>

        </CardContent>
      </Card>
    </div>
  );
}