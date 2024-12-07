import React, { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";

const HorizontalBarChart = ({ data }) => {
  const chartRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  console.log("Data:", data);
  const drawChart = useCallback(
    (width, height) => {

      d3.select(chartRef.current).select("svg").remove();
      d3.select("#tooltip-bar").remove();

      const margin = { top: 40, right: 50, bottom: 20, left: 100 };
      const chartWidth = width - margin.left - margin.right;
      const chartHeight = height - margin.top - margin.bottom;

      const svg = d3
        .select(chartRef.current)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

        const tooltip = d3
        .select("body")
        .append("div")
        .attr("id", "tooltip-bar")
        .style("position", "absolute")
        .style("background-color", "rgba(0, 0, 0, 0.7)")
        .style("color", "white")
        .style("padding", "10px")
        .style("border-radius", "5px")
        .style("pointer-events", "none")
        .style("font-size", "12px")
        .style("opacity", 0);

      // Group by Passholder Type and count occurrences
      const groupedData = d3.rollups(
        data,
        (v) => v.length,
        (d) => d.passholder_type
      );

      // Convert grouped data to an array of objects and sort by count descending
      const sortedData = groupedData
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count);

      const maxData = sortedData[0]; 

      const x = d3
        .scaleLinear()
        .domain([0, d3.max(sortedData, (d) => d.count)])
        .range([0, chartWidth]);

      const y = d3
        .scaleBand()
        .domain(sortedData.map((d) => d.type))
        .range([0, chartHeight])
        .padding(0.1);

      // Add X Axis
      svg
        .append("g")
        .attr("transform", `translate(0,${chartHeight})`)
        .call(d3.axisBottom(x).ticks(5))
        .selectAll("text")
        .attr("color", "black");

      // Add Y Axis
      svg
        .append("g")
        .call(d3.axisLeft(y))
        .selectAll("text")
        .attr("color", "black");

      // Add bars with rounded corners
      svg
        .selectAll(".bar")
        .data(sortedData)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("y", (d) => y(d.type))
        .attr("x", 0)
        .attr("height", y.bandwidth())
        .attr("width", (d) => x(d.count))
        .attr("rx", y.bandwidth() * 0.2) 
        .attr("ry", y.bandwidth() * 0.2)
        .attr("fill", (d) => (d === maxData ? "#ff9800" : "#2196f3")) // orange
        .on("mousemove", (event, d) => {
          tooltip
            .style("opacity", 1)
            .html(
              `<strong>Type:</strong> ${d.type}<br/>
               <strong>Rides:</strong> ${d.count}`
            )
            .style("left", `${event.pageX + 10}px`)
            .style("top", `${event.pageY - 20}px`);
        })
        .on("mouseout", () => {
          tooltip.style("opacity", 0);
        });

      // Add bar labels
      svg
        .selectAll(".bar-label")
        .data(sortedData)
        .enter()
        .append("text")
        .attr("class", "bar-label")
        .attr("x", (d) => x(d.count) + 5)
        .attr("y", (d) => y(d.type) + y.bandwidth() / 2)
        .attr("dy", "0.35em")
        .style("fill", (d) => (d === maxData ? "#ff9800" : "black")) // orange
        .text((d) => d.count);

      // Add chart title
      svg
      .append("text")
      .attr("x", chartWidth / 2)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("fill", "gray") 
      .text("Rides per Passholder Type");
    },
    [data]
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

export default HorizontalBarChart;
