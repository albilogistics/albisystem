import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Truck, 
  Package, 
  DollarSign, 
  User, 
  Mail, 
  FileText, 
  Download,
  Edit3,
  Plus,
  X,
  Save,
  ArrowRight,
  ArrowLeft,
  Settings,
  Bell,
  Zap,
  Shield,
  Eye,
  History
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const OrderWorkflow = ({ order, onStatusChange, onOrderUpdate }) => {
  const [currentStatus, setCurrentStatus] = useState(order?.status || 'draft');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalLevel, setApprovalLevel] = useState(1);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [statusHistory, setStatusHistory] = useState([]);
  const [automatedActions, setAutomatedActions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Define workflow statuses with transitions and rules
  const workflowStatuses = {
    draft: {
      label: 'Draft',
      icon: FileText,
      color: 'text-zinc-400',
      bgColor: 'bg-zinc-500/20',
      canTransitionTo: ['review', 'cancelled'],
      requiresApproval: false,
      automatedActions: []
    },
    review: {
      label: 'Under Review',
      icon: Eye,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20',
      canTransitionTo: ['approved', 'rejected', 'draft'],
      requiresApproval: true,
      automatedActions: ['sendReviewNotification']
    },
    approved: {
      label: 'Approved',
      icon: CheckCircle,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      canTransitionTo: ['processing', 'cancelled'],
      requiresApproval: false,
      automatedActions: ['generateInvoice', 'sendApprovalNotification']
    },
    processing: {
      label: 'Processing',
      icon: Package,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      canTransitionTo: ['ready', 'on_hold'],
      requiresApproval: false,
      automatedActions: ['updateInventory', 'sendProcessingNotification']
    },
    ready: {
      label: 'Ready for Shipment',
      icon: Truck,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
      canTransitionTo: ['shipped', 'on_hold'],
      requiresApproval: false,
      automatedActions: ['sendReadyNotification']
    },
    shipped: {
      label: 'Shipped',
      icon: Truck,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/20',
      canTransitionTo: ['delivered', 'returned'],
      requiresApproval: false,
      automatedActions: ['sendTrackingInfo', 'updateInventory']
    },
    delivered: {
      label: 'Delivered',
      icon: CheckCircle,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      canTransitionTo: ['completed', 'returned'],
      requiresApproval: false,
      automatedActions: ['sendDeliveryConfirmation', 'requestFeedback']
    },
    completed: {
      label: 'Completed',
      icon: CheckCircle,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      canTransitionTo: [],
      requiresApproval: false,
      automatedActions: ['sendCompletionNotification', 'archiveOrder']
    },
    on_hold: {
      label: 'On Hold',
      icon: AlertCircle,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20',
      canTransitionTo: ['processing', 'cancelled'],
      requiresApproval: true,
      automatedActions: ['sendHoldNotification']
    },
    cancelled: {
      label: 'Cancelled',
      icon: X,
      color: 'text-red-400',
      bgColor: 'bg-red-500/20',
      canTransitionTo: [],
      requiresApproval: false,
      automatedActions: ['sendCancellationNotification', 'restoreInventory']
    },
    returned: {
      label: 'Returned',
      icon: ArrowLeft,
      color: 'text-red-400',
      bgColor: 'bg-red-500/20',
      canTransitionTo: ['processing'],
      requiresApproval: true,
      automatedActions: ['processReturn', 'updateInventory']
    }
  };

  // Multi-level approval system
  const approvalLevels = {
    1: { name: 'Manager', required: true, completed: false },
    2: { name: 'Director', required: order?.totalAmount > 10000, completed: false },
    3: { name: 'VP', required: order?.totalAmount > 50000, completed: false }
  };

  useEffect(() => {
    fetchStatusHistory();
    fetchAutomatedActions();
  }, [order?.id]);

  const fetchStatusHistory = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/orders/${order?.id}/status-history`);
      if (response.data.success) {
        setStatusHistory(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching status history:', error);
      // Mock data for demonstration
      setStatusHistory([
        {
          id: 1,
          status: 'draft',
          changedBy: 'John Doe',
          changedAt: new Date().toISOString(),
          notes: 'Order created'
        },
        {
          id: 2,
          status: 'review',
          changedBy: 'Jane Smith',
          changedAt: new Date().toISOString(),
          notes: 'Order submitted for review'
        }
      ]);
    }
  };

  const fetchAutomatedActions = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/orders/${order?.id}/automated-actions`);
      if (response.data.success) {
        setAutomatedActions(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching automated actions:', error);
      // Mock data for demonstration
      setAutomatedActions([
        {
          id: 1,
          action: 'sendReviewNotification',
          status: 'completed',
          executedAt: new Date().toISOString(),
          description: 'Review notification sent to customer'
        }
      ]);
    }
  };

  const handleStatusChange = async (newStatus, notes = '') => {
    setLoading(true);
    try {
      const currentStatusConfig = workflowStatuses[currentStatus];
      
      // Check if transition is allowed
      if (!currentStatusConfig.canTransitionTo.includes(newStatus)) {
        throw new Error(`Invalid status transition from ${currentStatus} to ${newStatus}`);
      }

      // Check if approval is required
      const newStatusConfig = workflowStatuses[newStatus];
      if (newStatusConfig.requiresApproval) {
        setApprovalLevel(1);
        setApprovalNotes(notes);
        setShowApprovalModal(true);
        setLoading(false);
        return;
      }

      // Perform status change
      await performStatusChange(newStatus, notes);
    } catch (error) {
      console.error('Error changing status:', error);
      // Handle error notification
    }
    setLoading(false);
  };

  const performStatusChange = async (newStatus, notes = '') => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/orders/${order?.id}/status`, {
        status: newStatus,
        notes: notes,
        changedBy: 'current_user' // Replace with actual user
      });

      if (response.data.success) {
        setCurrentStatus(newStatus);
        onStatusChange?.(newStatus);
        
        // Execute automated actions
        const statusConfig = workflowStatuses[newStatus];
        await executeAutomatedActions(statusConfig.automatedActions, order);
        
        // Update status history
        await fetchStatusHistory();
        
        // Show success notification
        console.log(`Order status changed to ${newStatus}`);
      }
    } catch (error) {
      console.error('Error performing status change:', error);
      throw error;
    }
  };

  const executeAutomatedActions = async (actions, order) => {
    for (const action of actions) {
      try {
        switch (action) {
          case 'sendReviewNotification':
            await sendEmailNotification(order, 'review');
            break;
          case 'generateInvoice':
            await generateInvoice(order);
            break;
          case 'sendApprovalNotification':
            await sendEmailNotification(order, 'approval');
            break;
          case 'updateInventory':
            await updateInventory(order);
            break;
          case 'sendProcessingNotification':
            await sendEmailNotification(order, 'processing');
            break;
          case 'sendReadyNotification':
            await sendEmailNotification(order, 'ready');
            break;
          case 'sendTrackingInfo':
            await sendTrackingInfo(order);
            break;
          case 'sendDeliveryConfirmation':
            await sendEmailNotification(order, 'delivery');
            break;
          case 'requestFeedback':
            await requestFeedback(order);
            break;
          case 'sendCompletionNotification':
            await sendEmailNotification(order, 'completion');
            break;
          case 'archiveOrder':
            await archiveOrder(order);
            break;
          case 'sendHoldNotification':
            await sendEmailNotification(order, 'hold');
            break;
          case 'sendCancellationNotification':
            await sendEmailNotification(order, 'cancellation');
            break;
          case 'restoreInventory':
            await restoreInventory(order);
            break;
          case 'processReturn':
            await processReturn(order);
            break;
          default:
            console.log(`Unknown automated action: ${action}`);
        }
      } catch (error) {
        console.error(`Error executing automated action ${action}:`, error);
      }
    }
  };

  // Mock implementations for automated actions
  const sendEmailNotification = async (order, type) => {
    console.log(`Sending ${type} notification for order ${order.id}`);
    // Implement actual email sending logic
  };

  const generateInvoice = async (order) => {
    console.log(`Generating invoice for order ${order.id}`);
    // Implement invoice generation logic
  };

  const updateInventory = async (order) => {
    console.log(`Updating inventory for order ${order.id}`);
    // Implement inventory update logic
  };

  const sendTrackingInfo = async (order) => {
    console.log(`Sending tracking info for order ${order.id}`);
    // Implement tracking info sending logic
  };

  const requestFeedback = async (order) => {
    console.log(`Requesting feedback for order ${order.id}`);
    // Implement feedback request logic
  };

  const archiveOrder = async (order) => {
    console.log(`Archiving order ${order.id}`);
    // Implement order archiving logic
  };

  const restoreInventory = async (order) => {
    console.log(`Restoring inventory for order ${order.id}`);
    // Implement inventory restoration logic
  };

  const processReturn = async (order) => {
    console.log(`Processing return for order ${order.id}`);
    // Implement return processing logic
  };

  const handleApproval = async (approved, level) => {
    try {
      if (approved) {
        // Mark current level as completed
        approvalLevels[level].completed = true;
        
        // Check if all required levels are completed
        const requiredLevels = Object.entries(approvalLevels)
          .filter(([_, config]) => config.required)
          .map(([level, _]) => parseInt(level));
        
        const allCompleted = requiredLevels.every(level => approvalLevels[level].completed);
        
        if (allCompleted) {
          // All approvals completed, proceed with status change
          await performStatusChange(currentStatus, approvalNotes);
          setShowApprovalModal(false);
        } else {
          // Move to next approval level
          setApprovalLevel(level + 1);
        }
      } else {
        // Approval denied
        setShowApprovalModal(false);
        console.log('Approval denied');
      }
    } catch (error) {
      console.error('Error handling approval:', error);
    }
  };

  const getStatusIcon = (status) => {
    const statusConfig = workflowStatuses[status];
    const IconComponent = statusConfig?.icon || Clock;
    return <IconComponent className="w-4 h-4" />;
  };

  const getStatusColor = (status) => {
    const statusConfig = workflowStatuses[status];
    return statusConfig?.color || 'text-zinc-400';
  };

  const getStatusBgColor = (status) => {
    const statusConfig = workflowStatuses[status];
    return statusConfig?.bgColor || 'bg-zinc-500/20';
  };

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <div className="premium-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Order Workflow</h3>
          <button
            onClick={() => setShowStatusModal(true)}
            className="btn-premium flex items-center space-x-2"
          >
            <Edit3 className="w-4 h-4" />
            <span>Change Status</span>
          </button>
        </div>

        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-lg ${getStatusBgColor(currentStatus)}`}>
            {getStatusIcon(currentStatus)}
          </div>
          <div>
            <h4 className={`text-lg font-semibold ${getStatusColor(currentStatus)}`}>
              {workflowStatuses[currentStatus]?.label || 'Unknown Status'}
            </h4>
            <p className="text-zinc-400 text-sm">
              Order #{order?.orderNumber || 'N/A'}
            </p>
          </div>
        </div>

        {/* Available Transitions */}
        <div className="mt-4">
          <h5 className="text-sm font-medium text-zinc-300 mb-2">Available Actions</h5>
          <div className="flex flex-wrap gap-2">
            {workflowStatuses[currentStatus]?.canTransitionTo.map(status => (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                disabled={loading}
                className="px-3 py-1 text-xs rounded-full bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors disabled:opacity-50"
              >
                {workflowStatuses[status]?.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Status History */}
      <div className="premium-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Status History</h3>
        <div className="space-y-3">
          {statusHistory.map((history, index) => (
            <div key={history.id} className="flex items-center space-x-3 p-3 bg-zinc-800/30 rounded-lg">
              <div className={`p-2 rounded-lg ${getStatusBgColor(history.status)}`}>
                {getStatusIcon(history.status)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className={`font-medium ${getStatusColor(history.status)}`}>
                    {workflowStatuses[history.status]?.label}
                  </span>
                  <span className="text-xs text-zinc-400">
                    {new Date(history.changedAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-zinc-400">
                  Changed by {history.changedBy}
                </p>
                {history.notes && (
                  <p className="text-xs text-zinc-500 mt-1">{history.notes}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Automated Actions */}
      <div className="premium-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Automated Actions</h3>
        <div className="space-y-3">
          {automatedActions.map((action, index) => (
            <div key={action.id} className="flex items-center space-x-3 p-3 bg-zinc-800/30 rounded-lg">
              <div className={`p-2 rounded-lg ${
                action.status === 'completed' ? 'bg-green-500/20' : 'bg-yellow-500/20'
              }`}>
                <Zap className="w-4 h-4 text-green-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-white">
                    {action.description}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    action.status === 'completed' 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {action.status}
                  </span>
                </div>
                <p className="text-xs text-zinc-400">
                  {new Date(action.executedAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Status Change Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="premium-card p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Change Order Status</h3>
              <button
                onClick={() => setShowStatusModal(false)}
                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-all duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {workflowStatuses[currentStatus]?.canTransitionTo.map(status => (
                <button
                  key={status}
                  onClick={() => {
                    handleStatusChange(status);
                    setShowStatusModal(false);
                  }}
                  className="w-full p-3 text-left rounded-lg bg-zinc-800/30 hover:bg-zinc-800/50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${getStatusBgColor(status)}`}>
                      {getStatusIcon(status)}
                    </div>
                    <div>
                      <span className={`font-medium ${getStatusColor(status)}`}>
                        {workflowStatuses[status]?.label}
                      </span>
                      {workflowStatuses[status]?.requiresApproval && (
                        <span className="ml-2 text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded">
                          Requires Approval
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="premium-card p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Approval Required</h3>
              <button
                onClick={() => setShowApprovalModal(false)}
                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-all duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="text-center">
                <Shield className="w-12 h-12 text-orange-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-white mb-2">
                  {approvalLevels[approvalLevel]?.name} Approval Required
                </h4>
                <p className="text-zinc-400 text-sm">
                  This order requires approval before proceeding to the next status.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Approval Notes</label>
                  <textarea
                    value={approvalNotes}
                    onChange={(e) => setApprovalNotes(e.target.value)}
                    rows={3}
                    className="input-premium w-full"
                    placeholder="Add any notes about this approval..."
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => handleApproval(false, approvalLevel)}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200"
                  >
                    Deny
                  </button>
                  <button
                    onClick={() => handleApproval(true, approvalLevel)}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200"
                  >
                    Approve
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderWorkflow; 