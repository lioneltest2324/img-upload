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
      {/* 加上 ?v=sidebar 防止跨域缓存冲突 */}
      <img src={`${item.url}?v=sidebar`} alt="SKU" crossOrigin="anonymous" />
      <div className="sku-label">SKU: {item.sku}</div>
    </div>
  );
}

export default function Sidebar({ orders, activeOrderItems, activeOrderId, onOrderChange, overlapOffset, onOverlapChange }) {
  return (
    <div className="sidebar-content">
      <h2>订单选择</h2>
      <select value={activeOrderId} onChange={(e) => onOrderChange(e.target.value)} className="order-select">
        {orders.map(id => <option key={id} value={id}>订单 #{id}</option>)}
      </select>

      {/* 滑动条控制区 */}
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
        <div className="slider-help">向右拖动消除图片内边距，强制重叠</div>
      </div>

      <h3>图片底稿 ({activeOrderId})</h3>
      <div className="sidebar-pool">
        {activeOrderItems?.map(item => (
          <DraggableThumbnail key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}