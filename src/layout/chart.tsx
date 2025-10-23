import { memo, useRef, useEffect, useMemo } from "react";
import { ChartProvider, ChartContext } from "@echarts-readymade/core";
import { Line } from "@echarts-readymade/line";
import { labels } from "../data";
import { BioMarker } from "../atom/dataAtom";

interface ChartProps {
  data: BioMarker[];
  keys: string[];
}

const dimension = [
  {
    fieldKey: "d1",
    fieldName: "date",
  },
];

const echartsOptions: any = {
  style: { height: 400 },
  theme: "dark",
  option: {},
  opts: {
    grid: { top: 0 },
  },
};

export default memo(({ data, keys }: ChartProps) => {
  const valueList = keys.map((k, i) => ({
    fieldKey: "v" + i,
    fieldName: k,
    decimalLength: 2,
    yAxisIndex: i,
  }));

  console.log(data, keys);

  const yAxis: any[] = useMemo(
    () =>
      keys.map((k) => ({
        scale: true,
        name: k,
      })),
    [keys]
  );

  const dict = data
    .filter(([key]) => keys.includes(key))
    .reduce((result: Record<number, any>, [key, values]) => {
      values.forEach((v, i) => {
        if (!result[i]) {
          result[i] = { d1: labels[i] };
        }
        const k = valueList.find((entry) => entry.fieldName === key);
        if (k) {
          result[i][k.fieldKey] = v;
        }
      });
      return result;
    }, {});

  const chartData = Object.values(dict);

  const ref = useRef<any>(null);

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
      return () => {
        if (instance) {
          instance.destroy();
        }
      };
    }
  }, [ref.current, keys, yAxis]);

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
