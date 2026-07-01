const fs = require('fs')
const path = require('path')

const file = path.join(__dirname, 'src/layout/Correlation.tsx')
let content = fs.readFileSync(file, 'utf8')

// Add imports
if (!content.includes('import DirectionalCorrelationScatter')) {
  content = content.replace(
    "import KeystoneCentralityScatter from './KeystoneCentralityScatter'",
    "import KeystoneCentralityScatter from './KeystoneCentralityScatter'\nimport DirectionalCorrelationScatter from './DirectionalCorrelationScatter'"
  )
}

// Add tab state type
if (content.includes("React.useState<'chart' | 'significance' | 'table' | 'prioritization'>('chart')")) {
  content = content.replace(
    "React.useState<'chart' | 'significance' | 'table' | 'prioritization'>('chart')",
    "React.useState<'chart' | 'significance' | 'table' | 'prioritization' | 'directional'>('chart')"
  )
}

// Update the onChange for alternative
const oldSelect = `onChange={(e) =>
                                setAlternative(e.target.value as 'two-sided' | 'less' | 'greater')
                              }`
const newSelect = `onChange={(e) => {
                                const newAlternative = e.target.value as 'two-sided' | 'less' | 'greater';
                                setAlternative(newAlternative);
                                if (newAlternative !== 'two-sided' && activeTab === 'chart') {
                                  setActiveTab('directional');
                                } else if (newAlternative === 'two-sided' && activeTab === 'directional') {
                                  setActiveTab('chart');
                                }
                              }}`

if (content.includes(oldSelect)) {
  content = content.replace(oldSelect, newSelect)
}


// Add button to tab list
const directionalButton = `
                        {alternative !== 'two-sided' && (
                          <button
                            type="button"
                            aria-pressed={activeTab === 'directional'}
                            className={\`w-full rounded-lg py-2.5 text-sm font-medium leading-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors \${
                              activeTab === 'directional'
                                ? 'bg-blue-600/80 text-white shadow'
                                : 'text-gray-400 hover:bg-white/10 hover:text-white'
                            }\`}
                            onClick={() => setActiveTab('directional')}
                          >
                            Directional Profile
                          </button>
                        )}`

if (!content.includes('Directional Profile')) {
  content = content.replace(
    "Table View\n                        </button>",
    "Table View\n                        </button>" + directionalButton
  )
}

// Add component render
const directionalRender = `
                      {activeTab === 'directional' && alternative !== 'two-sided' && significantEntries.length > 0 && (
                        <div className="mb-8">
                          <DirectionalCorrelationScatter
                            target={target!}
                            correlations={significantEntries.map(e => [e[0], e[2], e[3]])}
                            alternative={alternative}
                          />
                        </div>
                      )}
`
if (!content.includes('<DirectionalCorrelationScatter')) {
  content = content.replace(
    "{activeTab === 'chart' && significantEntries.length > 0 && (",
    directionalRender + "\n                      {activeTab === 'chart' && significantEntries.length > 0 && ("
  )
}

fs.writeFileSync(file, content)
