import React, { memo } from "react";
import ReactECharts from "echarts-for-react";
import { labels } from "../data";

interface LineChartProps {
  name: string;
  values: number[];
}

const echartsOptions = {
  style: { height: 300, width: "100%" },
  theme: "dark",
  backgroundColor: "transparent",
  tooltip: {
    trigger: "axis",
  },
  grid: {
    left: "3%",
    right: "4%",
    bottom: "3%",
    containLabel: true,
  },
  xAxis: {
    type: "time",
    boundaryGap: false,
  },
  yAxis: {
    type: "value",
    scale: true, // This makes the axis adjust to the data range
  },
};

const formatTime = (label: string) => {
  if (!label || label.length < 6) return label;
  return `20${label.slice(0, 2)}/${label.slice(2, 4)}/${label.slice(4, 6)}`;
};

export default memo(({ name, values }: LineChartProps) => {
  // Filter out null/undefined values and pair them with labels
  const data = values.map((value, index) => {
      return [formatTime(labels[index]), value];
  }).filter(item => item[1] !== null && item[1] !== undefined);

  const options = {
    ...echartsOptions,
    title: {
      text: name,
      left: 'center',
      textStyle: {
        color: '#ccc'
      }
    },
    series: [
      {
        name: name,
        type: "line",
        data: data,
        smooth: true, // Make the line smooth
        symbol: 'circle',
        symbolSize: 6,
      },
    ],
  };

  return <ReactECharts option={options} style={echartsOptions.style} />;
});
