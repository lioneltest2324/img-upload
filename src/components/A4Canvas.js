import React from 'react';
import { useDroppable } from '@dnd-kit/core';

function DroppableRow({ row, onToggleLayout, onRemoveItem, overlapOffset }) {
  const { isOver, setNodeRef } = useDroppable({ id: row.id });

  const style = {
    backgroundColor: isOver ? '#f0f9ff' : undefined,
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
          row.items.map((item, index) => {
            
            // 计算双列的靠拢边距
            const isTwoCol = row.layout === '2-col';
            const marginStyle = isTwoCol ? {
              // 左边的图向右拉，右边的图向左拉
              marginRight: index === 0 ? `-${overlapOffset}mm` : '0',
              marginLeft: index === 1 ? `-${overlapOffset}mm` : '0',
              transition: 'margin 0.1s ease-out'
            } : {};

            return (
              <div key={item.instanceId} className="canvas-item-container" style={marginStyle}>
                {/* 加上 instanceId 防止跨域缓存冲突 */}
                <img src={`${item.url}?v=${item.instanceId}`} alt="底稿" className="canvas-img" crossOrigin="anonymous" />
                <button 
                  className="remove-item-btn no-print" 
                  onClick={() => onRemoveItem(row.id, item.instanceId)}
                >
                  ×
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function A4Canvas({ rows, a4Ref, onToggleLayout, onRemoveItem, overlapOffset }) {
  return (
    <div className="a4-canvas" ref={a4Ref}>
      {rows.map(row => (
        <DroppableRow 
            key={row.id} 
            row={row} 
            onToggleLayout={onToggleLayout} 
            onRemoveItem={onRemoveItem} 
            overlapOffset={overlapOffset}
        />
      ))}
    </div>
  );
}