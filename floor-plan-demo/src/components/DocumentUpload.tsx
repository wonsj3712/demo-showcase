import { useState, useRef } from 'react'
import { Upload, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { ingestPdfWithProgress } from '../api'
import type { IngestProgressEvent } from '../api'

interface DocumentUploadProps {
  onUploaded: () => void
}

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error'

export default function DocumentUpload({ onUploaded }: DocumentUploadProps) {
  const [status, setStatus] = useState<UploadStatus>('idle')
  const [message, setMessage] = useState('')
  const [logs, setLogs] = useState<string[]>([])
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    for (const file of Array.from(files)) {
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        setStatus('error')
        setMessage('PDF 파일만 업로드 가능합니다.')
        return
      }

      const docName = file.name.replace(/\.pdf$/i, '')

      setStatus('uploading')
      setMessage(`${docName} 인덱싱 중...`)
      setLogs([])

      try {
        const result = await ingestPdfWithProgress(
          file,
          docName,
          (event: IngestProgressEvent) => {
            if (event.step === 'complete') return
            if (event.message) {
              setLogs(prev => [...prev, event.message!])
            }
          },
        )
        setStatus('success')
        setMessage(
          `${result.doc_name}: ${result.total_pages}페이지, ` +
          `${(result.indexing_time_ms / 1000).toFixed(1)}초`
        )
        onUploaded()
      } catch (err) {
        setStatus('error')
        setMessage(err instanceof Error ? err.message : '업로드 실패')
      }
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFiles(e.dataTransfer.files)
  }

  return (
    <div>
      <div
        className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer
                    transition-colors ${
                      dragOver
                        ? 'border-blue-400 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".pdf"
          multiple
          className="hidden"
          onChange={e => handleFiles(e.target.files)}
        />

        {status === 'uploading' ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 size={28} className="text-blue-500 animate-spin" />
            <p className="text-sm text-gray-600">{message}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload size={28} className="text-gray-400" />
            <p className="text-sm text-gray-500">
              PDF 파일을 드래그하거나 클릭하여 업로드
            </p>
          </div>
        )}
      </div>

      {/* Progress logs */}
      {status === 'uploading' && logs.length > 0 && (
        <div className="mt-3 max-h-40 overflow-y-auto rounded-lg bg-gray-900 px-4 py-3 text-sm font-mono">
          {logs.map((log, i) => (
            <div key={i} className="text-gray-300 leading-6">
              <span className="text-gray-500 mr-2">{'>>'}</span>
              {log}
            </div>
          ))}
        </div>
      )}

      {/* Status message */}
      {status === 'success' && (
        <div className="flex items-center gap-2 mt-3 text-green-600">
          <CheckCircle2 size={16} />
          <span className="text-sm">{message}</span>
        </div>
      )}
      {status === 'error' && (
        <div className="flex items-center gap-2 mt-3 text-red-600">
          <AlertCircle size={16} />
          <span className="text-sm">{message}</span>
        </div>
      )}
    </div>
  )
}
