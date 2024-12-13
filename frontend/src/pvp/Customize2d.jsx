'use client'

import React, { useState, useEffect } from 'react'
import { Settings, X } from 'lucide-react'

export default function GameSettingsButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [tableMainColor, setTableMainColor] = useState('#00ff00')
  const [tableSecondaryColor, setTableSecondaryColor] = useState('#008000')
  const [paddlesColor, setPaddlesColor] = useState('#ffffff')
  const [isDarkTheme, setIsDarkTheme] = useState(false)

  const togglePopup = () => setIsOpen(!isOpen)

  useEffect(() => {
    // Apply the theme to the document when it changes
    document.documentElement.classList.toggle('dark', isDarkTheme)
  }, [isDarkTheme])

  return (
    <div className="fixed right-0 top-1/2 -translate-y-1/2">
      <button
        onClick={togglePopup}
        className="bg-blue-500 text-white p-2 rounded-l-md shadow-lg transition-all duration-300 hover:bg-blue-600"
        aria-label="Open game settings"
      >
        <Settings size={24} />
      </button>
      
      <div className={`fixed top-0 right-0 h-full w-80 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold dark:text-white">Game Settings</h2>
            <button onClick={togglePopup} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <X size={24} />
            </button>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="tableMainColor" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Table Main Color
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  id="tableMainColor"
                  value={tableMainColor}
                  onChange={(e) => setTableMainColor(e.target.value)}
                  className="w-8 h-8 rounded-md border border-gray-300 dark:border-gray-600"
                />
                <input
                  type="text"
                  value={tableMainColor}
                  onChange={(e) => setTableMainColor(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="tableSecondaryColor" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Table Secondary Color
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  id="tableSecondaryColor"
                  value={tableSecondaryColor}
                  onChange={(e) => setTableSecondaryColor(e.target.value)}
                  className="w-8 h-8 rounded-md border border-gray-300 dark:border-gray-600"
                />
                <input
                  type="text"
                  value={tableSecondaryColor}
                  onChange={(e) => setTableSecondaryColor(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="paddlesColor" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Paddles Color
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  id="paddlesColor"
                  value={paddlesColor}
                  onChange={(e) => setPaddlesColor(e.target.value)}
                  className="w-8 h-8 rounded-md border border-gray-300 dark:border-gray-600"
                />
                <input
                  type="text"
                  value={paddlesColor}
                  onChange={(e) => setPaddlesColor(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <label htmlFor="theme-toggle" className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id="theme-toggle"
                  className="sr-only peer"
                  checked={isDarkTheme}
                  onChange={(e) => setIsDarkTheme(e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Dark Theme</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

