import React, { useState, useEffect, useCallback, useMemo } from "react";
import * as WebSpeech from "./webspeech_adapter";
import { useNavigate } from "react-router-dom";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  onSnapshot,
  query,
  doc,
  deleteDoc,
  updateDoc,
  setDoc,
  where,
} from "firebase/firestore";
const LogoutIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" x2="9" y1="12" y2="12" />
  </svg>
);
const MoonIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </svg>
);
const DownloadIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" x2="12" y1="15" y2="3" />
  </svg>
);
const TrashIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </svg>
);
const PlayIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);
const SearchIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const BookIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
  </svg>
);
const StarIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

// Small missing icons used in the sidebar/navigation
const UploadIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 5 17 10" />
    <line x1="12" x2="12" y1="5" y2="19" />
  </svg>
);

const PodcastsIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 1v6" />
    <circle cx="12" cy="14" r="7" />
    <path d="M19 14a7 7 0 0 0-14 0" />
  </svg>
);

const ScriptsIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H7l-4-4V5a2 2 0 0 1 2-2h7" />
    <line x1="16" y1="2" x2="16" y2="8" />
    <line x1="8" y1="7" x2="16" y2="7" />
  </svg>
);

const SettingsIcon = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06A2 2 0 0 1 2.27 16.9l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82L4.3 2.27A2 2 0 0 1 7.12.44l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V0a2 2 0 0 1 4 0v.09c.2.6.66 1.09 1.24 1.34" />
  </svg>
);

import "./dashboard.css";

// --- CONSTANTS ---
const ACCENT_COLOR = "#B0A6DF";
const BG_COLOR = "#1e293b"; // Dark Slate Blue / Primary Background
const CARD_COLOR = "#334155"; // Secondary Background
const TEXT_COLOR = "#f8fafc"; // Light Text
const PLACEHOLDER_TEXT_COLOR = "#94a3b8"; // Slate 400

const mockPodcasts = [
  {
    id: "1",
    fileName: "Machine Learning Notes.pdf",
    title: "Machine Learning Notes",
    date: "2025-10-23",
    summary:
      "This chapter explains supervised and unsupervised learning, diving deep into perceptrons and decision tree principles...",
    duration: "3:20",
    audioURL: "mock-ml.mp3",
    tags: ["AI"],
    fullScript:
      "Chapter 1: Introduction to Machine Learning. This section covers all topics and superstitions the core concepts are explained and understandable. We also have other sessions including deep learning, reinforcement learning, and generative AI content.",
  },
  {
    id: "2",
    fileName: "History Vol 1.txt",
    title: "The History of Rome Vol.1",
    date: "2025-10-25",
    summary:
      "This chapter explains the Roman Republic, laying the groundwork for the ensuing social and political structures...",
    duration: "3:20",
    audioURL: "mock-rome.mp3",
    tags: ["History"],
    fullScript:
      "The rise and fall of the Roman Republic is a pivotal study in history. It details the transition from a monarchy to a republic, highlighting key figures like Sulla and Pompey. It also touches on early political philosophy.",
  },
  {
    id: "3",
    fileName: "Quantum.pdf",
    title: "Quantum Physics Basics",
    date: "2025-10-25",
    summary:
      "A journey through the Principles of Quantum Mechanics: superposition, entanglement, and the probabilistic nature of the universe...",
    duration: "3:20",
    audioURL: "mock-quantum.mp3",
    tags: ["Science"],
    fullScript:
      "Quantum mechanics fundamentally changed our understanding of reality. This podcast covers the Heisenberg Uncertainty Principle, wave-particle duality, and the foundational Copenhagen interpretation.",
  },
];

const SidebarItem = ({ icon: Icon, label, isActive, onClick }) => (
  <div
    className={`flex items-center p-3 rounded-xl transition-colors cursor-pointer ${
      isActive
        ? `bg-zinc-700 text-white shadow-lg`
        : "text-slate-400 hover:bg-slate-700"
    }`}
    onClick={onClick}
    style={isActive ? { backgroundColor: ACCENT_COLOR, color: TEXT_COLOR } : {}}
  >
    <Icon className="w-5 h-5 mr-4" />
    <span className="text-sm font-medium">{label}</span>
  </div>
);

