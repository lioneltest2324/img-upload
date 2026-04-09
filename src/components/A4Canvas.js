import React from 'react';
import { useDroppable } from '@dnd-kit/core';

function DroppableRow({ row, onToggleLayout, onRemoveItem }) {
  const { isOver, setNodeRef } = useDroppable({ id: row.id });

  const style = {
    backgroundColor: isOver ? '#f0f9ff' : undefined,
    border: isOver ? '2px solid #3b82f6' : '1px dashed #cbd5e1',
  };

  return (
    <div className="canvas-row-wrapper">
      <div className="layout-controls no-print">
        <button className={row.layout === '1-col' ? 'active' : ''} onClick={() => onToggleLayout(row.id, '1-col')}>单列</button>
        <button className={row.layout === '2-col' ? 'active' : ''} onClick={() => onToggleLayout(row.id, '2-col')}>双列</button>
      </div>
      
      <div ref={setNodeRef} style={style} className="canvas-row" data-layout={row.layout}>
        {row.items.length === 0 ? (
          <div className="placeholder-text">拖拽图片至此</div>
        ) : (
          row.items.map((item) => (
            <div key={item.instanceId} className="canvas-item-container">
              <img src={item.url} alt="底稿" className="canvas-img" />
              {/* 删除按钮 - 仅在网页显示，不打印 */}
              <button 
                className="remove-item-btn no-print" 
                onClick={() => onRemoveItem(row.id, item.instanceId)}
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function A4Canvas({ rows, a4Ref, onToggleLayout, onRemoveItem }) {
  return (
    <div className="a4-canvas" ref={a4Ref}>
      {rows.map(row => (
        <DroppableRow 
            key={row.id} 
            row={row} 
            onToggleLayout={onToggleLayout} 
            onRemoveItem={onRemoveItem} 
        />
      ))}
    </div>
  );
}