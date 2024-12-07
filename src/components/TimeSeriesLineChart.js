import React, { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";

const TimeSeriesLineChart = ({ data }) => {
  const chartRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const drawChart = useCallback(
    (width, height) => {
      d3.select(chartRef.current).select("svg").remove();
      d3.select("#tooltip-line").remove();

      const margin = { top: 10, right: 10, bottom: 20, left: 50 };
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
        .attr("id", "tooltip-line")
        .style("position", "absolute")
        .style("background-color", "rgba(0, 0, 0, 0.7)")
        .style("color", "white")
        .style("padding", "10px")
        .style("border-radius", "5px")
        .style("pointer-events", "none")
        .style("font-size", "12px")
        .style("opacity", 0);

      const parsedData = d3
        .rollups(
          data,
          (v) => v.length,
          (d) => {
            const date = new Date(d.start_time);
            return isNaN(date) ? null : d3.timeFormat("%Y-%m-%d")(date);
          }
        )
        .filter(([key]) => key !== null)
        .map(([key, value]) => ({ date: new Date(key), total: value }));

      if (parsedData.length === 0) {
        svg
          .append("text")
          .attr("x", chartWidth / 2)
          .attr("y", chartHeight / 2)
          .attr("text-anchor", "middle")
          .style("font-size", "16px")
          .text("No data available");
        return;
      }

      const x = d3
        .scaleTime()
        .domain(d3.extent(parsedData, (d) => d.date))
        .range([0, chartWidth]);

      const y = d3
        .scaleLinear()
        .domain([0, d3.max(parsedData, (d) => d.total)])
        .nice()
        .range([chartHeight, 0]);

      svg
        .append("g")
        .attr("transform", `translate(0,${chartHeight})`)
        .call(d3.axisBottom(x).ticks(4).tickFormat(d3.timeFormat("%b %d")))
        .selectAll("text")
        .attr("color", "black");

      svg
        .append("g")
        .call(d3.axisLeft(y).ticks(5))
        .selectAll("text")
        .attr("color", "black");

      svg.selectAll(".domain").attr("stroke", "black");
      svg.selectAll(".tick line").attr("stroke", "black");

      const line = d3
        .line()
        .x((d) => x(d.date))
        .y((d) => y(d.total));

      svg
        .append("path")
        .datum(parsedData)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", line);

      svg
        .append("rect")
        .attr("width", chartWidth)
        .attr("height", chartHeight)
        .attr("fill", "transparent")
        .on("mousemove", (event) => {
          const [mouseX] = d3.pointer(event);
          const hoverDate = x.invert(mouseX);

          const closestData = parsedData.reduce((prev, curr) =>
            Math.abs(curr.date - hoverDate) < Math.abs(prev.date - hoverDate)
              ? curr
              : prev
          );

          tooltip
            .style("opacity", 1)
            .html(
              `<strong>Date:</strong> ${d3.timeFormat("%Y-%m-%d")(
                closestData.date
              )}<br/>
               <strong>Rides:</strong> ${closestData.total}`
            )
            .style("left", `${event.pageX + 10}px`)
            .style("top", `${event.pageY - 20}px`);
        })
        .on("mouseout", () => {
          tooltip.style("opacity", 0);
        });
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

export default TimeSeriesLineChart;
