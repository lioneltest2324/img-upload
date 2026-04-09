import React from 'react';
import { useDraggable } from '@dnd-kit/core';

// 单个可拖拽的图片组件
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
      <img src={`${item.url}?t=sidebar`} alt="SKU" crossOrigin="anonymous" />
      <div className="sku-label">SKU: {item.sku}</div>
    </div>
  );
}

export default function Sidebar({ orders, activeOrderItems, activeOrderId, onOrderChange }) {
  return (
    <div className="sidebar-content">
      <h2>订单选择</h2>
      <select value={activeOrderId} onChange={(e) => onOrderChange(e.target.value)} className="order-select">
        {orders.map(id => <option key={id} value={id}>订单 #{id}</option>)}
      </select>
      <h3>图片底稿 ({activeOrderId})</h3>
      <div className="sidebar-pool">
        {activeOrderItems?.map(item => (
          <DraggableThumbnail key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}