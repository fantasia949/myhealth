const fs = require('fs')
const path = require('path')

const file = path.join(__dirname, 'src/layout/DirectionalCorrelationScatter.tsx')
let code = fs.readFileSync(file, 'utf8')

// Fix short circuiting
code = code.replace(
  `// Optimization: Replace Array.some() with a classic loop for faster O(N) evaluation\n      let isValid = false\n      for (let i = 0; i < sortedCorrelations.length; i++) {\n        if (sortedCorrelations[i][0] === selectedBiomarker) {\n          isValid = true\n          break\n        }\n      }\n      if (selectedBiomarker && isValid) {`,
  `// Optimization: Replace Array.some() with a classic loop for faster O(N) evaluation\n      let isValid = false\n      if (selectedBiomarker) {\n        for (let i = 0; i < sortedCorrelations.length; i++) {\n          if (sortedCorrelations[i][0] === selectedBiomarker) {\n            isValid = true\n            break\n          }\n        }\n      }\n      if (selectedBiomarker && isValid) {`
)

fs.writeFileSync(file, code)
