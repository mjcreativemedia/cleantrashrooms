import { BrowserRouter as Router, Routes, Route, Link, useLocation, useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Trash2, 
  Clock, 
  Shield, 
  CheckCircle, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  Upload,
  Eye,
  Menu,
  X,
  Filter,
  Download
} from "lucide-react";
import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:3001';

// Types
interface ServiceLog {
  id: string;
  clientId: string;
  clientName: string;
  date: string;
  time: string;
  technician: string;
  serviceType: 'Daily Clean' | 'End of Day' | 'Haul Away' | 'Deep Clean';
  beforePhoto: string;
  afterPhoto: string;
  notes: string;
  createdAt: string;
}

interface Client {
  id: string;
  name: string;
}

// API functions with localStorage persistence
const api = {
  // Initialize localStorage with default data if empty
  initializeStorage() {
    const existingLogs = localStorage.getItem('cleantrashrooms_service_logs');
    if (!existingLogs) {
      const defaultLogs = [
        {
          id: '1',
          clientId: 'sunset-towers',
          clientName: 'Sunset Towers',
          date: '2024-03-15',
          time: '07:30',
          technician: 'Mike Johnson',
          serviceType: 'Daily Clean',
          beforePhoto: '/before-after-cleaning.jpg',
          afterPhoto: '/clean-trash-room.jpg',
          notes: 'Routine cleaning completed. Removed 3 overflow bags from dumpster area. Applied sanitizer to all surfaces.',
          createdAt: '2024-03-15T07:30:00Z'
        },
        {
          id: '2',
          clientId: 'sunset-towers',
          clientName: 'Sunset Towers',
          date: '2024-03-14',
          time: '07:15',
          technician: 'Sarah Davis',
          serviceType: 'Daily Clean',
          beforePhoto: '/before-after-cleaning.jpg',
          afterPhoto: '/clean-trash-room.jpg',
          notes: 'Standard morning service. Minor spillage cleaned up near compactor.',
          createdAt: '2024-03-14T07:15:00Z'
        },
        {
          id: '3',
          clientId: 'sunset-towers',
          clientName: 'Sunset Towers',
          date: '2024-03-13',
          time: '06:45',
          technician: 'Mike Johnson',
          serviceType: 'Haul Away',
          beforePhoto: '/before-after-cleaning.jpg',
          afterPhoto: '/clean-trash-room.jpg',
          notes: 'Removed large furniture items left by tenant. Extra sanitization performed due to previous buildup.',
          createdAt: '2024-03-13T06:45:00Z'
        },
        {
          id: '4',
          clientId: 'oak-gardens',
          clientName: 'Oak Gardens Apartments',
          date: '2024-03-15',
          time: '08:00',
          technician: 'Carlos Martinez',
          serviceType: 'Daily Clean',
          beforePhoto: '/before-after-cleaning.jpg',
          afterPhoto: '/clean-trash-room.jpg',
          notes: 'Regular morning cleaning. Organized recycling bins. No major issues.',
          createdAt: '2024-03-15T08:00:00Z'
        }
      ];
      localStorage.setItem('cleantrashrooms_service_logs', JSON.stringify(defaultLogs));
    }
  },

  getStoredLogs(): ServiceLog[] {
    this.initializeStorage();
    const logs = localStorage.getItem('cleantrashrooms_service_logs');
    return logs ? JSON.parse(logs) : [];
  },

  saveLogsToStorage(logs: ServiceLog[]) {
    localStorage.setItem('cleantrashrooms_service_logs', JSON.stringify(logs));
  },

  generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },

  async getServiceLogs(filters?: {
    clientId?: string;
    startDate?: string;
    endDate?: string;
    serviceType?: string;
    technician?: string;
  }) {
    const allLogs = this.getStoredLogs();
    let filteredLogs = allLogs;
    
    if (filters) {
      if (filters.clientId) {
        filteredLogs = filteredLogs.filter(log => log.clientId === filters.clientId);
      }
      if (filters.startDate) {
        filteredLogs = filteredLogs.filter(log => log.date >= filters.startDate!);
      }
      if (filters.endDate) {
        filteredLogs = filteredLogs.filter(log => log.date <= filters.endDate!);
      }
      if (filters.serviceType) {
        filteredLogs = filteredLogs.filter(log => log.serviceType === filters.serviceType);
      }
      if (filters.technician) {
        filteredLogs = filteredLogs.filter(log => 
          log.technician.toLowerCase().includes(filters.technician!.toLowerCase())
        );
      }
    }
    
    // Sort by date and time, most recent first
    filteredLogs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return { serviceLogs: filteredLogs };
  },

  async createServiceLog(formData: FormData) {
    const allLogs = this.getStoredLogs();
    
    // Extract form data
    const clientId = formData.get('clientId') as string;
    const clientName = formData.get('clientName') as string;
    const technician = formData.get('technician') as string;
    const serviceType = formData.get('serviceType') as string;
    const notes = formData.get('notes') as string;
    
    const beforeFile = formData.get('beforePhoto') as File | null;
    const afterFile = formData.get('afterPhoto') as File | null;

    async function uploadFile(file: File | null): Promise<string> {
      if (!file || file.size === 0) return '';
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        body: fd
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      return data.path as string;
    }

    const beforePhoto = await uploadFile(beforeFile) || '/before-after-cleaning.jpg';
    const afterPhoto = await uploadFile(afterFile) || '/clean-trash-room.jpg';
    
    const now = new Date();
    const newServiceLog: ServiceLog = {
      id: this.generateId(),
      clientId,
      clientName,
      date: now.toISOString().split('T')[0], // YYYY-MM-DD
      time: now.toTimeString().slice(0, 5), // HH:MM
      technician,
      serviceType: serviceType as ServiceLog['serviceType'],
      beforePhoto,
      afterPhoto,
      notes,
      createdAt: now.toISOString()
    };
    
    // Add to beginning for most recent first
    allLogs.unshift(newServiceLog);
    this.saveLogsToStorage(allLogs);
    
    return { serviceLog: newServiceLog, message: "Service log created successfully" };
  },

  async createServiceRequest(data: any) {
    // For now, just simulate success
    return { serviceRequest: data, message: "Service request submitted successfully" };
  },

  async getClients() {
    const allLogs = this.getStoredLogs();
    const uniqueClients = new Map();
    
    allLogs.forEach(log => {
      if (!uniqueClients.has(log.clientId)) {
        uniqueClients.set(log.clientId, {
          id: log.clientId,
          name: log.clientName
        });
      }
    });
    
    return { clients: Array.from(uniqueClients.values()) };
  },

  async getPortalData(clientId: string) {
    const allLogs = this.getStoredLogs();
    const clientLogs = allLogs.filter(log => log.clientId === clientId);
    
    // Always return data, even if no logs exist
    const clientName = clientLogs.length > 0 
      ? clientLogs[0].clientName 
      : clientId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    return {
      client: { id: clientId, name: clientName },
      serviceLogs: clientLogs,
      serviceRequests: []
    };
  }
};

