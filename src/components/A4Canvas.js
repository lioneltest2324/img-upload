import React from 'react';

export default function A4Canvas({ rows, a4Ref, onToggleLayout }) {
  return (
    <div className="a4-canvas" ref={a4Ref}>
      {rows.map(row => (
        <div key={row.id} className="canvas-row-wrapper">
          {/* 布局切换小菜单 (下载图片时会自动隐藏) */}
          <div className="layout-controls no-print">
            <button 
              className={row.layout === '1-col' ? 'active' : ''} 
              onClick={() => onToggleLayout(row.id, '1-col')}
            >单列</button>
            <button 
              className={row.layout === '2-col' ? 'active' : ''} 
              onClick={() => onToggleLayout(row.id, '2-col')}
            >双列</button>
          </div>

          <div className="canvas-row" data-layout={row.layout}>
            {row.items.length === 0 ? (
              <div className="placeholder-text">
                拖拽至此 ({row.layout === '1-col' ? '全幅' : '左右对拼'})
              </div>
            ) : (
              row.items.map(item => (
                <img key={item.id} src={item.url} alt="底稿" className="canvas-img" />
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}