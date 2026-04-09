import React, { useState, useRef } from 'react';
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import html2canvas from 'html2canvas';
import Sidebar from './components/Sidebar';
import A4Canvas from './components/A4Canvas';
import './index.css';

export default function App() {
  // 这里的 setOrdersData 之后会用到，所以不会报错
  const [ordersData, setOrdersData] = useState({
    "17978": [
      { id: "img-1", sku: "15986", url: "https://pub-3ad6d42f11fb48398296c802423e1efa.r2.dev/442.png" },
      { id: "img-2", sku: "16491", url: "https://pub-3ad6d42f11fb48398296c802423e1efa.r2.dev/340.png" },
      { id: "img-3", sku: "16492", url: "https://pub-3ad6d42f11fb48398296c802423e1efa.r2.dev/442.png" } 
    ]
  });

  const [activeOrderId, setActiveOrderId] = useState("17978");
  const [canvasRows, setCanvasRows] = useState([
    { id: 'row-1', layout: '1-col', items: [] },
    { id: 'row-2', layout: '2-col', items: [] },
    { id: 'row-3', layout: '1-col', items: [] },
    { id: 'row-4', layout: '2-col', items: [] },
  ]);

  const a4Ref = useRef(null);

  // 设置传感器，防止点击按钮时触发拖拽
  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: { distance: 8 },
  }));

  // 核心：处理拖拽结束的逻辑
  const handleDragEnd = (event) => {
    const { active, over } = event;
    // 如果没有拖到目标区域，直接返回
    if (!over) return;

    const imageId = active.id;
    const targetRowId = over.id;

    // 1. 找到被拖拽的图片对象
    const draggedItem = ordersData[activeOrderId].find(item => item.id === imageId);
    if (!draggedItem) return;

    // 2. 更新画布状态：将图片加入对应的行
    setCanvasRows(prevRows => prevRows.map(row => {
      if (row.id === targetRowId) {
        // 根据布局限制数量：单列1张，双列2张
        const max = row.layout === '1-col' ? 1 : 2;
        if (row.items.length < max) {
          return { ...row, items: [...row.items, draggedItem] };
        }
      }
      return row;
    }));

    // 3. 更新侧边栏状态：从待选池中移除已拖走的图片
    setOrdersData(prevData => ({
      ...prevData,
      [activeOrderId]: prevData[activeOrderId].filter(item => item.id !== imageId)
    }));
  };

  const toggleLayout = (rowId, newLayout) => {
    setCanvasRows(prev => prev.map(row => 
      row.id === rowId ? { ...row, layout: newLayout, items: [] } : row // 切换布局时清空该行图片防止溢出
    ));
  };

  const downloadImage = async () => {
    if (!a4Ref.current) return;
    const canvas = await html2canvas(a4Ref.current, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
    const link = document.createElement('a');
    link.href = canvas.toDataURL("image/png");
    link.download = `订单-${activeOrderId}.png`;
    link.click();
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="app-container">
        <div className="sidebar-container">
          <Sidebar 
            orders={Object.keys(ordersData)}
            activeOrderItems={ordersData[activeOrderId]} 
            activeOrderId={activeOrderId}
            onOrderChange={setActiveOrderId} 
          />
          <button className="download-btn" onClick={downloadImage}>下载 A4 底稿图</button>
        </div>

        <div className="main-workspace">
          <A4Canvas rows={canvasRows} a4Ref={a4Ref} onToggleLayout={toggleLayout} />
        </div>
      </div>
    </DndContext>
  );
}