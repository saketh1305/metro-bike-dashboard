import React, { useState, useEffect } from "react";
import { Layout, Typography, Dropdown, Button, Row, Col, Space } from "antd";
import { DownOutlined } from "@ant-design/icons";

import * as d3 from "d3";
import TimeSeriesLineChart from "../components/TimeSeriesLineChart";
import HorizontalBarChart from "../components/HorizontalBarChart";
import StationUsageTable from "../components/StationUsageTable";
import HeatmapChart from "../components/HeatmapChart";
import TotalRides from "../components/TotalRide";

const { Header, Content } = Layout;
const { Title } = Typography;

const DashboardPage = () => {
  const [selectedQuarter, setSelectedQuarter] = useState("2024-Q3"); 
  const [csvFile, setCsvFile] = useState("data/metro-trips-2024-q3.csv");
  const [totalRides, setTotalRides] = useState(0); 
  const [rideData, setRideData] = useState([]); 
  const [stationData, setStationData] = useState([]);

  const items = [
    { key: "metro-trips-2024-q1.csv", label: "2024-Q1" },
    { key: "metro-trips-2024-q2.csv", label: "2024-Q2" },
    { key: "metro-trips-2024-q3.csv", label: "2024-Q3" },
  ];


  const handleMenuClick = ({ key }) => {
    const selectedItem = items.find((item) => item.key === key);
    setCsvFile("data/" + selectedItem.key);
    setSelectedQuarter(selectedItem.label);
  };

  useEffect(() => {
    const loadRideData = async () => {
      try {
        const rawData = await d3.csv(csvFile, d3.autoType);
        const stationFile = "data/metro-bike-share-stations-2024-10-01.csv";
        const stations = await d3.csv(stationFile, d3.autoType);
        const processedStations = stations.map((station) => ({
            kiosk_id: station["Kiosk ID"], 
            kiosk_name: station["Kiosk Name"],
          }));
        setRideData(rawData); 
        setTotalRides(rawData.length); 
        setStationData(processedStations);
      } catch (error) {
        console.error("Error loading CSV file:", error);
        setRideData([]);
        setTotalRides(0); 
      }
    };

    loadRideData();
  }, [csvFile]);

  return (
    <Layout style={{ height: "100vh", backgroundColor: "#f4f4f4" }}>

      <Header
        style={{
          backgroundColor: "#fff",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          display: "flex",
          justifyContent: "center", 
          alignItems: "center",
          padding: "20px 0",
        }}
      >
        <Space size="middle">
          <Title level={3} style={{ margin: 0, color: "#333" }}>
            Metro BikeShare Dashboard
          </Title>
          <Dropdown
            menu={{
              items,
              onClick: handleMenuClick,
            }}
          >
            <Button>
              <Space>
                {selectedQuarter}
                <DownOutlined />
              </Space>
            </Button>
          </Dropdown>
        </Space>
      </Header>

      <Content style={{ padding: "20px", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Row gutter={[16, 16]} style={{ width: "100%", maxWidth: "1200px", height: "90%" }}>
          <Col
            span={12}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: "bold",
              fontSize: "16px",
            }}
          >
            <HeatmapChart rideData={rideData} /> 
          </Col>

          <Col span={12} style={{ display: "flex", flexDirection: "column", gap: "10px", height: "100%" }}>

            <Row style={{ flex: 1, display: "flex" }}>
              <Col
                span={12}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontWeight: "bold",
                }}
              >
                <TotalRides totalRides={totalRides} /> 
              </Col>
              <Col
                span={12}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontWeight: "bold",
                }}
              >
                <TimeSeriesLineChart data={rideData} /> 
              </Col>
            </Row>

            <Row
              style={{
                flex: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: "bold",
              }}
            >
              <HorizontalBarChart data={rideData} />
            </Row>

            <Row
              style={{
                flex: 3,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: "bold",
              }}
            >
              <StationUsageTable rideData={rideData} stationData={stationData} />
            </Row>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default DashboardPage;
