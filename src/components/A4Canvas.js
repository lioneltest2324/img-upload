import React from 'react';
import { useDroppable } from '@dnd-kit/core';

// 单个可放置的行组件
function DroppableRow({ row, onToggleLayout }) {
  const { isOver, setNodeRef } = useDroppable({
    id: row.id,
  });

  const style = {
    backgroundColor: isOver ? '#e0f2fe' : undefined, // 拖过时变蓝
    border: isOver ? '2px solid #3b82f6' : '2px dashed #cbd5e1',
  };

  return (
    <div className="canvas-row-wrapper">
      <div className="layout-controls no-print">
        <button className={row.layout === '1-col' ? 'active' : ''} onClick={() => onToggleLayout(row.id, '1-col')}>单列</button>
        <button className={row.layout === '2-col' ? 'active' : ''} onClick={() => onToggleLayout(row.id, '2-col')}>双列</button>
      </div>
      
      <div ref={setNodeRef} style={style} className="canvas-row" data-layout={row.layout}>
        {row.items.length === 0 ? (
          <div className="placeholder-text">拖拽至此</div>
        ) : (
          row.items.map((item, index) => (
            <img key={`${item.id}-${index}`} src={item.url} alt="底稿" className="canvas-img" />
          ))
        )}
      </div>
    </div>
  );
}

export default function A4Canvas({ rows, a4Ref, onToggleLayout }) {
  return (
    <div className="a4-canvas" ref={a4Ref}>
      {rows.map(row => (
        <DroppableRow key={row.id} row={row} onToggleLayout={onToggleLayout} />
      ))}
    </div>
  );
}