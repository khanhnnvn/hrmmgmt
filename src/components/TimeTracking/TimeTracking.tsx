import React, { useState } from 'react';
import { Clock, MapPin, Calendar, Play, Square } from 'lucide-react';
import { TimeEntry } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

const TimeTracking: React.FC = () => {
  const { user } = useAuth();
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [currentLocation, setCurrentLocation] = useState('Office - Main Building');

  const mockTimeEntries: TimeEntry[] = [
    {
      id: '1',
      employeeId: '1',
      date: '2024-12-18',
      checkIn: '09:00',
      checkOut: '18:00',
      location: 'Office - Main Building',
      type: 'office',
      overtime: 0,
      status: 'on_time'
    },
    {
      id: '2',
      employeeId: '1',
      date: '2024-12-17',
      checkIn: '09:15',
      checkOut: '18:30',
      location: 'Office - Main Building',
      type: 'office',
      overtime: 0.5,
      status: 'late'
    },
    {
      id: '3',
      employeeId: '1',
      date: '2024-12-16',
      checkIn: '08:45',
      checkOut: '17:45',
      location: 'Home Office',
      type: 'wfh',
      overtime: 0,
      status: 'on_time'
    },
    {
      id: '4',
      employeeId: '1',
      date: '2024-12-15',
      checkIn: '09:00',
      checkOut: '17:30',
      location: 'Client Site - Downtown',
      type: 'business_trip',
      overtime: 0,
      status: 'early_leave'
    }
  ];

  const handleCheckIn = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // In a real app, you'd verify location against allowed locations
          setIsCheckedIn(true);
          setCurrentLocation('Office - Main Building (GPS Verified)');
        },
        (error) => {
          // Fallback if location access is denied
          setIsCheckedIn(true);
          setCurrentLocation('Office - Main Building');
        }
      );
    } else {
      setIsCheckedIn(true);
    }
  };

  const handleCheckOut = () => {
    setIsCheckedIn(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on_time':
        return 'bg-green-100 text-green-800';
      case 'late':
        return 'bg-red-100 text-red-800';
      case 'early_leave':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'office':
        return '🏢';
      case 'wfh':
        return '🏠';
      case 'business_trip':
        return '✈️';
      default:
        return '📍';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Time Tracking</h2>
      </div>

      {/* Check In/Out Card */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Today's Attendance</h3>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <MapPin className="h-4 w-4" />
            <span>{currentLocation}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="mb-4">
              <div className="text-3xl font-bold text-gray-900">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="text-sm text-gray-500">Current Time</div>
            </div>
          </div>

          <div className="text-center">
            <div className="mb-4">
              {isCheckedIn ? (
                <button
                  onClick={handleCheckOut}
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg flex items-center space-x-2 mx-auto transition-colors"
                >
                  <Square className="h-5 w-5" />
                  <span>Check Out</span>
                </button>
              ) : (
                <button
                  onClick={handleCheckIn}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg flex items-center space-x-2 mx-auto transition-colors"
                >
                  <Play className="h-5 w-5" />
                  <span>Check In</span>
                </button>
              )}
            </div>
            <div className="text-sm text-gray-500">
              {isCheckedIn ? 'You are currently checked in' : 'Click to check in'}
            </div>
          </div>

          <div className="text-center">
            <div className="mb-4">
              <div className="text-2xl font-bold text-blue-600">
                {isCheckedIn ? '7h 30m' : '0h 0m'}
              </div>
              <div className="text-sm text-gray-500">Hours Today</div>
            </div>
          </div>
        </div>

        {isCheckedIn && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2 text-green-800">
              <Clock className="h-5 w-5" />
              <span className="font-medium">Checked in at 09:00 AM</span>
            </div>
            <p className="text-sm text-green-600 mt-1">
              Location verified: {currentLocation}
            </p>
          </div>
        )}
      </div>

      {/* Weekly Summary */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">This Week Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">38.5h</div>
            <div className="text-sm text-blue-800">Total Hours</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">4</div>
            <div className="text-sm text-green-800">Days Present</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">2.5h</div>
            <div className="text-sm text-yellow-800">Overtime</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">1</div>
            <div className="text-sm text-red-800">Late Arrivals</div>
          </div>
        </div>
      </div>

      {/* Recent Attendance */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Attendance</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check In
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check Out
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hours
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mockTimeEntries.map((entry) => {
                const checkIn = new Date(`2024-01-01 ${entry.checkIn}`);
                const checkOut = entry.checkOut ? new Date(`2024-01-01 ${entry.checkOut}`) : null;
                const hoursWorked = checkOut ? 
                  ((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60)).toFixed(1) : 
                  '0.0';

                return (
                  <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {new Date(entry.date).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short' })}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {entry.checkIn}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {entry.checkOut || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="mr-2">{getTypeIcon(entry.type)}</span>
                        <span className="text-sm text-gray-900">{entry.location}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div>{hoursWorked}h</div>
                        {entry.overtime > 0 && (
                          <div className="text-xs text-orange-600">+{entry.overtime}h OT</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(entry.status)}`}>
                        {entry.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TimeTracking;