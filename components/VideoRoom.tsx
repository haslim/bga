
import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Video, VideoOff, Monitor, PhoneOff, MessageSquare, Users, MoreVertical, Send } from 'lucide-react';

interface VideoRoomProps {
  meetingId: string;
  participantName: string;
  onLeave: () => void;
}

export const VideoRoom: React.FC<VideoRoomProps> = ({ meetingId, participantName, onLeave }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<{sender: string, text: string, time: string}[]>([
      { sender: 'Sistem', text: 'Oturum başladı. Kayıt altındadır.', time: '10:00' }
  ]);
  const [newMessage, setNewMessage] = useState('');

  const participants = [
      { name: participantName, isSelf: true, isMuted, isVideoOff },
      { name: 'Karşı Taraf Vekili', isSelf: false, isMuted: true, isVideoOff: false },
      { name: 'Müvekkil', isSelf: false, isMuted: false, isVideoOff: true },
  ];

  const handleSendMessage = (e: React.FormEvent) => {
      e.preventDefault();
      if(!newMessage.trim()) return;
      setMessages([...messages, {
          sender: participantName,
          text: newMessage,
          time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      }]);
      setNewMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900 text-white flex flex-col animate-in fade-in">
       {/* Header */}
       <div className="h-14 bg-slate-800 flex items-center justify-between px-4 border-b border-slate-700">
           <div className="flex items-center space-x-2">
               <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
               <span className="font-bold text-sm">KAYITTA</span>
               <span className="text-slate-400 mx-2">|</span>
               <span className="font-medium">Arabuluculuk Oturumu #{meetingId}</span>
           </div>
           <div className="flex items-center space-x-2 text-sm">
               <Users className="w-4 h-4" />
               <span>{participants.length} Katılımcı</span>
           </div>
       </div>

       {/* Main Area */}
       <div className="flex-1 flex overflow-hidden">
           {/* Video Grid */}
           <div className="flex-1 p-4 grid grid-cols-2 gap-4 overflow-y-auto">
                {participants.map((p, idx) => (
                    <div key={idx} className="relative bg-slate-800 rounded-xl overflow-hidden flex items-center justify-center border border-slate-700 aspect-video group">
                        {p.isVideoOff ? (
                             <div className="w-20 h-20 rounded-full bg-slate-600 flex items-center justify-center text-2xl font-bold">
                                 {p.name.charAt(0)}
                             </div>
                        ) : (
                            // Mock Video Feed
                            <div className="absolute inset-0 bg-gradient-to-b from-slate-700 to-slate-800 flex items-center justify-center">
                                <span className="text-slate-500 opacity-20 text-6xl font-bold select-none">VIDEO</span>
                            </div>
                        )}
                        
                        {/* Overlay Info */}
                        <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded-lg text-sm backdrop-blur-sm flex items-center">
                            {p.isMuted ? <MicOff className="w-3 h-3 text-red-400 mr-2" /> : <Mic className="w-3 h-3 text-green-400 mr-2" />}
                            {p.name} {p.isSelf && '(Siz)'}
                        </div>
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition">
                             <button className="p-2 bg-slate-900/50 rounded-full hover:bg-slate-700"><MoreVertical className="w-4 h-4" /></button>
                        </div>
                    </div>
                ))}
           </div>

           {/* Chat Sidebar */}
           {showChat && (
               <div className="w-80 bg-slate-800 border-l border-slate-700 flex flex-col animate-in slide-in-from-right">
                   <div className="p-4 border-b border-slate-700 font-bold">Sohbet</div>
                   <div className="flex-1 overflow-y-auto p-4 space-y-4">
                       {messages.map((m, i) => (
                           <div key={i} className="flex flex-col">
                               <div className="flex justify-between text-xs text-slate-400 mb-1">
                                   <span>{m.sender}</span>
                                   <span>{m.time}</span>
                               </div>
                               <div className="bg-slate-700 p-2 rounded-lg text-sm">
                                   {m.text}
                               </div>
                           </div>
                       ))}
                   </div>
                   <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-700 flex gap-2">
                       <input 
                        type="text" 
                        className="flex-1 bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm outline-none focus:border-blue-500"
                        placeholder="Mesaj yaz..."
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                       />
                       <button type="submit" className="p-2 bg-blue-600 rounded hover:bg-blue-700"><Send className="w-4 h-4" /></button>
                   </form>
               </div>
           )}
       </div>

       {/* Controls Footer */}
       <div className="h-20 bg-slate-800 border-t border-slate-700 flex items-center justify-center space-x-4">
            <button 
                onClick={() => setIsMuted(!isMuted)}
                className={`p-4 rounded-full transition ${isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-slate-700 hover:bg-slate-600'}`}
            >
                {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>
            <button 
                onClick={() => setIsVideoOff(!isVideoOff)}
                className={`p-4 rounded-full transition ${isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-slate-700 hover:bg-slate-600'}`}
            >
                {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
            </button>
             <button 
                onClick={() => setIsScreenSharing(!isScreenSharing)}
                className={`p-4 rounded-full transition ${isScreenSharing ? 'bg-green-500 hover:bg-green-600' : 'bg-slate-700 hover:bg-slate-600'}`}
                title="Ekran Paylaş"
            >
                <Monitor className="w-6 h-6" />
            </button>
            <button 
                onClick={() => setShowChat(!showChat)}
                className={`p-4 rounded-full transition ${showChat ? 'bg-blue-500 hover:bg-blue-600' : 'bg-slate-700 hover:bg-slate-600'}`}
            >
                <MessageSquare className="w-6 h-6" />
            </button>
            
            <div className="w-px h-8 bg-slate-600 mx-4"></div>
            
            <button 
                onClick={onLeave}
                className="px-6 py-3 rounded-full bg-red-600 hover:bg-red-700 font-bold flex items-center"
            >
                <PhoneOff className="w-5 h-5 mr-2" />
                Görüşmeyi Sonlandır
            </button>
       </div>
    </div>
  );
};
