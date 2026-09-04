import React, { Fragment, useState, useCallback } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import {
  XMarkIcon,
  DocumentTextIcon,
  CheckIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline'
import { useAtomValue } from 'jotai'
import { gistTokenAtom } from '../atom/dataAtom'
import { fetchQuickNote, saveQuickNote } from '../service/gist'
import { Spinner } from './Spinner'
import { NoteEditorProps } from './NoteEditor.types'

const GIST_NOTE_URL =
  'https://gist.github.com/fantasia949/7853cbe1c3e9bd514e89ac06bf74b54b#file-notes-txt'

export default function NoteEditor({ isOpen, onClose }: NoteEditorProps) {
  const gistToken = useAtomValue(gistTokenAtom)
  const [noteContent, setNoteContent] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | 'info'
    message: string
  } | null>(null)

  const loadNote = useCallback(async () => {
    setIsLoading(true)
    setStatus(null)
    try {
      const content = await fetchQuickNote(gistToken)
      setNoteContent(content)
    } catch (err: any) {
      console.error('Error loading note:', err)
      setStatus({
        type: 'error',
        message: err.message || 'Failed to load note from Gist',
      })
    } finally {
      setIsLoading(false)
    }
  }, [gistToken])

  const handleSave = async () => {
    if (!gistToken) {
      setStatus({
        type: 'error',
        message:
          'Gist Token is missing. Please enter your Gist Token in the input field at the bottom of the page.',
      })
      return
    }

    setIsSaving(true)
    setStatus(null)

    try {
      await saveQuickNote(noteContent, gistToken)
      setStatus({
        type: 'success',
        message: 'Note saved to Gist successfully!',
      })
    } catch (err: any) {
      console.error('Error saving note:', err)
      setStatus({
        type: 'error',
        message: err.message || 'Failed to save note to Gist',
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Transition appear show={isOpen} as={Fragment} beforeEnter={loadNote}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Dimming backdrop overlay */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto flex flex-col w-screen max-w-md bg-[#222222] text-dark-text p-6 shadow-2xl h-screen border-l border-gray-700">
                  {/* Header */}
                  <Dialog.Title
                    as="div"
                    className="flex justify-between items-center text-lg font-bold pb-3 border-b border-gray-700"
                  >
                    <div className="flex items-center gap-2 text-white">
                      <DocumentTextIcon className="h-5 w-5 text-accent" />
                      <span>Quick Notes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={GIST_NOTE_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 text-gray-400 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded transition-colors"
                        aria-label="View Gist on GitHub"
                        title="View Gist on GitHub"
                      >
                        <ArrowTopRightOnSquareIcon className="h-5 w-5" aria-hidden="true" />
                      </a>
                      <button
                        type="button"
                        onClick={onClose}
                        className="p-1 text-gray-400 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded transition-colors"
                        aria-label="Close note editor"
                        title="Close note editor"
                      >
                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                      </button>
                    </div>
                  </Dialog.Title>

                  {/* Status Banner */}
                  {status && (
                    <div
                      className={`mt-3 p-2.5 rounded text-xs flex items-center justify-between ${
                        status.type === 'error'
                          ? 'bg-red-900/30 border border-red-700 text-red-300'
                          : 'bg-green-900/30 border border-green-700 text-green-300'
                      }`}
                      role="status"
                    >
                      <span>{status.message}</span>
                      {status.type === 'error' && (
                        <button
                          type="button"
                          onClick={loadNote}
                          className="ml-2 underline text-red-200 hover:text-white"
                        >
                          Retry
                        </button>
                      )}
                    </div>
                  )}

                  {/* Editor Body */}
                  <div className="flex-1 my-4 flex flex-col min-h-0">
                    {isLoading ? (
                      <div
                        className="flex-1 flex items-center justify-center bg-gray-900/50 rounded-lg border border-gray-800"
                        role="status"
                      >
                        <Spinner />
                        <span className="ml-2 text-sm text-gray-400">
                          Loading note from Gist...
                        </span>
                      </div>
                    ) : (
                      <textarea
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                        placeholder="Type your quick notes here..."
                        className="w-full flex-1 p-3 bg-gray-900/80 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent font-mono leading-relaxed"
                      />
                    )}
                  </div>

                  {/* Footer Actions */}
                  <div className="pt-3 border-t border-gray-700 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-xs font-medium text-gray-400 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-lg"
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={isSaving || isLoading}
                      className="px-4 py-2 bg-accent text-white rounded-lg text-xs font-semibold hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-all shadow-sm shadow-accent/20"
                      title="Save note to Gist"
                    >
                      {isSaving ? (
                        <>
                          <Spinner />
                          <span>Saving...</span>
                        </>
                      ) : status?.type === 'success' ? (
                        <>
                          <CheckIcon className="h-4 w-4" aria-hidden="true" />
                          <span>Saved</span>
                        </>
                      ) : (
                        <span>Save</span>
                      )}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
