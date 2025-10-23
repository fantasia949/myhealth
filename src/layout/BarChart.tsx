import { memo } from "react";
import ReactECharts from "echarts-for-react";
import { BioMarker } from "../atom/dataAtom";

interface BarChartProps {
  data: BioMarker[];
  keys: string[];
}

const echartsOptions = {
  style: { height: 400 },
  theme: "dark",
  backgroundColor: 'transparent',
  xAxis: {
    type: 'category',
    data: [] as string[],
  },
  yAxis: [] as any[],
  series: [] as any[],
  tooltip: {
    trigger: 'axis',
  },
  legend: {
    data: [] as string[],
  },
  grid: {
    right: 40,
  }
};

export default memo(({ data, keys }: BarChartProps) => {
  const yAxes = keys.map((key, index) => ({
    type: 'value',
    name: key,
    position: 'left',
    offset: index * 80,
    axisLine: {
      show: true,
    },
    axisLabel: {
      formatter: '{value}',
    },
  }));

  const chartData = keys.map((key, index) => {
    const bioMarker = data.find(bm => bm[0] === key);
    return {
      name: key,
      type: 'bar',
      yAxisIndex: index,
      data: bioMarker ? bioMarker[1] : [],
    };
  });

  const options = {
    ...echartsOptions,
    xAxis: {
      ...echartsOptions.xAxis,
      data: data.length > 0 ? data[0][1].map((_, i) => `Sample ${i + 1}`) : [],
    },
    yAxis: yAxes,
    series: chartData,
    legend: {
      ...echartsOptions.legend,
      data: keys,
    },
    grid: {
      right: keys.length * 60
    }
  };

  return <ReactECharts option={options} style={options.style} />;
});
