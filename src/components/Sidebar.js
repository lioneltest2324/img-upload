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

export default function Sidebar({ orders, activeOrderItems, activeOrderIds, onOrderChange, overlapOffset, onOverlapChange, rowSpacing, onRowSpacingChange }) {
  
  // 处理多选框的变更逻辑
  const handleCheckboxChange = (orderId, isChecked) => {
    if (isChecked) {
      onOrderChange([...activeOrderIds, orderId]);
    } else {
      onOrderChange(activeOrderIds.filter(id => id !== orderId));
    }
  };

  return (
    <div className="sidebar-content">
      <h2>订单选择 (可多选)</h2>
      {/* 变更 4：多选订单列表 UI */}
      <div className="order-multi-select">
        {orders.map(id => (
          <label key={id} className="order-checkbox-label">
            <input 
              type="checkbox" 
              checked={activeOrderIds.includes(id)} 
              onChange={(e) => handleCheckboxChange(id, e.target.checked)}
            />
            订单 #{id}
          </label>
        ))}
      </div>

      <div className="slider-container">
        {/* 原有双列滑块 */}
        <div className="slider-group">
          <label>双列向内靠拢: {overlapOffset} mm</label>
          <input 
            type="range" min="0" max="40" step="1"
            value={overlapOffset} onChange={(e) => onOverlapChange(e.target.value)}
            className="custom-slider"
          />
        </div>

        {/* 新增：行间距调整滑块 */}
        <div className="slider-group" style={{marginTop: '15px'}}>
          <label>行间距 (Gap): {rowSpacing} mm</label>
          <input 
            type="range" min="0" max="30" step="1"
            value={rowSpacing} onChange={(e) => onRowSpacingChange(e.target.value)}
            className="custom-slider"
          />
        </div>
      </div>

      <h3>去重底稿图池 (共 {activeOrderItems.length} 张)</h3>
      <div className="sidebar-pool">
        {activeOrderItems?.map(item => (
          <DraggableThumbnail key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}