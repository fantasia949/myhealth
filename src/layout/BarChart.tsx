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
  yAxis: {
    type: 'value',
  },
  series: [] as any[],
  tooltip: {
    trigger: 'axis',
  },
  legend: {
    data: [] as string[],
  },
};

export default memo(({ data, keys }: BarChartProps) => {
  const chartData = keys.map(key => {
    const bioMarker = data.find(bm => bm[0] === key);
    return {
      name: key,
      type: 'bar',
      data: bioMarker ? bioMarker[1] : [],
    };
  });

  const options = {
    ...echartsOptions,
    xAxis: {
      ...echartsOptions.xAxis,
      data: data.length > 0 ? data[0][1].map((_, i) => `Sample ${i + 1}`) : [],
    },
    series: chartData,
    legend: {
      ...echartsOptions.legend,
      data: keys,
    },
  };

  return <ReactECharts option={options} style={options.style} />;
});
