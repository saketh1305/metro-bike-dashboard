import React, { useEffect, useState, useRef, useCallback } from "react";
import { Table, Input, Button, Space, Typography } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import Highlighter from "react-highlight-words";

const StationUsageTable = ({ rideData, stationData }) => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tableHeight, setTableHeight] = useState(0);
  const containerRef = useRef(null);
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);

  const { Title } = Typography;

  const processRideData = (data) => {
    const startCounts = {};
    const endCounts = {};

    data.forEach((row) => {
      const startStation = row.start_station;
      const endStation = row.end_station;

      if (startStation) {
        startCounts[startStation] = (startCounts[startStation] || 0) + 1;
      }
      if (endStation) {
        endCounts[endStation] = (endCounts[endStation] || 0) + 1;
      }
    });

    const stations = new Set([...Object.keys(startCounts), ...Object.keys(endCounts)]);
    const stationData = Array.from(stations).map((station) => ({
      station_id: station,
      start_station_count: startCounts[station] || 0,
      end_station_count: endCounts[station] || 0,
      total_usage: (startCounts[station] || 0) + (endCounts[station] || 0),
    }));

    stationData.sort((a, b) => b.total_usage - a.total_usage);

    return stationData;
  };

  const mapStationNames = useCallback(
    (data) => {
      const stationMap = stationData.reduce((acc, row) => {
        if (row.kiosk_id && row.kiosk_name) {
          acc[row.kiosk_id] = row.kiosk_name;
        }
        return acc;
      }, {});

      return data.map((row) => ({
        ...row,
        station_name: stationMap[row.station_id] || `Unknown (${row.station_id})`,
      }));
    },
    [stationData]
  );

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div
        style={{
          padding: 8,
        }}
      >
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{
            marginBottom: 8,
            display: "block",
          }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{
              width: 90,
            }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{
              width: 90,
            }}
          >
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        style={{
          color: filtered ? "#1677ff" : undefined,
        }}
      />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{
            backgroundColor: "#ffc069",
            padding: 0,
          }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });

  useEffect(() => {
    if (rideData && stationData) {
      setLoading(true);
      const processedData = processRideData(rideData);
      const mappedData = mapStationNames(processedData);
      setTableData(mappedData);
      setLoading(false);
    }
  }, [rideData, stationData, mapStationNames]);

  useEffect(() => {
    const updateTableHeight = () => {
      if (containerRef.current) {
        const containerHeight = containerRef.current.clientHeight;
        setTableHeight(containerHeight - 40);
      }
    };

    updateTableHeight();
    window.addEventListener("resize", updateTableHeight);

    return () => {
      window.removeEventListener("resize", updateTableHeight);
    };
  }, []);

  const columns = [
    {
      title: "Station Name",
      dataIndex: "station_name",
      key: "station_name",
      ...getColumnSearchProps("station_name"),
    },
    {
      title: "Start Station Count",
      dataIndex: "start_station_count",
      key: "start_station_count",
      sorter: (a, b) => a.start_station_count - b.start_station_count,
    },
    {
      title: "End Station Count",
      dataIndex: "end_station_count",
      key: "end_station_count",
      sorter: (a, b) => a.end_station_count - b.end_station_count,
    },
    {
      title: "Total Usage",
      dataIndex: "total_usage",
      key: "total_usage",
      sorter: (a, b) => a.total_usage - b.total_usage,
    },
  ];

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%", overflow: "hidden" }}
    >
      <Title
        level={5}
        style={{
          textAlign: "center",
          color: "gray",
          marginBottom: 16,
        }}
      >
        Popular Station
      </Title>
      <Table
        columns={columns}
        dataSource={tableData}
        rowKey="station_id"
        loading={loading}
        scroll={{ y: tableHeight - 60 }}
        pagination={false}
        style={{ height: "100%" }}
      />
    </div>
  );
};

export default StationUsageTable;
