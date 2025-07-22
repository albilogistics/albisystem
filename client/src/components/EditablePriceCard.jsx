import React, { useState } from 'react';
import { Edit2, Save, X, DollarSign, Package, Tag, Percent, Calculator } from 'lucide-react';

const EditablePriceCard = ({ item, onSave, onCancel }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    sellPrice: item.sellPrice || 0,
    cost: item.cost || 0,
    margin: item.margin || 0,
    method: item.method || 'sigmoid',
    shipping: item.shipping || 0,
    box: item.box || 0,
    cable: item.cable || 0
  });

  const handleSave = () => {
    onSave(item.id, editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      sellPrice: item.sellPrice || 0,
      cost: item.cost || 0,
      margin: item.margin || 0,
      method: item.method || 'sigmoid',
      shipping: item.shipping || 0,
      box: item.box || 0,
      cable: item.cable || 0
    });
    setIsEditing(false);
    onCancel();
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(price);
  };

  const calculateTotalCost = () => {
    return (editData.cost || 0) + (editData.shipping || 0) + (editData.box || 0) + (editData.cable || 0);
  };

  const calculateProfit = () => {
    const totalCost = calculateTotalCost();
    return (editData.sellPrice || 0) - totalCost;
  };

  const calculateProfitMargin = () => {
    const totalCost = calculateTotalCost();
    const profit = calculateProfit();
    return totalCost > 0 ? (profit / totalCost) * 100 : 0;
  };

  return (
    <div className="bg-zinc-900 rounded-2xl shadow-lg border border-zinc-800 p-6 hover:shadow-xl transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
            <Package className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">{item.model}</h3>
            <p className="text-sm text-zinc-400">{item.grade} • {item.capacity} • {item.color}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 text-zinc-400 hover:text-blue-400 hover:bg-blue-500/20 rounded-lg transition-all duration-200"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center space-x-1">
              <button
                onClick={handleSave}
                className="p-2 text-green-400 hover:text-green-300 hover:bg-green-500/20 rounded-lg transition-all duration-200"
              >
                <Save className="w-4 h-4" />
              </button>
              <button
                onClick={handleCancel}
                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Price Display */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-zinc-800 rounded-xl p-3 border border-zinc-700">
          <div className="flex items-center space-x-2 mb-1">
            <DollarSign className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-zinc-400">Sell Price</span>
          </div>
          {isEditing ? (
            <input
              type="number"
              value={editData.sellPrice}
              onChange={(e) => setEditData({...editData, sellPrice: parseFloat(e.target.value) || 0})}
              className="w-full text-lg font-bold text-green-400 bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              step="0.01"
            />
          ) : (
            <div className="text-lg font-bold text-green-400">{formatPrice(item.sellPrice || 0)}</div>
          )}
        </div>

        <div className="bg-zinc-800 rounded-xl p-3 border border-zinc-700">
          <div className="flex items-center space-x-2 mb-1">
            <Tag className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-zinc-400">List Price</span>
          </div>
          <div className="text-lg font-semibold text-blue-400">{formatPrice(item.listPrice || 0)}</div>
        </div>
      </div>

      {/* Cost Breakdown */}
      {isEditing && (
        <div className="bg-blue-500/10 rounded-xl p-4 mb-4 border border-blue-500/20">
          <h4 className="font-medium text-blue-300 mb-3 flex items-center">
            <Calculator className="w-4 h-4 mr-2" />
            Cost Breakdown
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-blue-300 font-medium">Base Cost</label>
              <input
                type="number"
                value={editData.cost}
                onChange={(e) => setEditData({...editData, cost: parseFloat(e.target.value) || 0})}
                className="w-full text-sm bg-zinc-700 border border-blue-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                step="0.01"
              />
            </div>
            <div>
              <label className="text-xs text-blue-300 font-medium">Shipping</label>
              <input
                type="number"
                value={editData.shipping}
                onChange={(e) => setEditData({...editData, shipping: parseFloat(e.target.value) || 0})}
                className="w-full text-sm bg-zinc-700 border border-blue-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                step="0.01"
              />
            </div>
            <div>
              <label className="text-xs text-blue-300 font-medium">Box</label>
              <input
                type="number"
                value={editData.box}
                onChange={(e) => setEditData({...editData, box: parseFloat(e.target.value) || 0})}
                className="w-full text-sm bg-zinc-700 border border-blue-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                step="0.01"
              />
            </div>
            <div>
              <label className="text-xs text-blue-300 font-medium">Cable</label>
              <input
                type="number"
                value={editData.cable}
                onChange={(e) => setEditData({...editData, cable: parseFloat(e.target.value) || 0})}
                className="w-full text-sm bg-zinc-700 border border-blue-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                step="0.01"
              />
            </div>
          </div>
          
          {/* Summary */}
          <div className="mt-3 pt-3 border-t border-blue-500/30">
            <div className="flex justify-between text-sm">
              <span className="text-blue-300">Total Cost:</span>
              <span className="font-semibold text-blue-200">{formatPrice(calculateTotalCost())}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-green-300">Profit:</span>
              <span className="font-semibold text-green-200">{formatPrice(calculateProfit())}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-purple-300">Margin:</span>
              <span className="font-semibold text-purple-200">{calculateProfitMargin().toFixed(1)}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Method Selection */}
      {isEditing && (
        <div className="mb-4">
          <label className="text-sm font-medium text-zinc-300 mb-2 block">Pricing Method</label>
          <select
            value={editData.method}
            onChange={(e) => setEditData({...editData, method: e.target.value})}
            className="w-full border border-zinc-700 rounded-lg px-3 py-2 text-sm bg-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="sigmoid">Sigmoid</option>
            <option value="linear">Linear</option>
            <option value="exponential">Exponential</option>
          </select>
        </div>
      )}

      {/* Margin Display */}
      <div className="bg-zinc-800 rounded-xl p-3 border border-zinc-700">
        <div className="flex items-center space-x-2 mb-1">
          <Percent className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-medium text-zinc-400">Margin</span>
        </div>
        {isEditing ? (
          <input
            type="number"
            value={editData.margin}
            onChange={(e) => setEditData({...editData, margin: parseFloat(e.target.value) || 0})}
            className="w-full text-lg font-bold text-purple-400 bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            step="0.01"
          />
        ) : (
          <div className="text-lg font-bold text-purple-400">{item.margin || 0}%</div>
        )}
      </div>
    </div>
  );
};

export default EditablePriceCard; 