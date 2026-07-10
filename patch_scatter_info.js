const fs = require('fs')
const path = require('path')

const file = path.join(__dirname, 'src/layout/DirectionalCorrelationScatter.tsx')
let content = fs.readFileSync(file, 'utf8')

// Add InformationCircleIcon import if it doesn't exist
if (!content.includes('InformationCircleIcon')) {
  content = content.replace(
    "import React, { useMemo, useState } from 'react'",
    "import React, { useMemo, useState } from 'react'\nimport { InformationCircleIcon } from '@heroicons/react/24/outline'"
  )
}

// Replace the title section with title + icon + tooltip
const oldTitle = `<h3 className="text-sm font-medium text-gray-200">
            Directional Profile:{' '}
            <span className="text-gray-400 font-normal">
              Analyzing boundaries for {alternative} hypothesis
            </span>
          </h3>`

const newTitle = `<div className="flex items-center space-x-2 relative group">
            <h3 className="text-sm font-medium text-gray-200">
              Directional Profile:{' '}
              <span className="text-gray-400 font-normal">
                Analyzing boundaries for {alternative} hypothesis
              </span>
            </h3>
            <InformationCircleIcon className="h-4 w-4 text-gray-400 cursor-help hover:text-gray-200 transition-colors" />
            <div className="absolute left-0 top-6 z-10 w-72 rounded-md bg-gray-800 p-3 text-xs text-gray-300 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-gray-700 pointer-events-none">
              This chart visualizes asymmetric and boundary-conditional relationships. The X-axis represents the Target Biomarker and the Y-axis is the Selected Correlated Biomarker.
              <br/><br/>
              Average reference lines divide the data into quadrants, helping identify if a biomarker only affects another when crossing a specific threshold (e.g. only when above average).
            </div>
          </div>`

if (content.includes(oldTitle)) {
  content = content.replace(oldTitle, newTitle)
} else {
  console.log("Could not find the title section to replace.")
}

fs.writeFileSync(file, content)
