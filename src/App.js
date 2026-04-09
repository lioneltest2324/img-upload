import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas'; // 引入截图库
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
  const a4Ref = useRef(null); // 创建一个引用，指向 A4 画布

  // 画布状态，现在包含 layout 属性
  const [canvasRows, setCanvasRows] = useState([
    { id: 'row-1', layout: '1-col', items: [] },
    { id: 'row-2', layout: '2-col', items: [] },
    { id: 'row-3', layout: '1-col', items: [] },
    { id: 'row-4', layout: '2-col', items: [] },
  ]);

  // 修改行布局的函数
  const toggleLayout = (rowId, newLayout) => {
    setCanvasRows(prev => prev.map(row => 
      row.id === rowId ? { ...row, layout: newLayout } : row
    ));
  };

  // 下载 A4 图片的函数
  const downloadImage = async () => {
    if (!a4Ref.current) return;
    
    // 隐藏掉页面上的虚线和按钮，只下载白底和图片
    const canvas = await html2canvas(a4Ref.current, {
      scale: 2, // 提高清晰度 (2倍采样)
      useCORS: true, // 允许跨域图片下载
      backgroundColor: '#ffffff'
    });
    
    const image = canvas.toDataURL("image/png");
    const link = document.createElement('a');
    link.href = image;
    link.download = `订单-${activeOrderId}-排版.png`;
    link.click();
  };

  return (
    <div className="app-container">
       <div className="sidebar-container">
          <Sidebar 
            orders={Object.keys(ordersData)}
            activeOrderItems={ordersData[activeOrderId]} 
            activeOrderId={activeOrderId}
            onOrderChange={setActiveOrderId} 
          />
          {/* 添加下载按钮 */}
          <button className="download-btn" onClick={downloadImage}>
             下载 A4 底稿图
          </button>
       </div>

       <div className="main-workspace">
          {/* 将 ref 传给 A4Canvas */}
          <A4Canvas 
            rows={canvasRows} 
            a4Ref={a4Ref} 
            onToggleLayout={toggleLayout} 
          />
       </div>
    </div>
  );
}