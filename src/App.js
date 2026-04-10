import React, { useState, useRef, useEffect } from 'react';
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import html2canvas from 'html2canvas';
import Sidebar from './components/Sidebar';
import A4Canvas from './components/A4Canvas';
import './index.css';

export default function App() {
  const [ordersData, setOrdersData] = useState({});
  // 变更 1：当前选中的订单变成数组格式，支持多选
  const [activeOrderIds, setActiveOrderIds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [canvasRows, setCanvasRows] = useState([
    { id: 'row-1', layout: '1-col', items: [] },
    { id: 'row-2', layout: '2-col', items: [] },
    { id: 'row-3', layout: '1-col', items: [] },
    { id: 'row-4', layout: '2-col', items: [] },
  ]);

  const [overlapOffset, setOverlapOffset] = useState(0);
  // 新增：行间距状态（默认 10mm，最大 30mm）
  const [rowSpacing, setRowSpacing] = useState(10);
  const [isPrinting, setIsPrinting] = useState(false);
  const a4Ref = useRef(null);

  const API_URL = "https://script.google.com/macros/s/AKfycbyEyj4bcl_HjGn3BJlFDoNbCW3SeTLw1qSUpLK9UcoByDlQ989hJTYAULKgUZuBqt5B5A/exec";

  useEffect(() => {
    fetch(API_URL)
      .then(response => response.json())
      .then(data => {
        const grouped = data.reduce((acc, item) => {
          const orderId = String(item["订单号"]);
          if (!acc[orderId]) acc[orderId] = [];
          acc[orderId].push({
            id: `img-${item["SKU"]}-${Math.random().toString(36).substr(2, 9)}`,
            sku: item["SKU"],
            url: item["匹配URL"][0]
          });
          return acc;
        }, {});

        setOrdersData(grouped);
        
        // 变更 2：获取所有订单号并进行降序排列（大的在上）
        const sortedOrders = Object.keys(grouped).sort((a, b) => Number(b) - Number(a));
        if (sortedOrders.length > 0) {
          setActiveOrderIds([sortedOrders[0]]); // 默认选中最大的订单
        }
        setIsLoading(false);
      })
      .catch(error => {
        console.error("获取数据失败:", error);
        setIsLoading(false);
      });
  }, []);

  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: { distance: 8 },
  }));

  // 变更 3：核心去重逻辑，合并所选订单的图片并根据 SKU 去重
  const getActiveItems = () => {
    const items = [];
    const seenSkus = new Set();
    
    activeOrderIds.forEach(orderId => {
      if (ordersData[orderId]) {
        ordersData[orderId].forEach(item => {
          if (!seenSkus.has(item.sku)) {
            seenSkus.add(item.sku);
            items.push(item);
          }
        });
      }
    });
    return items;
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    const imageId = active.id;
    const targetRowId = over.id;

    // 从聚合去重后的列表中寻找被拖拽的图片
    const draggedItem = getActiveItems().find(item => item.id === imageId);
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
        link.download = `合并订单排版底稿.png`; // 名字改为泛用型
        link.click();
      } finally {
        setIsPrinting(false);
      }
    }, 100);
  };

  if (isLoading) {
    return <div className="loading-screen">正在获取订单数据，请稍候...</div>;
  }

  // 保证传给 Sidebar 的也是排好序的订单列表
  const sortedOrderKeys = Object.keys(ordersData).sort((a, b) => Number(b) - Number(a));

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="app-container">
        <div className="sidebar-container">
          <Sidebar 
            orders={sortedOrderKeys}
            activeOrderItems={getActiveItems()} 
            activeOrderIds={activeOrderIds}
            onOrderChange={setActiveOrderIds} 
            overlapOffset={overlapOffset}
            onOverlapChange={setOverlapOffset}
            // 传递行间距给侧边栏控制
            rowSpacing={rowSpacing}
            onRowSpacingChange={setRowSpacing}
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
               // 传递行间距给画布
               rowSpacing={rowSpacing}
             />
          </div>
        </div>
      </div>
    </DndContext>
  );
}