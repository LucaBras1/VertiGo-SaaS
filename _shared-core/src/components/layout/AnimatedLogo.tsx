'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface AnimatedLogoProps {
  src: string
  alt: string
  className?: string
  animationDuration?: number
}

export default function AnimatedLogo({
  src,
  alt,
  className = '',
  animationDuration = 2000,
}: AnimatedLogoProps) {
  const [isStopped, setIsStopped] = useState(false)
  const [capturedFrame, setCapturedFrame] = useState<string | null>(null)
  const [gifKey, setGifKey] = useState<number | null>(null)
  const [imageLoaded, setImageLoaded] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  // Initialize on client only
  useEffect(() => {
    setGifKey(Date.now())
  }, [])

  // Capture current frame from the image
  const captureCurrentFrame = useCallback((): string | null => {
    if (!imgRef.current) {
      console.log('AnimatedLogo: No image ref')
      return null
    }

    try {
      const img = imgRef.current
      const canvas = document.createElement('canvas')
      const width = img.naturalWidth || img.width || 100
      const height = img.naturalHeight || img.height || 100

      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        console.log('AnimatedLogo: No canvas context')
        return null
      }

      ctx.drawImage(img, 0, 0, width, height)
      const dataUrl = canvas.toDataURL('image/png')

      // Check if we got a valid image (not just empty canvas)
      if (dataUrl && dataUrl.length > 1000) {
        console.log('AnimatedLogo: Frame captured successfully')
        return dataUrl
      } else {
        console.log('AnimatedLogo: Captured data too small:', dataUrl?.length)
      }
    } catch (e) {
      console.error('AnimatedLogo: Capture error:', e)
    }
    return null
  }, [])

  // Stop animation and capture frame after duration
  useEffect(() => {
    if (gifKey && imageLoaded && !isStopped) {
      const timer = setTimeout(() => {
        const frame = captureCurrentFrame()
        if (frame) {
          setCapturedFrame(frame)
        }
        // Always stop, even if capture failed
        setIsStopped(true)
      }, animationDuration)
      return () => clearTimeout(timer)
    }
  }, [gifKey, imageLoaded, isStopped, animationDuration, captureCurrentFrame])

  const handleClick = () => {
    if (isStopped) {
      setIsStopped(false)
      setCapturedFrame(null)
      setImageLoaded(false)
      setGifKey(Date.now())
    }
  }

  const handleImageLoad = () => {
    console.log('AnimatedLogo: Image loaded')
    setImageLoaded(true)
  }

  // Show placeholder on server
  if (!gifKey) {
    return (
      <div className={`cursor-pointer ${className}`}>
        <img
          src={src}
          alt={alt}
          className="w-full h-full rounded-full object-cover"
        />
      </div>
    )
  }

  // When stopped: show captured frame if available, otherwise keep showing GIF
  if (isStopped && capturedFrame) {
    return (
      <div
        onClick={handleClick}
        className={`cursor-pointer ${className}`}
        title="Klikni pro přehrání animace"
      >
        <img
          src={capturedFrame}
          alt={alt}
          className="w-full h-full rounded-full object-cover"
        />
      </div>
    )
  }

  // Show animated GIF (or keep showing if capture failed)
  return (
    <div
      onClick={handleClick}
      className={`cursor-pointer ${className}`}
      title={isStopped ? "Klikni pro přehrání animace" : undefined}
    >
      <img
        ref={imgRef}
        key={gifKey}
        src={`${src}?t=${gifKey}`}
        alt={alt}
        className="w-full h-full rounded-full object-cover"
        crossOrigin="anonymous"
        onLoad={handleImageLoad}
      />
    </div>
  )
}
