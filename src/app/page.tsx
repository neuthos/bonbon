"use client";
import {useState} from "react";
import {Layout, Tabs, Typography} from "antd";
import {ShopOutlined, FileTextOutlined} from "@ant-design/icons";
import InventoryTab from "./components/InventoryTab";
import OrderTab from "./components/OrderTab";
import {ThemeProvider} from "./context/ThemeContext";

const {Header, Content} = Layout;
const {Title} = Typography;

function AppContent() {
  const items = [
    {
      key: "inventory",
      label: (
        <span className="text-sm sm:text-base">
          <span className="ml-1">Inventory</span>
        </span>
      ),
      children: <InventoryTab />,
    },
    {
      key: "orders",
      label: (
        <span className="text-sm sm:text-base">
          <span className="ml-1">Orders</span>
        </span>
      ),
      children: <OrderTab />,
    },
  ];

  return (
    <Layout style={{minHeight: "100vh"}}>
      <Header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 16px",
        }}
      >
        <Title
          level={4}
          style={{margin: 0, color: "white", textAlign: "center"}}
        >
          Bonbon Fashion
        </Title>
      </Header>

      <Content style={{padding: "8px"}}>
        <div
          style={{
            background: "#fff",
            borderRadius: "8px",
            padding: "8px",
            minHeight: "calc(100vh - 80px)",
          }}
        >
          <Tabs items={items} size="small" centered />
        </div>
      </Content>
    </Layout>
  );
}

export default function Home() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
