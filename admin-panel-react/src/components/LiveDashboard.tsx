import React, { useState, useEffect } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { Calendar, Clock, DollarSign, Users, Activity, Wifi, WifiOff } from 'lucide-react';

interface LiveStats {
  todayAppointments: number;
  pendingAppointments: number;
  totalRevenue: number;
  activeUsers: number;
  realTimeEvents: number;
  lastUpdate: Date;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  isLive?: boolean;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
}

function StatCard({ title, value, icon, trend, isLive, color = 'blue' }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200'
  };

  return (
    <div className={`bg-white rounded-lg border p-6 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {isLive && (
            <div className="flex items-center mt-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
              <span className="text-xs text-gray-500">Live</span>
            </div>
          )}
        </div>
        <div className="text-3xl opacity-80">
          {icon}
        </div>
      </div>
    </div>
  );
}

export function LiveDashboard() {
  const { events, isConnected, connectionStatus } = useWebSocket();
  const [liveStats, setLiveStats] = useState<LiveStats>({
    todayAppointments: 0,
    pendingAppointments: 0,
    totalRevenue: 0,
    activeUsers: 0,
    realTimeEvents: 0,
    lastUpdate: new Date()
  });

  const [recentEvents, setRecentEvents] = useState<any[]>([]);

  useEffect(() => {
    // Process real-time events to update stats
    events.forEach(event => {
      setLiveStats(prev => {
        const newStats = { ...prev };
        
        switch (event.type) {
          case 'appointment.created':
            newStats.todayAppointments += 1;
            newStats.realTimeEvents += 1;
            break;
          case 'appointment.cancelled':
            newStats.todayAppointments = Math.max(0, newStats.todayAppointments - 1);
            newStats.realTimeEvents += 1;
            break;
          case 'appointment.confirmed':
            newStats.pendingAppointments = Math.max(0, newStats.pendingAppointments - 1);
            newStats.realTimeEvents += 1;
            break;
          case 'bot.booking.completed':
            newStats.activeUsers += 1;
            newStats.realTimeEvents += 1;
            break;
          case 'bot.message.received':
            newStats.activeUsers += 1;
            newStats.realTimeEvents += 1;
            break;
        }
        
        newStats.lastUpdate = new Date();
        return newStats;
      });

      // Add to recent events
      setRecentEvents(prev => {
        const newEvent = {
          ...event,
          timestamp: new Date(event.timestamp)
        };
        return [newEvent, ...prev].slice(0, 10); // Keep last 10 events
      });
    });
  }, [events]);

  const getConnectionStatus = () => {
    switch (connectionStatus) {
      case 'connected':
        return { icon: <Wifi className="h-4 w-4 text-green-500" />, text: 'Connected', color: 'text-green-600' };
      case 'connecting':
        return { icon: <Activity className="h-4 w-4 text-yellow-500 animate-pulse" />, text: 'Connecting...', color: 'text-yellow-600' };
      case 'error':
        return { icon: <WifiOff className="h-4 w-4 text-red-500" />, text: 'Connection Error', color: 'text-red-600' };
      default:
        return { icon: <WifiOff className="h-4 w-4 text-gray-500" />, text: 'Disconnected', color: 'text-gray-600' };
    }
  };

  const connectionStatusInfo = getConnectionStatus();

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {connectionStatusInfo.icon}
            <span className={`font-medium ${connectionStatusInfo.color}`}>
              {connectionStatusInfo.text}
            </span>
          </div>
          <div className="text-sm text-gray-500">
            Last update: {liveStats.lastUpdate.toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Live Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Today's Appointments"
          value={liveStats.todayAppointments}
          icon={<Calendar className="h-8 w-8" />}
          trend="up"
          isLive={true}
          color="blue"
        />
        <StatCard
          title="Pending Appointments"
          value={liveStats.pendingAppointments}
          icon={<Clock className="h-8 w-8" />}
          trend="neutral"
          isLive={true}
          color="yellow"
        />
        <StatCard
          title="Total Revenue"
          value={`$${liveStats.totalRevenue.toFixed(2)}`}
          icon={<DollarSign className="h-8 w-8" />}
          trend="up"
          isLive={true}
          color="green"
        />
        <StatCard
          title="Active Users"
          value={liveStats.activeUsers}
          icon={<Users className="h-8 w-8" />}
          trend="up"
          isLive={true}
          color="purple"
        />
      </div>

      {/* Real-time Events Counter */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Real-time Activity</h3>
            <p className="text-sm text-gray-600">Events processed in this session</p>
          </div>
          <div className="text-3xl font-bold text-indigo-600">
            {liveStats.realTimeEvents}
          </div>
        </div>
      </div>

      {/* Recent Events */}
      {recentEvents.length > 0 && (
        <div className="bg-white rounded-lg border">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Recent Events</h3>
            <p className="text-sm text-gray-600">Live activity feed</p>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {recentEvents.map((event, index) => (
              <div
                key={`${event.id}-${index}`}
                className="p-4 border-b last:border-b-0 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-gray-900">
                        {event.type.replace(/\./g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      {event.data?.serviceName && `Service: ${event.data.serviceName}`}
                      {event.data?.userName && `User: ${event.data.userName}`}
                      {event.data?.messageText && `Message: ${event.data.messageText.substring(0, 50)}...`}
                    </p>
                    <p className="text-xs text-gray-400">
                      {event.timestamp.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-xs text-gray-500 ml-4">
                    {event.metadata?.source || 'system'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* WebSocket Connection Info */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="text-sm text-gray-600">
          <div className="flex items-center justify-between">
            <span>WebSocket Status:</span>
            <span className={`font-medium ${connectionStatusInfo.color}`}>
              {connectionStatusInfo.text}
            </span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span>Events Received:</span>
            <span className="font-medium">{events.length}</span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span>Real-time Events:</span>
            <span className="font-medium">{liveStats.realTimeEvents}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