function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/services', label: 'Services' },
    { path: '/contact', label: 'Contact' },
    { path: '/blog', label: 'Blog' },
    { path: '/schedule', label: 'Schedule Service' }
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Trash2 className="h-8 w-8 text-blue-600" />
            <span className="font-bold text-xl text-gray-900">CleanTrashRooms</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-blue-600"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-3 py-2 text-base font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Professional Trash Room Cleaning
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              We clean apartment building trash rooms so you don't have to. Early morning service, 
              overflow removal, and sanitization to keep your building safe and livable.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact">
                <Button size="lg" variant="secondary" className="text-blue-600">
                  Get A Quote
                </Button>
              </Link>
              <Link to="/services">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                  Our Services
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Before/After Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              See the Difference We Make
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From neglected mess to spotless space. Here's what CleanTrashRooms delivers every time.
            </p>
          </div>
          
          <div className="flex justify-center">
            <div className="max-w-4xl">
              <img 
                src="/before-after-cleaning.jpg" 
                alt="Before and after trash room cleaning" 
                className="w-full rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Property Managers Choose Us
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Clock className="h-10 w-10 text-blue-600 mb-2" />
                <CardTitle>Early Morning Service</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  We arrive early before tenants start their day, ensuring clean trash rooms 
                  without disrupting residents.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <Trash2 className="h-10 w-10 text-blue-600 mb-2" />
                <CardTitle>Overflow Removal</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  We haul away overflow trash and properly dispose of items that don't belong, 
                  keeping your dumpster area organized.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <Shield className="h-10 w-10 text-blue-600 mb-2" />
                <CardTitle>Full Sanitization</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Complete cleaning and sanitization prevents pest issues and maintains 
                  a healthy environment for all residents.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Flexible Service Plans
            </h2>
            <p className="text-lg text-gray-600">
              Choose the cleaning schedule that works for your building
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Daily Clean</CardTitle>
                <CardDescription className="text-center">Every morning service</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Badge className="mb-2">Most Popular</Badge>
                <p className="text-sm text-gray-600">Perfect for high-traffic buildings</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-center">End of Day</CardTitle>
                <CardDescription className="text-center">Evening cleanup</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-gray-600">Great for moderate traffic</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Haul Away</CardTitle>
                <CardDescription className="text-center">Overflow removal</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-gray-600">On-demand overflow service</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Deep Clean</CardTitle>
                <CardDescription className="text-center">Comprehensive sanitization</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-gray-600">Monthly deep sanitization</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="text-center mt-8">
            <Link to="/services">
              <Button size="lg">View All Services</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Keep Your Building Clean?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Get a custom quote for your property and start maintaining clean, safe trash rooms today.
          </p>
          <Link to="/contact">
            <Button size="lg" variant="secondary" className="text-blue-600">
              Contact Us Today
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

