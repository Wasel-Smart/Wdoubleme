/**
 * Wasel Logo Showcase
 * Display the futuristic logo with explanations and variants
 */

import { useState } from 'react';
import { WaselFuturisticLogo, WaselLogoIcon } from '../../components/branding/WaselFuturisticLogo';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  Sparkles,
  Rocket,
  Globe,
  Zap,
  Shield,
  Users,
  TrendingUp,
  Eye,
  Download,
} from 'lucide-react';

export function LogoShowcase() {
  const [animated, setAnimated] = useState(true);
  const [variant, setVariant] = useState<'full' | 'icon-only' | 'with-text'>('with-text');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <Badge className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white">
            <Sparkles className="w-3 h-3 mr-1" />
            Brand Identity 2026
          </Badge>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-teal-500 via-cyan-500 to-emerald-500 bg-clip-text text-transparent">
            Wasel | واصل
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 font-medium">
            Out of This World Transportation
          </p>
          <p className="text-gray-500 dark:text-gray-500 max-w-2xl mx-auto">
            Revolutionary mobility for the Middle East. We're not just moving people—we're launching 
            a transportation revolution that's never been seen in this region.
          </p>
        </div>

        {/* Main Logo Display */}
        <Card className={`p-12 ${theme === 'dark' ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-gray-50 to-white'}`}>
          <div className="flex justify-center">
            <WaselFuturisticLogo 
              size={400} 
              animated={animated}
              variant={variant}
              showTagline={true}
            />
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-3 justify-center mt-8">
            <Button
              variant={animated ? 'default' : 'outline'}
              onClick={() => setAnimated(!animated)}
              size="sm"
            >
              <Zap className="w-4 h-4 mr-2" />
              {animated ? 'Animated' : 'Static'}
            </Button>
            <Button
              variant={theme === 'dark' ? 'default' : 'outline'}
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              size="sm"
            >
              {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download SVG
            </Button>
          </div>
        </Card>

        {/* Variants */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 text-center cursor-pointer hover:border-teal-500 transition-colors"
                onClick={() => setVariant('icon-only')}>
            <div className="mb-4 flex justify-center">
              <WaselFuturisticLogo size={150} animated={false} variant="icon-only" />
            </div>
            <h3 className="font-semibold mb-2">Icon Only</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              For app icons, favicons, and small spaces
            </p>
          </Card>

          <Card className="p-6 text-center cursor-pointer hover:border-teal-500 transition-colors"
                onClick={() => setVariant('full')}>
            <div className="mb-4 flex justify-center">
              <WaselFuturisticLogo size={150} animated={false} variant="full" />
            </div>
            <h3 className="font-semibold mb-2">Full Logo</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Complete logo with Arabic integration
            </p>
          </Card>

          <Card className="p-6 text-center cursor-pointer hover:border-teal-500 transition-colors"
                onClick={() => setVariant('with-text')}>
            <div className="mb-4 flex justify-center">
              <WaselFuturisticLogo size={150} animated={false} variant="with-text" showTagline />
            </div>
            <h3 className="font-semibold mb-2">With Branding</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Full branding with bilingual text and tagline
            </p>
          </Card>
        </div>

        {/* Logo Meaning */}
        <Tabs defaultValue="concept" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="concept">Concept</TabsTrigger>
            <TabsTrigger value="elements">Elements</TabsTrigger>
            <TabsTrigger value="usage">Usage</TabsTrigger>
          </TabsList>

          <TabsContent value="concept" className="space-y-4">
            <Card className="p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shrink-0">
                  <Rocket className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Out of This World Transportation</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    The logo represents a futuristic hover vehicle—not a literal UFO, but a revolutionary 
                    transportation pod that symbolizes how Wasel is bringing next-generation mobility to 
                    the Middle East. It's transportation innovation that feels alien to the region because 
                    nothing like this has existed before.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <Globe className="w-5 h-5 text-teal-500 mt-1 shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Revolutionary Vision</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      The futuristic vehicle represents breakthrough technology and innovation that's 
                      transforming how people move in Jordan and beyond.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-emerald-500 mt-1 shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Journey & Connection</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      The road and location pins below show the journey from origin to destination—
                      "واصل" literally means "the one who reaches/connects."
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-amber-500 mt-1 shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Energy & Movement</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      The pulsing energy core and rotating gear symbolize constant motion, efficiency, 
                      and the mechanical precision of our platform.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-teal-500 mt-1 shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-1">Trust & Security</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      The stable, balanced design with protective dome represents safety and trust—
                      core values for any transportation platform.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="elements" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-teal-500" />
                  Futuristic Hover Vehicle
                </h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>• Sleek transport pod (not literal UFO)</li>
                  <li>• Transparent dome (passenger area)</li>
                  <li>• Side thrusters (movement/speed)</li>
                  <li>• Hover glow (advanced technology)</li>
                  <li>• Teal gradient (brand color)</li>
                </ul>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  Energy Core/Gear
                </h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>• Golden gear (mechanical precision)</li>
                  <li>• Pulsing center (active energy)</li>
                  <li>• Rotating ring (constant motion)</li>
                  <li>• Teal core (brand integration)</li>
                  <li>• Direction indicators (journey)</li>
                </ul>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-cyan-500" />
                  Journey Elements
                </h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>• Curved road (path/route)</li>
                  <li>• Golden dashes (highway)</li>
                  <li>• Origin pin (start point)</li>
                  <li>• Destination pin (endpoint)</li>
                  <li>• Connection arc (linking journey)</li>
                </ul>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500" />
                  Cultural Integration
                </h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>• Arabic "واصل" (connector)</li>
                  <li>• Gold accent (Middle East)</li>
                  <li>• Orbital ring (global reach)</li>
                  <li>• Balanced design (trust)</li>
                  <li>• Bilingual branding</li>
                </ul>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="usage" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Logo Usage Guidelines</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2 text-teal-600">✅ Correct Usage</h4>
                  <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <li>• Use on dark or light backgrounds with proper contrast</li>
                    <li>• Maintain aspect ratio when scaling</li>
                    <li>• Keep clear space around logo (minimum 20px)</li>
                    <li>• Use provided color schemes (teal/gold)</li>
                    <li>• Include Arabic text for Middle East markets</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 text-red-600">❌ Avoid</h4>
                  <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <li>• Don't stretch or distort proportions</li>
                    <li>• Don't change colors arbitrarily</li>
                    <li>• Don't add effects (drop shadows, etc.)</li>
                    <li>• Don't rotate or flip the logo</li>
                    <li>• Don't use on busy backgrounds</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Recommended Sizes</h4>
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div className="flex items-center gap-3">
                      <WaselLogoIcon size={24} />
                      <span className="text-sm">24px - App bars</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <WaselLogoIcon size={40} />
                      <span className="text-sm">40px - Buttons</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <WaselLogoIcon size={64} />
                      <span className="text-sm">64px - Cards</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <WaselLogoIcon size={80} />
                      <span className="text-sm">80px - Headers</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Color Palette */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Brand Color Palette</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <div className="w-full h-20 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600" />
              <div className="text-sm">
                <div className="font-semibold">Primary Teal</div>
                <div className="text-xs text-gray-500">#06b6d4</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="w-full h-20 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600" />
              <div className="text-sm">
                <div className="font-semibold">Secondary Emerald</div>
                <div className="text-xs text-gray-500">#10b981</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="w-full h-20 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600" />
              <div className="text-sm">
                <div className="font-semibold">Accent Gold</div>
                <div className="text-xs text-gray-500">#f59e0b</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="w-full h-20 rounded-lg bg-gradient-to-br from-cyan-400 to-cyan-600" />
              <div className="text-sm">
                <div className="font-semibold">Highlight Cyan</div>
                <div className="text-xs text-gray-500">#67e8f9</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="w-full h-20 rounded-lg bg-gradient-to-br from-gray-700 to-gray-900" />
              <div className="text-sm">
                <div className="font-semibold">Dark Base</div>
                <div className="text-xs text-gray-500">#1e293b</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Marketing Message */}
        <Card className="p-8 bg-gradient-to-br from-teal-500 to-emerald-500 text-white">
          <div className="text-center space-y-4">
            <Sparkles className="w-12 h-12 mx-auto" />
            <h2 className="text-3xl font-bold">
              Transportation That's Out of This World
            </h2>
            <p className="text-teal-100 max-w-2xl mx-auto">
              Wasel isn't just another ride-sharing app—it's a complete revolution in Middle Eastern 
              mobility. We're bringing futuristic technology, AI intelligence, and cultural respect 
              together to create something the region has never seen before.
            </p>
            <div className="flex flex-wrap gap-4 justify-center pt-4">
              <Badge className="bg-white/20 text-white text-sm py-2 px-4">
                <Rocket className="w-4 h-4 mr-2" />
                Revolutionary Technology
              </Badge>
              <Badge className="bg-white/20 text-white text-sm py-2 px-4">
                <Users className="w-4 h-4 mr-2" />
                Community-Driven
              </Badge>
              <Badge className="bg-white/20 text-white text-sm py-2 px-4">
                <Globe className="w-4 h-4 mr-2" />
                Middle East First
              </Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
