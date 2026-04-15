import React, { Fragment, useEffect, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, ArrowLeftIcon, ClockIcon } from '@heroicons/react/24/outline'
import Markdown from 'react-markdown'
import { getGistFiles, GistFile } from '../service/gist'
import { Spinner } from './Spinner'
import { GistViewerProps } from './GistViewer.types'

export default function GistViewer({ isOpen, onClose }: GistViewerProps) {
  const [files, setFiles] = useState<GistFile[]>([])
  const [selectedFile, setSelectedFile] = useState<GistFile | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      loadFiles()
    } else {
      // Reset state when closed
      setSelectedFile(null)
    }
  }, [isOpen])

  const getTimestamp = (filename: string): number => {
    const match = filename.match(/^(?:biomarker_)?.*_(\d+)\.md$/)
    if (match) {
      const numStr = match[1]
      if (numStr.length === 8) {
        // YYYYMMDD format
        const year = parseInt(numStr.substring(0, 4), 10)
        const month = parseInt(numStr.substring(4, 6), 10) - 1 // 0-indexed
        const day = parseInt(numStr.substring(6, 8), 10)
        return new Date(year, month, day).getTime()
      } else {
        // Standard Date.now() timestamp
        return parseInt(numStr, 10)
      }
    }
    return 0 // Fallback
  }

  const loadFiles = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const fetchedFiles = await getGistFiles()

      // Sort by parsed timestamp descending (newest first)
      fetchedFiles.sort((a, b) => getTimestamp(b.filename) - getTimestamp(a.filename))
      setFiles(fetchedFiles)
    } catch (err: any) {
      setError(err.message || 'Failed to load Gist files')
    } finally {
      setIsLoading(false)
    }
  }

  const formatFilename = (filename: string) => {
    // Expected format: biomarker_KEYS_timestamp.md or KEYS_timestamp.md
    // Handle either YYYYMMDD string or standard JS timestamp
    const match = filename.match(/^(?:biomarker_)?(.*)_(\d+)\.md$/)
    if (match) {
      const keys = match[1].replace(/_/g, ', ')
      const numStr = match[2]
      let dateStr = ''

      if (numStr.length === 8) {
        // YYYYMMDD format
        const year = numStr.substring(0, 4)
        const month = numStr.substring(4, 6)
        const day = numStr.substring(6, 8)
        dateStr = `${year}-${month}-${day}`
      } else {
        // Standard Date.now() timestamp
        const date = new Date(parseInt(numStr, 10))
        dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
      }

      return { keys, dateStr, isParsed: true }
    }
    return { keys: filename, dateStr: '', isParsed: false }
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-end p-0 text-center">
            <Transition.Child
              as={Fragment}
              enter="transform transition ease-in-out duration-500 sm:duration-700"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition ease-in-out duration-500 sm:duration-700"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <Dialog.Panel className="flex flex-col w-full max-w-md transform overflow-hidden bg-[#222222] text-dark-text p-6 text-left align-middle shadow-xl transition-all h-screen ml-auto border-l border-gray-700">
                <Dialog.Title
                  as="div"
                  className="flex justify-between items-center text-lg font-medium leading-6 mb-4 pb-2 border-b border-gray-700"
                >
                  <div className="flex items-center gap-2">
                    {selectedFile && (
                      <button
                        onClick={() => setSelectedFile(null)}
                        className="text-gray-400 hover:text-white mr-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
                        aria-label="Back to list"
                        title="Back to list"
                      >
                        <ArrowLeftIcon className="h-5 w-5" />
                      </button>
                    )}
                    <span>{selectedFile ? 'Analysis Details' : 'AI History'}</span>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
                    aria-label="Close dialog"
                    title="Close dialog"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </Dialog.Title>

                <div className="flex-1 overflow-y-auto">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-32">
                      <Spinner /> <span className="ml-2 text-gray-400">Loading history...</span>
                    </div>
                  ) : error ? (
                    <div className="text-red-400 p-4 bg-red-900/20 rounded">
                      <p>Error: {error}</p>
                      <button
                        onClick={loadFiles}
                        className="mt-2 text-sm text-blue-400 hover:text-blue-300 underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
                      >
                        Try again
                      </button>
                    </div>
                  ) : selectedFile ? (
                    <div className="text-sm whitespace-pre-wrap">
                      <Markdown>{selectedFile.content}</Markdown>
                    </div>
                  ) : files.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      {files.map((file) => {
                        const { keys, dateStr, isParsed } = formatFilename(file.filename)
                        return (
                          <button
                            key={file.filename}
                            onClick={() => setSelectedFile(file)}
                            className="text-left p-3 rounded bg-[#333333] hover:bg-[#444444] transition-colors border border-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                          >
                            <div className="font-medium text-blue-400 mb-1 line-clamp-2">
                              {keys}
                            </div>
                            <div className="text-xs text-gray-400 flex items-center gap-1">
                              <ClockIcon className="h-3 w-3" />
                              {isParsed ? dateStr : file.filename}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  ) : (
                    <div
                      className="text-gray-400 text-center mt-10"
                      role="status"
                      aria-live="polite"
                    >
                      No AI history found in the gist.
                    </div>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
