import { aggregatedData } from './src/data/aggregated'
import { loadData } from './src/processors/loader'

const data = loadData()
const glucose = data.find(d => d[0] === 'Glucose')
console.log(glucose[3].originValues)
