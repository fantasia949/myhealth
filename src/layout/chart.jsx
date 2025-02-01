import { memo, useRef, useEffect, useMemo } from "react";
import { ChartProvider, ChartContext } from "@echarts-readymade/core";
import { Line } from "@echarts-readymade/line";
import { labels } from "../data";

const dimension = [
  {
    fieldKey: "d1",
    fieldName: "date",
  },
];

const echartsOptions = {
  style: { height: 400 },
  theme: "dark",
  opts: {
    grid: { top: 0 },
  },
};

export default memo(({ data, keys }) => {
  const valueList = keys.map((k, i) => ({
    fieldKey: "v" + i,
    fieldName: k,
    decimalLength: 2,
    yAxisIndex: i,
  }));

  console.log(data, keys);

  const yAxis = useMemo(
    () =>
      keys.map((k) => ({
        scale: true,
        name: k,
      })),
    [keys]
  );

  const dict = data
    .filter(([key]) => keys.includes(key))
    .reduce((result, [key, values]) => {
      values.forEach((v, i) => {
        if (!result[i]) {
          result[i] = { d1: labels[i] };
        }
        const k = valueList.find((entry) => entry.fieldName === key);
        result[i][k.fieldKey] = v;
      });
      return result;
    }, {});

  const chartData = Object.values(dict);

  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      const instance = ref.current.getEchartsInstance();
      if (instance) {
        instance.setOption({
          yAxis,
          grid: { top: 40, bottom: 20 },
          series: [
            {
              type: "line",
              connectNulls: true,
            },
          ],
        });
      }
    }
    return () => instance.destroy();
  }, [ref.current, keys]);

  return (
    <ChartProvider data={chartData} echartsOptions={echartsOptions}>
      <Line
        ref={ref}
        // Note: here you need pass context down
        context={ChartContext}
        dimension={dimension}
        valueList={valueList}
      />
    </ChartProvider>
  );
});
