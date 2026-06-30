import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Clock, Tag, ChevronDown, ChevronRight, Code2 } from 'lucide-react'
import ImageViewer from './ImageViewer'
import type { ChatMessage } from '../types'
import { getQueryImageUrl } from '../api'

interface MessageBubbleProps {
  message: ChatMessage
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const [viewerImage, setViewerImage] = useState<string | null>(null)
  const [showCode, setShowCode] = useState(false)
  const isUser = message.role === 'user'
  const analysisImages = (message.images || []).filter(img => img.label.startsWith('track_b_input:'))
  const inlineImages = (message.images || []).filter(img => !img.label.startsWith('track_b_input:'))

  return (
    <>
      <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
        <div
          className={`${isUser ? 'max-w-[75%]' : 'max-w-full w-full'} rounded-xl px-5 py-4 ${
            isUser
              ? 'bg-blue-500 text-white'
              : 'bg-white border border-gray-200 text-gray-800'
          }`}
        >
          {/* Processing time */}
          {!isUser && message.processing_time_ms && (
            <div className="flex items-center gap-2 mb-2 text-sm text-gray-400">
              <Clock size={14} />
              <span>{(message.processing_time_ms / 1000).toFixed(1)}초</span>
              {message.intent && (
                <>
                  <span>·</span>
                  <Tag size={12} />
                  <span>{message.intent}</span>
                </>
              )}
            </div>
          )}

          {/* Content */}
          {isUser ? (
            <p className="text-[19px] whitespace-pre-wrap leading-relaxed">{message.content}</p>
          ) : (
            <div className="markdown-content text-[19px] leading-relaxed">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
            </div>
          )}

          {/* Inline images */}
          {inlineImages.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-3">
              {inlineImages.slice(0, 6).map(img => {
                const url = getQueryImageUrl(
                  img.url.split('/').slice(-2, -1)[0],
                  img.index,
                )
                return (
                  <div
                    key={img.index}
                    className="relative cursor-pointer rounded-lg border border-gray-200
                               overflow-hidden hover:border-blue-400 transition-colors"
                    onClick={() => setViewerImage(url)}
                  >
                    <img
                      src={url}
                      alt={img.label}
                      className="w-full h-auto"
                      loading="lazy"
                    />
                    <span className="absolute bottom-0 left-0 right-0 bg-black/50
                                     text-white text-xs px-2 py-1 truncate">
                      {img.label}
                    </span>
                  </div>
                )
              })}
              {inlineImages.length > 6 && (
                <div className="text-sm text-gray-400 col-span-2 text-center">
                  +{inlineImages.length - 6}개 이미지 더
                </div>
              )}
            </div>
          )}

          {/* Code execution details toggle */}
          {!isUser && message.code_details && (
            <div className="mt-3 border-t border-gray-100 pt-3">
              <button
                onClick={() => setShowCode(!showCode)}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Code2 size={14} />
                <span>분석 과정 보기</span>
                {showCode ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
              {showCode && (
                <div className="mt-2 max-h-[500px] overflow-y-auto rounded-lg bg-gray-50 border border-gray-200 p-4 space-y-4">
                  {analysisImages.length > 0 && (
                    <div>
                      <div className="text-xs font-medium text-gray-500 mb-2">Track B 후보 입력</div>
                      <div className="grid grid-cols-2 gap-3">
                        {analysisImages.map(img => {
                          const url = getQueryImageUrl(
                            img.url.split('/').slice(-2, -1)[0],
                            img.index,
                          )
                          return (
                            <div
                              key={img.index}
                              className="relative cursor-pointer rounded-lg border border-gray-200 overflow-hidden hover:border-blue-400 transition-colors bg-white"
                              onClick={() => setViewerImage(url)}
                            >
                              <img src={url} alt={img.label} className="w-full h-auto" loading="lazy" />
                              <span className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs px-2 py-1 truncate">
                                {img.label.replace('track_b_input:', '')}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                  <div className="markdown-content text-sm leading-relaxed text-gray-600">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.code_details}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Image viewer modal */}
      {viewerImage && (
        <ImageViewer
          src={viewerImage}
          onClose={() => setViewerImage(null)}
        />
      )}
    </>
  )
}
