import { memo, useRef, useEffect, useMemo } from "react";
import { ChartProvider, ChartContext } from "@echarts-readymade/core";
import { Scatter } from "@echarts-readymade/scatter";
import { regression, transform } from "echarts-stat";
import { labels } from "../data";
import ReactECharts from "echarts-for-react";
import { registerTransform } from "echarts";

registerTransform(transform.regression);

const echartsOptions = {
  style: { height: 400 },
  theme: "dark",
  color: [
    "#FF7C7C",
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
    },
    {
      type: "line",
      symbol: "circle",
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

export default memo(({ data, keys }) => {
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
      .reduce((result, [key, values], i) => {
        values.forEach((v, i) => {
          if (!result[i]) {
            result[i] = [labels[i].slice(0, -2)];
          }
          result[i].push(v);
        });
        return result;
      }, [])
      .filter((v) => v[1] && v[2]);

    const excludedDate = matchedData.map((v) => [+v[2], +v[1]]);

    const scatterData = matchedData.map((v, i) => ({
      [keys[0]]: v[1],
      [keys[1]]: v[2],
      date: v[0],
    }));

    return [scatterData, excludedDate];
  }, [keys, data]);

  const scatterRef = useRef(null);

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
  }, [scatterRef.current, keys]);

  const options = useMemo(() => {
    let { series, yAxis, xAxis } = echartsOptions;
    xAxis[0].name = keys[0];
    yAxis[0].name = keys[1];

    const scatterData = scatterData2.map((v) => [v[1], v[0]]);
    series[1].datasetIndex = 1;

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
          ...echartsOptions.dataZoom[0],
          startValue: Math.min(...scatterData.map((item) => item[0])),
          endValue: Math.max(...scatterData.map((item) => item[0])),
        },
        {
          ...echartsOptions.dataZoom[1],
          startValue: Math.min(...scatterData.map((item) => item[1])),
          endValue: Math.max(...scatterData.map((item) => item[1])),
        },
      ],
    };
  }, [echartsOptions, scatterData2]);

  // console.log("ch2", options.series[0].data, options.series[1].data);

  return (
    <ChartProvider data={scatterData} echartsOptions={options}>
      <ReactECharts option={options} />
      <Scatter
        ref={scatterRef}
        context={ChartContext}
        valueList={valueList}
        dimension={dimension}
      />
    </ChartProvider>
  );
});
