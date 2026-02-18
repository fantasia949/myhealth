import React from "react";
import { useAtom, useAtomValue, atom } from "jotai";
import { dataAtom, correlationAlphaAtom, correlationAlternativeAtom } from "../atom/dataAtom";
import { calculateSpearman } from "../processors/stats";

interface CorrelationProps {
  target: string | null;
}

const nonInferredDataAtom = atom((get) => {
  const data = get(dataAtom);
  return data.filter((item) => !item[3]?.inferred);
});

export default React.memo(({ target }: CorrelationProps) => {
  const data = useAtomValue(nonInferredDataAtom);
  const [alpha, setAlpha] = useAtom(correlationAlphaAtom);
  const [alternative, setAlternative] = useAtom(correlationAlternativeAtom);

  const entries = React.useMemo(() => {
    if (!Array.isArray(data) || !target) {
      return;
    }
    const source = data.find((item) => item[0] === target);
    if (!source) {
      return;
    }
    const sourceValues = source[1].map((v) => (v ? +v : 0));
    const entries: [string, number, number, number][] = [];

    for (const item of data) {
      if (item[0] === target) {
        continue;
      }
      const targetValues = item[1].map((v) => (v ? +v : 0));
      const result = calculateSpearman(sourceValues, targetValues, {
        alpha: alpha,
        alternative: alternative,
      });
      if (result.pValue <= alpha) {
        entries.push([item[0], result.statistic, result.pValue, result.pcorr]);
      }
    }
    entries.sort((a, b) => a[2] - b[2]);

    return entries;
  }, [data, target, alpha, alternative]);

  if (!target) return null;

  return (
    <div style={{ width: 300 }} className="mx-auto text-dark-text mb-8">
      <div className="font-bold mb-2 text-center">{target}</div>

      <div className="mb-4 p-3 border border-gray-700 rounded bg-[#222222]">
        <div className="text-xs font-bold mb-2 text-gray-400 uppercase tracking-wider">Spearman Correlation Settings</div>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <label htmlFor="corr-alpha" className="text-xs text-gray-300">Alpha Threshold:</label>
            <input
              id="corr-alpha"
              type="number"
              step="0.001"
              min="0.0001"
              max="1"
              value={alpha}
              onChange={(e) => setAlpha(Number(e.target.value))}
              className="w-24 px-2 py-1 bg-dark-bg border border-gray-600 rounded text-xs text-right focus:border-blue-500 outline-none transition-colors"
            />
          </div>
          <div className="flex justify-between items-center">
            <label htmlFor="corr-alt" className="text-xs text-gray-300">Hypothesis:</label>
            <select
              id="corr-alt"
              value={alternative}
              onChange={(e) => setAlternative(e.target.value as any)}
              className="w-24 px-2 py-1 bg-dark-bg border border-gray-600 rounded text-xs focus:border-blue-500 outline-none transition-colors"
            >
              <option value="two-sided">Two-sided</option>
              <option value="less">Less</option>
              <option value="greater">Greater</option>
            </select>
          </div>
        </div>
      </div>

      <div className="text-xs text-gray-500 mb-2 flex justify-between px-1">
        <span>Biomarker</span>
        <div className="flex gap-4">
          <span>P-Value</span>
          <span>Coeff</span>
        </div>
      </div>

      {entries && entries.length > 0 ? (
        entries.map((entry) => (
          <div
            key={entry[0]}
            className="flex justify-between items-center border-b border-gray-800 py-1.5 hover:bg-white/5 px-1 transition-colors"
          >
            <span className="text-sm truncate pr-2" style={{ flex: 1 }} title={entry[0]}>{entry[0]}</span>
            <div className="flex gap-4 font-mono text-xs">
              <span className={entry[2] < 0.001 ? "text-green-400" : "text-gray-300"}>{entry[2].toFixed(6)}</span>
              <span className={Math.abs(entry[3]) > 0.7 ? "text-blue-400 font-bold" : "text-gray-400"}>{entry[3].toFixed(4)}</span>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center text-gray-500 text-sm py-8 border border-dashed border-gray-700 rounded bg-white/5">
          No correlations found.<br/>
          <span className="text-xs mt-1 block">Try adjusting the Alpha threshold.</span>
        </div>
      )}
    </div>
  );
});