// --- FIREBASE UTILITIES ---
const appId = typeof __app_id !== "undefined" ? __app_id : "default-app-id";
const firebaseConfig =
  typeof __firebase_config !== "undefined" ? JSON.parse(__firebase_config) : {};

const getCollectionPath = (userId) =>
  `/artifacts/${appId}/users/${userId}/podcasts`;

// --- COMPONENTS ---

const PodcastScriptModal = ({ isOpen, onClose, script, title }) => {
  if (!isOpen) return null;

  // Debug: log when modal renders so we can verify clicks reach here
  try {
    console.log(
      "PodcastScriptModal open. title:",
      title,
      "script length:",
      script && script.length
    );
  } catch (e) {
    /* ignore logging errors in environments that block console */
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
      <div className="bg-slate-800 p-6 rounded-xl shadow-2xl w-full max-w-2xl transform transition-all duration-300">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-white">
            Podcast Script: {title}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            &times;
          </button>
        </div>

        <div className="p-4 bg-slate-700 rounded-lg max-h-96 overflow-y-auto mb-4 border border-slate-600">
          <p className="text-slate-200 whitespace-pre-wrap">{script}</p>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-slate-600 text-white hover:bg-slate-500 transition-colors"
            onClick={() => {
              // Using document.execCommand('copy') for better compatibility in iframe environments
              const tempTextArea = document.createElement("textarea");
              tempTextArea.value = script;
              document.body.appendChild(tempTextArea);
              tempTextArea.select();
              document.execCommand("copy");
              document.body.removeChild(tempTextArea);
              console.log("Script copied to clipboard!");
            }}
          >
            Copy Text
          </button>
          <button
            className="px-4 py-2 text-sm font-semibold rounded-lg text-white transition-colors"
            style={{ backgroundColor: ACCENT_COLOR }}
            onClick={() => {
              console.log("Editing feature coming soon!");
            }}
          >
            Edit Script
          </button>
        </div>
      </div>
    </div>
  );
};

const PodcastCard = ({ podcast, onViewScript, onDelete }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const playWithWebSpeech = async () => {
    try {
      const text = podcast.fullScript || podcast.summary || podcast.title || "";
      if (!text) return;
      setIsSpeaking(true);
      if (WebSpeech.isAvailable()) {
        await WebSpeech.speak(text, podcast.voice || null, { rate: 1 });
      } else {
        // fallback: use HTML5 Audio if audioURL present
        if (podcast.audioURL) {
          const audio = new Audio(podcast.audioURL);
          audio.play();
          // no await; let it play
        }
      }
    } catch (e) {
      console.error('WebSpeech play failed', e);
    } finally {
      setIsSpeaking(false);
    }
  };

  const stopWebSpeech = () => {
    try {
      if (WebSpeech.isAvailable()) WebSpeech.cancel();
    } catch (e) {
      console.warn('cancel failed', e);
    } finally {
      setIsSpeaking(false);
    }
  };

  return (
    <div className="bg-slate-800 p-4 rounded-xl shadow-lg flex flex-col justify-start items-start transition-transform duration-300 hover:shadow-xl hover:scale-[1.02]">
    <div>
      <div className="flex items-center mb-2">
        <BookIcon className="w-5 h-5 mr-2" style={{ color: ACCENT_COLOR }} />
        <h4 className="text-lg font-semibold text-white truncate">
          {podcast.title}
        </h4>
        {podcast.tags.map((tag) => (
          <span
            key={tag}
            className="ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-900 text-indigo-200"
          >
            {tag}
          </span>
        ))}
      </div>
      <p className="text-xs text-slate-400 mb-3">{podcast.date}</p>
      <p className="text-sm text-slate-300 line-clamp-2 mb-4">
        {podcast.summary}
      </p>
    </div>

  <div className="space-y-3">
      {/* Audio Player */}
      <audio controls className="w-full h-10 rounded-full bg-slate-900">
        <source src={podcast.audioURL} type="audio/mp3" />
        Your browser does not support the audio element.
      </audio>

      <div className="flex justify-between items-center text-slate-400">
        <div className="flex items-center space-x-3">
          <button
            className="flex items-center text-xs font-medium hover:text-white transition-colors"
            onClick={() => onViewScript(podcast)}
          >
            <ScriptsIcon className="w-4 h-4 mr-1" />
            View Script
          </button>
          <button
            className="flex items-center text-xs font-medium hover:text-white transition-colors ml-2"
            onClick={() => (isSpeaking ? stopWebSpeech() : playWithWebSpeech())}
          >
            <PlayIcon className="w-4 h-4 mr-1" />
            {isSpeaking ? "Stop" : "Play (Web)"}
          </button>
          <button
            type="button"
            className="flex items-center text-xs font-medium hover:text-white transition-colors"
            onClick={() => {
              try {
                if (!podcast?.audioURL) {
                  console.warn("No audio URL available for download.");
                  return;
                }
                // Create an anchor and trigger download. This will open or download depending on headers/CORS.
                const link = document.createElement("a");
                link.href = podcast.audioURL;
                // Use filename when available
                const suggested =
                  podcast.fileName || podcast.title || "podcast.mp3";
                link.download = suggested;
                document.body.appendChild(link);
                link.click();
                link.remove();
              } catch (err) {
                console.error("Download failed:", err);
              }
            }}
          >
            <DownloadIcon className="w-4 h-4 mr-1" />
            Download
          </button>
        </div>
        <button
          onClick={() => onDelete(podcast.id)}
          className="hover:text-red-500 transition-colors"
        >
          <TrashIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  </div>
  );
};

