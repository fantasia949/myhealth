import React from "react";
import pcorrtest from "@stdlib/stats-pcorrtest";
import { atom, useAtomValue } from "jotai";
import { dataAtom } from "../atom/dataAtom";

const nonInferredDataAtom = atom((get) => {
  const data = get(dataAtom);
  return data.filter((item) => !item[3]?.inferred);
});

const MAX_P_VALUE = 0.1;

export default React.memo(({ target }) => {
  const data = useAtomValue(nonInferredDataAtom);

  const entries = React.useMemo(() => {
    if (!Array.isArray(data) || !target) {
      return;
    }
    const source = data.find((item) => item[0] === target);

    const sourceValues = source[1].map((v) => (v ? +v : 0));
    const entries = [];

    for (const item of data) {
      if (item[0] === target) {
        continue;
      }
      const targetValues = item[1].map((v) => (v ? +v : 0));
      const result = pcorrtest(sourceValues, targetValues, {
        alpha: 0.1,
        // alternative: "greater",
      });
      if (result.pValue <= MAX_P_VALUE) {
        entries.push([item[0], result.statistic, result.pValue, result.pcorr]);
      }
    }
    entries.sort((a, b) => a[2] - b[2]);

    return entries;
  }, [data, target]);
  return !!entries ? (
    <div style={{ width: 300 }} className="mx-auto">
      <div>{target}</div>
      {entries.map((entry) => (
        <div key={entry[0]} className="d-flex justify-content-between">
          <span style={{ flexBasis: 120 }}>{entry[0]}</span>
          {/* <span>{entry[1].toFixed(4)}</span> */}
          <span>{entry[2].toFixed(6)}</span>
          <span>{entry[3].toFixed(4)}</span>
        </div>
      ))}
    </div>
  ) : null;
});
