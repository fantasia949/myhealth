import { memo, useRef, useEffect, useMemo } from "react";
import { ChartProvider, ChartContext } from "@echarts-readymade/core";
import { Scatter } from "@echarts-readymade/scatter";
import { labels } from "../data";
import ReactECharts from "echarts-for-react";
import { BioMarker } from "../atom/dataAtom";

interface ChartProps {
  data: BioMarker[];
  keys: string[];
}

const echartsOptions: any = {
  style: { height: 400, maxWidth: 800 },
  theme: "dark",
  backgroundColor: 'transparent',
  color: [
    "#c23531",
    "#ADD4EF",
    "#BFDAA7",
    "#FCAC65",
    "#C6C1D2",
    "#7598E4",
    "#CF6D6C",
    "#4979CF",
    "#E1934B",
    "#829649",
    "#7D70AC",
    "#2559B7",
  ],
  colorBy: "series",
  xAxis: [
    {
      type: "value",
      show: true,
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { show: false },
    },
  ],
  yAxis: [
    {
      show: true,
      type: "value",
      splitLine: { lineStyle: { color: "#E7EAEF", type: "dashed", width: 1 } },
    },
    {
      show: false,
      type: "value",
      name: "",
    },
  ],
  tooltip: {
    triggerOn: "mousemove",
  },
  grid: {
    top: 40,
    bottom: 40,
  },
  dataZoom: [
    {
      type: "slider",
      show: false,
      xAxisIndex: [0],
      bottom: 30,
    },
    {
      type: "slider",
      show: false,
      yAxisIndex: [0],
      right: 30,
    },
  ],
  series: [
    {
      type: "scatter",
      symbolSize: 24,
      legendHoverLink: true,
      large: false,
      zIndex: 2,
    },
    {
      type: "line",
      symbol: "circle",
      zIndex: -1,
      showSymbol: false,
      lineStyle: {
        color: "#5470C688",
        width: 64,
      },
      legendHoverLink: true,
      markPoint: {
        itemStyle: {
          normal: {
            color: "transparent",
          },
        },
        label: {
          normal: {
            show: true,
            textStyle: {
              color: "#333",
              fontSize: 14,
            },
          },
        },
      },
    },
  ],
};

export default memo(({ data, keys }: ChartProps) => {
  const valueList = [
    { fieldKey: keys[0], fieldName: keys[0], decimalLength: 2 },
    { fieldKey: keys[1], fieldName: keys[1], decimalLength: 2 },
  ];

  const dimension = [
    {
      fieldKey: "date",
      fieldName: "Date",
    },
    {
      fieldKey: keys[0],
      fieldName: keys[0],
    },
    {
      fieldKey: keys[1],
      fieldName: keys[1],
    },
  ];

  const [scatterData, scatterData2] = useMemo(() => {
    const matchedData = keys
      .map((key) => {
        return data.find(([k]) => key === k);
      })
      .reduce((result: any[][], entry) => {
        if (entry) {
          const [key, values] = entry;
          values.forEach((v, i) => {
            if (!result[i]) {
              result[i] = [labels[i].slice(0, -2)];
            }
            result[i].push(v);
          });
        }
        return result;
      }, [])
      .filter((v) => v[1] && v[2]);

    const excludedDate: number[][] = matchedData.map((v) => [+v[2], +v[1]]);

    const scatterData: Record<string, any>[] = matchedData.map((v) => ({
      [keys[0]]: v[1],
      [keys[1]]: v[2],
      date: v[0],
    }));

    return [scatterData, excludedDate];
  }, [keys, data]);

  const scatterRef = useRef<any>(null);

  const options: any = useMemo(() => {
    let { series, yAxis, xAxis } = echartsOptions;
    (xAxis as any[])[0].name = keys[0];
    (yAxis as any[])[0].name = keys[1];

    const scatterData = scatterData2.map((v) => [v[1], v[0]]);
    (series as any[])[1].datasetIndex = 1;

    const dataset = [
      { source: scatterData },
      {
        transform: {
          type: "ecStat:regression",
          // 'linear' by default.
          // config: { method: 'linear', formulaOn: 'end'}
        },
      },
    ];

    return {
      ...echartsOptions,
      dataset,
      series,
      dataZoom: [
        {
          ...(echartsOptions.dataZoom as any[])[0],
          startValue: Math.min(...scatterData.map((item) => item[0])),
          endValue: Math.max(...scatterData.map((item) => item[0])),
        },
        {
          ...(echartsOptions.dataZoom as any[])[1],
          startValue: Math.min(...scatterData.map((item) => item[1])),
          endValue: Math.max(...scatterData.map((item) => item[1])),
        },
      ],
    };
  }, [scatterData2, keys]);

  useEffect(() => {
    if (scatterRef.current) {
      const instance = scatterRef.current.getEchartsInstance();
      if (instance) {
        instance.setOption(
          {
            grid: options.grid,
            series: [{ symbolSize: 40 }],
            dataZoom: options.dataZoom,
          }
          // { notMerge: true }
        );
        // console.log("ch1", instance.getOption());
      }
    }
  }, [scatterRef.current, keys, options]);

  // console.log("ch2", options.series[0].data, options.series[1].data);

  return (
    <div>
      <ChartProvider data={scatterData} echartsOptions={options}>
        <ReactECharts option={options} style={options.style} />
        <Scatter
          ref={scatterRef}
          context={ChartContext}
          valueList={valueList}
          dimension={dimension}
        />
      </ChartProvider>
    </div>
  );
});
