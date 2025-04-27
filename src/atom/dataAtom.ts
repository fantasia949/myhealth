import { atom } from 'jotai'
import { unwrap, atomWithStorage } from 'jotai/utils'
import { loadData } from '../data'
import { process } from '../processors'

const sourceAtom = atom(() => loadData())

export const getDataAtom = atom(get => get(sourceAtom).then(([data]) => process(data)))

export const notesAtom = atom(get => get(sourceAtom).then(([_, notes]) => notes))

export const dataAtom = atom(get => get(unwrap(getDataAtom, [])))

export const filterTextAtom = atom('')
export const tagAtom = atom(null)

export const visibleDataAtom = atom(get => {
    let data = get(dataAtom)
    const filterText = get(filterTextAtom)
    const tag = get(tagAtom)
    if (data && (filterText || tag)) {
        data = data.filter(entry => {
            const matchedTag = !tag || entry[3].tag.includes(tag)
            let matchedText = !filterText
            if (!matchedText) {
                const words = filterText.toLowerCase().split(' ')
                const title = entry[0].toLowerCase()
                matchedText = words.some(word => title.includes(word))
            }
            return matchedText && matchedTag
        })
    }
    return data
})

export const aiKeyAtom = atomWithStorage('key')
