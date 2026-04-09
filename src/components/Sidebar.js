import React from 'react';

export default function Sidebar({ orders, activeOrderItems, activeOrderId, onOrderChange }) {
  return (
    <div className="sidebar-content">
      <h2 style={{marginTop: 0}}>订单选择</h2>
      <select 
        value={activeOrderId} 
        onChange={(e) => onOrderChange(e.target.value)}
        className="order-select"
      >
        {orders.map(orderId => (
          <option key={orderId} value={orderId}>订单 #{orderId}</option>
        ))}
      </select>

      <h3>图片底稿 (订单 {activeOrderId})</h3>
      
      {/* 左侧的缩略图池 */}
      <div className="sidebar-pool">
        {activeOrderItems?.map(item => (
          <div key={item.id} className="thumbnail-card">
            <img src={item.url} alt={`SKU ${item.sku}`} />
            <div className="sku-label">SKU: {item.sku}</div>
          </div>
        ))}
      </div>
    </div>
  );
}