function ServicesPage() {
  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Our Services
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Comprehensive trash room cleaning solutions tailored to your building's needs
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Daily Clean */}
          <Card className="relative">
            <Badge className="absolute top-4 right-4">Most Popular</Badge>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Clock className="h-6 w-6 text-blue-600" />
                Daily Clean Service
              </CardTitle>
              <CardDescription>
                Every morning before 8 AM
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Sweep and mop trash room floors</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Clean and sanitize all surfaces</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Empty overflowing bags around dumpsters</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Organize and consolidate loose items</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Spray deodorizer and disinfectant</span>
                </li>
              </ul>
              <div className="pt-4">
                <p className="text-sm text-gray-600">Perfect for high-traffic buildings with 50+ units</p>
              </div>
            </CardContent>
          </Card>

          {/* End of Day */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Shield className="h-6 w-6 text-blue-600" />
                End of Day Service
              </CardTitle>
              <CardDescription>
                Evening cleanup after 6 PM
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Clean up day's accumulation</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Sanitize high-touch surfaces</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Bag and contain loose debris</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Quick floor sweep and spot cleaning</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Pest deterrent application</span>
                </li>
              </ul>
              <div className="pt-4">
                <p className="text-sm text-gray-600">Great for buildings with moderate foot traffic</p>
              </div>
            </CardContent>
          </Card>

          {/* Haul Away */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Trash2 className="h-6 w-6 text-blue-600" />
                Haul Away Service
              </CardTitle>
              <CardDescription>
                On-demand overflow removal
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Remove large furniture and appliances</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Clear overflowing dumpster areas</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Proper disposal of hazardous materials</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Emergency cleanup response</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Post-haul area sanitization</span>
                </li>
              </ul>
              <div className="pt-4">
                <p className="text-sm text-gray-600">Call us when things get out of hand</p>
              </div>
            </CardContent>
          </Card>

          {/* Deep Clean */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Shield className="h-6 w-6 text-blue-600" />
                Deep Clean Service
              </CardTitle>
              <CardDescription>
                Monthly comprehensive sanitization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Power wash floors and walls</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Deep sanitization with hospital-grade disinfectants</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Dumpster and compactor cleaning</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Pest control treatment</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Odor elimination and deodorizing</span>
                </li>
              </ul>
              <div className="pt-4">
                <p className="text-sm text-gray-600">Reset your trash room to pristine condition</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Custom Service Plans Available
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Every building is different. We'll create a cleaning schedule that fits your property's 
            specific needs and budget.
          </p>
          <Link to="/contact">
            <Button size="lg">
              Get Custom Quote
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    property: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    alert('Thank you for your inquiry! We\'ll get back to you within 24 hours.');
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Contact Us
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Ready to transform your trash rooms? Get in touch for a custom quote.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle>Get A Quote</CardTitle>
              <CardDescription>
                Tell us about your property and we'll provide a custom cleaning plan.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Property Manager Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="property">Property Name & Address</Label>
                  <Input
                    id="property"
                    value={formData.property}
                    onChange={(e) => setFormData({...formData, property: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="message">Tell us about your needs</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    placeholder="How many units? Current cleaning frequency? Specific issues?"
                    rows={4}
                  />
                </div>
                
                <Button type="submit" className="w-full">
                  Send Quote Request
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Get In Touch</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Call Us</p>
                    <p className="text-gray-600">(555) 123-CLEAN</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-gray-600">info@cleantrashrooms.com</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Service Area</p>
                    <p className="text-gray-600">Greater Metro Area</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Hours</p>
                    <p className="text-gray-600">24/7 Emergency Service</p>
                    <p className="text-gray-600 text-sm">Regular hours: 6 AM - 8 PM</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Why Choose CleanTrashRooms?</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Licensed and insured</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Same-day emergency response</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Custom service plans</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Eco-friendly cleaning products</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Photo documentation of all work</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function BlogPage() {
  const blogPosts = [
    {
      title: "The Hidden Health Risks of Dirty Trash Rooms",
      excerpt: "Learn why regular trash room cleaning is essential for tenant health and building compliance.",
      date: "March 15, 2024",
      readTime: "5 min read"
    },
    {
      title: "5 Signs Your Trash Room Needs Professional Attention",
      excerpt: "From persistent odors to pest sightings, here are the warning signs property managers should watch for.",
      date: "March 10, 2024",
      readTime: "3 min read"
    },
    {
      title: "How Clean Trash Rooms Increase Property Values",
      excerpt: "Discover the connection between building cleanliness and tenant retention rates.",
      date: "March 5, 2024",
      readTime: "4 min read"
    },
    {
      title: "Winter Trash Room Challenges: What Property Managers Need to Know",
      excerpt: "Cold weather creates unique cleaning challenges. Here's how to stay ahead of winter issues.",
      date: "February 28, 2024",
      readTime: "6 min read"
    }
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            CleanTrashRooms Blog
          </h1>
          <p className="text-lg text-gray-600">
            Tips, insights, and best practices for maintaining clean apartment building spaces
          </p>
        </div>

        <div className="space-y-8">
          {blogPosts.map((post, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                  <span>{post.date}</span>
                  <span>{post.readTime}</span>
                </div>
                <CardTitle className="text-2xl hover:text-blue-600 transition-colors">
                  {post.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{post.excerpt}</p>
                <Button variant="outline">Read More</Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            Want to stay updated on trash room maintenance tips?
          </p>
          <Button>Subscribe to Our Newsletter</Button>
        </div>
      </div>
    </div>
  );
}

// Schedule Service Page (Public)
function SchedulePage() {
  const [scheduleForm, setScheduleForm] = useState({
    clientId: '',
    requestType: '',
    preferredDate: '',
    preferredTime: '',
    details: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.createServiceRequest(scheduleForm);
      setSuccess('Service request submitted successfully! We\'ll contact you within 24 hours to confirm.');
      
      // Reset form
      setScheduleForm({
        clientId: '',
        requestType: '',
        preferredDate: '',
        preferredTime: '',
        details: ''
      });
    } catch (err) {
      setError('Failed to submit service request');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Schedule Service
          </h1>
          <p className="text-lg text-gray-600">
            Request additional cleaning or schedule one-time services
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            {success}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Schedule Service Request
            </CardTitle>
            <CardDescription>
              Request emergency cleanup, additional services, or schedule one-time cleaning
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleScheduleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="property-name">Property Name</Label>
                  <Input
                    id="property-name"
                    value={scheduleForm.clientId}
                    onChange={(e) => setScheduleForm(prev => ({ ...prev, clientId: e.target.value }))}
                    placeholder="e.g., Sunset Towers"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="schedule-type">Service Request Type</Label>
                  <select
                    id="schedule-type"
                    value={scheduleForm.requestType}
                    onChange={(e) => setScheduleForm(prev => ({ ...prev, requestType: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select request type</option>
                    <option value="emergency">Emergency Cleanup</option>
                    <option value="haul-away">Additional Haul Away</option>
                    <option value="deep-clean">Schedule Deep Clean</option>
                    <option value="one-time">One-Time Service</option>
                    <option value="consultation">Service Consultation</option>
                  </select>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="schedule-date">Preferred Date</Label>
                  <Input
                    id="schedule-date"
                    type="date"
                    value={scheduleForm.preferredDate}
                    onChange={(e) => setScheduleForm(prev => ({ ...prev, preferredDate: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="schedule-time">Preferred Time</Label>
                  <select
                    id="schedule-time"
                    value={scheduleForm.preferredTime}
                    onChange={(e) => setScheduleForm(prev => ({ ...prev, preferredTime: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select time</option>
                    <option value="early">Early Morning (6-8 AM)</option>
                    <option value="morning">Morning (8-11 AM)</option>
                    <option value="afternoon">Afternoon (1-5 PM)</option>
                    <option value="evening">Evening (5-8 PM)</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="schedule-details">Service Details</Label>
                <Textarea
                  id="schedule-details"
                  value={scheduleForm.details}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, details: e.target.value }))}
                  placeholder="Describe what needs attention, any special requirements, or additional information..."
                  rows={4}
                  required
                />
              </div>
              
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Service Request'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-2">Need Immediate Assistance?</h3>
            <p className="text-blue-700 mb-4">
              For emergency cleanup or urgent service requests, call us directly:
            </p>
            <p className="text-2xl font-bold text-blue-800">(555) 123-CLEAN</p>
            <p className="text-sm text-blue-600 mt-2">Available 24/7 for emergency services</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Admin Page (Internal Only)
function AdminPage() {
  const [activeTab, setActiveTab] = useState('upload');
  const [serviceLogs, setServiceLogs] = useState<ServiceLog[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [filters, setFilters] = useState({
    clientId: '',
    startDate: '',
    endDate: '',
    serviceType: '',
    technician: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state for technician upload
  const [uploadForm, setUploadForm] = useState({
    clientId: '',
    clientName: '',
    technician: '',
    serviceType: '',
    notes: ''
  });

  useEffect(() => {
    loadServiceLogs();
    loadClients();
  }, []);

  const loadServiceLogs = async () => {
    try {
      setLoading(true);
      const response = await api.getServiceLogs(filters);
      setServiceLogs(response.serviceLogs);
    } catch (err) {
      setError('Failed to load service logs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadClients = async () => {
    try {
      const response = await api.getClients();
      setClients(response.clients);
    } catch (err) {
      console.error('Failed to load clients:', err);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    loadServiceLogs();
  };

  const handleUploadSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData(e.target as HTMLFormElement);
      
      // Add form fields to FormData
      Object.entries(uploadForm).forEach(([key, value]) => {
        if (value) formData.set(key, value);
      });

      const response = await api.createServiceLog(formData);
      setSuccess('Service log submitted successfully!');
      
      // Reset form
      setUploadForm({
        clientId: '',
        clientName: '',
        technician: '',
        serviceType: '',
        notes: ''
      });
      
      // Reset file inputs
      const form = e.target as HTMLFormElement;
      form.reset();
      
      // Reload service logs
      loadServiceLogs();
    } catch (err) {
      setError('Failed to submit service log');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Admin Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Internal portal for technicians and management
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            {success}
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Submit Service Log</TabsTrigger>
            <TabsTrigger value="view">View All Service History</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Submit Service Report
                </CardTitle>
                <CardDescription>
                  For technicians: Upload photos and submit service completion report
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUploadSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="clientId">Client ID</Label>
                      <Input
                        id="clientId"
                        name="clientId"
                        value={uploadForm.clientId}
                        onChange={(e) => setUploadForm(prev => ({ ...prev, clientId: e.target.value }))}
                        placeholder="e.g., sunset-towers"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="clientName">Client Name</Label>
                      <Input
                        id="clientName"
                        name="clientName"
                        value={uploadForm.clientName}
                        onChange={(e) => setUploadForm(prev => ({ ...prev, clientName: e.target.value }))}
                        placeholder="e.g., Sunset Towers"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="technician">Technician Name</Label>
                      <Input
                        id="technician"
                        name="technician"
                        value={uploadForm.technician}
                        onChange={(e) => setUploadForm(prev => ({ ...prev, technician: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="serviceType">Service Type</Label>
                      <select
                        id="serviceType"
                        name="serviceType"
                        value={uploadForm.serviceType}
                        onChange={(e) => setUploadForm(prev => ({ ...prev, serviceType: e.target.value }))}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        required
                      >
                        <option value="">Select service type</option>
                        <option value="Daily Clean">Daily Clean</option>
                        <option value="End of Day">End of Day</option>
                        <option value="Haul Away">Haul Away</option>
                        <option value="Deep Clean">Deep Clean</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="beforePhoto">Before Photo</Label>
                      <Input
                        id="beforePhoto"
                        name="beforePhoto"
                        type="file"
                        accept="image/*"
                      />
                    </div>
                    <div>
                      <Label htmlFor="afterPhoto">After Photo</Label>
                      <Input
                        id="afterPhoto"
                        name="afterPhoto"
                        type="file"
                        accept="image/*"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="notes">Service Notes</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      value={uploadForm.notes}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Describe work completed, any issues encountered, special circumstances..."
                      rows={4}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit Service Report'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="view" className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  All Service History
                </CardTitle>
                <CardDescription>
                  View and filter all service logs across all clients
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium mb-4 flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Filter Service Logs
                  </h3>
                  <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <div>
                      <Label htmlFor="filter-client">Client</Label>
                      <select
                        id="filter-client"
                        name="clientId"
                        value={filters.clientId}
                        onChange={handleFilterChange}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="">All Clients</option>
                        {clients.map(client => (
                          <option key={client.id} value={client.id}>{client.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="filter-start">Start Date</Label>
                      <Input
                        id="filter-start"
                        name="startDate"
                        type="date"
                        value={filters.startDate}
                        onChange={handleFilterChange}
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="filter-end">End Date</Label>
                      <Input
                        id="filter-end"
                        name="endDate"
                        type="date"
                        value={filters.endDate}
                        onChange={handleFilterChange}
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="filter-service">Service Type</Label>
                      <select
                        id="filter-service"
                        name="serviceType"
                        value={filters.serviceType}
                        onChange={handleFilterChange}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="">All Services</option>
                        <option value="Daily Clean">Daily Clean</option>
                        <option value="End of Day">End of Day</option>
                        <option value="Haul Away">Haul Away</option>
                        <option value="Deep Clean">Deep Clean</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="filter-tech">Technician</Label>
                      <Input
                        id="filter-tech"
                        name="technician"
                        value={filters.technician}
                        onChange={handleFilterChange}
                        placeholder="Search technician"
                        className="text-sm"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button onClick={applyFilters} disabled={loading}>
                      {loading ? 'Loading...' : 'Apply Filters'}
                    </Button>
                  </div>
                </div>

                {/* Service Logs */}
                <div className="space-y-6">
                  {serviceLogs.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">
                      {loading ? 'Loading...' : 'No service logs found'}
                    </p>
                  ) : (
                    serviceLogs.map((log) => (
                      <div key={log.id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold">{log.serviceType}</h3>
                            <p className="text-gray-600">
                              {log.clientName} • {log.date} at {log.time} • Technician: {log.technician}
                            </p>
                          </div>
                          <Badge variant="secondary">Completed</Badge>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Before</p>
                            <img 
                              src={log.beforePhoto} 
                              alt="Before cleaning" 
                              className="w-full h-48 object-cover rounded-lg"
                            />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">After</p>
                            <img 
                              src={log.afterPhoto} 
                              alt="After cleaning" 
                              className="w-full h-48 object-cover rounded-lg"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Service Notes:</p>
                          <p className="text-gray-600">{log.notes}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {serviceLogs.length > 0 && (
                  <div className="mt-6 text-center">
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export to PDF
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Private Client Portal
function ClientPortal() {
  const { clientId } = useParams<{ clientId: string }>();
  const [portalData, setPortalData] = useState<{
    client: Client;
    serviceLogs: ServiceLog[];
    serviceRequests: any[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (clientId) {
      loadPortalData(clientId);
    }
  }, [clientId]);

  const loadPortalData = async (id: string) => {
    try {
      setLoading(true);
      const response = await api.getPortalData(id);
      setPortalData(response);
    } catch (err) {
      console.error(err);
      // Set default data if there's an error
      setPortalData({
        client: { id: id, name: id.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) },
        serviceLogs: [],
        serviceRequests: []
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading client portal...</p>
        </div>
      </div>
    );
  }

  if (!portalData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Portal Not Found</h1>
          <p className="text-gray-600 mb-4">Unable to load client portal</p>
          <Link to="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {portalData.client.name}
          </h1>
          <p className="text-lg text-gray-600">
            Service History and Documentation
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Recent Service History
            </CardTitle>
            <CardDescription>
              Your cleaning service documentation and photos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {portalData.serviceLogs.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">
                    No service history available for this client yet.
                  </p>
                  <p className="text-sm text-gray-400">
                    Service logs will appear here once cleaning services are completed.
                  </p>
                </div>
              ) : (
                portalData.serviceLogs.map((log) => (
                  <div key={log.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{log.serviceType}</h3>
                        <p className="text-gray-600">
                          {log.date} at {log.time} • Technician: {log.technician}
                        </p>
                      </div>
                      <Badge variant="secondary">Completed</Badge>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Before</p>
                        <img 
                          src={log.beforePhoto} 
                          alt="Before cleaning" 
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">After</p>
                        <img 
                          src={log.afterPhoto} 
                          alt="After cleaning" 
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Service Notes:</p>
                      <p className="text-gray-600">{log.notes}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {portalData.serviceLogs.length > 0 && (
              <div className="mt-6 text-center">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download Service Report
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-gray-600">
          <p>Need additional service? Contact us at (555) 123-CLEAN</p>
        </div>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Trash2 className="h-6 w-6" />
              <span className="font-bold text-lg">CleanTrashRooms</span>
            </div>
            <p className="text-gray-400">
              Professional trash room cleaning services for apartment buildings. 
              Keeping your property clean, safe, and livable.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Services</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/services" className="hover:text-white">Daily Clean</Link></li>
              <li><Link to="/services" className="hover:text-white">End of Day</Link></li>
              <li><Link to="/services" className="hover:text-white">Haul Away</Link></li>
              <li><Link to="/services" className="hover:text-white">Deep Clean</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/" className="hover:text-white">Home</Link></li>
              <li><Link to="/blog" className="hover:text-white">Blog</Link></li>
              <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
              <li><Link to="/schedule" className="hover:text-white">Schedule Service</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <div className="space-y-2 text-gray-400">
              <p>(555) 123-CLEAN</p>
              <p>info@cleantrashrooms.com</p>
              <p>24/7 Emergency Service</p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 CleanTrashRooms. All rights reserved. Licensed and insured.</p>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/schedule" element={<SchedulePage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/portal/:clientId" element={<ClientPortal />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
