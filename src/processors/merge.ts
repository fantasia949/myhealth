export default (inputs: Array<RawEntry>): Entry[] =>
    inputs.reduce((result: Entry[], info, index) => {
        info.entries.forEach(([name, value, unit, extra]) => {
            const matchedEntry = result.find(entry => entry[0] === name)
            if (matchedEntry) {
                matchedEntry[1][index] = value
            } else {
                const values = Array.from<string>({ length: inputs.length })
                values[index] = value
                result.push([name, values, unit as string, extra])
            }
        })
        return result
    }, [])
