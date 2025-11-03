import React, { useState, useEffect } from 'react'
import './dashboard.css'

export default function Dashboard() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [podcasts, setPodcasts] = useState([])
  const [summary, setSummary] = useState(null)
  const [voices, setVoices] = useState([])
  const [selectedVoice, setSelectedVoice] = useState('Joanna')

  function handleFileChange(e) {
    const f = e.target.files && e.target.files[0]
    if (!f) {
      setSelectedFile(null)
      return
    }
    const isValid = /\.pdf$|\.txt$/i.test(f.name)
    if (!isValid) {
      alert('Only .pdf and .txt files are allowed')
      e.target.value = ''
      setSelectedFile(null)
      return
    }
    setSelectedFile(f)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!selectedFile) {
      alert('Please select a .pdf or .txt file first')
      return
    }

    setUploading(true)
    setSummary(null)

    try {
      const form = new FormData()
      form.append('file', selectedFile)

      // append voice selection to form
      form.append('voice', selectedVoice)
      const resp = await fetch('http://127.0.0.1:5000/api/generate-podcast', {
        method: 'POST',
        body: form,
      })

      if (!resp.ok) {
        const errBody = await resp.json().catch(() => null)
        throw new Error(errBody?.error || `Upload failed: ${resp.status}`)
      }

      const data = await resp.json()
      setSummary(data.summary || 'No summary returned')

      if (data.audio_url) {
        setPodcasts((p) => [{ id: Date.now(), title: selectedFile.name, src: data.audio_url }, ...p])
      } else if (data.audio_base64) {
        // create a blob URL from base64
        const bstr = atob(data.audio_base64)
        let n = bstr.length
        const u8arr = new Uint8Array(n)
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n)
        }
        const blob = new Blob([u8arr], { type: data.audio_content_type || 'audio/mpeg' })
        const url = URL.createObjectURL(blob)
        setPodcasts((p) => [{ id: Date.now(), title: selectedFile.name, src: url }, ...p])
      } else {
        // No audio yet — store summary-only item so user can see result
        setPodcasts((p) => [
          { id: Date.now(), title: selectedFile.name, src: null, summary: data.summary },
          ...p,
        ])
      }
    } catch (err) {
      console.error(err)
      alert('Upload error: ' + err.message)
    } finally {
      setUploading(false)
      setSelectedFile(null)
      const input = document.getElementById('file-input')
      if (input) input.value = ''
    }
  }

  useEffect(() => {
    async function loadVoices() {
      try {
        const res = await fetch('http://127.0.0.1:5000/api/tts/voices')
        const data = await res.json()
        setVoices(data.voices || [])
        if (data.voices && data.voices.length > 0) setSelectedVoice(data.voices[0].Id || 'Joanna')
      } catch (err) {
        console.error('Failed to load voices', err)
      }
    }
    loadVoices()
  }, [])

  async function handlePreview() {
    if (!selectedVoice) {
      alert('Select a voice first')
      return
    }
    const text = prompt('Enter short preview text (<= 2000 chars)', 'Hello, this is a quick preview.')
    if (!text) return
    try {
      const resp = await fetch('http://127.0.0.1:5000/api/tts/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voiceId: selectedVoice }),
      })
      if (!resp.ok) {
        const err = await resp.json().catch(() => null)
        throw new Error(err?.error || 'Preview failed')
      }
      const blob = await resp.blob()
      const url = URL.createObjectURL(blob)
      const audio = new Audio(url)
      audio.play()
    } catch (err) {
      alert('Preview error: ' + err.message)
    }
  }

  // Demo helper to add a sample audio item. If a summary exists, request a local
  // pyttsx3 preview from the backend and use that audio. Otherwise fall back to
  // a static demo audio file.
  async function addDemoPodcast() {
    const id = Date.now()
    const title = `Demo podcast ${podcasts.length + 1}`

    if (summary && summary.trim().length > 0) {
      try {
        // preview endpoint limits text length; trim if necessary
        const text = summary.length > 2000 ? summary.slice(0, 2000) : summary
        const resp = await fetch('http://127.0.0.1:5000/api/tts/preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, voiceId: selectedVoice }),
        })
        if (!resp.ok) {
          const err = await resp.json().catch(() => null)
          throw new Error(err?.error || 'Preview failed')
        }
        const blob = await resp.blob()
        const url = URL.createObjectURL(blob)
        const demo = { id, title, src: url }
        setPodcasts((p) => [demo, ...p])
        return
      } catch (err) {
        console.error('Demo preview failed, falling back to static demo:', err)
        // fall through to static demo below
      }
    }

    // fallback static demo audio
    const demo = {
      id,
      title,
      src: 'https://interactive-examples.mdn.mozilla.net/media/examples/t-rex-roar.mp3',
    }
    setPodcasts((p) => [demo, ...p])
  }

  return (
    <main className="dashboard-root">
      <header>
        <h1>Test Dashboard</h1>
        <p className="subtitle">Upload .pdf or .txt files to generate podcast</p>
      </header>

      <section className="upload-section">
        <h2>Upload File</h2>
        <form onSubmit={handleSubmit}>
          <input id="file-input" type="file" accept=".pdf,.txt" onChange={handleFileChange} />
          <div className="uploaded-list">
            <h3>Selected file</h3>
            {!selectedFile && <p>No file selected</p>}
            {selectedFile && <p>{selectedFile.name}</p>}
          </div>
          <div style={{ marginTop: 8 }}>
            <label>
              Voice: {' '}
              <select value={selectedVoice} onChange={(e) => setSelectedVoice(e.target.value)}>
                {voices.map((v) => (
                  <option key={v.Id} value={v.Id}>{`${v.Name} (${v.LanguageCode})`}</option>
                ))}
              </select>
            </label>
            <button type="button" style={{ marginLeft: 8 }} onClick={handlePreview}>
              Preview Voice
            </button>
          </div>
          <div className="actions">
            <button type="submit" disabled={uploading}>
              {uploading ? 'Uploading...' : 'Generate'}
            </button>
            <button type="button" onClick={addDemoPodcast} className="secondary">
              Add Demo Podcast
            </button>
          </div>
        </form>
      </section>

      {summary && (
        <section className="summary-section">
          <h3>Summary</h3>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{summary}</pre>
        </section>
      )}

      <section className="podcasts-section">
        <h2>My Podcasts</h2>
        {podcasts.length === 0 && <p>No podcasts yet. Use "Add Demo Podcast" or generate one above.</p>}
        <ul>
          {podcasts.map((p) => (
            <li key={p.id} className="podcast-item">
              <div className="podcast-meta">
                <strong>{p.title}</strong>
              </div>
              {p.src ? (
                <audio controls src={p.src}>
                  Your browser does not support the audio element.
                </audio>
              ) : (
                <div>
                  <em>No audio (backend TTS not configured)</em>
                  {p.summary && <pre style={{ whiteSpace: 'pre-wrap' }}>{p.summary}</pre>}
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
