import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Paperclip,
  Image as ImageIcon,
  X,
  Crown,
  CheckCheck,
  Trash2,
  Users,
  Smile,
  ShieldAlert,
  User,
  Edit2,
  Sparkles,
} from 'lucide-react';
import { ChatMessage } from '../types.ts';
import {
  subscribeToMessages,
  sendMessageToDb,
  deleteMessageFromDb,
} from '../services/firestoreService.ts';

interface GBChatProps {
  currentUser: {
    name: string;
    id: string;
    isOwner?: boolean;
    isAdmin?: boolean;
    email?: string;
  };
}

export const GBChat: React.FC<GBChatProps> = ({ currentUser }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [selectedImageModal, setSelectedImageModal] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Student Name Gate State
  const [studentName, setStudentName] = useState<string>(() => {
    if (currentUser.isOwner) return currentUser.name || 'Sarvottam Yadav';
    return localStorage.getItem('gb_student_chat_name') || '';
  });

  const [showNameModal, setShowNameModal] = useState<boolean>(() => {
    if (currentUser.isOwner) return false;
    const saved = localStorage.getItem('gb_student_chat_name');
    return !saved || saved.trim() === '';
  });

  const [nameInput, setNameInput] = useState('');
  const [examInput, setExamInput] = useState('NEET');

  // Subscribe to real-time messages across all devices
  useEffect(() => {
    const unsub = subscribeToMessages((liveMessages) => {
      setMessages(liveMessages);
    });
    return () => unsub();
  }, []);

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSaveStudentName = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = nameInput.trim();
    if (!clean) return;
    const finalName = examInput && examInput !== 'General' ? `${clean} (${examInput})` : clean;
    localStorage.setItem('gb_student_chat_name', finalName);
    setStudentName(finalName);
    setShowNameModal(false);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 800;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.82);
          setAttachedImage(compressed);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if student has entered their name
    if (!currentUser.isOwner && (!studentName || !studentName.trim())) {
      setShowNameModal(true);
      return;
    }

    const textToSend = inputText.trim();
    const imageToSend = attachedImage;
    if (!textToSend && !imageToSend) return;

    const senderDisplayName = currentUser.isOwner
      ? 'Sarvottam Yadav'
      : studentName || currentUser.name || 'Student';

    const newMsg: ChatMessage = {
      id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6),
      text: textToSend || undefined,
      imageUrl: imageToSend || undefined,
      senderName: senderDisplayName,
      senderId: currentUser.id || 'student-user',
      senderEmail: currentUser.email || '',
      isOwner: currentUser.isOwner || false,
      isAdmin: currentUser.isAdmin || false,
      avatar: currentUser.isOwner ? '/assets/gb_study_icon.png' : undefined,
      createdAt: new Date().toISOString(),
    };

    // Optimistic UI update
    setMessages((prev) => {
      if (prev.some((m) => m.id === newMsg.id)) return prev;
      return [...prev, newMsg];
    });
    setInputText('');
    setAttachedImage(null);
    setIsSending(true);

    try {
      await sendMessageToDb(newMsg);
    } catch (err) {
      console.error('Failed to broadcast message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteMessage = async (msgId: string) => {
    if (confirm('Delete this message?')) {
      try {
        await deleteMessageFromDb(msgId);
      } catch (err) {
        console.error('Error deleting message:', err);
      }
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#070a11] text-white relative overflow-hidden select-text">
      {/* Telegram-style Top Header */}
      <div className="px-4 py-2.5 bg-[#0f1422] border-b border-slate-800 flex items-center justify-between shrink-0 shadow-md">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full overflow-hidden border border-sky-400/40 p-0.5 bg-black shrink-0">
            <img
              src="/assets/gb_study_icon.png"
              alt="Group Icon"
              className="w-full h-full object-cover rounded-full"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-black" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-black text-white leading-tight">
                GB Study Discussion Group
              </h2>
              <span className="px-1.5 py-0.2 rounded-full bg-sky-500/20 text-sky-400 text-[9px] font-bold">
                Official
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
              <span className="text-emerald-400 font-bold">Live Synced</span>
              <span>•</span>
              <span>3,420 students</span>
            </div>
          </div>
        </div>

        {/* Student Name / Profile Badge */}
        <div className="flex items-center gap-2">
          {currentUser.isOwner ? (
            <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-bold flex items-center gap-1">
              <Crown className="w-3 h-3 text-amber-400" />
              <span>Sarvottam (Owner)</span>
            </span>
          ) : (
            <button
              onClick={() => {
                setNameInput(studentName.replace(/\s*\([^)]*\)$/, ''));
                setShowNameModal(true);
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold transition-colors cursor-pointer border border-slate-700 max-w-[130px]"
              title="Click to edit your display name"
            >
              <User className="w-3 h-3 text-sky-400 shrink-0" />
              <span className="truncate">{studentName || 'Apna Naam Likhein'}</span>
              <Edit2 className="w-2.5 h-2.5 text-slate-400 shrink-0" />
            </button>
          )}
        </div>
      </div>

      {/* Messages Stream Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-3.5 space-y-3">
        {/* Date Divider */}
        <div className="flex justify-center my-2">
          <span className="px-3 py-1 rounded-full bg-[#12192a]/90 border border-slate-800 text-[11px] font-semibold text-slate-400 shadow-sm">
            Live Student Discussion
          </span>
        </div>

        {messages.map((msg) => {
          const isMine =
            msg.senderId === currentUser.id ||
            (!currentUser.isOwner && studentName && msg.senderName === studentName);
          const isOwnerMsg = msg.isOwner || msg.senderEmail === 'sarvottamyadav789@gmail.com';

          return (
            <div
              key={msg.id}
              className={`flex flex-col group ${isMine ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-[20px] p-3 shadow-md relative transition-all ${
                  isMine
                    ? 'bg-gradient-to-br from-sky-600 to-blue-700 text-white rounded-br-xs'
                    : isOwnerMsg
                    ? 'bg-[#151c2d] border border-amber-500/50 text-slate-100 rounded-bl-xs shadow-[0_0_15px_rgba(245,158,11,0.1)]'
                    : 'bg-[#141b2a] border border-slate-800 text-slate-100 rounded-bl-xs'
                }`}
              >
                {/* Sender Name & Badges */}
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-xs font-bold ${
                        isMine
                          ? 'text-sky-200'
                          : isOwnerMsg
                          ? 'text-amber-400 font-black'
                          : 'text-sky-400'
                      }`}
                    >
                      {msg.senderName}
                    </span>
                    {isOwnerMsg && (
                      <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[9px] font-black uppercase tracking-wider flex items-center gap-0.5 border border-amber-500/30">
                        <Crown className="w-2.5 h-2.5 text-amber-400" />
                        <span>Owner</span>
                      </span>
                    )}
                  </div>

                  {(isMine || currentUser.isOwner) && (
                    <button
                      onClick={() => handleDeleteMessage(msg.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-400 transition-opacity cursor-pointer"
                      title="Delete message"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Message Image if any */}
                {msg.imageUrl && (
                  <div
                    onClick={() => setSelectedImageModal(msg.imageUrl || null)}
                    className="mb-2 rounded-xl overflow-hidden cursor-pointer border border-white/10 max-h-60 max-w-xs"
                  >
                    <img
                      src={msg.imageUrl}
                      alt="Attachment"
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </div>
                )}

                {/* Text Content */}
                {msg.text && (
                  <p className="text-sm font-normal leading-relaxed whitespace-pre-wrap break-words">
                    {msg.text}
                  </p>
                )}

                {/* Timestamp & Read ticks */}
                <div className="flex items-center justify-end gap-1 mt-1 opacity-70 text-[10px]">
                  <span>{formatTime(msg.createdAt)}</span>
                  {isMine && <CheckCheck className="w-3.5 h-3.5 text-sky-200" />}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Image Attachment Preview Bar */}
      {attachedImage && (
        <div className="px-4 py-2 bg-[#0c101c] border-t border-slate-800 flex items-center gap-3">
          <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-sky-400 shrink-0">
            <img src={attachedImage} alt="Upload preview" className="w-full h-full object-cover" />
            <button
              onClick={() => setAttachedImage(null)}
              className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-black/80 text-white hover:text-rose-400"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <span className="text-xs text-slate-300">Photo attached (ready to send)</span>
        </div>
      )}

      {/* Bottom Message Input Bar */}
      <form
        onSubmit={handleSendMessage}
        className="p-3 bg-[#0f1422] border-t border-slate-800 flex items-center gap-2 shrink-0"
      >
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageSelect}
          accept="image/*"
          className="hidden"
        />

        {/* Attachment Button */}
        <button
          type="button"
          onClick={() => {
            if (!currentUser.isOwner && (!studentName || !studentName.trim())) {
              setShowNameModal(true);
              return;
            }
            fileInputRef.current?.click();
          }}
          className="p-2.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          title="Attach Photo"
        >
          <Paperclip className="w-4 h-4" />
        </button>

        {/* Input Text Box */}
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onFocus={() => {
            if (!currentUser.isOwner && (!studentName || !studentName.trim())) {
              setShowNameModal(true);
            }
          }}
          placeholder={
            currentUser.isOwner
              ? 'Send official announcement as Sarvottam Yadav...'
              : studentName
              ? `Write message as ${studentName}...`
              : 'Apna naam enter karein discussion ke liye...'
          }
          className="flex-1 px-4 py-2.5 rounded-full bg-[#162035] border border-slate-700/60 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-sky-400"
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={isSending || (!inputText.trim() && !attachedImage)}
          className="w-10 h-10 rounded-full bg-sky-500 hover:bg-sky-400 text-slate-950 flex items-center justify-center transition-all disabled:opacity-40 shadow-md cursor-pointer active:scale-95 shrink-0 font-bold"
        >
          <Send className="w-4 h-4 fill-current translate-x-0.5" />
        </button>
      </form>

      {/* ============================================================== */}
      {/* STUDENT NAME ENTRY MODAL (REQUIRED BEFORE CHAT ACCESS)         */}
      {/* ============================================================== */}
      {showNameModal && !currentUser.isOwner && (
        <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-[28px] bg-[#111728] border border-sky-500/40 p-6 shadow-2xl flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white mb-4 shadow-lg shadow-sky-500/30">
              <Users className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-black text-white">GB Study Discussion 💬</h3>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
              Doubt puchhne aur group me charcha karne ke liye kripya pehle apna poora naam enter karein:
            </p>

            <form onSubmit={handleSaveStudentName} className="w-full mt-5 space-y-3.5 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Aapka Poora Naam (Your Full Name) *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    autoFocus
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Jaise: Rahul Sharma, Priya Singh..."
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#162035] border border-slate-700 text-white text-sm focus:outline-none focus:border-sky-400 placeholder:text-slate-500"
                  />
                  <User className="w-4 h-4 text-sky-400 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Target Exam / Class
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['NEET', 'JEE', '12th Board', '11th Board', '10th', 'General'].map((chip) => (
                    <button
                      type="button"
                      key={chip}
                      onClick={() => setExamInput(chip)}
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        examInput === chip
                          ? 'bg-sky-500 text-slate-950 font-black shadow-sm'
                          : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={!nameInput.trim()}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-300 hover:to-blue-400 text-slate-950 font-black text-sm shadow-lg shadow-sky-500/25 active:scale-95 transition-all cursor-pointer disabled:opacity-40 mt-2"
              >
                Join Discussion / Aage Badhein 🚀
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Fullscreen Image Preview Modal */}
      {selectedImageModal && (
        <div
          onClick={() => setSelectedImageModal(null)}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-lg max-h-[85vh]">
            <img
              src={selectedImageModal}
              alt="Full Preview"
              className="w-full h-full object-contain rounded-2xl"
            />
            <button
              onClick={() => setSelectedImageModal(null)}
              className="absolute top-2 right-2 p-2 rounded-full bg-black/70 text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
