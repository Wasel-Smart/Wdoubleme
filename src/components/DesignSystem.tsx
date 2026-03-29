import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "./ui/card";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Check, Shield, MapPin, Clock, AlertTriangle, TrendingUp, Wallet, Star } from "lucide-react";
import { Separator } from "./ui/separator";

export function DesignSystem() {
  return (
    <div className="min-h-screen bg-background p-8 space-y-12 max-w-7xl mx-auto font-sans">
      
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-primary">Wasel Design System</h1>
        <p className="text-xl text-muted-foreground">
          Jordan's National Mobility Economy Super-App
        </p>
        <div className="flex gap-4">
          <Badge variant="default" className="bg-primary text-primary-foreground">v2.0 Teal/Orange</Badge>
          <Badge variant="outline">Bilingual RTL/LTR</Badge>
        </div>
      </div>

      <Tabs defaultValue="colors" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
          <TabsTrigger value="colors">Colors</TabsTrigger>
          <TabsTrigger value="typography">Typography</TabsTrigger>
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="brand">Brand</TabsTrigger>
        </TabsList>

        {/* COLORS TAB */}
        <TabsContent value="colors" className="space-y-8 mt-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Brand Palette</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Primary Teal */}
              <div className="space-y-2">
                <div className="h-24 rounded-xl bg-[#006F5C] shadow-lg flex items-center justify-center text-white font-bold">
                  #006F5C
                </div>
                <div>
                  <p className="font-semibold">Primary Teal</p>
                  <p className="text-sm text-muted-foreground">Brand Identity, Primary Actions</p>
                </div>
              </div>
              
              {/* Accent Orange */}
              <div className="space-y-2">
                <div className="h-24 rounded-xl bg-[#FF6B00] shadow-lg flex items-center justify-center text-white font-bold">
                  #FF6B00
                </div>
                <div>
                  <p className="font-semibold">Accent Orange</p>
                  <p className="text-sm text-muted-foreground">CTAs, Earnings, Notifications</p>
                </div>
              </div>

              {/* Neutral Dark */}
              <div className="space-y-2">
                <div className="h-24 rounded-xl bg-[#1A1F36] shadow-lg flex items-center justify-center text-white font-bold">
                  #1A1F36
                </div>
                <div>
                  <p className="font-semibold">Neutral Dark</p>
                  <p className="text-sm text-muted-foreground">Text, Headings, Dark Mode BG</p>
                </div>
              </div>

              {/* Neutral Light */}
              <div className="space-y-2">
                <div className="h-24 rounded-xl bg-[#FDFDFD] border shadow-sm flex items-center justify-center text-slate-800 font-bold">
                  #FDFDFD
                </div>
                <div>
                  <p className="font-semibold">Neutral White</p>
                  <p className="text-sm text-muted-foreground">Backgrounds, Cards</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Functional Colors</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="h-16 rounded-lg bg-destructive flex items-center justify-center text-white">Error / Destructive</div>
              <div className="h-16 rounded-lg bg-green-600 flex items-center justify-center text-white">Success / Verified</div>
              <div className="h-16 rounded-lg bg-blue-600 flex items-center justify-center text-white">Info / Trust</div>
              <div className="h-16 rounded-lg bg-yellow-500 flex items-center justify-center text-white">Warning / Pending</div>
            </div>
          </section>
        </TabsContent>

        {/* TYPOGRAPHY TAB */}
        <TabsContent value="typography" className="space-y-8 mt-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-5xl font-bold text-foreground">Heading 1 (48px)</h1>
              <p className="text-muted-foreground">Use for hero sections and main page titles</p>
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-foreground">Heading 2 (30px)</h2>
              <p className="text-muted-foreground">Use for section headers and modal titles</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-semibold text-foreground">Heading 3 (24px)</h3>
              <p className="text-muted-foreground">Use for card titles and sub-sections</p>
            </div>
            <div className="space-y-2">
              <p className="text-base text-foreground max-w-2xl">
                Body Text (16px) - Wasel uses a clean, modern sans-serif typeface (Inter or System). 
                The typography is designed for high legibility in both English and Arabic. 
                Spacing and line-heights are optimized for comfortable reading on mobile devices.
              </p>
            </div>
          </div>
        </TabsContent>

        {/* COMPONENTS TAB */}
        <TabsContent value="components" className="space-y-8 mt-8">
          
          {/* Buttons */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold">Buttons</h3>
            <div className="flex flex-wrap gap-4">
              <Button>Primary Action</Button>
              <Button className="bg-[#FF6B00] hover:bg-[#E65000]">Accent CTA</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
            </div>
          </section>

          {/* Cards */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold">Cards</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Ride Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>Ride to Abdali Mall</span>
                    <Badge variant="secondary">Pending</Badge>
                  </CardTitle>
                  <CardDescription>Today, 2:30 PM</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Pickup</p>
                        <p className="text-sm text-muted-foreground">7th Circle</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-primary">3.500 JOD</p>
                      <p className="text-xs text-muted-foreground">Cash</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-[#FF6B00] hover:bg-[#E65000]">Track Ride</Button>
                </CardFooter>
              </Card>

              {/* Earnings Card */}
              <Card className="bg-primary text-primary-foreground border-none">
                <CardHeader>
                  <CardTitle className="text-primary-foreground">Total Earnings</CardTitle>
                  <CardDescription className="text-primary-foreground/80">This Week</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold">142.500</span>
                    <span className="text-lg opacity-80">JOD</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="secondary" className="w-full text-primary font-bold">Withdraw Funds</Button>
                </CardFooter>
              </Card>
            </div>
          </section>

          {/* Badges & Pills */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold">Badges & Trust Indicators</h3>
            <div className="flex flex-wrap gap-4">
              <Badge className="bg-green-600 hover:bg-green-700 gap-1">
                <Shield className="w-3 h-3" /> Verified
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <Clock className="w-3 h-3" /> 5 min away
              </Badge>
              <Badge className="bg-blue-600 hover:bg-blue-700 gap-1">
                <Star className="w-3 h-3 fill-white" /> 4.9
              </Badge>
              <Badge variant="outline" className="border-[#FF6B00] text-[#FF6B00]">
                Surge 1.2x
              </Badge>
            </div>
          </section>

          {/* Inputs */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold">Inputs</h3>
            <div className="max-w-md space-y-4">
              <Input placeholder="Enter pickup location..." />
              <div className="relative">
                <Input placeholder="0.000 JOD" className="pl-8" />
                <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
              </div>
            </div>
          </section>
        </TabsContent>

        {/* BRAND IDENTITY TAB */}
        <TabsContent value="brand" className="space-y-8 mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Wasel Logo & Iconography</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="flex items-center gap-8">
                {/* Logo Mark */}
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#006F5C] to-[#004D40] flex items-center justify-center text-white text-3xl font-bold shadow-xl">
                  W
                </div>
                {/* Logotype */}
                <div className="text-4xl font-bold tracking-tight text-[#006F5C]">
                  Wasel <span className="text-[#FF6B00]">.</span>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-xl">
                  <h4 className="font-semibold mb-2">Icon Style</h4>
                  <div className="flex gap-4">
                    <MapPin className="w-6 h-6 text-primary" />
                    <Wallet className="w-6 h-6 text-[#FF6B00]" />
                    <Shield className="w-6 h-6 text-foreground" />
                  </div>
                  <p className="text-sm mt-2 text-muted-foreground">Line icons, 24px, 2px stroke</p>
                </div>
                <div className="p-4 bg-muted rounded-xl">
                  <h4 className="font-semibold mb-2">Border Radius</h4>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl border flex items-center justify-center text-xs">12px</div>
                    <div className="w-12 h-12 bg-white rounded-2xl border flex items-center justify-center text-xs">16px</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
