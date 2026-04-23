import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react'
import { BeakerIcon } from '@heroicons/react/24/outline'
import { useAtomValue } from 'jotai'
import { noteValuesAtom } from '../atom/dataAtom'
import { useMemo } from 'react'
import { SupplementsPopoverProps } from './SupplementsPopover.types'

export default function SupplementsPopover({ supps }: SupplementsPopoverProps) {
  const noteValues = useAtomValue(noteValuesAtom)

  // Optimization: Pre-calculate supplement frequencies across all notes
  // This could be moved to Jotai as a derived atom if it needs to be shared,
  // but since it's only used in popovers (which render rarely/on-demand),
  // useMemo is sufficient.
  const suppFrequencies = useMemo(() => {
    const counts = new Map<string, number>()
    for (let i = 0; i < noteValues.length; i++) {
      const note = noteValues[i]
      if (note && note.supps) {
        for (let j = 0; j < note.supps.length; j++) {
          const supp = note.supps[j]
          counts.set(supp, (counts.get(supp) || 0) + 1)
        }
      }
    }
    return counts
  }, [noteValues])

  if (!supps || supps.length === 0) return null

  return (
    <Popover className="w-full h-full flex justify-center items-center">
      <PopoverButton
        aria-label={`View ${supps.length} supplement${supps.length !== 1 ? 's' : ''}`}
        title={`View ${supps.length} supplement${supps.length !== 1 ? 's' : ''} taken on this date`}
        className="w-full h-full cursor-pointer hover:bg-gray-800 hover:text-blue-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded font-bold transition-colors flex justify-center items-center p-1"
      >
        <BeakerIcon className="h-5 w-5" />
      </PopoverButton>
      <PopoverPanel
        transition
        anchor="top"
        className="z-50 w-64 p-4 mb-2 bg-[#1a1a1a] border border-gray-600 rounded shadow-xl text-left text-sm text-gray-200 max-h-80 overflow-y-auto flex flex-col gap-2 transition duration-200 ease-in-out data-[closed]:translate-y-1 data-[closed]:opacity-0"
      >
        <h3 className="font-semibold text-gray-400 text-xs uppercase tracking-wider mb-1">
          Supplements
        </h3>
        <ul className="list-disc pl-4 space-y-1">
          {supps.map((supp, idx) => (
            <li key={idx} className="break-words flex justify-between items-center gap-2">
              <span>{supp}</span>
              <span
                className="text-gray-400 font-mono text-xs"
                title="Frequency across all records"
              >
                ({suppFrequencies.get(supp) || 0})
              </span>
            </li>
          ))}
        </ul>
      </PopoverPanel>
    </Popover>
  )
}
