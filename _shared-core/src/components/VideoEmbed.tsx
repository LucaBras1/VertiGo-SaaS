'use client'

interface VideoEmbedProps {
  url: string
  title?: string
}

export default function VideoEmbed({ url, title = 'Video' }: VideoEmbedProps) {
  const getEmbedUrl = (url: string): string | null => {
    // YouTube
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    const youtubeMatch = url.match(youtubeRegex)
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`
    }

    // Vimeo
    const vimeoRegex = /(?:vimeo\.com\/)(\d+)/
    const vimeoMatch = url.match(vimeoRegex)
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`
    }

    return null
  }

  const embedUrl = getEmbedUrl(url)

  if (!embedUrl) {
    return (
      <div className="bg-neutral-gray-800 rounded-lg p-6 text-center">
        <p className="text-neutral-gray-300">
          Video nelze zobrazit. <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Otevřít v novém okně</a>
        </p>
      </div>
    )
  }

  return (
    <div className="aspect-video rounded-lg overflow-hidden bg-neutral-gray-800">
      <iframe
        src={embedUrl}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
      />
    </div>
  )
}
