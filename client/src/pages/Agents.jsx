import React, { useEffect, useState } from 'react';
import DataTable from '../components/DataTable';
import axios from 'axios';
import { Plus, Search, Filter, Edit, Trash2, UserPlus, Users, TrendingUp, Sparkles, ArrowUpRight, ArrowDownRight, Zap, RefreshCw, Download, Eye, DollarSign, BarChart3, Star, Mail, Phone, MapPin, Calendar } from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const Agents = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ status: '', role: '' });
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);
  const [newAgent, setNewAgent] = useState({
    name: '',
    email: '',
    role: 'Agent',
    phone: '',
    region: 'North America'
  });
  const [stats, setStats] = useState({
    totalAgents: 0,
    activeAgents: 0,
    totalSales: 0
  });

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    { key: 'role', header: 'Role' },
    { key: 'status', header: 'Status' },
    { key: 'phone', header: 'Phone' },
    { key: 'region', header: 'Region' },
    { 
      key: 'lastLogin', 
      header: 'Last Login',
      render: (value) => new Date(value).toLocaleDateString()
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (value, row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEdit(row)}
            className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="p-1 text-red-400 hover:text-red-300 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  useEffect(() => {
    fetchAgents();
  }, [searchTerm, filters]);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filters.status) params.append('status', filters.status);
      if (filters.role) params.append('role', filters.role);
      
      const response = await axios.get(`${API_BASE_URL}/agents?${params}`);
      if (response.data.success) {
        setData(response.data.data);
        setStats({
          totalAgents: response.data.data.length,
          activeAgents: response.data.data.filter(a => a.status === 'active').length,
          totalSales: response.data.data.reduce((sum, a) => sum + a.sales, 0)
        });
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
    }
    setLoading(false);
  };

  const handleAddAgent = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/agents`, newAgent);
      if (response.data.success) {
        setShowAddModal(false);
        setNewAgent({ name: '', email: '', role: 'Agent', phone: '', region: 'North America' });
        fetchAgents();
      }
    } catch (error) {
      console.error('Error adding agent:', error);
    }
  };

  const handleEdit = (agent) => {
    setEditingAgent(agent);
  };

  const handleUpdateAgent = async () => {
    try {
      const response = await axios.put(`${API_BASE_URL}/agents/${editingAgent.id}`, editingAgent);
      if (response.data.success) {
        setEditingAgent(null);
        fetchAgents();
      }
    } catch (error) {
      console.error('Error updating agent:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this agent?')) {
      try {
        const response = await axios.delete(`${API_BASE_URL}/agents/${id}`);
        if (response.data.success) {
          fetchAgents();
        }
      } catch (error) {
        console.error('Error deleting agent:', error);
      }
    }
  };

  const filteredAgents = data.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.region.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filters.status === 'all' || agent.status === filters.status;
    return matchesSearch && matchesStatus;
  });

  const statuses = ['all', 'active', 'inactive'];

  return (
    <div className="flex-grow bg-black overflow-y-auto">
      {/* Premium Header */}
      <div className="sm:px-7 sm:pt-7 px-4 pt-4 flex flex-col w-full border-b border-zinc-800/50 bg-black sticky top-0 z-30">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text">Agent Management</h1>
              <p className="text-zinc-400 text-sm">Manage sales agents and performance</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button className="btn-secondary flex items-center space-x-2">
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
            <button className="btn-premium flex items-center space-x-2">
              <UserPlus className="w-4 h-4" />
              <span>Add Agent</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="sm:p-7 p-4 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="premium-card p-6 premium-card-hover">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Total Agents</h3>
                <p className="text-zinc-400 text-sm">All registered agents</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <div className="text-3xl font-bold text-white">{stats.totalAgents}</div>
          </div>

          <div className="premium-card p-6 premium-card-hover">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Active Agents</h3>
                <p className="text-zinc-400 text-sm">Currently active</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
            </div>
            <div className="text-3xl font-bold text-green-400">{stats.activeAgents}</div>
          </div>

          <div className="premium-card p-6 premium-card-hover">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Total Sales</h3>
                <p className="text-zinc-400 text-sm">This month</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-400" />
              </div>
            </div>
            <div className="text-3xl font-bold text-purple-400">${(stats.totalSales / 1000).toFixed(0)}k</div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="premium-card p-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search agents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-premium w-full pl-10"
              />
            </div>
            
            <select
              value={filters.status}
              onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))}
              className="input-premium"
            >
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>

            <button className="btn-secondary flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Results Summary */}
        <div className="premium-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Agent Directory</h3>
              <p className="text-zinc-400 text-sm">
                Showing {filteredAgents.length} of {data.length} agents
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-all duration-200">
                <Eye className="w-4 h-4" />
              </button>
              <button className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-all duration-200">
                <BarChart3 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Agent Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredAgents.length === 0 ? (
            <div className="col-span-full">
              <div className="premium-card p-12 text-center">
                <div className="w-16 h-16 bg-zinc-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-zinc-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">No agents found</h3>
                <p className="text-zinc-400">Try adjusting your search criteria</p>
              </div>
            </div>
          ) : (
            filteredAgents.map((agent) => (
              <div key={agent.id} className="premium-card p-6 premium-card-hover group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg">
                      {agent.avatar}
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                        {agent.name}
                      </h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          agent.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {agent.status}
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          <span className="text-sm text-zinc-400">{agent.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-400">${(agent.sales / 1000).toFixed(0)}k</p>
                    <p className="text-sm text-zinc-400">Total Sales</p>
                  </div>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="flex items-center space-x-3 text-sm">
                    <Mail className="w-4 h-4 text-zinc-400" />
                    <span className="text-zinc-300">{agent.email}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <Phone className="w-4 h-4 text-zinc-400" />
                    <span className="text-zinc-300">{agent.phone}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <MapPin className="w-4 h-4 text-zinc-400" />
                    <span className="text-zinc-300">{agent.region}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <Calendar className="w-4 h-4 text-zinc-400" />
                    <span className="text-zinc-300">Joined {agent.joinDate}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-lg font-bold text-white">{agent.deals}</p>
                    <p className="text-xs text-zinc-400">Deals</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-blue-400">${(agent.commission / 1000).toFixed(1)}k</p>
                    <p className="text-xs text-zinc-400">Commission</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-purple-400">{agent.rating}</p>
                    <p className="text-xs text-zinc-400">Rating</p>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-zinc-700/30">
                  <div className="flex space-x-2">
                    <button className="flex-1 px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-sm">
                      View Profile
                    </button>
                    <button className="flex-1 px-3 py-2 bg-zinc-800/50 text-zinc-400 rounded-lg hover:bg-zinc-700/50 transition-colors text-sm">
                      Performance
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="premium-card p-6 premium-card-hover cursor-pointer group">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">Performance Analytics</h4>
                <p className="text-zinc-400 text-sm">Detailed agent metrics</p>
              </div>
              <ArrowUpRight className="w-6 h-6 text-zinc-400 group-hover:text-blue-400 transition-colors" />
            </div>
          </div>

          <div className="premium-card p-6 premium-card-hover cursor-pointer group">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-lg font-semibold text-white group-hover:text-green-400 transition-colors">Commission Report</h4>
                <p className="text-zinc-400 text-sm">Track earnings and payouts</p>
              </div>
              <ArrowDownRight className="w-6 h-6 text-zinc-400 group-hover:text-green-400 transition-colors" />
            </div>
          </div>
        </div>
      </div>

      {/* Add Agent Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 rounded-2xl p-6 w-full max-w-md border border-zinc-800 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">Add New Agent</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Name"
                value={newAgent.name}
                onChange={(e) => setNewAgent(a => ({ ...a, name: e.target.value }))}
                className="w-full px-3 py-2 bg-zinc-800 text-white rounded-lg border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="email"
                placeholder="Email"
                value={newAgent.email}
                onChange={(e) => setNewAgent(a => ({ ...a, email: e.target.value }))}
                className="w-full px-3 py-2 bg-zinc-800 text-white rounded-lg border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select
                value={newAgent.role}
                onChange={(e) => setNewAgent(a => ({ ...a, role: e.target.value }))}
                className="w-full px-3 py-2 bg-zinc-800 text-white rounded-lg border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Agent">Agent</option>
                <option value="Supervisor">Supervisor</option>
                <option value="Manager">Manager</option>
                <option value="Admin">Admin</option>
              </select>
              <input
                type="tel"
                placeholder="Phone"
                value={newAgent.phone}
                onChange={(e) => setNewAgent(a => ({ ...a, phone: e.target.value }))}
                className="w-full px-3 py-2 bg-zinc-800 text-white rounded-lg border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select
                value={newAgent.region}
                onChange={(e) => setNewAgent(a => ({ ...a, region: e.target.value }))}
                className="w-full px-3 py-2 bg-zinc-800 text-white rounded-lg border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="North America">North America</option>
                <option value="South America">South America</option>
                <option value="Europe">Europe</option>
                <option value="Asia">Asia</option>
                <option value="Africa">Africa</option>
              </select>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleAddAgent}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Add Agent
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Agent Modal */}
      {editingAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 rounded-2xl p-6 w-full max-w-md border border-zinc-800 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">Edit Agent</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Name"
                value={editingAgent.name}
                onChange={(e) => setEditingAgent(a => ({ ...a, name: e.target.value }))}
                className="w-full px-3 py-2 bg-zinc-800 text-white rounded-lg border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="email"
                placeholder="Email"
                value={editingAgent.email}
                onChange={(e) => setEditingAgent(a => ({ ...a, email: e.target.value }))}
                className="w-full px-3 py-2 bg-zinc-800 text-white rounded-lg border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select
                value={editingAgent.role}
                onChange={(e) => setEditingAgent(a => ({ ...a, role: e.target.value }))}
                className="w-full px-3 py-2 bg-zinc-800 text-white rounded-lg border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Agent">Agent</option>
                <option value="Supervisor">Supervisor</option>
                <option value="Manager">Manager</option>
                <option value="Admin">Admin</option>
              </select>
              <input
                type="tel"
                placeholder="Phone"
                value={editingAgent.phone}
                onChange={(e) => setEditingAgent(a => ({ ...a, phone: e.target.value }))}
                className="w-full px-3 py-2 bg-zinc-800 text-white rounded-lg border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select
                value={editingAgent.region}
                onChange={(e) => setEditingAgent(a => ({ ...a, region: e.target.value }))}
                className="w-full px-3 py-2 bg-zinc-800 text-white rounded-lg border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="North America">North America</option>
                <option value="South America">South America</option>
                <option value="Europe">Europe</option>
                <option value="Asia">Asia</option>
                <option value="Africa">Africa</option>
              </select>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleUpdateAgent}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Update Agent
              </button>
              <button
                onClick={() => setEditingAgent(null)}
                className="flex-1 px-4 py-2 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Agents; 