const UploadSection = ({ onNewPodcast }) => {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const pollingRefs = React.useRef({});
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState("Joanna");
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [previewText, setPreviewText] = useState("This is a short voice preview.");

  // API base, use Vite env if provided when running dev server
  const API_BASE = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE
    ? import.meta.env.VITE_API_BASE
    : 'http://127.0.0.1:5000';

  const handleFileChange = (selectedFile) => {
    if (
      selectedFile &&
      (selectedFile.type === "application/pdf" ||
        selectedFile.type === "text/plain")
    ) {
      setFile(selectedFile);
    } else {
      setFile(null);
      console.error(
        "Unsupported file format. Please upload a PDF or TXT file."
      );
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleGenerate = () => {
    if (!file) return;

    setIsGenerating(true);

    // Upload file to backend /api/generate-podcast which enqueues a job and returns job_id
    const form = new FormData();
    form.append('file', file);
    // allow future voice selection - send default for now
    form.append('voice', selectedVoice || 'Joanna');

    fetch(`${API_BASE}/api/generate-podcast`, { method: 'POST', body: form })
      .then(async (res) => {
        // If backend returns 202, assume async job flow (job_id)
        if (res.status === 202) {
          const j = await res.json();
          const jobId = j.job_id;
          const pending = {
            id: jobId,
            fileName: file.name,
            title: file.name.replace(/\.[^/.]+$/, ''),
            date: new Date().toISOString().slice(0, 10),
            summary: 'Processing...',
            duration: null,
            audioURL: null,
            audio_base64: null,
            tags: [],
            fullScript: '',
            status: 'pending',
            voice: selectedVoice,
          };
          if (onNewPodcast) onNewPodcast(pending);
          startPollingJob(jobId);
          return;
        }

        // Otherwise handle synchronous response (older backend) which returns summary and audio_base64
        if (res.ok) {
          const body = await res.json();
          if (body && body.success) {
            // create completed podcast entry directly
            const completed = {
              id: `${Date.now()}`,
              fileName: file.name,
              title: file.name.replace(/\.[^/.]+$/, ''),
              date: new Date().toISOString().slice(0, 10),
              summary: body.summary || '',
              audio_base64: body.audio_base64 || null,
              audioURL: body.audio_url || (body.audio_base64 ? `data:${body.audio_content_type || 'audio/wav'};base64,${body.audio_base64}` : null),
              tags: [],
              fullScript: body.summary || '',
              status: 'completed',
              voice: selectedVoice,
            };
            if (onNewPodcast) onNewPodcast(completed, true);
            return;
          } else {
            const err = body.error || 'generation failed';
            console.error('Generation failed', err);
            alert('Generation failed: ' + err);
          }
        } else {
          const errText = await res.text();
          console.error('Failed to generate', errText);
          alert('Failed to start generation: ' + errText);
        }
      })
      .catch((e) => {
        console.error('Error uploading file', e);
        alert('Upload failed');
      })
      .finally(() => {
        setIsGenerating(false);
        setFile(null);
      });
  };

  // Fetch available voices on mount
  useEffect(() => {
    let mounted = true;
    const fetchVoices = async () => {
      try {
        // Prefer browser Web Speech API if available
        if (WebSpeech.isAvailable()) {
          // Ensure voices are populated (some browsers require a small delay or an event)
          const populate = () => {
            const list = WebSpeech.listVoices();
            if (list && list.length > 0) {
              setVoices(list);
              setSelectedVoice((v) => v || list[0].Name || list[0].Id);
            }
          };
          // try immediate then also after voiceschanged
          populate();
          window.speechSynthesis.onvoiceschanged = () => {
            if (!mounted) return;
            populate();
          };
          return;
        }

        const r = await fetch(`${API_BASE}/api/tts/voices`);
        if (r.ok) {
          const data = await r.json();
          if (mounted) {
            setVoices(data.voices || []);
            if (data.voices && data.voices.length > 0) {
              setSelectedVoice((v) => v || data.voices[0].Name || data.voices[0].Id);
            }
          }
        }
      } catch (e) {
        console.warn('Failed to fetch voices', e);
      }
    };
    fetchVoices();
    return () => {
      mounted = false;
      if (WebSpeech.isAvailable()) window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const handlePreview = async () => {
    if (!selectedVoice) return;
    setIsPreviewing(true);
    try {
      if (WebSpeech.isAvailable()) {
        await WebSpeech.speak(previewText, selectedVoice, { rate: 1 });
        setIsPreviewing(false);
        return;
      }

      const r = await fetch(`${API_BASE}/api/tts/preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: previewText, voiceId: selectedVoice }),
      });
      if (r.ok) {
        const blob = await r.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.play();
      } else {
        const err = await r.json().catch(() => null);
        console.error('Preview failed', err);
        alert('Preview failed');
      }
    } catch (e) {
      console.error('Preview error', e);
      alert('Preview error');
    } finally {
      setIsPreviewing(false);
    }
  };

  function startPollingJob(jobId) {
    if (pollingRefs.current[jobId]) return; // already polling
    const poll = async () => {
      try {
        const r = await fetch(`/api/tts-job/${jobId}`);
        if (r.ok) {
          const data = await r.json();
          const job = data.job;
          if (job && job.status === 'completed') {
            // construct podcast item
        const completed = {
              id: job.job_id,
              fileName: job.file_path ? job.file_path.split('/').pop() : job.job_id,
              title: job.file_path ? job.file_path.split('/').pop().replace(/\.[^/.]+$/, '') : 'Podcast',
              date: job.updated_at ? job.updated_at.slice(0,10) : new Date().toISOString().slice(0,10),
              summary: job.summary || '',
              audio_base64: job.audio_base64 || null,
              audioURL: job.audio_url || (job.audio_base64 ? `data:audio/wav;base64,${job.audio_base64}` : null),
              tags: [],
              fullScript: job.summary || '',
          status: 'completed',
          voice: job.voice || selectedVoice,
            };
            if (onNewPodcast) onNewPodcast(completed, true);
            clearInterval(pollingRefs.current[jobId]);
            delete pollingRefs.current[jobId];
          } else if (job && job.status === 'failed') {
            // mark failed
            const failed = { id: job.job_id, fileName: job.file_path || job.job_id, title: 'Failed', date: job.updated_at, summary: 'Failed to generate', status: 'failed', voice: job.voice || selectedVoice };
            if (onNewPodcast) onNewPodcast(failed, true);
            clearInterval(pollingRefs.current[jobId]);
            delete pollingRefs.current[jobId];
          }
        }
      } catch (e) {
        console.error('Polling failed', e);
      }
    };
    // poll immediately then every 3s
    poll();
    pollingRefs.current[jobId] = setInterval(poll, 3000);
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold text-white mb-4 text-left">
        Upload Section
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">
        {/* Left: Upload box (top-left corner) */}
        <div className="col-span-1 w-full lg:w-auto lg:min-w-64">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`p-6 border-2 border-dashed rounded-xl transition-colors ${
              isDragging
                ? "border-indigo-400 bg-slate-700"
                : "border-slate-600 bg-slate-800"
            }`}
          >
            <div className="flex flex-col items-start">
              <UploadIcon
                className="w-8 h-8 mb-3"
                style={{ color: ACCENT_COLOR }}
              />
              <p className="text-base font-medium text-slate-300 text-left">
                Drag & Drop PDF or Text File Here
              </p>
              <p className="text-xs text-slate-400 mt-1 text-left">
                (.pdf, .txt only)
              </p>
              <div className="mt-3">
                <label
                  htmlFor="file-upload"
                  className="px-3 py-2 rounded bg-slate-700 text-sm text-white cursor-pointer hover:bg-slate-600"
                >
                  Choose File
                </label>
                <input
                  type="file"
                  id="file-upload"
                  accept=".pdf,.txt"
                  onChange={(e) => handleFileChange(e.target.files[0])}
                  className="hidden"
                />
                <span className="ml-3 text-sm text-slate-300">
                  {file ? file.name : ""}
                </span>
              </div>
            </div>
          </div>
        </div>

  {/* Right: File Details (appears after selecting file) */}
  <div className="col-span-1 lg:col-span-3 w-full lg:flex-1">
          {file && (
            <div className="bg-slate-800 p-6 rounded-xl shadow-xl">
              <h3 className="text-lg font-semibold text-white mb-4">
                File Details
              </h3>
              <div className="flex flex-col space-y-3">
                <div className="flex justify-between items-center text-slate-300 border-b border-slate-700 pb-2">
                  <span className="font-medium">{file.name}</span>
                  <span className="text-sm text-slate-400">
                    {formatFileSize(file.size)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span className="font-medium">Type:</span>
                  <span className="text-sm text-slate-400">
                    {file.type.split("/").pop().toUpperCase()}
                  </span>
                </div>
                {/* Voice selector & preview */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <label className="text-sm text-slate-300 font-medium">Voice:</label>
                    <select
                      value={selectedVoice}
                      onChange={(e) => setSelectedVoice(e.target.value)}
                      className="bg-slate-900 border border-slate-700 text-white rounded-lg p-1.5"
                    >
                      {voices && voices.length > 0 ? (
                        voices.map((v) => (
                          <option key={v.Id || v.Name} value={v.Name || v.Id}>
                            {v.Name || v.Id} {v.Gender ? `(${v.Gender})` : ""}
                          </option>
                        ))
                      ) : (
                        <option value="Joanna">Joanna</option>
                      )}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={previewText}
                      onChange={(e) => setPreviewText(e.target.value)}
                      className="bg-slate-900 border border-slate-700 text-white rounded-lg p-2 text-sm w-64"
                      placeholder="Preview text"
                    />
                    <button
                      onClick={handlePreview}
                      disabled={isPreviewing}
                      className="px-3 py-2 rounded bg-slate-700 text-white text-sm hover:bg-slate-600"
                    >
                      {isPreviewing ? "Previewing..." : "Preview Voice"}
                    </button>
                  </div>
                </div>
                <div className="pt-4 flex justify-between items-center">
                  <button
                    className="text-red-400 hover:text-red-500 text-sm font-medium transition-colors"
                    onClick={() => setFile(null)}
                  >
                    Remove File
                  </button>
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className={`px-6 py-3 rounded-lg font-bold text-white transition-all duration-300 shadow-md ${
                      isGenerating
                        ? "bg-indigo-600 cursor-not-allowed"
                        : "hover:opacity-90"
                    }`}
                    style={{ backgroundColor: ACCENT_COLOR }}
                  >
                    {isGenerating ? (
                      <div className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          ></path>
                        </svg>
                        Generating your podcast...
                      </div>
                    ) : (
                      "Generate Podcast"
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const MyPodcastsSection = ({ podcasts, onViewScript, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTag, setFilterTag] = useState("All");

  const uniqueTags = useMemo(
    () => ["All", ...new Set(podcasts.flatMap((p) => p.tags))],
    [podcasts]
  );

  const filteredPodcasts = useMemo(() => {
    return podcasts.filter((podcast) => {
      const matchesSearch =
        podcast.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        podcast.summary.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTag =
        filterTag === "All" || podcast.tags.includes(filterTag);
      return matchesSearch && matchesTag;
    });
  }, [podcasts, searchTerm, filterTag]);

  const availableTags = ["AI", "Math", "History", "Science"];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">My Podcasts</h2>

      {/* Filter / Search Bar */}
      <div className="bg-slate-800 p-4 rounded-xl shadow-xl">
        <div className="relative mb-4">
          <SearchIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Categories / Tags */}
        <p className="text-sm text-slate-400 mb-2">Categories / Tags</p>
        <div className="flex flex-wrap gap-2">
          {availableTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setFilterTag(tag)}
              className={`px-4 py-1 text-sm rounded-full font-medium transition-colors ${
                filterTag === tag
                  ? "text-white shadow-md"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
              style={filterTag === tag ? { backgroundColor: ACCENT_COLOR } : {}}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Podcast Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPodcasts.length > 0 ? (
          filteredPodcasts.map((podcast) => (
            <PodcastCard
              key={podcast.id}
              podcast={podcast}
              onViewScript={onViewScript}
              onDelete={onDelete}
            />
          ))
        ) : (
          <p className="text-slate-400 col-span-full text-center p-8 bg-slate-800 rounded-xl">
            No podcasts match your search or filter.
          </p>
        )}
      </div>
    </div>
  );
};

const RightPanel = ({ user }) => (
  <div className="space-y-6">
    {/* Activity Log removed per request - right column intentionally left minimal */}
  </div>
);

const Dashboard = () => {
  // --- FIREBASE STATE & INITIALIZATION ---
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [user, setUser] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const navigate = useNavigate();

  // --- APP STATE ---
  const [activePage, setActivePage] = useState("Upload");
  const [podcasts, setPodcasts] = useState(mockPodcasts); // Start with mock data
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: "", script: "" });
  const [darkMode, setDarkMode] = useState(true); // Default to dark mode as per design

  useEffect(() => {
    // 1. Initialize Firebase
    if (!Object.keys(firebaseConfig).length) {
      console.error("Firebase config is missing. Using mock data only.");
      setIsAuthReady(true);
      return;
    }

    try {
      const app = initializeApp(firebaseConfig);
      const firestore = getFirestore(app);
      const authInstance = getAuth(app);
      setDb(firestore);
      setAuth(authInstance);

      // 2. Handle initial auth
      const initializeAuth = async () => {
        try {
          if (
            typeof __initial_auth_token !== "undefined" &&
            __initial_auth_token
          ) {
            await signInWithCustomToken(authInstance, __initial_auth_token);
            console.log("Signed in with custom token.");
          } else {
            await signInAnonymously(authInstance);
            console.log("Signed in anonymously.");
          }
        } catch (error) {
          console.error("Firebase auth error:", error);
          // Fallback to anonymous sign-in if custom token fails
          await signInAnonymously(authInstance);
        }
      };

      // 3. Set up auth listener
      const unsubscribeAuth = onAuthStateChanged(
        authInstance,
        (currentUser) => {
          setUser(currentUser);
          setIsAuthReady(true);
          console.log("Auth state changed. User:", currentUser?.uid);
        }
      );

      initializeAuth();
      return () => unsubscribeAuth();
    } catch (error) {
      console.error("Failed to initialize Firebase:", error);
      setIsAuthReady(true);
    }
  }, []);

  // 4. Firestore Listener for Podcasts (using mock data if Firebase fails)
  useEffect(() => {
    if (!isAuthReady || !db || !user) {
      // Keep mock data if auth or DB isn't ready
      return;
    }

    const userId = user.uid;
    const path = getCollectionPath(userId);
    const podcastsCol = collection(db, path);

    // Mock: If using real Firestore, you would uncomment the following lines
    /*
        const q = query(podcastsCol);

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedPodcasts = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setPodcasts(fetchedPodcasts);
            console.log("Real-time podcast update received.");
        }, (error) => {
            console.error("Error listening to podcasts:", error);
            // On error, fall back to mock data
            setPodcasts(mockPodcasts);
        });

        return () => unsubscribe();
        */
  }, [isAuthReady, db, user]); // Depend on DB and authenticated user

  // --- HANDLERS ---

  const handleLogout = async () => {
    try {
      if (auth) {
        await signOut(auth);
      } else if (typeof firebaseAuth !== "undefined" && firebaseAuth) {
        await signOut(firebaseAuth);
      }
      setUser(null);
      console.log("User signed out.");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // After logout, navigate back to home
      try {
        navigate("/");
      } catch (e) {
        console.warn("Navigation to home failed:", e);
      }
    }
  };

  const handleViewScript = (podcast) => {
    // Debug log - ensure handler is invoked and podcast payload is present
    try {
      console.log("handleViewScript called with podcast:", podcast);
    } catch (e) {}

    // Ensure we always provide something to show in the modal
    const scriptText =
      podcast?.fullScript ||
      podcast?.script ||
      "No script available for this podcast.";
    setModalContent({
      title: podcast?.title || podcast?.fileName || "Script",
      script: scriptText,
    });
    setIsModalOpen(true);

    // Fallback: open a new browser window/tab with the script content so user definitely sees it
    try {
      const popup = window.open(
        "",
        "script_view",
        "width=700,height=600,scrollbars=yes"
      );
      if (popup) {
        const safeTitle = (
          podcast?.title ||
          podcast?.fileName ||
          "Script"
        ).replace(/</g, "&lt;");
        const safeScript = (scriptText || "No script available")
          .replace(/</g, "&lt;")
          .replace(/\n/g, "<br />");
        popup.document.title = safeTitle;
        popup.document.body.style.background = "#0b1220";
        popup.document.body.style.color = "#e6eef8";
        popup.document.body.style.fontFamily = "Inter, Arial, sans-serif";
        popup.document.body.style.padding = "18px";
        popup.document.body.innerHTML = `<h2 style=\"font-size:18px;margin-bottom:12px;\">${safeTitle}</h2><div style=\"white-space:pre-wrap;font-family:monospace;line-height:1.5;\">${safeScript}</div>`;
      }
    } catch (e) {
      // ignore popup errors (blocked by browser etc.)
      console.warn("Popup script window failed:", e);
    }
  };

  const handleDeletePodcast = async (id) => {
    console.log(`Attempting to delete podcast ID: ${id}`);

    // Optimistic UI update for mock/real data
    setPodcasts((prev) => prev.filter((p) => p.id !== id));

    // Mock: Real delete logic (uncomment for actual Firestore use)
    /*
        if (db && user) {
            try {
                const docRef = doc(db, getCollectionPath(user.uid), id);
                await deleteDoc(docRef);
                console.log("Podcast deleted successfully:", id);
            } catch (error) {
                console.error("Error deleting podcast:", error);
            }
        }
        */
  };

  // Add or update podcast entries from UploadSection polling
  const handleNewPodcast = (podcast, replace = false) => {
    setPodcasts((prev) => {
      if (replace) {
        // replace matching id or append
        const found = prev.find((p) => p.id === podcast.id);
        if (found) {
          return prev.map((p) => (p.id === podcast.id ? { ...p, ...podcast } : p));
        }
        return [podcast, ...prev];
      } else {
        // add pending at top if not exists
        if (prev.find((p) => p.id === podcast.id)) return prev;
        return [podcast, ...prev];
      }
    });
  };

  // --- SMALL HELPERS ---
  const getInitials = (u) => {
    if (!u) return "";
    if (u.displayName) {
      return u.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
    }
    if (u.email) return u.email[0].toUpperCase();
    return "";
  };

  // --- RENDER LOGIC ---

  const renderMainContent = () => {
    switch (activePage) {
      case "Upload":
        return <UploadSection onNewPodcast={handleNewPodcast} />;
      case "My Podcasts":
        return (
          <MyPodcastsSection
            podcasts={podcasts}
            onViewScript={handleViewScript}
            onDelete={handleDeletePodcast}
          />
        );
      /* Scripts page removed per user request */
      /* Profile panel removed per request */
      case "Settings":
        return (
          <div className="space-y-6">
            <div className="bg-slate-800 p-8 rounded-xl shadow-xl">
              <h2 className="text-2xl font-bold text-white mb-4">
                Application Settings
              </h2>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center">
                  <label className="text-slate-300">Voice Style Selector</label>
                  <select className="bg-slate-900 border border-slate-700 text-white rounded-lg p-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                    <option>Female AI (Neutral)</option>
                    <option>Male AI (Informative)</option>
                  </select>
                </div>

                {/* Summarization Length removed per user request */}

                <div className="flex justify-between items-center">
                  <label className="text-slate-300">Language Selection</label>
                  <select className="bg-slate-900 border border-slate-700 text-white rounded-lg p-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                    <option>English</option>
                    <option>Spanish</option>
                    <option>Japanese</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-slate-800 p-8 rounded-xl shadow-xl">
              <h2 className="text-2xl font-bold text-white mb-4">
                Playback Controls
              </h2>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center">
                  <label className="text-slate-300">Speed</label>
                  <div className="flex space-x-3 text-slate-300">
                    <button className="px-2 py-1 rounded hover:text-white">
                      0.75x
                    </button>
                    <button
                      className="px-2 py-1 rounded font-bold text-white"
                      style={{ color: ACCENT_COLOR }}
                    >
                      1x
                    </button>
                    <button className="px-2 py-1 rounded hover:text-white">
                      1.25x
                    </button>
                  </div>
                </div>

                {/* Note removed per user request */}
              </div>
            </div>
          </div>
        );
      default:
        return <UploadSection onNewPodcast={handleNewPodcast} />;
    }
  };

  if (!isAuthReady) {
    return (
      <div
        className={`flex items-center justify-center min-h-screen ${
          darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-800"
        }`}
      >
        <div className="flex items-center space-x-2">
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            style={{ color: ACCENT_COLOR }}
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            ></path>
          </svg>
          <span className="text-lg">Initializing...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`af-dashboard min-h-screen overflow-auto ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-800"
      } transition-colors duration-300 font-sans`}
    >
      <style>{`
                /* Custom scrollbar for dark theme */
                ::-webkit-scrollbar {
                    width: 8px;
                }
                ::-webkit-scrollbar-track {
                    background: ${BG_COLOR};
                }
                ::-webkit-scrollbar-thumb {
                    background: #475569; /* Slightly darker grey for scrollbar in dark mode */
                    border-radius: 4px;
                }
                ::-webkit-scrollbar-thumb:hover {
                    background: #64748b;
                }
                /* Hide default audio controls on Chrome */
                audio::-webkit-media-controls-enclosure {
                    border-radius: 10px;
                    background-color: ${CARD_COLOR};
                }
            `}</style>
      <div className={`flex h-full`}>
        {/* Sidebar Navigation (Fixed) */}
        <aside
          className="w-64 min-h-full p-6 flex flex-col justify-between shadow-2xl z-10"
          style={{ backgroundColor: BG_COLOR }}
        >
          <div>
            {/* Compact profile/brand icon at top */}
            {(() => {
              const initial = getInitials(user).slice(0, 1);
              if (!initial) return null;
              return (
                <div className="sidebar-top-icon mb-4 flex items-center justify-center">
                  <div
                    className="compact-icon"
                    style={{
                      backgroundColor: ACCENT_COLOR,
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span className="compact-initial">{initial}</span>
                  </div>
                </div>
              );
            })()}

            {/* Profile removed to increase visible nav items */}

            {/* Navigation Items */}
            <nav className="space-y-2">
              <SidebarItem
                icon={UploadIcon}
                label="Upload"
                isActive={activePage === "Upload"}
                onClick={() => setActivePage("Upload")}
              />
              <SidebarItem
                icon={PodcastsIcon}
                label="My Podcasts"
                isActive={activePage === "My Podcasts"}
                onClick={() => setActivePage("My Podcasts")}
              />
              {/* Scripts section removed per user request */}
              <SidebarItem
                icon={SettingsIcon}
                label="Settings"
                isActive={activePage === "Settings"}
                onClick={() => setActivePage("Settings")}
              />
              {/* Profile navigation removed */}
              <SidebarItem
                icon={LogoutIcon}
                label="Logout"
                isActive={false}
                onClick={handleLogout}
              />
            </nav>
          </div>

          {/* Dark/Light mode toggle removed per design request */}
        </aside>

  {/* Main Content Area */}
  {/* remove inner scroll on main so the page uses a single scrollbar */}
  <main className="flex-1 p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left/Central Column (Takes full space for upload, other content centered) */}
            <div
              className={`${
                activePage === "Upload" ? "lg:col-span-3" : "lg:col-span-2"
              } space-y-8`}
            >
              {renderMainContent()}
            </div>

            {/* Right Column (Takes 1/3 space) */}
            <div className="lg:col-span-1 space-y-8">
              <RightPanel user={user} />
            </div>
          </div>
        </main>
      </div>

      <PodcastScriptModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        script={modalContent.script}
        title={modalContent.title}
      />
    </div>
  );
};

export default Dashboard;
