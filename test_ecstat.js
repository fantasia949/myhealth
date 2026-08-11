const ecStat = require('echarts-stat');
const data = [
  [1, 2, "date1", "u1", "u2"],
  [2, 4, "date2", "u1", "u2"],
  [3, 6, "date3", "u1", "u2"]
];
const regRes = ecStat.regression('linear', data);
console.log(regRes);
