import React, { useState } from 'react';
import { Package, Plus, Search, Filter, User, Calendar, AlertTriangle } from 'lucide-react';
import { Asset } from '../../types';

const AssetManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [showModal, setShowModal] = useState(false);

  const mockAssets: Asset[] = [
    {
      id: '1',
      name: 'MacBook Pro 13"',
      type: 'laptop',
      model: 'MacBook Pro M1',
      serialNumber: 'C02D12345678',
      assignedTo: '1',
      assignedToName: 'John Doe',
      assignedDate: '2024-03-15',
      status: 'assigned',
      condition: 'good',
      purchaseDate: '2024-03-01',
      warranty: '2027-03-01',
      value: 1299
    },
    {
      id: '2',
      name: 'Dell Monitor 24"',
      type: 'monitor',
      model: 'Dell S2421DS',
      serialNumber: 'DL24556789',
      assignedTo: '1',
      assignedToName: 'John Doe',
      assignedDate: '2024-03-15',
      status: 'assigned',
      condition: 'new',
      purchaseDate: '2024-03-10',
      warranty: '2027-03-10',
      value: 299
    },
    {
      id: '3',
      name: 'iPhone 15 Pro',
      type: 'phone',
      model: 'iPhone 15 Pro 128GB',
      serialNumber: 'F2G5H4K8L9M1',
      assignedTo: '2',
      assignedToName: 'Jane Smith',
      assignedDate: '2024-02-20',
      status: 'assigned',
      condition: 'good',
      purchaseDate: '2024-02-15',
      warranty: '2025-02-15',
      value: 999
    },
    {
      id: '4',
      name: 'Logitech Webcam',
      type: 'equipment',
      model: 'Logitech C920s',
      serialNumber: 'LG920S12345',
      status: 'available',
      condition: 'good',
      purchaseDate: '2024-01-15',
      warranty: '2026-01-15',
      value: 69
    },
    {
      id: '5',
      name: 'Office Chair',
      type: 'furniture',
      model: 'Herman Miller Aeron',
      serialNumber: 'HM-AERON-001',
      assignedTo: '3',
      assignedToName: 'Mike Johnson',
      assignedDate: '2024-06-10',
      status: 'assigned',
      condition: 'new',
      purchaseDate: '2024-06-01',
      value: 1200
    },
    {
      id: '6',
      name: 'HP Laptop',
      type: 'laptop',
      model: 'HP EliteBook 840',
      serialNumber: 'HP840G8-001',
      status: 'maintenance',
      condition: 'fair',
      purchaseDate: '2023-08-15',
      warranty: '2026-08-15',
      value: 899
    }
  ];

  const getFilteredAssets = () => {
    return mockAssets.filter(asset => {
      const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           asset.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           asset.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (asset.assignedToName && asset.assignedToName.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = filterStatus === 'all' || asset.status === filterStatus;
      const matchesType = filterType === 'all' || asset.type === filterType;

      return matchesSearch && matchesStatus && matchesType;
    });
  };

  const filteredAssets = getFilteredAssets();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'assigned':
        return 'bg-blue-100 text-blue-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'retired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'new':
        return 'text-green-600';
      case 'good':
        return 'text-blue-600';
      case 'fair':
        return 'text-yellow-600';
      case 'poor':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'laptop':
        return '💻';
      case 'monitor':
        return '🖥️';
      case 'phone':
        return '📱';
      case 'equipment':
        return '🎛️';
      case 'furniture':
        return '🪑';
      default:
        return '📦';
    }
  };

  const totalValue = mockAssets.reduce((sum, asset) => sum + asset.value, 0);
  const assignedAssets = mockAssets.filter(asset => asset.status === 'assigned').length;
  const availableAssets = mockAssets.filter(asset => asset.status === 'available').length;
  const maintenanceAssets = mockAssets.filter(asset => asset.status === 'maintenance').length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Asset Management</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Asset</span>
        </button>
      </div>

      {/* Asset Summary */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Asset Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{mockAssets.length}</div>
            <div className="text-sm text-blue-800">Total Assets</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{availableAssets}</div>
            <div className="text-sm text-green-800">Available</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{assignedAssets}</div>
            <div className="text-sm text-yellow-800">Assigned</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">${totalValue.toLocaleString()}</div>
            <div className="text-sm text-purple-800">Total Value</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search assets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="assigned">Assigned</option>
              <option value="maintenance">Maintenance</option>
              <option value="retired">Retired</option>
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="laptop">Laptops</option>
              <option value="monitor">Monitors</option>
              <option value="phone">Phones</option>
              <option value="equipment">Equipment</option>
              <option value="furniture">Furniture</option>
            </select>
          </div>
        </div>
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAssets.map((asset) => (
          <div key={asset.id} className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{getTypeIcon(asset.type)}</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{asset.name}</h3>
                  <p className="text-sm text-gray-500">{asset.model}</p>
                </div>
              </div>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(asset.status)}`}>
                {asset.status}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Serial Number:</span>
                <span className="text-gray-900 font-mono">{asset.serialNumber}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-500">Condition:</span>
                <span className={`font-medium ${getConditionColor(asset.condition)}`}>
                  {asset.condition}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Value:</span>
                <span className="text-gray-900 font-medium">${asset.value}</span>
              </div>

              {asset.assignedTo && (
                <>
                  <div className="border-t border-gray-200 pt-2 mt-3">
                    <div className="flex items-center space-x-2 text-sm">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-500">Assigned to:</span>
                    </div>
                    <p className="font-medium text-gray-900 ml-6">{asset.assignedToName}</p>
                  </div>

                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <span>Since: {new Date(asset.assignedDate!).toLocaleDateString()}</span>
                  </div>
                </>
              )}

              {asset.warranty && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Warranty:</span>
                  <span className={`text-sm ${
                    new Date(asset.warranty) < new Date() ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {new Date(asset.warranty).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            {/* Warning for expired warranty */}
            {asset.warranty && new Date(asset.warranty) < new Date() && (
              <div className="flex items-center space-x-2 mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-800">Warranty expired</span>
              </div>
            )}

            <div className="flex space-x-2 mt-4 pt-4 border-t border-gray-200">
              {asset.status === 'available' && (
                <button className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors">
                  Assign
                </button>
              )}
              {asset.status === 'assigned' && (
                <button className="flex-1 bg-orange-600 text-white px-3 py-2 rounded text-sm hover:bg-orange-700 transition-colors">
                  Return
                </button>
              )}
              <button className="flex-1 border border-gray-300 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-50 transition-colors">
                Edit
              </button>
            </div>
          </div>
        ))}

        {filteredAssets.length === 0 && (
          <div className="col-span-full">
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">No assets found matching your criteria.</p>
            </div>
          </div>
        )}
      </div>

      {/* Add Asset Modal - placeholder */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Asset</h3>
            <p className="text-gray-600 mb-4">Asset creation form would go here...</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Add Asset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetManagement;