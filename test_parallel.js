const echarts = require('echarts')
// The way ECharts 6 exports features changed, we can test if the component exists in the loaded object
// Or if we can require it
try {
  require('echarts/charts').ParallelChart
  console.log('ParallelChart exists')
} catch (e) {
  console.log('Error finding parallel chart', e.message)
}
