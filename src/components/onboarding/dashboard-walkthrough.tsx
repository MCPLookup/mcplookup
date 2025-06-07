'use client'

import { useState, useEffect } from 'react'
import { X, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react'

interface WalkthroughStep {
  id: string
  title: string
  description: string
  target: string
  position: 'top' | 'bottom' | 'left' | 'right'
}

const WALKTHROUGH_STEPS: WalkthroughStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Your Dashboard!',
    description: 'This is your central hub for managing MCP servers, API keys, and monitoring your usage.',
    target: 'dashboard-header',
    position: 'bottom'
  },
  {
    id: 'api-keys',
    title: 'API Keys Management',
    description: 'Create and manage API keys to access the MCPLookup.org API programmatically.',
    target: 'api-keys-tab',
    position: 'top'
  },
  {
    id: 'servers',
    title: 'Your Servers',
    description: 'View and manage the MCP servers you\'ve registered with the directory.',
    target: 'servers-tab',
    position: 'top'
  },
  {
    id: 'analytics',
    title: 'Usage Analytics',
    description: 'Monitor your API usage, discovery patterns, and server performance metrics.',
    target: 'analytics-tab',
    position: 'top'
  },
  {
    id: 'discovery',
    title: 'Discovery Tools',
    description: 'Use the discovery interface to find and test MCP servers in the directory.',
    target: 'discovery-link',
    position: 'bottom'
  }
]

interface DashboardWalkthroughProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

export function DashboardWalkthrough({ isOpen, onClose, onComplete }: DashboardWalkthroughProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null)

  useEffect(() => {
    if (!isOpen) return

    const step = WALKTHROUGH_STEPS[currentStep]
    const element = document.getElementById(step.target)
    
    if (element) {
      setHighlightedElement(element)
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [currentStep, isOpen])

  useEffect(() => {
    if (!isOpen) {
      setHighlightedElement(null)
      return
    }

    // Add overlay styles
    document.body.style.overflow = 'hidden'
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const currentStepData = WALKTHROUGH_STEPS[currentStep]
  const isLastStep = currentStep === WALKTHROUGH_STEPS.length - 1

  const handleNext = () => {
    if (isLastStep) {
      onComplete()
    } else {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    onClose()
  }

  const getTooltipPosition = () => {
    if (!highlightedElement) return { top: '50%', left: '50%' }

    const rect = highlightedElement.getBoundingClientRect()
    const position = currentStepData.position

    switch (position) {
      case 'top':
        return {
          top: rect.top - 20,
          left: rect.left + rect.width / 2,
          transform: 'translate(-50%, -100%)'
        }
      case 'bottom':
        return {
          top: rect.bottom + 20,
          left: rect.left + rect.width / 2,
          transform: 'translate(-50%, 0)'
        }
      case 'left':
        return {
          top: rect.top + rect.height / 2,
          left: rect.left - 20,
          transform: 'translate(-100%, -50%)'
        }
      case 'right':
        return {
          top: rect.top + rect.height / 2,
          left: rect.right + 20,
          transform: 'translate(0, -50%)'
        }
      default:
        return {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }
    }
  }

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={handleSkip} />
      
      {/* Highlight */}
      {highlightedElement && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            top: highlightedElement.getBoundingClientRect().top - 4,
            left: highlightedElement.getBoundingClientRect().left - 4,
            width: highlightedElement.getBoundingClientRect().width + 8,
            height: highlightedElement.getBoundingClientRect().height + 8,
            border: '2px solid #3b82f6',
            borderRadius: '8px',
            boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.2)',
            background: 'rgba(59, 130, 246, 0.1)'
          }}
        />
      )}

      {/* Tooltip */}
      <div
        className="fixed z-50 bg-white rounded-lg shadow-xl border max-w-sm p-6"
        style={getTooltipPosition()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
              {currentStep + 1}
            </div>
            <h3 className="font-semibold text-gray-900">{currentStepData.title}</h3>
          </div>
          <button
            onClick={handleSkip}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <p className="text-gray-600 mb-6">{currentStepData.description}</p>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-4">
          {WALKTHROUGH_STEPS.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index <= currentStep ? 'bg-blue-500' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleSkip}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Skip tour
          </button>

          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                onClick={handlePrevious}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-3 h-3" />
                Previous
              </button>
            )}
            
            <button
              onClick={handleNext}
              className="flex items-center gap-1 px-4 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
            >
              {isLastStep ? (
                <>
                  <CheckCircle className="w-3 h-3" />
                  Complete
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-3 h-3" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
