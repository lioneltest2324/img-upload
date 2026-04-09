import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import A4Canvas from './components/A4Canvas';
import './index.css';

export default function App() {
  // 模拟从 API 获取到的订单数据
  const [ordersData] = useState({
    "17978": [
      { id: "img-1", sku: "15986", url: "https://pub-3ad6d42f11fb48398296c802423e1efa.r2.dev/442.png" },
      { id: "img-2", sku: "16491", url: "https://pub-3ad6d42f11fb48398296c802423e1efa.r2.dev/340.png" },
      { id: "img-3", sku: "16492", url: "https://pub-3ad6d42f11fb48398296c802423e1efa.r2.dev/442.png" } // 复制一个测试多图
    ],
    "17979": [
      { id: "img-4", sku: "88888", url: "https://pub-3ad6d42f11fb48398296c802423e1efa.r2.dev/340.png" }
    ]
  });

  const [activeOrderId, setActiveOrderId] = useState("17978");

  // A4 画布状态 (暂未加入图片，只是空架子)
  const [canvasRows] = useState([
    { id: 'row-1', layout: '1-col', items: [] },
    { id: 'row-2', layout: '2-col', items: [] },
    { id: 'row-3', layout: '1-col', items: [] },
    { id: 'row-4', layout: '2-col', items: [] },
  ]);

  return (
    <div className="app-container">
       <div className="sidebar-container">
          <Sidebar 
            orders={Object.keys(ordersData)}
            activeOrderItems={ordersData[activeOrderId]} 
            activeOrderId={activeOrderId}
            onOrderChange={setActiveOrderId} 
          />
       </div>

       <div className="main-workspace">
          <A4Canvas rows={canvasRows} />
       </div>
    </div>
  );
}