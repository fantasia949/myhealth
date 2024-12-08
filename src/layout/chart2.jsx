import { memo, useRef, useEffect, useMemo } from "react";
import { ChartProvider, ChartContext } from "@echarts-readymade/core";
import { Scatter } from "@echarts-readymade/scatter";
import { labels } from "../data";

const echartsOptions = {
  style: { height: 400 },
  theme: "dark",
  opts: {
    grid: { top: 0 },
  },
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
    .filter((v) => v[1] && v[2])
    .map((v) => ({ [keys[0]]: v[1], [keys[1]]: v[2], date: v[0] }));

  // console.log(matchedData);

  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      const instance = ref.current.getEchartsInstance();
      if (instance) {
        instance.setOption({
          grid: { top: 40, bottom: 40 },
          series: [{ symbolSize: 40 }],
          dataZoom: [
            {
              show: false,
            },
            {
              show: false,
            },
          ],
        });
      }
    }
  }, [ref.current, keys]);

  return (
    <ChartProvider data={matchedData} echartsOptions={echartsOptions}>
      <Scatter
        ref={ref}
        context={ChartContext}
        valueList={valueList}
        dimension={dimension}
      />
    </ChartProvider>
  );
});
