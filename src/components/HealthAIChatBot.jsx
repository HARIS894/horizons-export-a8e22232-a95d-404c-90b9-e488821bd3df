import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Paperclip, Loader2, AlertTriangle, FileText, Bot, ChevronDown, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

const HealthAIChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      role: 'ai', 
      text: "Hi! I'm your InstantCare Health Assistant. I can help you find nurses, understand basic health info, or book services. How can I help you today?" 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmergency, setIsEmergency] = useState(false);
  const [isQuotaExceeded, setIsQuotaExceeded] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const sendingRef = useRef(false); // Ref to track in-flight requests
  
  const { toast } = useToast();
  const navigate = useNavigate();

  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({ title: "File too large", description: "Please upload files smaller than 5MB", variant: "destructive" });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    
    // Prevent empty sends, duplicate requests, or sends when quota is exceeded
    if ((!input.trim() && !selectedFile) || isLoading || sendingRef.current || isQuotaExceeded) return;

    const userMessageText = input.trim();
    const currentFile = selectedFile;
    
    // Clear input immediately
    setInput('');
    setSelectedFile(null);

    // Add User Message
    const newUserMsg = { 
      id: Date.now(), 
      role: 'user', 
      text: userMessageText,
      file: currentFile ? currentFile.name : null
    };
    
    setMessages(prev => [...prev, newUserMsg]);
    setIsLoading(true);
    sendingRef.current = true;

    try {
      if (!API_KEY) {
        throw new Error("Missing API Key. Please check your configuration.");
      }

      // System Instruction
      const systemInstruction = `
        You are an AI Health Assistant for "InstantCare", a home healthcare service in India.
        
        YOUR ROLE:
        - Provide general health info and guidance.
        - Assist with booking nurses/staff.
        - Interpret summaries of lab reports (if text is provided).
        - STRICTLY NEVER provide medical diagnoses or prescribe meds.
        - ALWAYS advise consulting a doctor.
        
        CRITICAL EMERGENCY DETECTION:
        - If user mentions: chest pain, difficulty breathing, severe bleeding, stroke symptoms, unconsciousness, suicide, or "emergency".
        - ACTION: Start response with "EMERGENCY_DETECTED" followed by a newline.
        - Advise calling ambulance (102/108).
        
        INTENT DETECTION:
        - If user wants to book a nurse: include "ACTION_BOOK_NURSE" in text.
        - If user provides 6-digit pincode: include "DETECTED_PINCODE: [pincode]".
        
        Keep responses concise, helpful, and empathetic.
      `;

      // Prepare context including file info
      let fileContext = "";
      if (currentFile) {
        fileContext = `[User attached file: ${currentFile.name}. Treat this as if the user shared a document/report context related to their health query.]\n`;
      }

      const fullPrompt = `${systemInstruction}\n\n${fileContext}\nUser Message: ${userMessageText}`;

      // V1 API Call to Gemini 2.5 Flash
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: fullPrompt }
              ]
            }]
          })
        }
      );

      // Handle 429 specifically before parsing JSON
      if (response.status === 429) {
        throw new Error("API_QUOTA_EXCEEDED");
      }

      const data = await response.json();

      if (!response.ok) {
        // Check for quota errors in the response body as well
        if (data.error?.code === 429 || data.error?.status === 'RESOURCE_EXHAUSTED') {
          throw new Error("API_QUOTA_EXCEEDED");
        }
        throw new Error(data.error?.message || 'Failed to fetch from Gemini API');
      }

      // Safely extract text
      const aiResponseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "I apologize, I couldn't process that request.";

      // Parse special actions
      let reply = aiResponseText;
      let emergencyDetected = false;
      let action = null;
      let detectedPincode = null;

      if (reply.includes("EMERGENCY_DETECTED")) {
        emergencyDetected = true;
        reply = reply.replace("EMERGENCY_DETECTED", "").trim();
      }

      if (reply.includes("ACTION_BOOK_NURSE")) {
        action = "BOOK_NURSE";
        reply = reply.replace("ACTION_BOOK_NURSE", "").trim();
      }

      const pincodeMatch = reply.match(/DETECTED_PINCODE:\s*(\d{6})/);
      if (pincodeMatch) {
        detectedPincode = pincodeMatch[1];
        reply = reply.replace(pincodeMatch[0], "").trim();
        if (!action) action = "SEARCH_NEARBY";
      }

      setIsEmergency(emergencyDetected);

      // Add AI Response
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        role: 'ai', 
        text: reply,
        isEmergency: emergencyDetected
      }]);

      // Handle Actions
      if (action === 'BOOK_NURSE') {
        setTimeout(() => {
          setIsOpen(false);
          navigate('/book');
          toast({ title: "Redirecting...", description: "Taking you to the booking page." });
        }, 2000);
      } else if (action === 'SEARCH_NEARBY' && detectedPincode) {
         const searchEvent = new CustomEvent('searchNearbyNurse', { 
          detail: { pincode: detectedPincode } 
        });
        window.dispatchEvent(searchEvent);
        
        // Navigation logic for homepage scroll
        if (window.location.pathname !== '/') {
           navigate('/');
           setTimeout(() => {
              document.getElementById('nearby-nurse')?.scrollIntoView({ behavior: 'smooth'});
           }, 800);
        } else {
           document.getElementById('nearby-nurse')?.scrollIntoView({ behavior: 'smooth'});
        }
      }

    } catch (err) {
      console.error("Gemini API Error:", err);
      let errorMessage = "I'm having trouble connecting to my brain right now. Please try again in a moment.";
      
      // Specific handling for Quota Exceeded
      if (err.message === "API_QUOTA_EXCEEDED" || err.message?.includes('429') || err.message?.includes('RESOURCE_EXHAUSTED')) {
        errorMessage = "I'm currently experiencing very high traffic and have reached my capacity limit. Please try again in a few minutes.";
        setIsQuotaExceeded(true);
        // Auto-reset quota error after 1 minute to allow retries
        setTimeout(() => setIsQuotaExceeded(false), 60000);
      }
      
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        role: 'ai', 
        text: errorMessage,
        isError: true
      }]);
    } finally {
      setIsLoading(false);
      sendingRef.current = false;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-24 right-6 z-[140] w-14 h-14 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110"
        >
          <Bot className="w-8 h-8" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse border-2 border-white"></span>
        </motion.button>
      )}

      {/* Chat Interface */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: 20, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-[150] w-[90vw] md:w-[400px] h-[600px] max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden font-sans"
          >
            {/* Header */}
            <div className={`p-4 flex items-center justify-between ${isEmergency ? 'bg-red-600' : 'bg-[#7C3AED]'} text-white transition-colors duration-500`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight">AI Health Assistant</h3>
                  <p className="text-xs text-white/80 flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${isQuotaExceeded ? 'bg-yellow-400' : 'bg-green-400 animate-pulse'}`}></span> 
                    {isQuotaExceeded ? 'High Traffic' : 'Online'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <ChevronDown className="w-6 h-6" />
              </button>
            </div>

            {/* Disclaimer Banner */}
            <div className="bg-blue-50 p-2 px-4 flex items-start gap-2 border-b border-blue-100">
              <AlertTriangle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <p className="text-[10px] text-blue-700 leading-tight">
                <strong>Disclaimer:</strong> AI provides general info only. Not a substitute for professional medical advice. In emergencies, call 108.
              </p>
            </div>

            {/* Emergency Banner */}
            {isEmergency && (
              <motion.div 
                initial={{ height: 0 }} 
                animate={{ height: 'auto' }}
                className="bg-red-100 border-b border-red-200 p-3 flex items-center gap-3"
              >
                <AlertTriangle className="w-5 h-5 text-red-600 animate-bounce" />
                <div>
                  <p className="font-bold text-red-700 text-sm">Emergency Detected!</p>
                  <p className="text-xs text-red-600">Please call an ambulance immediately.</p>
                </div>
                <Button size="sm" variant="destructive" className="ml-auto h-8 text-xs" onClick={() => window.open('tel:102')}>
                  Call 102
                </Button>
              </motion.div>
            )}

            {/* Quota Exceeded Banner */}
            {isQuotaExceeded && (
              <motion.div 
                initial={{ height: 0 }} 
                animate={{ height: 'auto' }}
                className="bg-yellow-50 border-b border-yellow-200 p-3 flex items-center gap-3"
              >
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="font-bold text-yellow-700 text-sm">System Busy</p>
                  <p className="text-xs text-yellow-600">We are experiencing high traffic. Please try again later.</p>
                </div>
              </motion.div>
            )}

            {/* Messages Area */}
            <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-50/50">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`
                      max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap
                      ${msg.role === 'user' 
                        ? 'bg-[#7C3AED] text-white rounded-br-none' 
                        : msg.isEmergency 
                          ? 'bg-red-50 border border-red-200 text-gray-900 rounded-bl-none'
                          : msg.isError
                            ? 'bg-red-50 border border-red-200 text-red-800 rounded-bl-none'
                            : 'bg-white border border-gray-100 text-gray-800 rounded-bl-none'
                      }
                    `}
                  >
                    {msg.file && (
                      <div className="flex items-center gap-2 mb-2 p-2 bg-black/10 rounded-lg text-xs">
                        <FileText className="w-4 h-4" />
                        <span className="truncate max-w-[150px]">{msg.file}</span>
                      </div>
                    )}
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-[#7C3AED]" />
                    <span className="text-xs text-gray-500">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white border-t border-gray-100">
              {selectedFile && (
                <div className="flex items-center justify-between bg-gray-50 p-2 rounded-lg mb-2 text-xs border border-gray-200">
                  <div className="flex items-center gap-2">
                    <FileText className="w-3 h-3 text-[#7C3AED]" />
                    <span className="truncate max-w-[200px] text-gray-700">{selectedFile.name}</span>
                  </div>
                  <button onClick={() => setSelectedFile(null)} className="text-gray-400 hover:text-red-500">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              
              <div className="flex gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                  accept="image/*,.pdf,.txt"
                  disabled={isQuotaExceeded}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isQuotaExceeded}
                  className={`p-3 rounded-xl transition-colors ${isQuotaExceeded ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-[#7C3AED] hover:bg-purple-50'}`}
                  title="Upload Report/Image"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isQuotaExceeded}
                  placeholder={isQuotaExceeded ? "Chat unavailable due to high traffic" : (isEmergency ? "Describe emergency..." : "Type your health query...")}
                  className={`flex-grow bg-gray-50 text-gray-900 placeholder:text-gray-400 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] transition-all text-sm resize-none h-12 max-h-24 ${isQuotaExceeded ? 'opacity-50 cursor-not-allowed' : ''}`}
                  rows={1}
                />
                
                <Button 
                  onClick={handleSendMessage}
                  disabled={isLoading || (!input.trim() && !selectedFile) || isQuotaExceeded}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md transition-all ${isLoading || isQuotaExceeded ? 'bg-gray-100' : 'bg-[#7C3AED] hover:bg-[#6D28D9] text-white'}`}
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-gray-400" /> : <Send className={`w-5 h-5 ml-0.5 ${isQuotaExceeded ? 'text-gray-300' : ''}`} />}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default HealthAIChatBot;