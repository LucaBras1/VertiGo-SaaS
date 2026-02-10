'use client'

import { useState, useRef, useEffect } from 'react'
import { Button, Card, Input } from '@vertigo/ui'
interface ContractSignatureProps {
  onSign: (data: {
    signedByName: string
    signedByEmail: string
    signatureData?: string
    signatureType: 'draw' | 'type' | 'checkbox'
  }) => Promise<void>
  clientName?: string
  clientEmail?: string
  loading?: boolean
}

type SignatureMethod = 'draw' | 'type' | 'checkbox'

export function ContractSignature({
  onSign,
  clientName = '',
  clientEmail = '',
  loading = false,
}: ContractSignatureProps) {
  const [method, setMethod] = useState<SignatureMethod>('checkbox')
  const [name, setName] = useState(clientName)
  const [email, setEmail] = useState(clientEmail)
  const [typedSignature, setTypedSignature] = useState('')
  const [agreed, setAgreed] = useState(false)

  // Drawing canvas
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasDrawn, setHasDrawn] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set up canvas
    ctx.strokeStyle = '#000'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }, [])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    setIsDrawing(true)
    setHasDrawn(true)

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top

    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top

    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasDrawn(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !email) {
      return
    }

    let signatureData: string | undefined

    if (method === 'draw') {
      const canvas = canvasRef.current
      if (!canvas || !hasDrawn) return
      signatureData = canvas.toDataURL('image/png')
    } else if (method === 'type') {
      if (!typedSignature) return
      signatureData = typedSignature
    } else {
      if (!agreed) return
    }

    await onSign({
      signedByName: name,
      signedByEmail: email,
      signatureData,
      signatureType: method,
    })
  }

  const isValid = () => {
    if (!name || !email) return false
    if (method === 'draw' && !hasDrawn) return false
    if (method === 'type' && !typedSignature) return false
    if (method === 'checkbox' && !agreed) return false
    return true
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-6">Sign Contract</h3>

      <form onSubmit={handleSubmit}>
        {/* Personal Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Input
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full legal name"
            required
          />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
          />
        </div>

        {/* Signature Method Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Signature Method
          </label>
          <div className="flex gap-2">
            {(['checkbox', 'type', 'draw'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMethod(m)}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  method === m
                    ? 'border-amber-500 bg-amber-50 text-amber-700'
                    : 'border-gray-200 text-gray-600 hover:border-amber-300'
                }`}
              >
                {m === 'checkbox' && 'Checkbox Agreement'}
                {m === 'type' && 'Type Signature'}
                {m === 'draw' && 'Draw Signature'}
              </button>
            ))}
          </div>
        </div>

        {/* Signature Input */}
        {method === 'checkbox' && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
              />
              <span className="text-gray-700">
                I, <strong>{name || '[Your Name]'}</strong>, have read and agree to all terms
                and conditions outlined in this contract. I understand this constitutes a
                legally binding agreement.
              </span>
            </label>
          </div>
        )}

        {method === 'type' && (
          <div className="mb-6">
            <Input
              label="Type Your Signature"
              value={typedSignature}
              onChange={(e) => setTypedSignature(e.target.value)}
              placeholder="Type your full name as signature"
              required
            />
            {typedSignature && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-2">Preview:</p>
                <p
                  className="text-3xl"
                  style={{ fontFamily: 'cursive' }}
                >
                  {typedSignature}
                </p>
              </div>
            )}
          </div>
        )}

        {method === 'draw' && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700">
                Draw Your Signature
              </label>
              <button
                type="button"
                onClick={clearCanvas}
                className="text-sm text-amber-600 hover:text-amber-700"
              >
                Clear
              </button>
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-2 bg-white">
              <canvas
                ref={canvasRef}
                width={500}
                height={150}
                className="w-full cursor-crosshair touch-none"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Use your mouse or finger to draw your signature
            </p>
          </div>
        )}

        {/* Submit */}
        <Button
          type="submit"
          className="w-full"
          disabled={!isValid() || loading}
        >
          {loading ? 'Signing...' : 'Sign Contract'}
        </Button>

        <p className="text-xs text-gray-500 text-center mt-4">
          By signing, you agree to the terms and conditions of this contract.
          Your signature is legally binding.
        </p>
      </form>
    </Card>
  )
}
