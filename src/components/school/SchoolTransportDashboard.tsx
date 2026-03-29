import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useTranslation } from '../hooks/useTranslation';
import { MapPin, Bus, ShieldCheck, Clock, AlertTriangle, Phone, Calendar } from 'lucide-react';
import { motion } from 'motion/react';

interface StudentProfile {
  id: string;
  name: string;
  grade: string;
  school: string;
  status: 'on_bus' | 'at_school' | 'at_home' | 'delayed';
  busNumber: string;
  driverName: string;
}

export function SchoolTransportDashboard() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('tracking');
  
  // Mock Data
  const [students, setStudents] = useState<StudentProfile[]>([
    {
      id: '1',
      name: 'Layla Ahmed',
      grade: 'KG2',
      school: 'International Academy',
      status: 'on_bus',
      busNumber: 'BUS-102',
      driverName: 'Mahmoud Al-Sayed'
    },
    {
      id: '2',
      name: 'Omar Ahmed',
      grade: 'Grade 3',
      school: 'International Academy',
      status: 'at_school',
      busNumber: 'BUS-105',
      driverName: 'Khaled Yassin'
    }
  ]);

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bus className="w-8 h-8 text-yellow-500" />
            {t('school.dashboard_title') || 'School Transport Portal'}
          </h1>
          <p className="text-muted-foreground">
            {t('school.dashboard_subtitle') || 'Monitor your children\'s safety and schedule.'}
          </p>
        </div>
        <Button variant="outline" className="border-yellow-500 text-yellow-600 hover:bg-yellow-50">
          <ShieldCheck className="w-4 h-4 mr-2" />
          {t('school.safety_check') || 'Safety Check Passed'}
        </Button>
      </div>

      <Tabs defaultValue="tracking" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="tracking">Live Tracking</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="tracking" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {students.map((student) => (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className={`border-l-4 ${
                  student.status === 'on_bus' ? 'border-l-blue-500' : 
                  student.status === 'delayed' ? 'border-l-red-500' : 'border-l-green-500'
                }`}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{student.name}</CardTitle>
                        <CardDescription>{student.school} • {student.grade}</CardDescription>
                      </div>
                      <Badge variant={student.status === 'delayed' ? 'destructive' : 'outline'} className="capitalize">
                        {student.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Status Indicator */}
                      <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                        {student.status === 'on_bus' ? (
                          <Bus className="w-5 h-5 text-blue-500 animate-pulse" />
                        ) : student.status === 'at_school' ? (
                          <MapPin className="w-5 h-5 text-green-500" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-red-500" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {student.status === 'on_bus' ? 'Currently on the way home' : 
                             student.status === 'at_school' ? 'Arrived safely at school' : 'Delayed'}
                          </p>
                          <p className="text-xs text-muted-foreground">Last update: Just now</p>
                        </div>
                      </div>

                      {/* Driver Info */}
                      <div className="flex items-center justify-between text-sm border-t pt-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                            {student.driverName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium">{student.driverName}</p>
                            <p className="text-xs text-muted-foreground">{student.busNumber}</p>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost" className="text-blue-600">
                          <Phone className="w-4 h-4 mr-2" />
                          Call Driver
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Live Map Placeholder */}
          <Card className="h-[400px] bg-muted/20 flex items-center justify-center border-dashed">
            <div className="text-center text-muted-foreground">
              <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Live Map Integration</p>
              <p className="text-sm">Showing real-time location of Bus-102 & Bus-105</p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Schedule</CardTitle>
              <CardDescription>Manage recurring pickups and drop-offs.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Sunday'].map((day) => (
                  <div key={day} className="flex items-center justify-between p-3 border rounded hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">{day}</span>
                    </div>
                    <div className="flex gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 07:30 AM (Pickup)</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 02:30 PM (Drop-off)</span>
                    </div>
                    <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">Confirmed</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4 mt-4">
           <Card>
            <CardHeader>
              <CardTitle>Subscription Plan</CardTitle>
              <CardDescription>Manage your billing cycle and add-ons.</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
              <div className="p-4 border rounded-lg bg-yellow-50 border-yellow-200">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg">Premium Safety Plan</h3>
                    <p className="text-sm text-gray-600">Active since Sep 1, 2024</p>
                  </div>
                  <Badge>Active</Badge>
                </div>
                <ul className="space-y-2 text-sm mb-4">
                  <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-green-600" /> Real-time GPS Tracking</li>
                  <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-green-600" /> Video Feed Access</li>
                  <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-green-600" /> Priority Support</li>
                </ul>
                <div className="flex justify-between items-center pt-4 border-t border-yellow-200">
                  <span className="font-bold text-xl">85 JOD <span className="text-sm font-normal text-gray-600">/ month</span></span>
                  <Button variant="outline">Manage Plan</Button>
                </div>
              </div>
              
              <div className="flex flex-col justify-center items-center text-center p-6 border rounded-lg border-dashed text-muted-foreground">
                <p>Need to add another child?</p>
                <Button variant="link" className="mt-2">Contact Administration</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
