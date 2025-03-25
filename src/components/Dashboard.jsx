import React, { useState, useEffect } from 'react';
import '../css/dashboard.css'; // Import your CSS file for styling
import CardsContainer from './styled-components/CardsContainer'; // Import the CardsContainer component

export default function DashboardPage() {
  const [selectedItem, setSelectedItem] = useState(null);
  const [deliveryData, setDeliveryData] = useState([]); // State to hold delivery data


  // Mock sales data (replace this with actual API calls or dynamic data)
  const mockSalesData = [
    { id: 1, title: 'Todays Delivery', currentSales: 35, previousSales: 30, text: 'Delivery' },
    { id: 2, title: 'Monthly Delivery', currentSales:712, previousSales: 430, text: 'Delivery' },
    { id: 3, title: 'Delivery Issue', currentSales: 1, previousSales: 4, text: 'Report' },
    { id: 4, title: 'Total Delivery', currentSales: 2532, previousSales: 1812, text: 'Delivery' },
  ];

  // Calculate delivery metrics
  useEffect(() => {
    // Define icon links for each card
    const icons = [
      'https://cdn-icons-png.flaticon.com/512/1234/1234567.png',
      'https://cdn-icons-png.flaticon.com/512/2345/2345678.png',
      'https://cdn-icons-png.flaticon.com/512/3456/3456789.png',
      'https://cdn-icons-png.flaticon.com/512/4567/4567890.png',
    ];

    // Update sampleData with calculated values and icon links
    setDeliveryData(
      mockSalesData.map((item, index) => ({
        id: item.id,
        title: item.title,
        description: `This is the ${item.title.toLowerCase()}.`,
        value: item.currentSales.toLocaleString(),
        icon: icons[index],
        currentSales: item.currentSales,
        previousSales: item.previousSales,
        text: item.text,
      }))
    );
  }, []); // Empty dependency array means this runs once on mount

  const handleViewDetails = (item) => {
    setSelectedItem(item);
  };

  return (
    <div className="dashboard-content">
      {/* Welcome Message */}
      <div className="welcome-message">
        <h2>Delivery Orders</h2>
        <p>Here's an overview of your account and activities.</p>
      </div>

      {/* Main Grid Layout */}
      <div className="main-grid">
        {/* Left Column: Cards Section */}
        <CardsContainer data={deliveryData} onViewDetails={handleViewDetails} />

      </div>
    </div>
  );
}