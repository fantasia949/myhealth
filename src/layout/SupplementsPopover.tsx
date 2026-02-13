import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react'
import cn from 'classnames'

interface Props {
  supps: string[]
}

export default function SupplementsPopover({ supps }: Props) {
  if (!supps || supps.length === 0) return null;

  return (
    <Popover className="relative inline-block">
      <PopoverButton className="cursor-pointer hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 font-bold transition-colors">
        ?
      </PopoverButton>
      <PopoverPanel
        anchor="top"
        className="z-50 w-64 p-4 mb-2 bg-[#1a1a1a] border border-gray-600 rounded shadow-xl text-left text-sm text-gray-200 max-h-80 overflow-y-auto flex flex-col gap-2"
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
