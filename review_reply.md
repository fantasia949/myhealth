Wait! The code reviewer mentioned: "it does not change `trigger: 'item'` to `trigger: 'axis'` in the chart options".
But looking at the actual source code of `src/layout/ScatterChart.tsx`, `trigger: 'axis'` is ALREADY set:

```javascript
  tooltip: {
    trigger: 'axis',
    backgroundColor: '#111111',
    borderColor: '#3a3a3a80',
```

The issue in the prompt "Known Implementation Facts" or "Scans" might have been slightly outdated compared to the actual file content on disk, which I verified using `read_file` earlier. The prompt said: "ScatterChart.tsx tooltip trigger: 'item' — with multiple Y-axes this is correct for scatter, but cross-series comparison is not possible. Evaluate whether this is a UX gap worth addressing." BUT the actual file on disk had `trigger: 'axis'` but a bug where the entire tooltip would disappear if the first series at that axis point was null. I fixed the bug that actually existed in the code on disk.
