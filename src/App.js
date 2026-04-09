import React, { useState, useRef } from 'react';
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import html2canvas from 'html2canvas';
import Sidebar from './components/Sidebar';
import A4Canvas from './components/A4Canvas';
import './index.css';

export default function App() {
  const [ordersData] = useState({
    "17978": [
      { id: "img-1", sku: "15986", url: "https://pub-3ad6d42f11fb48398296c802423e1efa.r2.dev/442.png" },
      { id: "img-2", sku: "16491", url: "https://pub-3ad6d42f11fb48398296c802423e1efa.r2.dev/340.png" },
      { id: "img-3", sku: "16492", url: "https://pub-3ad6d42f11fb48398296c802423e1efa.r2.dev/442.png" } 
    ]
  });

  const [activeOrderId, setActiveOrderId] = useState("17978");
  
  // 画布的 4 行状态
  const [canvasRows, setCanvasRows] = useState([
    { id: 'row-1', layout: '1-col', items: [] },
    { id: 'row-2', layout: '2-col', items: [] },
    { id: 'row-3', layout: '1-col', items: [] },
    { id: 'row-4', layout: '2-col', items: [] },
  ]);

  // 新增：双列靠拢的偏移量状态（默认 0mm，最大 40mm）
  const [overlapOffset, setOverlapOffset] = useState(0);
  
  // 打印模式状态
  const [isPrinting, setIsPrinting] = useState(false);
  const a4Ref = useRef(null);

  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: { distance: 8 },
  }));

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    const imageId = active.id;
    const targetRowId = over.id;

    const draggedItem = ordersData[activeOrderId].find(item => item.id === imageId);
    if (!draggedItem) return;

    setCanvasRows(prevRows => prevRows.map(row => {
      if (row.id === targetRowId) {
        const max = row.layout === '1-col' ? 1 : 2;
        if (row.items.length < max) {
          return { 
            ...row, 
            items: [...row.items, { ...draggedItem, instanceId: `${draggedItem.id}-${Date.now()}` }] 
          };
        }
      }
      return row;
    }));
  };

  const removeItemFromCanvas = (rowId, instanceId) => {
    setCanvasRows(prev => prev.map(row => {
      if (row.id === rowId) {
        return { ...row, items: row.items.filter(item => item.instanceId !== instanceId) };
      }
      return row;
    }));
  };

  const toggleLayout = (rowId, newLayout) => {
    setCanvasRows(prev => prev.map(row => 
      row.id === rowId ? { ...row, layout: newLayout, items: [] } : row
    ));
  };

  const downloadImage = () => {
    if (!a4Ref.current) return;
    
    setIsPrinting(true);

    setTimeout(async () => {
      try {
        const canvas = await html2canvas(a4Ref.current, { 
          scale: 3, 
          useCORS: true, 
          allowTaint: false,
          backgroundColor: '#ffffff' 
        });
        const link = document.createElement('a');
        link.href = canvas.toDataURL("image/png");
        link.download = `订单-${activeOrderId}-排版底稿.png`;
        link.click();
      } catch (error) {
        console.error("生成图片失败:", error);
        alert("图片下载失败，请确保 R2 已配置 CORS 规则！");
      } finally {
        setIsPrinting(false);
      }
    }, 100);
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
            // 传递滑块数据
            overlapOffset={overlapOffset}
            onOverlapChange={setOverlapOffset}
          />
          <button className="download-btn" onClick={downloadImage}>下载高清底稿</button>
        </div>

        <div className="main-workspace">
          <div className={`a4-wrapper ${isPrinting ? 'is-printing' : ''}`}>
             <A4Canvas 
               rows={canvasRows} 
               a4Ref={a4Ref} 
               onToggleLayout={toggleLayout} 
               onRemoveItem={removeItemFromCanvas} 
               // 传递滑块数据给画布
               overlapOffset={overlapOffset}
             />
          </div>
        </div>
      </div>
    </DndContext>
  );
}