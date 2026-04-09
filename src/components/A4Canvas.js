import React from 'react';

export default function A4Canvas({ rows }) {
  return (
    <div className="a4-canvas">
      {rows.map(row => (
        <div key={row.id} className="canvas-row" data-layout={row.layout}>
          {/* 这里判断，如果这行没有图片，就显示占位符 */}
          {row.items.length === 0 ? (
            <div className="placeholder-text">
              拖拽图片至此<br/>
              ({row.layout === '1-col' ? '单列排版' : '双列排版'})
            </div>
          ) : (
            row.items.map(item => (
              <img key={item.id} src={item.url} alt="底稿" className="canvas-img" />
            ))
          )}
        </div>
      ))}
    </div>
  );
}