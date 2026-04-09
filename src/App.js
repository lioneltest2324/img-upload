import React, { useState, useRef, useEffect } from 'react';
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import html2canvas from 'html2canvas';
import Sidebar from './components/Sidebar';
import A4Canvas from './components/A4Canvas';
import './index.css';

export default function App() {
  // 1. 初始化状态：初始为空对象
  const [ordersData, setOrdersData] = useState({});
  const [activeOrderId, setActiveOrderId] = useState("");
  const [isLoading, setIsLoading] = useState(true); // 加载状态
  
  const [canvasRows, setCanvasRows] = useState([
    { id: 'row-1', layout: '1-col', items: [] },
    { id: 'row-2', layout: '2-col', items: [] },
    { id: 'row-3', layout: '1-col', items: [] },
    { id: 'row-4', layout: '2-col', items: [] },
  ]);

  const [overlapOffset, setOverlapOffset] = useState(0);
  const [isPrinting, setIsPrinting] = useState(false);
  const a4Ref = useRef(null);

  const API_URL = "https://script.google.com/macros/s/AKfycbyEyj4bcl_HjGn3BJlFDoNbCW3SeTLw1qSUpLK9UcoByDlQ989hJTYAULKgUZuBqt5B5A/exec";

  // 2. 使用 useEffect 在页面加载时获取数据
  useEffect(() => {
    fetch(API_URL)
      .then(response => response.json())
      .then(data => {
        // 将 API 返回的扁平数组转换为按“订单号”分组的对象
        const grouped = data.reduce((acc, item) => {
          const orderId = String(item["订单号"]);
          if (!acc[orderId]) {
            acc[orderId] = [];
          }
          acc[orderId].push({
            // 唯一 ID：SKU + 随机数，防止重复
            id: `img-${item["SKU"]}-${Math.random().toString(36).substr(2, 9)}`,
            sku: item["SKU"],
            url: item["匹配URL"][0]
          });
          return acc;
        }, {});

        setOrdersData(grouped);
        
        // 默认选中第一个订单
        const firstOrder = Object.keys(grouped)[0];
        if (firstOrder) {
          setActiveOrderId(firstOrder);
        }
        setIsLoading(false);
      })
      .catch(error => {
        console.error("获取数据失败:", error);
        setIsLoading(false);
      });
  }, []); // 仅在组件挂载时执行一次

  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: { distance: 8 },
  }));

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    const imageId = active.id;
    const targetRowId = over.id;

    // 从当前选中的订单中找到图片数据
    const draggedItem = ordersData[activeOrderId]?.find(item => item.id === imageId);
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
          backgroundColor: '#ffffff' 
        });
        const link = document.createElement('a');
        link.href = canvas.toDataURL("image/png");
        link.download = `订单-${activeOrderId}.png`;
        link.click();
      } finally {
        setIsPrinting(false);
      }
    }, 100);
  };

  // 如果正在加载，显示提示
  if (isLoading) {
    return <div className="loading-screen">正在获取订单数据，请稍候...</div>;
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="app-container">
        <div className="sidebar-container">
          <Sidebar 
            orders={Object.keys(ordersData)}
            activeOrderItems={ordersData[activeOrderId]} 
            activeOrderId={activeOrderId}
            onOrderChange={setActiveOrderId} 
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
               overlapOffset={overlapOffset}
             />
          </div>
        </div>
      </div>
    </DndContext>
  );
}