import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Clock, 
  Mail, 
  DollarSign, 
  Package, 
  CheckCircle, 
  AlertCircle, 
  Settings, 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  X, 
  Play, 
  Pause,
  Bell,
  FileText,
  Truck,
  Database,
  Calendar,
  Filter,
  Search
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const AutomatedWorkflows = () => {
  const [workflows, setWorkflows] = useState([]);
  const [showAddWorkflow, setShowAddWorkflow] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState(null);
  const [executionHistory, setExecutionHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ message: '', type: '' });

  // Predefined workflow templates
  const workflowTemplates = {
    autoInvoice: {
      name: 'Auto-Invoice Generation',
      description: 'Automatically generate invoices when orders are approved',
      trigger: { type: 'order_status_change', condition: 'status = approved' },
      actions: [
        { type: 'generate_invoice', params: { template: 'standard' } },
        { type: 'send_email', params: { template: 'invoice_created' } },
        { type: 'update_inventory', params: { action: 'reserve' } }
      ],
      enabled: true
    },
    paymentReminder: {
      name: 'Payment Reminders',
      description: 'Send payment reminders for overdue invoices',
      trigger: { type: 'schedule', condition: 'daily_at_9am' },
      actions: [
        { type: 'check_overdue_invoices', params: { days_overdue: 7 } },
        { type: 'send_email', params: { template: 'payment_reminder' } },
        { type: 'update_invoice_status', params: { status: 'overdue' } }
      ],
      enabled: true
    },
    statusUpdates: {
      name: 'Status Update Notifications',
      description: 'Send notifications when order status changes',
      trigger: { type: 'order_status_change', condition: 'any_status_change' },
      actions: [
        { type: 'send_email', params: { template: 'status_update' } },
        { type: 'send_sms', params: { template: 'status_update_sms' } },
        { type: 'log_activity', params: { type: 'status_change' } }
      ],
      enabled: true
    },
    inventorySync: {
      name: 'Inventory Synchronization',
      description: 'Automatically update inventory when orders are processed',
      trigger: { type: 'order_status_change', condition: 'status = shipped' },
      actions: [
        { type: 'update_inventory', params: { action: 'decrease' } },
        { type: 'check_low_stock', params: { threshold: 5 } },
        { type: 'send_alert', params: { type: 'low_stock' } }
      ],
      enabled: true
    },
    orderApproval: {
      name: 'Order Approval Workflow',
      description: 'Automated approval process for large orders',
      trigger: { type: 'order_created', condition: 'amount > 10000' },
      actions: [
        { type: 'send_approval_request', params: { level: 'manager' } },
        { type: 'set_order_status', params: { status: 'pending_approval' } },
        { type: 'log_activity', params: { type: 'approval_requested' } }
      ],
      enabled: true
    },
    customerFollowUp: {
      name: 'Customer Follow-up',
      description: 'Follow up with customers after order completion',
      trigger: { type: 'order_status_change', condition: 'status = delivered' },
      actions: [
        { type: 'schedule_followup', params: { delay_days: 3 } },
        { type: 'send_email', params: { template: 'delivery_followup' } },
        { type: 'request_feedback', params: { method: 'email' } }
      ],
      enabled: true
    }
  };

  useEffect(() => {
    fetchWorkflows();
    fetchExecutionHistory();
  }, []);

  const fetchWorkflows = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/workflows`);
      if (response.data.success) {
        setWorkflows(response.data.data);
      } else {
        // Use template data for demonstration
        setWorkflows(Object.values(workflowTemplates));
      }
    } catch (error) {
      console.error('Error fetching workflows:', error);
      // Use template data for demonstration
      setWorkflows(Object.values(workflowTemplates));
    }
    setLoading(false);
  };

  const fetchExecutionHistory = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/workflows/execution-history`);
      if (response.data.success) {
        setExecutionHistory(response.data.data);
      } else {
        // Mock execution history
        setExecutionHistory([
          {
            id: 1,
            workflowName: 'Auto-Invoice Generation',
            status: 'success',
            executedAt: new Date().toISOString(),
            details: 'Generated invoice INV-001 for order ORD-001',
            duration: 2.5
          },
          {
            id: 2,
            workflowName: 'Payment Reminders',
            status: 'success',
            executedAt: new Date(Date.now() - 86400000).toISOString(),
            details: 'Sent 5 payment reminders for overdue invoices',
            duration: 1.8
          },
          {
            id: 3,
            workflowName: 'Inventory Synchronization',
            status: 'error',
            executedAt: new Date(Date.now() - 172800000).toISOString(),
            details: 'Failed to update inventory for order ORD-002',
            duration: 0.5
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching execution history:', error);
    }
  };

  const handleAddWorkflow = async (workflowData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/workflows`, workflowData);
      if (response.data.success) {
        setWorkflows(prev => [...prev, response.data.data]);
        setShowAddWorkflow(false);
        setNotification({ message: 'Workflow added successfully', type: 'success' });
      }
    } catch (error) {
      console.error('Error adding workflow:', error);
      setNotification({ message: 'Failed to add workflow', type: 'error' });
    }
  };

  const handleUpdateWorkflow = async (workflowData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/workflows/${workflowData.id}`, workflowData);
      if (response.data.success) {
        setWorkflows(prev => prev.map(w => w.id === workflowData.id ? workflowData : w));
        setEditingWorkflow(null);
        setNotification({ message: 'Workflow updated successfully', type: 'success' });
      }
    } catch (error) {
      console.error('Error updating workflow:', error);
      setNotification({ message: 'Failed to update workflow', type: 'error' });
    }
  };

  const handleToggleWorkflow = async (workflowId, enabled) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/workflows/${workflowId}/toggle`, {
        enabled: enabled
      });
      if (response.data.success) {
        setWorkflows(prev => prev.map(w => 
          w.id === workflowId ? { ...w, enabled: enabled } : w
        ));
        setNotification({ 
          message: `Workflow ${enabled ? 'enabled' : 'disabled'} successfully`, 
          type: 'success' 
        });
      }
    } catch (error) {
      console.error('Error toggling workflow:', error);
      setNotification({ message: 'Failed to toggle workflow', type: 'error' });
    }
  };

  const handleDeleteWorkflow = async (workflowId) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/workflows/${workflowId}`);
      if (response.data.success) {
        setWorkflows(prev => prev.filter(w => w.id !== workflowId));
        setNotification({ message: 'Workflow deleted successfully', type: 'success' });
      }
    } catch (error) {
      console.error('Error deleting workflow:', error);
      setNotification({ message: 'Failed to delete workflow', type: 'error' });
    }
  };

  const executeWorkflow = async (workflowId) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/workflows/${workflowId}/execute`);
      if (response.data.success) {
        setNotification({ message: 'Workflow executed successfully', type: 'success' });
        // Refresh execution history
        fetchExecutionHistory();
      }
    } catch (error) {
      console.error('Error executing workflow:', error);
      setNotification({ message: 'Failed to execute workflow', type: 'error' });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'text-green-400';
      case 'error': return 'text-red-400';
      case 'pending': return 'text-yellow-400';
      default: return 'text-zinc-400';
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'success': return 'bg-green-500/20';
      case 'error': return 'bg-red-500/20';
      case 'pending': return 'bg-yellow-500/20';
      default: return 'bg-zinc-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Automated Workflows</h2>
          <p className="text-zinc-400">Configure automated processes and triggers</p>
        </div>
        <button
          onClick={() => setShowAddWorkflow(true)}
          className="btn-premium flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Workflow</span>
        </button>
      </div>

      {/* Workflow Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="premium-card p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Zap className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-zinc-400">Active Workflows</p>
              <p className="text-xl font-semibold text-white">
                {workflows.filter(w => w.enabled).length}
              </p>
            </div>
          </div>
        </div>
        <div className="premium-card p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-zinc-400">Successful Executions</p>
              <p className="text-xl font-semibold text-white">
                {executionHistory.filter(h => h.status === 'success').length}
              </p>
            </div>
          </div>
        </div>
        <div className="premium-card p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-sm text-zinc-400">Failed Executions</p>
              <p className="text-xl font-semibold text-white">
                {executionHistory.filter(h => h.status === 'error').length}
              </p>
            </div>
          </div>
        </div>
        <div className="premium-card p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Clock className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-zinc-400">Avg Execution Time</p>
              <p className="text-xl font-semibold text-white">
                {executionHistory.length > 0 
                  ? (executionHistory.reduce((sum, h) => sum + h.duration, 0) / executionHistory.length).toFixed(1)
                  : '0'
                }s
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Workflows List */}
      <div className="space-y-4">
        {workflows.map(workflow => (
          <div key={workflow.id || workflow.name} className="premium-card p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Zap className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{workflow.name}</h3>
                    <p className="text-zinc-400">{workflow.description}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    workflow.enabled 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-zinc-500/20 text-zinc-400'
                  }`}>
                    {workflow.enabled ? 'Active' : 'Inactive'}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="text-sm font-medium text-zinc-300 mb-2">Trigger</h4>
                    <div className="p-3 bg-zinc-800/30 rounded-lg">
                      <p className="text-sm text-white">
                        {workflow.trigger?.type === 'order_status_change' 
                          ? `Order status changes to: ${workflow.trigger.condition.split('=')[1]?.trim()}`
                          : workflow.trigger?.type === 'schedule'
                          ? `Scheduled: ${workflow.trigger.condition}`
                          : workflow.trigger?.condition
                        }
                      </p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-zinc-300 mb-2">Actions</h4>
                    <div className="space-y-2">
                      {workflow.actions?.map((action, index) => (
                        <div key={index} className="p-2 bg-zinc-800/30 rounded text-sm text-zinc-300">
                          {action.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => executeWorkflow(workflow.id || workflow.name)}
                  className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition-colors"
                  title="Execute Now"
                >
                  <Play className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setEditingWorkflow(workflow)}
                  className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors"
                  title="Edit Workflow"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleToggleWorkflow(workflow.id || workflow.name, !workflow.enabled)}
                  className={`p-2 rounded-lg transition-colors ${
                    workflow.enabled
                      ? 'text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/20'
                      : 'text-green-400 hover:text-green-300 hover:bg-green-500/20'
                  }`}
                  title={workflow.enabled ? 'Disable Workflow' : 'Enable Workflow'}
                >
                  {workflow.enabled ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => handleDeleteWorkflow(workflow.id || workflow.name)}
                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
                  title="Delete Workflow"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Execution History */}
      <div className="premium-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Execution History</h3>
        <div className="space-y-3">
          {executionHistory.map((history, index) => (
            <div key={history.id} className="flex items-center space-x-3 p-3 bg-zinc-800/30 rounded-lg">
              <div className={`p-2 rounded-lg ${getStatusBgColor(history.status)}`}>
                {history.status === 'success' ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : history.status === 'error' ? (
                  <AlertCircle className="w-4 h-4 text-red-400" />
                ) : (
                  <Clock className="w-4 h-4 text-yellow-400" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-white">
                    {history.workflowName}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${getStatusBgColor(history.status)} ${getStatusColor(history.status)}`}>
                    {history.status}
                  </span>
                </div>
                <p className="text-sm text-zinc-400">{history.details}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-zinc-500">
                    {new Date(history.executedAt).toLocaleString()}
                  </span>
                  <span className="text-xs text-zinc-500">
                    {history.duration}s
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add/Edit Workflow Modal */}
      {(showAddWorkflow || editingWorkflow) && (
        <WorkflowForm
          workflow={editingWorkflow}
          onSave={editingWorkflow ? handleUpdateWorkflow : handleAddWorkflow}
          onCancel={() => {
            setShowAddWorkflow(false);
            setEditingWorkflow(null);
          }}
          title={editingWorkflow ? 'Edit Workflow' : 'Add New Workflow'}
        />
      )}
    </div>
  );
};

// Workflow Form Component
const WorkflowForm = ({ workflow, onSave, onCancel, title }) => {
  const [formData, setFormData] = useState({
    name: workflow?.name || '',
    description: workflow?.description || '',
    trigger: workflow?.trigger || { type: 'order_status_change', condition: '' },
    actions: workflow?.actions || [],
    enabled: workflow?.enabled ?? true
  });

  const triggerTypes = [
    { value: 'order_status_change', label: 'Order Status Change' },
    { value: 'order_created', label: 'Order Created' },
    { value: 'invoice_created', label: 'Invoice Created' },
    { value: 'payment_received', label: 'Payment Received' },
    { value: 'schedule', label: 'Scheduled' }
  ];

  const actionTypes = [
    { value: 'send_email', label: 'Send Email' },
    { value: 'send_sms', label: 'Send SMS' },
    { value: 'generate_invoice', label: 'Generate Invoice' },
    { value: 'update_inventory', label: 'Update Inventory' },
    { value: 'update_order_status', label: 'Update Order Status' },
    { value: 'send_notification', label: 'Send Notification' },
    { value: 'log_activity', label: 'Log Activity' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    const workflowData = {
      ...formData,
      ...(workflow?.id && { id: workflow.id })
    };
    onSave(workflowData);
  };

  const addAction = () => {
    setFormData(prev => ({
      ...prev,
      actions: [...prev.actions, { type: 'send_email', params: {} }]
    }));
  };

  const updateAction = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      actions: prev.actions.map((action, i) => 
        i === index ? { ...action, [field]: value } : action
      )
    }));
  };

  const removeAction = (index) => {
    setFormData(prev => ({
      ...prev,
      actions: prev.actions.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="premium-card p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          <button
            onClick={onCancel}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Workflow Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-premium w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Status</label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.enabled}
                  onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                  className="rounded border-zinc-600 bg-zinc-700 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-zinc-300">Enabled</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="input-premium w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Trigger</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                value={formData.trigger.type}
                onChange={(e) => setFormData({
                  ...formData,
                  trigger: { ...formData.trigger, type: e.target.value }
                })}
                className="input-premium w-full"
              >
                {triggerTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
              <input
                type="text"
                value={formData.trigger.condition}
                onChange={(e) => setFormData({
                  ...formData,
                  trigger: { ...formData.trigger, condition: e.target.value }
                })}
                placeholder="Condition (e.g., status = approved)"
                className="input-premium w-full"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-zinc-300">Actions</label>
              <button
                type="button"
                onClick={addAction}
                className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 text-sm"
              >
                Add Action
              </button>
            </div>
            <div className="space-y-3">
              {formData.actions.map((action, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-zinc-800/30 rounded-lg">
                  <select
                    value={action.type}
                    onChange={(e) => updateAction(index, 'type', e.target.value)}
                    className="input-premium flex-1"
                  >
                    {actionTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => removeAction(index)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Workflow</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AutomatedWorkflows; 