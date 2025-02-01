import React from "react";
import pcorrtest from "@stdlib/stats-pcorrtest";

export default React.memo(({ comparedSourceTarget }) => {
  const text = React.useMemo(() => {
    if (!Array.isArray(comparedSourceTarget)) {
      return;
    }
    const [source, target] = comparedSourceTarget;
    const sourceValues = source[1].map((v) => (v ? +v : 0));
    const targetValues = target[1].map((v) => (v ? +v : 0));
    const result = pcorrtest(sourceValues, targetValues, {
      alpha: 0.1,
      // alternative: "greater",
      // alternative: "less",
    });
    // console.log(result.print());
    return [result.print(), JSON.stringify(result, null, "\t")];
  }, [comparedSourceTarget]);
  return !!text ? (
    <div style={{ whiteSpace: "pre-wrap" }} title={text[1]}>
      <div>
        {comparedSourceTarget[0][0]}
        <span>=&gt;</span>
        {comparedSourceTarget[1][0]}
      </div>
      {text[0]}
    </div>
  ) : null;
});
