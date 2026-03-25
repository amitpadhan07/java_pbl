'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface ActivityFormProps {
  userId: string;
  onActivityAdded: () => void;
}

export function ActivityForm({ userId, onActivityAdded }: ActivityFormProps) {
  const [activeTab, setActiveTab] = useState('transport');
  const [isLoading, setIsLoading] = useState(false);

  // Transport state
  const [transportMode, setTransportMode] = useState('CAR');
  const [distance, setDistance] = useState('');
  const [transportNotes, setTransportNotes] = useState('');

  // Energy state
  const [energyType, setEnergyType] = useState('ELECTRICITY');
  const [consumption, setConsumption] = useState('');
  const [energyNotes, setEnergyNotes] = useState('');

  // Waste state
  const [wasteType, setWasteType] = useState('LANDFILL');
  const [wasteAmount, setWasteAmount] = useState('');
  const [wasteNotes, setWasteNotes] = useState('');

  const handleTransportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!distance || parseFloat(distance) <= 0) {
      toast.error('Please enter a valid distance');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          activityType: 'TRANSPORT',
          transportMode,
          distance: parseFloat(distance),
          notes: transportNotes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Failed to add activity');
        return;
      }

      setDistance('');
      setTransportNotes('');
      onActivityAdded();
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnergySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consumption || parseFloat(consumption) <= 0) {
      toast.error('Please enter a valid consumption amount');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          activityType: 'ENERGY',
          energyType,
          consumption: parseFloat(consumption),
          notes: energyNotes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Failed to add activity');
        return;
      }

      setConsumption('');
      setEnergyNotes('');
      onActivityAdded();
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWasteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wasteAmount || parseFloat(wasteAmount) <= 0) {
      toast.error('Please enter a valid waste amount');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          activityType: 'WASTE',
          wasteType,
          amount: parseFloat(wasteAmount),
          notes: wasteNotes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Failed to add activity');
        return;
      }

      setWasteAmount('');
      setWasteNotes('');
      onActivityAdded();
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log Activity</CardTitle>
        <CardDescription>Track your daily activities and their carbon emissions</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="transport">Transport</TabsTrigger>
            <TabsTrigger value="energy">Energy</TabsTrigger>
            <TabsTrigger value="waste">Waste</TabsTrigger>
          </TabsList>

          {/* Transport Tab */}
          <TabsContent value="transport" className="mt-6">
            <form onSubmit={handleTransportSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Mode of Transport</label>
                <Select value={transportMode} onValueChange={setTransportMode}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CAR">Car</SelectItem>
                    <SelectItem value="BUS">Bus</SelectItem>
                    <SelectItem value="TRAIN">Train</SelectItem>
                    <SelectItem value="FLIGHT">Flight</SelectItem>
                    <SelectItem value="MOTORCYCLE">Motorcycle</SelectItem>
                    <SelectItem value="BICYCLE">Bicycle</SelectItem>
                    <SelectItem value="WALK">Walk</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Distance (km)</label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="Enter distance in kilometers"
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Notes</label>
                <Textarea
                  placeholder="Add any notes about this trip"
                  value={transportNotes}
                  onChange={(e) => setTransportNotes(e.target.value)}
                  rows={3}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Log Transport Activity'}
              </Button>
            </form>
          </TabsContent>

          {/* Energy Tab */}
          <TabsContent value="energy" className="mt-6">
            <form onSubmit={handleEnergySubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Energy Type</label>
                <Select value={energyType} onValueChange={setEnergyType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ELECTRICITY">Electricity</SelectItem>
                    <SelectItem value="NATURAL_GAS">Natural Gas</SelectItem>
                    <SelectItem value="OIL">Oil</SelectItem>
                    <SelectItem value="RENEWABLE">Renewable Energy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Consumption (kWh)</label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="Enter energy consumption in kWh"
                  value={consumption}
                  onChange={(e) => setConsumption(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Notes</label>
                <Textarea
                  placeholder="Add any notes about energy usage"
                  value={energyNotes}
                  onChange={(e) => setEnergyNotes(e.target.value)}
                  rows={3}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Log Energy Activity'}
              </Button>
            </form>
          </TabsContent>

          {/* Waste Tab */}
          <TabsContent value="waste" className="mt-6">
            <form onSubmit={handleWasteSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Waste Type</label>
                <Select value={wasteType} onValueChange={setWasteType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LANDFILL">Landfill</SelectItem>
                    <SelectItem value="RECYCLING">Recycling</SelectItem>
                    <SelectItem value="COMPOSTING">Composting</SelectItem>
                    <SelectItem value="INCINERATION">Incineration</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Amount (kg)</label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="Enter waste amount in kg"
                  value={wasteAmount}
                  onChange={(e) => setWasteAmount(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Notes</label>
                <Textarea
                  placeholder="Add any notes about waste disposal"
                  value={wasteNotes}
                  onChange={(e) => setWasteNotes(e.target.value)}
                  rows={3}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Log Waste Activity'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
