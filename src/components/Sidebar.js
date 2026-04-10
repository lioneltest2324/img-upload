import React from 'react';
import { useDraggable } from '@dnd-kit/core';

function DraggableThumbnail({ item }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: item.id,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 999,
  } : undefined;

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...listeners} 
      {...attributes} 
      className="thumbnail-card"
    >
      <img src={`${item.url}?v=sidebar`} alt="SKU" crossOrigin="anonymous" />
      <div className="sku-label">SKU: {item.sku}</div>
    </div>
  );
}

export default function Sidebar({ orders, activeOrderItems, activeOrderIds, onOrderChange, overlapOffset, onOverlapChange }) {
  
  // 处理多选切换
  const handleToggleOrder = (orderId) => {
    if (activeOrderIds.includes(orderId)) {
      onOrderChange(activeOrderIds.filter(id => id !== orderId));
    } else {
      onOrderChange([...activeOrderIds, orderId]);
    }
  };

  return (
    <div className="sidebar-content">
      <h2>订单选择 (多选)</h2>
      {/* 订单多选列表 */}
      <div className="order-selection-list">
        {orders.map(id => (
          <label key={id} className="order-checkbox-item">
            <input 
              type="checkbox" 
              checked={activeOrderIds.includes(id)} 
              onChange={() => handleToggleOrder(id)} 
            />
            <span>订单 #{id}</span>
          </label>
        ))}
      </div>

      <div className="slider-container">
        <label>双列向内靠拢: {overlapOffset} mm</label>
        <input 
          type="range" 
          min="0" 
          max="40" 
          step="1"
          value={overlapOffset} 
          onChange={(e) => onOverlapChange(e.target.value)}
          className="overlap-slider"
        />
      </div>

      <h3>合并去重底稿 ({activeOrderItems.length} 个SKU)</h3>
      <div className="sidebar-pool">
        {activeOrderItems?.map(item => (
          <DraggableThumbnail key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}