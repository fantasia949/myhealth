import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react'
import { BeakerIcon } from '@heroicons/react/24/outline'
import cn from 'classnames'

interface Props {
  supps: string[]
}

export default function SupplementsPopover({ supps }: Props) {
  if (!supps || supps.length === 0) return null;

  return (
    <Popover className="w-full h-full flex justify-center items-center">
      <PopoverButton
        aria-label="View supplements"
        title="View supplements taken on this date"
        className="w-full h-full cursor-pointer hover:bg-gray-800 hover:text-blue-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded font-bold transition-colors flex justify-center items-center p-1"
      >
        <BeakerIcon className="h-5 w-5" />
      </PopoverButton>
      <PopoverPanel
        transition
        anchor="top"
        className="z-50 w-64 p-4 mb-2 bg-[#1a1a1a] border border-gray-600 rounded shadow-xl text-left text-sm text-gray-200 max-h-80 overflow-y-auto flex flex-col gap-2 transition duration-200 ease-in-out data-[closed]:translate-y-1 data-[closed]:opacity-0"
      >
        <h3 className="font-semibold text-gray-400 text-xs uppercase tracking-wider mb-1">Supplements</h3>
        <ul className="list-disc pl-4 space-y-1">
          {supps.map((supp, idx) => (
            <li key={idx} className="break-words">{supp}</li>
          ))}
        </ul>
      </PopoverPanel>
    </Popover>
  )
}
