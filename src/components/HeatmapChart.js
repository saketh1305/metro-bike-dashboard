import React, { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";

const HeatmapChart = ({ rideData }) => {
  const chartRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const drawChart = useCallback(
    (width, height) => {
      d3.select(chartRef.current).select("svg").remove();
      d3.select("#tooltip-heatmap").remove();

      const margin = { top: 70, right: 30, bottom: 50, left: 60 };
      const chartWidth = width - margin.left - margin.right;
      const chartHeight = height - margin.top - margin.bottom;

      const svg = d3
        .select(chartRef.current)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      d3.select(chartRef.current)
        .select("svg")
        .append("text")
        .attr("x", width / 2)
        .attr("y", margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("fill", "gray")
        .text("Rides per Hour and Weekday");
      
      const tooltip = d3
        .select("body")
        .append("div")
        .attr("id", "tooltip-heatmap")
        .style("position", "absolute")
        .style("background-color", "rgba(0, 0, 0, 0.7)")
        .style("color", "white")
        .style("padding", "10px")
        .style("border-radius", "5px")
        .style("pointer-events", "none")
        .style("font-size", "12px")
        .style("opacity", 0);

      const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

      const processedData = d3.rollups(
        rideData,
        (v) => v.length,
        (d) => {
          const date = new Date(d.start_time);
          return `${days[date.getDay()]}-${date.getHours()}`;
        }
      );

      const heatmapData = processedData.map(([key, count]) => {
        const [day, hour] = key.split("-");
        return { day, hour: `${hour}:00`, count };
      });

      const x = d3
        .scaleBand()
        .domain(days)
        .range([0, chartWidth])
        .padding(0.1);

      const y = d3
        .scaleBand()
        .domain(hours)
        .range([0, chartHeight])
        .padding(0.1);

      const color = d3
        .scaleSequential(d3.interpolateBlues)
        .domain([0, d3.max(heatmapData, (d) => d.count)]);

      const radiusScale = d3
        .scaleSqrt()
        .domain([0, d3.max(heatmapData, (d) => d.count)])
        .range([0, Math.min(x.bandwidth(), y.bandwidth()) / 2]);

      svg
        .append("g")
        .call(d3.axisTop(x).tickSize(0))
        .selectAll("text")
        .attr("fill", "black");

      svg
        .append("g")
        .call(d3.axisLeft(y).tickSize(0))
        .selectAll("text")
        .attr("fill", "black");

      svg.selectAll(".domain").attr("stroke", "black");
      svg.selectAll(".tick line").attr("stroke", "black");

      svg
        .selectAll("circle")
        .data(heatmapData)
        .join("circle")
        .attr("cx", (d) => x(d.day) + x.bandwidth() / 2)
        .attr("cy", (d) => y(d.hour) + y.bandwidth() / 2)
        .attr("r", (d) => radiusScale(d.count))
        .style("fill", (d) => color(d.count))
        .style("stroke", "black")
        .style("stroke-width", 0.5)
        .on("mousemove", (event, d) => {
          tooltip
            .style("opacity", 1)
            .html(
              `<strong>Day:</strong> ${d.day}<br/>
               <strong>Hour:</strong> ${d.hour}<br/>
               <strong>Rides:</strong> ${d.count}`
            )
            .style("left", `${event.pageX + 10}px`)
            .style("top", `${event.pageY - 30}px`);
        })
        .on("mouseout", () => {
          tooltip.style("opacity", 0);
        });
    },
    [rideData]
  );

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      if (entries[0]) {
        const { width, height } = entries[0].contentRect;
        setDimensions({ width, height });
      }
    });

    if (chartRef.current) {
      resizeObserver.observe(chartRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (dimensions.width && dimensions.height) {
      drawChart(dimensions.width, dimensions.height);
    }
  }, [dimensions, drawChart]);

  return (
    <div
      ref={chartRef}
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
      }}
    />
  );
};

export default HeatmapChart;
