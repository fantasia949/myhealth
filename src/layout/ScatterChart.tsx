import { memo } from "react";
import ReactECharts from "echarts-for-react";
import { BioMarker } from "../atom/dataAtom";
import { labels } from "../data";

interface ScatterChartProps {
  data: BioMarker[];
  keys: string[];
}

const echartsOptions = {
  style: { height: 400 },
  theme: "dark",
  backgroundColor: 'transparent',
  xAxis: {
    type: 'time',
  },
  yAxis: [] as any[],
  series: [] as any[],
  tooltip: {
    trigger: 'item',
  },
  legend: {
    data: [] as string[],
  },
  grid: {
    right: 40,
  }
};

export default memo(({ data, keys }: ScatterChartProps) => {
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
    min: 'dataMin',
  }));

  const formatTime = (label: string) => {
    return `${label.slice(0, 4)}-${label.slice(4, 6)}-${label.slice(6, 8)}`;
  };

  const chartData = keys.map((key, index) => {
    const bioMarker = data.find(bm => bm[0] === key);
    return {
      name: key,
      type: 'scatter',
      yAxisIndex: index,
      data: bioMarker ? bioMarker[1].map((value, i) => [formatTime(labels[i]), value]) : [],
    };
  });

  const options = {
    ...echartsOptions,
    xAxis: {
      ...echartsOptions.xAxis,
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
