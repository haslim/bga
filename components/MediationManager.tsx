
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useData } from '../DataContext';
import { Mediation, MediationStatus, MediationMeeting, Template, TemplateType, MediatorProfile, Document, MediationParty } from '../types';
import { processTemplate } from '../utils';
import { VideoRoom } from './VideoRoom';
import { Handshake, Plus, Search, Filter, ArrowLeft, ArrowRight, User, Printer, Clock, Save, FileText, X, Calendar, FileSignature, Scale, MessageSquare, Settings, Edit3, CreditCard, MapPin, Mail, Phone, CheckCircle2, XCircle, Activity, Users, Trash2, Bold, Italic, Underline, AlignCenter, List, Type, Code, Eye, Columns, LayoutTemplate, Image as ImageIcon, Bell, Video, PenTool, Send, Loader2, AlertTriangle, Check, FileCheck, Briefcase, ChevronDown } from 'lucide-react';

// Helper for Portal
const Portal = ({ children }: { children?: React.ReactNode }) => {
  return children ? createPortal(children, document.body) : null;
};

export const MediationManager: React.FC = () => {
  const { mediations, addMediation, updateMediation, deleteMediation, templates, updateTemplate, mediatorProfile, updateMediatorProfile, notificationSettings, addNotification, siteSettings } = useData();
  
  const [selectedMediation, setSelectedMediation] = useState<Mediation | null>(null);
  const [activeMediationData, setActiveMediationData] = useState<Mediation | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'sessions' | 'documents' | 'notes'>('overview');
  
  // Modal/Form states
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isTemplateEditorOpen, setIsTemplateEditorOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false); // Oturum iptal/erteleme
  const [isReportModalOpen, setIsReportModalOpen] = useState(false); // Report Modal
  
  // Minute Selection State
  const [isMinuteSelectionOpen, setIsMinuteSelectionOpen] = useState(false);

  const [meetingToCancel, setMeetingToCancel] = useState<MediationMeeting | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  
  // Edit Parties Modal State
  const [isEditPartiesModalOpen, setIsEditPartiesModalOpen] = useState(false);
  // Helper type for local state
  type PartyRow = { name: string; phone: string; representative: string; representativePhone: string; tcVkn: string; address: string; email: string; };
  const [editApplicantList, setEditApplicantList] = useState<PartyRow[]>([]);
  const [editCounterPartyList, setEditCounterPartyList] = useState<PartyRow[]>([]);

  // Sending States
  const [sendingType, setSendingType] = useState<'Davet' | 'Ucret' | null>(null);
  const [isSendingWorkflow, setIsSendingWorkflow] = useState(false);

  // Online Meeting
  const [activeVideoMeeting, setActiveVideoMeeting] = useState<string | null>(null);

  // Template Stuff
  const [templatePreviewContent, setTemplatePreviewContent] = useState('');
  const [selectedTemplateToEdit, setSelectedTemplateToEdit] = useState<Template | null>(null);
  const [editedTemplateContent, setEditedTemplateContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // New Meeting Form
  const [newMeeting, setNewMeeting] = useState<Partial<MediationMeeting>>({ 
      date: '', participants: '', notes: '', type: 'Fiziksel', location: 'Ofis Toplantı Odası', link: '' 
  });
  
  // New Application Form & Dynamic Parties
  const [newApplication, setNewApplication] = useState<Partial<Mediation>>({
      subject: '', mediatorName: '', fileNumber: '', mediationNumber: '' // Added mediationNumber
  });
  // Updated state to include representative info
  const [applicantList, setApplicantList] = useState<PartyRow[]>([{name: '', phone: '', representative: '', representativePhone: '', tcVkn: '', address: '', email: ''}]);
  const [counterPartyList, setCounterPartyList] = useState<PartyRow[]>([{name: '', phone: '', representative: '', representativePhone: '', tcVkn: '', address: '', email: ''}]);

  // E-Signature Simulation State
  const [signingDocId, setSigningDocId] = useState<string | null>(null);

  useEffect(() => {
    if (selectedMediation) {
        const freshData = mediations.find(m => m.id === selectedMediation.id);
        setActiveMediationData(freshData || null);
    } else {
        setActiveMediationData(null);
    }
  }, [selectedMediation, mediations]);
  
  const filteredMediations = mediations.filter(m => 
    m.fileNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.mediationNumber && m.mediationNumber.toLowerCase().includes(searchTerm.toLowerCase())) || // Filter by mediationNumber too
    m.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.counterParty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper: Phone Formatter
  const formatPhoneNumber = (value: string) => {
    if (!value) return '';
    // Remove all non-digit characters
    let raw = value.replace(/\D/g, '');

    // If user is backspacing and clears everything
    if (raw.length === 0) return '';

    // Normalize: If starts with '90', remove it temporarily. If starts with '0', remove it.
    if (raw.startsWith('90')) {
        raw = raw.substring(2);
    } else if (raw.startsWith('0')) {
        raw = raw.substring(1);
    }

    // Limit to 10 digits (Turkish mobile/landline without country code)
    raw = raw.substring(0, 10);

    // Reconstruct with +90 and spacing
    let formatted = '+90';
    if (raw.length > 0) formatted += ' ' + raw.substring(0, 3);
    if (raw.length > 3) formatted += ' ' + raw.substring(3, 6);
    if (raw.length > 6) formatted += ' ' + raw.substring(6, 8);
    if (raw.length > 8) formatted += ' ' + raw.substring(8, 10);

    return formatted;
  };

  // Helper: Process Flow
  const getProcessStats = (status: MediationStatus) => {
      switch(status) {
          case MediationStatus.APPLIED: return { percent: 25, color: 'bg-blue-500', step: 1, theme: 'blue' };
          case MediationStatus.PROCESS: return { percent: 50, color: 'bg-blue-600', step: 2, theme: 'blue' };
          case MediationStatus.AGREEMENT: return { percent: 100, color: 'bg-green-500', step: 3, theme: 'green' };
          case MediationStatus.NO_AGREEMENT: return { percent: 100, color: 'bg-red-500', step: 3, theme: 'red' };
          case MediationStatus.CANCELLED: return { percent: 0, color: 'bg-slate-400', step: 0, theme: 'slate' };
          default: return { percent: 0, color: 'bg-slate-200', step: 0, theme: 'slate' };
      }
  };

  const handleDeleteMediation = (id: string, event?: React.MouseEvent) => {
    if(event) event.stopPropagation();
    if (window.confirm('Dosyayı silmek istediğinize emin misiniz?')) {
        deleteMediation(id);
        if (selectedMediation?.id === id) setSelectedMediation(null);
    }
  };

  // Dynamic Party Handlers for Creation
  const handleAddPartyRow = (type: 'applicant' | 'counter') => {
      const emptyRow: PartyRow = {name: '', phone: '', representative: '', representativePhone: '', tcVkn: '', address: '', email: ''};
      if (type === 'applicant') setApplicantList([...applicantList, emptyRow]);
      else setCounterPartyList([...counterPartyList, emptyRow]);
  };

  const handleRemovePartyRow = (type: 'applicant' | 'counter', index: number) => {
      if (type === 'applicant') {
          if (applicantList.length > 1) setApplicantList(applicantList.filter((_, i) => i !== index));
      } else {
          if (counterPartyList.length > 1) setCounterPartyList(counterPartyList.filter((_, i) => i !== index));
      }
  };

  const handleChangePartyRow = (type: 'applicant' | 'counter', index: number, field: keyof PartyRow, value: string) => {
      let finalValue = value;
      if (field === 'phone' || field === 'representativePhone') {
          finalValue = formatPhoneNumber(value);
      }

      if (type === 'applicant') {
          const newList = [...applicantList];
          newList[index] = { ...newList[index], [field]: finalValue };
          setApplicantList(newList);
      } else {
          const newList = [...counterPartyList];
          newList[index] = { ...newList[index], [field]: finalValue };
          setCounterPartyList(newList);
      }
  };

  // --- EDIT PARTY HANDLERS ---
  const handleOpenEditParties = () => {
      if (!activeMediationData) return;
      const currentParties = activeMediationData.parties || [];
      
      const applicants = currentParties.filter(p => p.role === 'Başvurucu').map(p => ({
          name: p.name, 
          phone: p.phone, 
          representative: p.representative || '', 
          representativePhone: p.representativePhone || '',
          tcVkn: p.tcVkn || '',
          address: p.address || '',
          email: p.email || ''
      }));
      
      const counters = currentParties.filter(p => p.role === 'Karşı Taraf').map(p => ({
          name: p.name, 
          phone: p.phone,
          representative: p.representative || '',
          representativePhone: p.representativePhone || '',
          tcVkn: p.tcVkn || '',
          address: p.address || '',
          email: p.email || ''
      }));

      // Fallback for legacy data
      if (applicants.length === 0 && activeMediationData.clientName) {
          activeMediationData.clientName.split(',').forEach(n => applicants.push({name: n.trim(), phone: '', representative: '', representativePhone: '', tcVkn: '', address: '', email: ''}));
      }
      if (counters.length === 0 && activeMediationData.counterParty) {
          activeMediationData.counterParty.split(',').forEach(n => counters.push({name: n.trim(), phone: '', representative: '', representativePhone: '', tcVkn: '', address: '', email: ''}));
      }

      setEditApplicantList(applicants.length > 0 ? applicants : [{name: '', phone: '', representative: '', representativePhone: '', tcVkn: '', address: '', email: ''}]);
      setEditCounterPartyList(counters.length > 0 ? counters : [{name: '', phone: '', representative: '', representativePhone: '', tcVkn: '', address: '', email: ''}]);
      
      setIsEditPartiesModalOpen(true);
  };

  const handleAddEditPartyRow = (type: 'applicant' | 'counter') => {
      const emptyRow: PartyRow = {name: '', phone: '', representative: '', representativePhone: '', tcVkn: '', address: '', email: ''};
      if (type === 'applicant') setEditApplicantList([...editApplicantList, emptyRow]);
      else setEditCounterPartyList([...editCounterPartyList, emptyRow]);
  };

  const handleRemoveEditPartyRow = (type: 'applicant' | 'counter', index: number) => {
      if (type === 'applicant') {
          if (editApplicantList.length > 1) setEditApplicantList(editApplicantList.filter((_, i) => i !== index));
      } else {
          if (editCounterPartyList.length > 1) setEditCounterPartyList(editCounterPartyList.filter((_, i) => i !== index));
      }
  };

  const handleEditPartyChange = (type: 'applicant' | 'counter', index: number, field: keyof PartyRow, value: string) => {
      let finalValue = value;
      if (field === 'phone' || field === 'representativePhone') {
          finalValue = formatPhoneNumber(value);
      }

      if (type === 'applicant') {
          const newList = [...editApplicantList];
          newList[index] = { ...newList[index], [field]: finalValue };
          setEditApplicantList(newList);
      } else {
          const newList = [...editCounterPartyList];
          newList[index] = { ...newList[index], [field]: finalValue };
          setEditCounterPartyList(newList);
      }
  };

  const handleSaveParties = () => {
      if (!activeMediationData) return;

      const newParties: MediationParty[] = [
          ...editApplicantList.filter(p => p.name).map(p => ({ ...p, role: 'Başvurucu' as const })),
          ...editCounterPartyList.filter(p => p.name).map(p => ({ ...p, role: 'Karşı Taraf' as const }))
      ];

      // Update legacy fields for display compatibility
      const updatedClientName = editApplicantList.map(p => p.name).filter(Boolean).join(', ');
      const updatedCounterParty = editCounterPartyList.map(p => p.name).filter(Boolean).join(', ');

      const updatedMediation = {
          ...activeMediationData,
          parties: newParties,
          clientName: updatedClientName,
          counterParty: updatedCounterParty
      };

      updateMediation(updatedMediation);
      addNotification({
          id: `edit-parties-${Date.now()}`,
          type: 'SUCCESS',
          title: 'Taraflar Güncellendi',
          message: 'Taraf bilgileri başarıyla güncellendi.',
          timestamp: 'Şimdi',
          read: false
      });
      setIsEditPartiesModalOpen(false);
  };

  const handleAddApplication = () => {
    // Validate that names are filled (phone is now optional)
    const isApplicantValid = applicantList.every(p => p.name.trim() !== '');
    const isCounterPartyValid = counterPartyList.every(p => p.name.trim() !== '');

    if (!newApplication.fileNumber || !newApplication.subject) {
        alert("Lütfen büro dosya numarası ve uyuşmazlık konusunu giriniz.");
        return;
    }
    
    if (!isApplicantValid || !isCounterPartyValid) {
        alert("Lütfen tüm tarafların Ad Soyad bilgilerini eksiksiz giriniz.");
        return;
    }

    const finalClientNames = applicantList.map(p => p.name).join(', ');
    const finalCounterParties = counterPartyList.map(p => p.name).join(', ');

    // Create structured party objects
    const parties: MediationParty[] = [
        ...applicantList.map(p => ({ ...p, role: 'Başvurucu' as const })),
        ...counterPartyList.map(p => ({ ...p, role: 'Karşı Taraf' as const }))
    ];

    const mediationToAdd: Mediation = {
        id: `m-${Date.now()}`,
        fileNumber: newApplication.fileNumber || '',
        mediationNumber: newApplication.mediationNumber || '', // Added
        applicationDate: new Date().toISOString().split('T')[0],
        clientName: finalClientNames,
        counterParty: finalCounterParties,
        subject: newApplication.subject || '',
        mediatorName: newApplication.mediatorName || mediatorProfile.name,
        status: MediationStatus.APPLIED,
        meetings: [],
        documents: [],
        parties: parties
    };

    addMediation(mediationToAdd);
    
    // Notification
    addNotification({
        id: `notif-app-${Date.now()}`,
        type: 'SUCCESS',
        title: 'Dosya Açıldı',
        message: `${mediationToAdd.fileNumber} nolu dosya başarıyla oluşturuldu.`,
        timestamp: 'Şimdi',
        read: false
    });

    setIsApplicationModalOpen(false);
    setNewApplication({ subject: '', mediatorName: '', fileNumber: '', mediationNumber: '' });
    setApplicantList([{name: '', phone: '', representative: '', representativePhone: '', tcVkn: '', address: '', email: ''}]);
    setCounterPartyList([{name: '', phone: '', representative: '', representativePhone: '', tcVkn: '', address: '', email: ''}]);
  };

  // --- MEETING LOGIC ---
  const handleAddMeeting = () => {
    if (!activeMediationData || !newMeeting.date || !newMeeting.participants) return;

    // Generate Link if Online
    let meetingLink = newMeeting.link;
    if (newMeeting.type === 'Online' && !meetingLink) {
        meetingLink = `https://meet.bgaofis.com/${activeMediationData.fileNumber.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`;
    }

    const meetingToAdd: MediationMeeting = {
        id: `mm-${Date.now()}`,
        date: newMeeting.date || '',
        participants: newMeeting.participants || 'Taraflar',
        notes: newMeeting.notes || '',
        outcome: 'Ertelendi',
        type: newMeeting.type as 'Online' | 'Fiziksel',
        location: newMeeting.type === 'Fiziksel' ? newMeeting.location : undefined,
        link: meetingLink
    };

    const updatedMeetings = [...activeMediationData.meetings, meetingToAdd];
    const updatedMediation = { ...activeMediationData, meetings: updatedMeetings, status: MediationStatus.PROCESS };
    updateMediation(updatedMediation);
    
    // Notification Logic
    if (notificationSettings.rules.meetingReminder24h) {
        addNotification({
            id: `notif-meet-${Date.now()}`,
            type: 'REMINDER',
            title: 'SMS & E-Posta Planlandı',
            message: `${activeMediationData.fileNumber} için ${newMeeting.type} oturum hatırlatması taraflara gönderilecek.`,
            timestamp: 'Şimdi',
            read: false
        });
    }

    setIsMeetingModalOpen(false);
    setNewMeeting({ date: '', participants: '', notes: '', type: 'Fiziksel', location: 'Ofis', link: '' });
  };

  const openCancelModal = (meeting: MediationMeeting) => {
      setMeetingToCancel(meeting);
      setCancelReason('');
      setIsCancelModalOpen(true);
  };

  const handleCancelMeeting = () => {
      if (!activeMediationData || !meetingToCancel) return;
      
      const updatedMeetings = activeMediationData.meetings.map(m => 
          m.id === meetingToCancel.id ? { ...m, outcome: 'İptal' as any, cancellationReason: cancelReason } : m
      );

      updateMediation({ ...activeMediationData, meetings: updatedMeetings });
      
      // Notify Parties
      addNotification({
          id: `cancel-${Date.now()}`,
          type: 'WARNING',
          title: 'Oturum İptal Edildi',
          message: `Taraflara iptal ve gerekçe (${cancelReason}) bildirimi SMS ile gönderildi.`,
          timestamp: 'Şimdi',
          read: false
      });

      setIsCancelModalOpen(false);
      setMeetingToCancel(null);
  };

  // --- SENDING LOGIC (Action Buttons) ---
  const handleSendDocumentAction = (type: 'Davet' | 'Ucret') => {
      if (!activeMediationData) return;
      
      // Find the template
      const template = templates.find(t => t.type === type);
      if (!template) {
          alert("Şablon bulunamadı. Lütfen Ayarlar > Belge Şablonları bölümünden şablon oluşturunuz.");
          return;
      }

      // Process template with real data
      const processedContent = processTemplate(template.content, activeMediationData, mediatorProfile);
      
      // Prepare Editor
      setSelectedTemplateToEdit(template);
      setEditedTemplateContent(processedContent);
      setSendingType(type);
      setIsSendingWorkflow(true); // Set workflow flag
      setIsTemplateEditorOpen(true);
  };

  const handleConfirmSend = () => {
      if (!activeMediationData || !sendingType || !selectedTemplateToEdit) return;

      // Create document entry
      const docName = selectedTemplateToEdit.name || (sendingType === 'Davet' ? 'Davet Mektubu' : 'Ücret Sözleşmesi');
      const newDoc: Document = {
          id: `doc-sent-${Date.now()}`,
          name: docName,
          type: sendingType,
          createdDate: new Date().toISOString().split('T')[0],
          status: 'Gönderildi',
          signedBy: []
      };

      const currentDocs = activeMediationData.documents || [];
      const updatedMediation = {
          ...activeMediationData,
          documents: [newDoc, ...currentDocs],
          invitationSent: sendingType === 'Davet' ? true : activeMediationData.invitationSent,
          feeContractSent: sendingType === 'Ucret' ? true : activeMediationData.feeContractSent
      };

      updateMediation(updatedMediation);
      
      addNotification({
          id: `send-${Date.now()}`,
          type: 'SUCCESS',
          title: `${sendingType === 'Davet' ? 'Davet' : 'Sözleşme'} İletildi`,
          message: `${sendingType === 'Davet' ? 'İlk oturum daveti' : 'Ücret sözleşmesi'} taraflara E-Posta ve SMS yoluyla başarıyla iletildi.`,
          timestamp: 'Şimdi',
          read: false
      });

      // Reset and close
      setIsTemplateEditorOpen(false);
      setIsSendingWorkflow(false);
      setSendingType(null);
      setSelectedTemplateToEdit(null);
  };


  // --- DOCUMENT GENERATION (TUTANAKLAR) ---
  const handleGenerateDoc = (docType: TemplateType) => {
      if (!activeMediationData) return;
      const template = templates.find(t => t.type === docType);
      if (!template) return alert('Şablon bulunamadı!');

      // Process template with real data to generate content
      const html = processTemplate(template.content, activeMediationData, mediatorProfile);
      
      // Simulate document creation
      const newDoc: Document = {
          id: `doc-${Date.now()}`,
          name: template.name,
          type: docType, // Specific type (e.g., Tutanak_Anlasma)
          createdDate: new Date().toISOString().split('T')[0],
          status: 'Taslak',
          signedBy: []
      };

      // Check if documents array exists, otherwise create new
      const currentDocs = activeMediationData.documents || [];
      updateMediation({ ...activeMediationData, documents: [newDoc, ...currentDocs] });

      // Also show preview
      setTemplatePreviewContent(html);
      setIsTemplateModalOpen(true);
      
      // Close selection modal if open
      setIsMinuteSelectionOpen(false);
  };

  const handleSignDocument = (docId: string) => {
      setSigningDocId(docId);
      // Simulate process
      setTimeout(() => {
          // We must fetch fresh data or use the active one, assuming component didn't unmount
          // In real app, you'd check if mounted.
          if (activeMediationData) {
              const currentDocs = activeMediationData.documents || [];
              const updatedDocs = currentDocs.map(d => 
                  d.id === docId ? { ...d, status: 'İmzada' as any } : d
              );
              updateMediation({ ...activeMediationData, documents: updatedDocs });
          }
          
          // Simulate completion after more time
          setTimeout(() => {
             if (activeMediationData) {
                // In a real app with async updates, we would trigger a refetch here.
                // For this simulation, we just add the notification.
                 addNotification({
                     id: `sign-${Date.now()}`,
                     type: 'SUCCESS',
                     title: 'Belge İmzalandı',
                     message: 'Taraflar belgeyi e-imza/mobil imza ile imzaladı.',
                     timestamp: 'Şimdi',
                     read: false
                 });
                 // Update to Signed would happen here via global update in a real async flow
             }
             setSigningDocId(null);
          }, 3000);

      }, 1500);
  };

  // --- TEMPLATE EDITOR HELPERS (EXISTING) ---
  const openTemplateEditor = (type: TemplateType) => {
      const template = templates.find(t => t.type === type);
      if (template) {
          // This is for "Tutanak" manual editing, not the workflow sending
          setIsSendingWorkflow(false); 
          setSelectedTemplateToEdit(template);
          // Pre-fill with processed content for convenience in Tutanak editor
          if (activeMediationData) {
             setEditedTemplateContent(processTemplate(template.content, activeMediationData, mediatorProfile));
          } else {
             setEditedTemplateContent(template.content);
          }
          setIsTemplateEditorOpen(true);
      }
  };
  
  const saveTemplate = () => {
      if (isSendingWorkflow) {
          handleConfirmSend();
      } else {
          // Manual Save Logic (e.g. for Tutanak)
          // In this mock, we just close it, perhaps generating a document?
          // For simplicity, let's treat it as "Generate Document"
          if (activeMediationData && selectedTemplateToEdit) {
              const newDoc: Document = {
                  id: `doc-manual-${Date.now()}`,
                  name: selectedTemplateToEdit.name,
                  type: selectedTemplateToEdit.type as any,
                  createdDate: new Date().toISOString().split('T')[0],
                  status: 'Taslak',
                  signedBy: []
              };
              const currentDocs = activeMediationData.documents || [];
              updateMediation({ ...activeMediationData, documents: [newDoc, ...currentDocs] });
              addNotification({
                  id: `doc-created-${Date.now()}`,
                  type: 'SUCCESS',
                  title: 'Belge Oluşturuldu',
                  message: 'Düzenlenen belge taslak olarak kaydedildi.',
                  timestamp: 'Şimdi',
                  read: false
              });
          }
          setIsTemplateEditorOpen(false);
      }
  };
  
  const insertAtCursor = (text: string) => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const currentVal = editedTemplateContent;
    setEditedTemplateContent(currentVal.substring(0, start) + text + currentVal.substring(end));
    setTimeout(() => { if (textareaRef.current) textareaRef.current.focus(); }, 0);
  };

  // --- REPORT PRINTING LOGIC ---
  const handlePrintReport = () => {
      const reportContent = document.getElementById('printable-report');
      if (!reportContent) return;

      const printWindow = window.open('', '_blank');
      if (printWindow) {
          printWindow.document.write(`
              <html>
              <head>
                  <title>Arabuluculuk Raporu - ${activeMediationData?.fileNumber}</title>
                  <script src="https://cdn.tailwindcss.com"></script>
                  <style>
                      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
                      body { font-family: 'Inter', sans-serif; -webkit-print-color-adjust: exact; }
                      @page { size: A4; margin: 1cm; }
                  </style>
              </head>
              <body class="bg-white p-8">
                  ${reportContent.innerHTML}
                  <script>
                      window.onload = function() { window.print(); window.close(); }
                  </script>
              </body>
              </html>
          `);
          printWindow.document.close();
      }
  };

  // --- RENDER ---
  if (activeVideoMeeting) {
      return <VideoRoom meetingId={activeVideoMeeting} participantName={mediatorProfile.name} onLeave={() => setActiveVideoMeeting(null)} />;
  }

  // Theme-compatible input class
  const inputClass = "w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500 transition-all placeholder-slate-400";

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen animate-in fade-in duration-300 relative dark:bg-slate-900 dark:text-white">
        
        {/* Add Meeting Modal */}
        {isMeetingModalOpen && (
            <Portal>
                <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md flex flex-col animate-in zoom-in-95">
                        <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center rounded-t-xl">
                             <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center">
                                <Calendar className="w-5 h-5 mr-2 text-brand-600" />
                                Yeni Oturum Planla
                             </h3>
                             <button onClick={() => setIsMeetingModalOpen(false)}><X className="w-5 h-5 text-slate-400 hover:text-slate-600" /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Tarih ve Saat</label>
                                <input 
                                    type="datetime-local" 
                                    className={inputClass}
                                    value={newMeeting.date}
                                    onChange={e => setNewMeeting({...newMeeting, date: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Görüşme Tipi</label>
                                <div className="flex space-x-2">
                                    <button 
                                        onClick={() => setNewMeeting({...newMeeting, type: 'Fiziksel'})}
                                        className={`flex-1 py-2 rounded-lg border text-sm font-bold transition ${newMeeting.type === 'Fiziksel' ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 text-blue-700 dark:text-blue-400' : 'border-slate-200 dark:border-slate-700 text-slate-500'}`}
                                    >
                                        Fiziksel
                                    </button>
                                    <button 
                                        onClick={() => setNewMeeting({...newMeeting, type: 'Online'})}
                                        className={`flex-1 py-2 rounded-lg border text-sm font-bold transition ${newMeeting.type === 'Online' ? 'bg-purple-50 dark:bg-purple-900/30 border-purple-200 text-purple-700 dark:text-purple-400' : 'border-slate-200 dark:border-slate-700 text-slate-500'}`}
                                    >
                                        Online
                                    </button>
                                </div>
                            </div>
                            
                            {newMeeting.type === 'Fiziksel' ? (
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Konum / Adres</label>
                                    <input 
                                        type="text" 
                                        className={inputClass}
                                        value={newMeeting.location}
                                        onChange={e => setNewMeeting({...newMeeting, location: e.target.value})}
                                        placeholder="Örn: Ofis Toplantı Odası"
                                    />
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Görüşme Linki (Otomatik Oluşur)</label>
                                    <input 
                                        type="text" 
                                        className={inputClass}
                                        value={newMeeting.link}
                                        onChange={e => setNewMeeting({...newMeeting, link: e.target.value})}
                                        placeholder="Boş bırakırsanız sistem link üretir"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Katılımcılar</label>
                                <input 
                                    type="text" 
                                    className={inputClass}
                                    value={newMeeting.participants}
                                    onChange={e => setNewMeeting({...newMeeting, participants: e.target.value})}
                                    placeholder="Örn: Taraflar ve Vekilleri"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Notlar</label>
                                <textarea 
                                    className={inputClass}
                                    rows={3}
                                    value={newMeeting.notes}
                                    onChange={e => setNewMeeting({...newMeeting, notes: e.target.value})}
                                ></textarea>
                            </div>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2 rounded-b-xl">
                            <button onClick={() => setIsMeetingModalOpen(false)} className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-sm font-medium">İptal</button>
                            <button onClick={handleAddMeeting} className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm hover:bg-brand-700 flex items-center font-medium shadow-lg">
                                <Save className="w-4 h-4 mr-2" /> Kaydet
                            </button>
                        </div>
                    </div>
                </div>
            </Portal>
        )}

        {/* Cancel Modal */}
        {isCancelModalOpen && meetingToCancel && (
            <Portal>
                <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md flex flex-col animate-in zoom-in-95">
                        <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center rounded-t-xl">
                             <h3 className="text-lg font-bold text-red-600 flex items-center">
                                <AlertTriangle className="w-5 h-5 mr-2" />
                                Oturum İptal / Erteleme
                             </h3>
                             <button onClick={() => setIsCancelModalOpen(false)}><X className="w-5 h-5 text-slate-400 hover:text-slate-600" /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-sm text-slate-600 dark:text-slate-300">
                                <strong>{meetingToCancel.date}</strong> tarihli oturumu iptal etmek üzeresiniz. Lütfen iptal veya erteleme gerekçesini belirtiniz. Bu gerekçe taraflara iletilecektir.
                            </p>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Gerekçe / Mazeret</label>
                                <textarea 
                                    className={inputClass}
                                    rows={4}
                                    value={cancelReason}
                                    onChange={e => setCancelReason(e.target.value)}
                                    placeholder="Örn: Tarafların ortak talebi üzerine..."
                                ></textarea>
                            </div>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2 rounded-b-xl">
                            <button onClick={() => setIsCancelModalOpen(false)} className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-sm font-medium">Vazgeç</button>
                            <button onClick={handleCancelMeeting} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 flex items-center font-medium shadow-lg">
                                <Send className="w-4 h-4 mr-2" /> İptal Bildirimi Gönder
                            </button>
                        </div>
                    </div>
                </div>
            </Portal>
        )}

        {/* Report Modal - Portal */}
        {isReportModalOpen && activeMediationData && (
            <Portal>
                <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                            <h3 className="font-bold text-slate-800 dark:text-white flex items-center">
                                <FileText className="w-5 h-5 mr-2 text-brand-600" />
                                Dosya Raporu Önizleme
                            </h3>
                            <button onClick={() => setIsReportModalOpen(false)}><X className="w-6 h-6 text-slate-400" /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8 bg-slate-100 dark:bg-slate-900">
                            <div id="printable-report" className="bg-white text-slate-900 p-10 shadow-lg max-w-[210mm] mx-auto min-h-[297mm]">
                                {/* Report Content */}
                                <div className="text-center border-b-2 border-slate-800 pb-6 mb-8">
                                    <h1 className="text-2xl font-bold uppercase tracking-wider">Arabuluculuk Süreç Raporu</h1>
                                    <p className="text-sm text-slate-500 mt-2">{mediatorProfile.name} - Sicil No: {mediatorProfile.registrationNumber}</p>
                                    <p className="text-xs text-slate-400 mt-1">Rapor Tarihi: {new Date().toLocaleDateString('tr-TR')}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-8 mb-8">
                                    <div>
                                        <h3 className="font-bold text-sm uppercase text-slate-500 mb-2 border-b pb-1">Dosya Bilgileri</h3>
                                        <p><span className="font-bold">Büro Dosya No:</span> {activeMediationData.fileNumber}</p>
                                        {activeMediationData.mediationNumber && <p><span className="font-bold">Arabuluculuk No:</span> {activeMediationData.mediationNumber}</p>}
                                        <p><span className="font-bold">Başvuru Tarihi:</span> {activeMediationData.applicationDate}</p>
                                        <p><span className="font-bold">Konu:</span> {activeMediationData.subject}</p>
                                        <p><span className="font-bold">Durum:</span> {activeMediationData.status}</p>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm uppercase text-slate-500 mb-2 border-b pb-1">Taraf Bilgileri</h3>
                                        <div className="mb-2">
                                            <span className="font-bold block text-xs uppercase text-green-700">Başvurucu</span>
                                            <p>{activeMediationData.clientName}</p>
                                        </div>
                                        <div>
                                            <span className="font-bold block text-xs uppercase text-red-700">Karşı Taraf</span>
                                            <p>{activeMediationData.counterParty}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-8">
                                    <h3 className="font-bold text-sm uppercase text-slate-500 mb-4 border-b pb-1">Süreç Kronolojisi</h3>
                                    <table className="w-full text-sm text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50 border-b border-slate-200">
                                                <th className="p-2 border border-slate-200">Tarih</th>
                                                <th className="p-2 border border-slate-200">İşlem / Oturum</th>
                                                <th className="p-2 border border-slate-200">Sonuç</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr className="border-b border-slate-100">
                                                <td className="p-2 border border-slate-200">{activeMediationData.applicationDate}</td>
                                                <td className="p-2 border border-slate-200">Dosya Açılışı</td>
                                                <td className="p-2 border border-slate-200">Başvuru Alındı</td>
                                            </tr>
                                            {activeMediationData.meetings.map((m, i) => (
                                                <tr key={i} className="border-b border-slate-100">
                                                    <td className="p-2 border border-slate-200">{m.date}</td>
                                                    <td className="p-2 border border-slate-200">{m.type} Oturumu</td>
                                                    <td className="p-2 border border-slate-200">{m.outcome}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="mt-12 pt-4 border-t border-slate-200 text-center text-xs text-slate-400">
                                    <p>Bu rapor BGAofis Hukuk Otomasyon Sistemi üzerinden {new Date().toLocaleString('tr-TR')} tarihinde oluşturulmuştur.</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3">
                            <button onClick={() => setIsReportModalOpen(false)} className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-sm font-medium">Kapat</button>
                            <button onClick={handlePrintReport} className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm hover:bg-brand-700 flex items-center font-medium shadow-lg">
                                <Printer className="w-4 h-4 mr-2" /> Yazdır / PDF Kaydet
                            </button>
                        </div>
                    </div>
                </div>
            </Portal>
        )}

        {/* Minute Type Selection Modal */}
        {isMinuteSelectionOpen && (
            <Portal>
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[90] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                            <h3 className="font-bold text-slate-800 dark:text-white">Tutanak Türü Seçiniz</h3>
                            <button onClick={() => setIsMinuteSelectionOpen(false)}><X className="w-5 h-5 text-slate-400"/></button>
                        </div>
                        <div className="p-2">
                            <button onClick={() => handleGenerateDoc('Tutanak_Acilis')} className="w-full text-left p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center border-b border-slate-100 dark:border-slate-700 transition">
                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3"><FileText className="w-4 h-4"/></div>
                                <div>
                                    <p className="font-bold text-slate-800 dark:text-slate-200">Oturum Açılış Tutanağı</p>
                                    <p className="text-xs text-slate-500">İlk oturum için standart tutanak.</p>
                                </div>
                            </button>
                            <button onClick={() => handleGenerateDoc('Tutanak_Ara')} className="w-full text-left p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center border-b border-slate-100 dark:border-slate-700 transition">
                                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3"><Activity className="w-4 h-4"/></div>
                                <div>
                                    <p className="font-bold text-slate-800 dark:text-slate-200">Ara Oturum Tutanağı</p>
                                    <p className="text-xs text-slate-500">Sürecin devam ettiği durumlar için.</p>
                                </div>
                            </button>
                            <button onClick={() => handleGenerateDoc('Tutanak_Anlasma')} className="w-full text-left p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center border-b border-slate-100 dark:border-slate-700 transition">
                                <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-3"><Handshake className="w-4 h-4"/></div>
                                <div>
                                    <p className="font-bold text-slate-800 dark:text-slate-200">Anlaşma Tutanağı (Son)</p>
                                    <p className="text-xs text-slate-500">Taraflar anlaştığında düzenlenir.</p>
                                </div>
                            </button>
                            <button onClick={() => handleGenerateDoc('Tutanak_Anlasamama')} className="w-full text-left p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center border-b border-slate-100 dark:border-slate-700 transition">
                                <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center mr-3"><XCircle className="w-4 h-4"/></div>
                                <div>
                                    <p className="font-bold text-slate-800 dark:text-slate-200">Anlaşamama Tutanağı (Son)</p>
                                    <p className="text-xs text-slate-500">Anlaşma sağlanamadığında düzenlenir.</p>
                                </div>
                            </button>
                            <button onClick={() => handleGenerateDoc('Tutanak_Gelmeme')} className="w-full text-left p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center border-b border-slate-100 dark:border-slate-700 transition">
                                <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center mr-3"><User className="w-4 h-4"/></div>
                                <div>
                                    <p className="font-bold text-slate-800 dark:text-slate-200">Taraf Gelmedi Tutanağı</p>
                                    <p className="text-xs text-slate-500">Taraflardan biri veya ikisi katılmadıysa.</p>
                                </div>
                            </button>
                            <button onClick={() => handleGenerateDoc('Tutanak_Sonlandirma')} className="w-full text-left p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center transition">
                                <div className="w-8 h-8 rounded-full bg-slate-300 text-slate-700 flex items-center justify-center mr-3"><FileText className="w-4 h-4"/></div>
                                <div>
                                    <p className="font-bold text-slate-800 dark:text-slate-200">Süreç Sonlandırma Tutanağı</p>
                                    <p className="text-xs text-slate-500">Feragat, ölüm vb. sebeplerle kapanış.</p>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </Portal>
        )}

        {/* Edit Parties Modal - Portal */}
        {isEditPartiesModalOpen && (
            <Portal>
                <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-4xl flex flex-col max-h-[95vh] animate-in zoom-in-95">
                        <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center shrink-0">
                             <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center">
                                <Users className="w-5 h-5 mr-2 text-brand-600" />
                                Taraf ve Vekil Bilgilerini Düzenle
                             </h3>
                             <button onClick={() => setIsEditPartiesModalOpen(false)}><X className="w-6 h-6 text-slate-400 hover:text-slate-600" /></button>
                        </div>
                        <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar bg-white dark:bg-slate-800">
                            <div className="space-y-6">
                                 {/* Applicants List */}
                                 <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-100 dark:border-green-900">
                                    <div className="flex justify-between items-center mb-3">
                                        <label className="block text-sm font-bold text-green-700 dark:text-green-400 uppercase tracking-wide">Başvurucu(lar)</label>
                                        <button onClick={() => handleAddEditPartyRow('applicant')} className="text-xs text-green-600 hover:underline flex items-center font-bold bg-white dark:bg-slate-800 px-2 py-1 rounded border border-green-200 dark:border-green-800">
                                            <Plus className="w-3 h-3 mr-1"/> Yeni Taraf Ekle
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        {editApplicantList.map((app, idx) => (
                                            <div key={idx} className="relative p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm group">
                                                <div className="absolute top-3 right-3">
                                                    {editApplicantList.length > 1 && (
                                                        <button onClick={() => handleRemoveEditPartyRow('applicant', idx)} className="text-slate-400 hover:text-red-500 p-1 hover:bg-red-50 rounded">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="mb-3">
                                                    <span className="text-xs font-bold text-green-600 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded border border-green-100 dark:border-green-800">
                                                        Başvurucu {idx + 1}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-500 mb-1">Ad Soyad / Ünvan</label>
                                                        <input 
                                                            type="text" 
                                                            className={inputClass}
                                                            value={app.name}
                                                            onChange={e => handleEditPartyChange('applicant', idx, 'name', e.target.value)} 
                                                            placeholder="Örn: Ahmet Yılmaz"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-500 mb-1">TCKN / VKN</label>
                                                        <input 
                                                            type="text" 
                                                            className={inputClass}
                                                            value={app.tcVkn}
                                                            onChange={e => handleEditPartyChange('applicant', idx, 'tcVkn', e.target.value)} 
                                                            placeholder="11 haneli TC / 10 haneli VKN"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-500 mb-1">Telefon</label>
                                                        <input 
                                                            type="text" 
                                                            className={inputClass}
                                                            value={app.phone}
                                                            onChange={e => handleEditPartyChange('applicant', idx, 'phone', e.target.value)} 
                                                            placeholder="Telefon"
                                                        />
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <label className="block text-xs font-bold text-slate-500 mb-1">Adres</label>
                                                        <input 
                                                            type="text" 
                                                            className={inputClass}
                                                            value={app.address}
                                                            onChange={e => handleEditPartyChange('applicant', idx, 'address', e.target.value)} 
                                                            placeholder="Tam Adres"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-500 mb-1">E-Posta</label>
                                                        <input 
                                                            type="text" 
                                                            className={inputClass}
                                                            value={app.email}
                                                            onChange={e => handleEditPartyChange('applicant', idx, 'email', e.target.value)} 
                                                            placeholder="ornek@email.com"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-500 mb-1">Vekil Adı (Opsiyonel)</label>
                                                        <input 
                                                            type="text" 
                                                            className={inputClass}
                                                            value={app.representative}
                                                            onChange={e => handleEditPartyChange('applicant', idx, 'representative', e.target.value)} 
                                                            placeholder="Av. Mehmet Demir"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-500 mb-1">Vekil Telefonu</label>
                                                        <input 
                                                            type="text" 
                                                            className={inputClass}
                                                            value={app.representativePhone}
                                                            onChange={e => handleEditPartyChange('applicant', idx, 'representativePhone', e.target.value)} 
                                                            placeholder="Telefon"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                 </div>

                                 {/* Counter Parties List */}
                                 <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900">
                                    <div className="flex justify-between items-center mb-3">
                                        <label className="block text-sm font-bold text-red-700 dark:text-red-400 uppercase tracking-wide">Karşı Taraf(lar)</label>
                                        <button onClick={() => handleAddEditPartyRow('counter')} className="text-xs text-red-600 hover:underline flex items-center font-bold bg-white dark:bg-slate-800 px-2 py-1 rounded border border-red-200 dark:border-red-800">
                                            <Plus className="w-3 h-3 mr-1"/> Yeni Taraf Ekle
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        {editCounterPartyList.map((cp, idx) => (
                                            <div key={idx} className="relative p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm group">
                                                <div className="absolute top-3 right-3">
                                                    {editCounterPartyList.length > 1 && (
                                                        <button onClick={() => handleRemoveEditPartyRow('counter', idx)} className="text-slate-400 hover:text-red-500 p-1 hover:bg-red-50 rounded">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="mb-3">
                                                    <span className="text-xs font-bold text-red-600 bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded border border-red-100 dark:border-red-800">
                                                        Karşı Taraf {idx + 1}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-500 mb-1">Ad Soyad / Ünvan</label>
                                                        <input 
                                                            type="text" 
                                                            className={inputClass}
                                                            value={cp.name}
                                                            onChange={e => handleEditPartyChange('counter', idx, 'name', e.target.value)} 
                                                            placeholder="Örn: XYZ Ltd. Şti."
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-500 mb-1">TCKN / VKN</label>
                                                        <input 
                                                            type="text" 
                                                            className={inputClass}
                                                            value={cp.tcVkn}
                                                            onChange={e => handleEditPartyChange('counter', idx, 'tcVkn', e.target.value)} 
                                                            placeholder="11 haneli TC / 10 haneli VKN"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-500 mb-1">Telefon</label>
                                                        <input 
                                                            type="text" 
                                                            className={inputClass}
                                                            value={cp.phone}
                                                            onChange={e => handleEditPartyChange('counter', idx, 'phone', e.target.value)} 
                                                            placeholder="Telefon"
                                                        />
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <label className="block text-xs font-bold text-slate-500 mb-1">Adres</label>
                                                        <input 
                                                            type="text" 
                                                            className={inputClass}
                                                            value={cp.address}
                                                            onChange={e => handleEditPartyChange('counter', idx, 'address', e.target.value)} 
                                                            placeholder="Tam Adres"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-500 mb-1">E-Posta</label>
                                                        <input 
                                                            type="text" 
                                                            className={inputClass}
                                                            value={cp.email}
                                                            onChange={e => handleEditPartyChange('counter', idx, 'email', e.target.value)} 
                                                            placeholder="ornek@email.com"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-500 mb-1">Vekil Adı (Opsiyonel)</label>
                                                        <input 
                                                            type="text" 
                                                            className={inputClass}
                                                            value={cp.representative}
                                                            onChange={e => handleEditPartyChange('counter', idx, 'representative', e.target.value)} 
                                                            placeholder="Av. Ayşe Yılmaz"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-500 mb-1">Vekil Telefonu</label>
                                                        <input 
                                                            type="text" 
                                                            className={inputClass}
                                                            value={cp.representativePhone}
                                                            onChange={e => handleEditPartyChange('counter', idx, 'representativePhone', e.target.value)} 
                                                            placeholder="Telefon"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                 </div>
                            </div>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2 shrink-0">
                            <button onClick={() => setIsEditPartiesModalOpen(false)} className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-sm font-medium">İptal</button>
                            <button onClick={handleSaveParties} className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm hover:bg-brand-700 flex items-center font-medium shadow-lg shadow-brand-600/20">
                                <Save className="w-4 h-4 mr-2" /> Kaydet
                            </button>
                        </div>
                    </div>
                </div>
            </Portal>
        )}

        {/* Add Application Modal - Portal */}
        {isApplicationModalOpen && (
            <Portal>
                <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[95vh] animate-in zoom-in-95">
                        <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center shrink-0">
                             <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center">
                                <Plus className="w-5 h-5 mr-2 text-brand-600" />
                                Yeni Arabuluculuk Başvurusu
                             </h3>
                             <button onClick={() => setIsApplicationModalOpen(false)}><X className="w-6 h-6 text-slate-400 hover:text-slate-600" /></button>
                        </div>
                        <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar bg-white dark:bg-slate-800">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Büro Dosya Numarası</label>
                                    <input 
                                        type="text" 
                                        className={inputClass}
                                        placeholder="Örn: 2025/101"
                                        value={newApplication.fileNumber} 
                                        onChange={e => setNewApplication({...newApplication, fileNumber: e.target.value})} 
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Arabuluculuk No (ARB)</label>
                                    <input 
                                        type="text" 
                                        className={inputClass}
                                        placeholder="Örn: ARB-2025/5505"
                                        value={newApplication.mediationNumber} 
                                        onChange={e => setNewApplication({...newApplication, mediationNumber: e.target.value})} 
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-6">
                                 {/* Applicants List */}
                                 <div className="p-4 bg-slate-50 dark:bg-slate-900/30 rounded-xl border border-slate-100 dark:border-slate-700">
                                    <div className="flex justify-between items-center mb-3">
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Başvurucu(lar)</label>
                                        <button onClick={() => handleAddPartyRow('applicant')} className="text-xs text-brand-600 hover:underline flex items-center font-bold">
                                            <Plus className="w-3 h-3 mr-1"/> Ekle
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        {applicantList.map((app, idx) => (
                                            <div key={idx} className="grid grid-cols-12 gap-2 items-start">
                                                <div className="col-span-12 mb-1">
                                                    <span className="text-xs font-bold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded">Taraf {idx + 1}</span>
                                                </div>
                                                <div className="col-span-4">
                                                    <input 
                                                        type="text" 
                                                        className={inputClass}
                                                        placeholder="Ad Soyad / Ünvan *"
                                                        value={app.name}
                                                        onChange={e => handleChangePartyRow('applicant', idx, 'name', e.target.value)} 
                                                    />
                                                </div>
                                                <div className="col-span-4">
                                                    <input 
                                                        type="text" 
                                                        className={inputClass}
                                                        placeholder="TCKN / VKN"
                                                        value={app.tcVkn}
                                                        onChange={e => handleChangePartyRow('applicant', idx, 'tcVkn', e.target.value)} 
                                                    />
                                                </div>
                                                <div className="col-span-4">
                                                    <input 
                                                        type="text" 
                                                        className={inputClass}
                                                        placeholder="Telefon"
                                                        value={app.phone}
                                                        onChange={e => handleChangePartyRow('applicant', idx, 'phone', e.target.value)} 
                                                    />
                                                </div>
                                                <div className="col-span-12">
                                                    <input 
                                                        type="text" 
                                                        className={inputClass}
                                                        placeholder="Adres"
                                                        value={app.address}
                                                        onChange={e => handleChangePartyRow('applicant', idx, 'address', e.target.value)} 
                                                    />
                                                </div>
                                                <div className="col-span-12 flex justify-center pt-1">
                                                    {applicantList.length > 1 && (
                                                        <button onClick={() => handleRemovePartyRow('applicant', idx)} className="text-slate-400 hover:text-red-500">
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                 </div>

                                 {/* Counter Parties List */}
                                 <div className="p-4 bg-slate-50 dark:bg-slate-900/30 rounded-xl border border-slate-100 dark:border-slate-700">
                                    <div className="flex justify-between items-center mb-3">
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Karşı Taraf(lar)</label>
                                        <button onClick={() => handleAddPartyRow('counter')} className="text-xs text-brand-600 hover:underline flex items-center font-bold">
                                            <Plus className="w-3 h-3 mr-1"/> Ekle
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        {counterPartyList.map((cp, idx) => (
                                            <div key={idx} className="grid grid-cols-12 gap-2 items-start">
                                                <div className="col-span-12 mb-1">
                                                    <span className="text-xs font-bold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded">Taraf {idx + 1}</span>
                                                </div>
                                                <div className="col-span-4">
                                                    <input 
                                                        type="text" 
                                                        className={inputClass}
                                                        placeholder="Ad Soyad / Ünvan *"
                                                        value={cp.name}
                                                        onChange={e => handleChangePartyRow('counter', idx, 'name', e.target.value)} 
                                                    />
                                                </div>
                                                <div className="col-span-4">
                                                    <input 
                                                        type="text" 
                                                        className={inputClass}
                                                        placeholder="TCKN / VKN"
                                                        value={cp.tcVkn}
                                                        onChange={e => handleChangePartyRow('counter', idx, 'tcVkn', e.target.value)} 
                                                    />
                                                </div>
                                                <div className="col-span-4">
                                                    <input 
                                                        type="text" 
                                                        className={inputClass}
                                                        placeholder="Telefon"
                                                        value={cp.phone}
                                                        onChange={e => handleChangePartyRow('counter', idx, 'phone', e.target.value)} 
                                                    />
                                                </div>
                                                <div className="col-span-12">
                                                    <input 
                                                        type="text" 
                                                        className={inputClass}
                                                        placeholder="Adres"
                                                        value={cp.address}
                                                        onChange={e => handleChangePartyRow('counter', idx, 'address', e.target.value)} 
                                                    />
                                                </div>
                                                <div className="col-span-12 flex justify-center pt-1">
                                                    {counterPartyList.length > 1 && (
                                                        <button onClick={() => handleRemovePartyRow('counter', idx)} className="text-slate-400 hover:text-red-500">
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                 </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Uyuşmazlık Konusu</label>
                                <textarea 
                                    className={inputClass}
                                    rows={3}
                                    value={newApplication.subject} 
                                    onChange={e => setNewApplication({...newApplication, subject: e.target.value})} 
                                ></textarea>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Arabulucu</label>
                                 <input 
                                    type="text" 
                                    className={`${inputClass} bg-slate-50 dark:bg-slate-800`}
                                    value={newApplication.mediatorName || mediatorProfile.name} 
                                    onChange={e => setNewApplication({...newApplication, mediatorName: e.target.value})} 
                                />
                            </div>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2 shrink-0">
                            <button onClick={() => setIsApplicationModalOpen(false)} className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-sm font-medium">İptal</button>
                            <button onClick={handleAddApplication} className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm hover:bg-brand-700 flex items-center font-medium shadow-lg shadow-brand-600/20">
                                <Save className="w-4 h-4 mr-2" /> Dosyayı Aç
                            </button>
                        </div>
                    </div>
                </div>
            </Portal>
        )}

        {/* Modals (Templates, Profile etc.) */}
        {isTemplateModalOpen && (
            <Portal>
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[80] flex items-center justify-center p-4">
                     <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden">
                          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                              <h3 className="font-bold text-slate-800 dark:text-white">Evrak Önizleme</h3>
                              <button onClick={() => setIsTemplateModalOpen(false)}><X className="w-5 h-5 text-slate-500"/></button>
                          </div>
                          <div className="flex-1 overflow-y-auto p-8 bg-gray-100 dark:bg-slate-900">
                               <div className="bg-white shadow-lg p-10 min-h-full mx-auto text-black" dangerouslySetInnerHTML={{ __html: templatePreviewContent }} />
                          </div>
                     </div>
                </div>
            </Portal>
        )}

        {/* Template Editor Modal - Portal */}
        {isTemplateEditorOpen && selectedTemplateToEdit && (
            <Portal>
                <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[90] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                            <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center">
                                <PenTool className="w-5 h-5 mr-2 text-brand-600" />
                                {isSendingWorkflow ? `${sendingType} Hazırlama & Gönderme` : `${selectedTemplateToEdit.name} Düzenle`}
                            </h3>
                            <button onClick={() => setIsTemplateEditorOpen(false)}><X className="w-6 h-6 text-slate-400 hover:text-slate-600" /></button>
                        </div>
                        
                        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                            {/* Sidebar: Variables/Tools */}
                            <div className="w-full md:w-64 bg-slate-50 dark:bg-slate-900/30 border-r border-slate-200 dark:border-slate-700 p-4 overflow-y-auto">
                                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-3">Hızlı Ekle</h4>
                                <div className="space-y-2">
                                    {[
                                        { label: 'Müvekkil Adı', value: activeMediationData?.clientName },
                                        { label: 'Karşı Taraf', value: activeMediationData?.counterParty },
                                        { label: 'Dosya No', value: activeMediationData?.fileNumber },
                                        { label: 'Toplantı Tarihi', value: new Date().toLocaleDateString('tr-TR') },
                                        { label: 'Arabulucu', value: mediatorProfile.name },
                                    ].map((v, i) => (
                                        <button 
                                            key={i}
                                            onClick={() => insertAtCursor(v.value || '')}
                                            className="w-full text-left px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-xs hover:border-brand-400 hover:text-brand-600 transition group"
                                        >
                                            <span className="font-bold text-slate-700 dark:text-slate-300 block">{v.label}</span>
                                            <span className="text-slate-400 group-hover:text-brand-500 truncate block text-[10px]">{v.value || '-'}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Editor Area */}
                            <div className="flex-1 flex flex-col bg-slate-100 dark:bg-slate-900">
                                <div className="p-2 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
                                    <div className="flex items-center">
                                        <FileText className="w-4 h-4 mr-2" />
                                        Canlı Önizleme & Düzenleme Modu
                                    </div>
                                </div>
                                <div className="flex-1 p-8 overflow-y-auto">
                                    <textarea 
                                        ref={textareaRef}
                                        className="w-full h-full min-h-[800px] p-10 bg-white text-slate-900 shadow-lg resize-none outline-none font-serif leading-relaxed text-sm md:text-base border-none"
                                        value={editedTemplateContent.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '')} // Simple HTML strip for textarea (in real app use rich text editor)
                                        onChange={e => setEditedTemplateContent(e.target.value)}
                                        spellCheck={false}
                                    ></textarea>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3">
                            <button onClick={() => setIsTemplateEditorOpen(false)} className="px-5 py-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-sm font-medium">İptal</button>
                            <button onClick={saveTemplate} className="px-6 py-2.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 text-sm font-bold shadow-lg flex items-center">
                                {isSendingWorkflow ? (
                                    <>
                                        <Send className="w-4 h-4 mr-2" /> Onayla ve Gönder
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" /> Taslağı Kaydet
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </Portal>
        )}

        {/* MAIN CONTENT SWITCH */}
        {activeMediationData ? (
            // --- DETAIL VIEW ---
            <div className="animate-in slide-in-from-right duration-300">
                <button onClick={() => setSelectedMediation(null)} className="flex items-center text-slate-500 hover:text-brand-600 mb-4">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Listeye Dön
                </button>

                {/* Detail Header */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-6 relative overflow-hidden">
                     <div className={`absolute top-0 left-0 w-2 h-full ${getProcessStats(activeMediationData.status).color}`}></div>
                     <div className="flex justify-between items-start">
                         <div>
                             <div className="flex items-center gap-2 mb-1">
                                 <span className="text-xs font-bold text-slate-400 uppercase">Büro No</span>
                                 <span className="text-sm font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">{activeMediationData.fileNumber}</span>
                                 
                                 {activeMediationData.mediationNumber && (
                                     <>
                                        <span className="text-xs font-bold text-slate-400 uppercase ml-2">Arb No</span>
                                        <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded">{activeMediationData.mediationNumber}</span>
                                     </>
                                 )}

                                 <span className={`ml-2 text-xs font-bold px-2 py-0.5 rounded border ${
                                     activeMediationData.status === 'Anlaşma' ? 'bg-green-100 text-green-700 border-green-200' : 
                                     (activeMediationData.status === 'Anlaşmama' || activeMediationData.status === 'İptal') ? 'bg-red-100 text-red-700 border-red-200' : 
                                     'bg-blue-100 text-blue-700 border-blue-200'
                                 }`}>
                                     {activeMediationData.status}
                                 </span>
                             </div>
                             <h1 className="text-3xl font-bold text-slate-800 dark:text-white mt-2">{activeMediationData.subject}</h1>
                         </div>
                         <div className="flex gap-2">
                             <button 
                                onClick={(e) => handleDeleteMediation(activeMediationData.id, e)} 
                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg border border-transparent hover:border-red-200 transition"
                             >
                                 <Trash2 className="w-5 h-5" />
                             </button>
                             <button 
                                onClick={() => setIsReportModalOpen(true)}
                                className="bg-brand-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-brand-700 flex items-center"
                             >
                                 <Printer className="w-4 h-4 mr-2" /> Rapor Al
                             </button>
                         </div>
                     </div>

                     {/* Process Bar */}
                     <div className="mt-8 relative pt-4">
                         <div className="absolute top-0 left-0 w-full h-1 bg-slate-100 dark:bg-slate-700 rounded"></div>
                         <div className={`absolute top-0 left-0 h-1 rounded transition-all duration-1000 ${getProcessStats(activeMediationData.status).color}`} style={{width: `${getProcessStats(activeMediationData.status).percent}%`}}></div>
                         <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mt-2">
                             <span className={getProcessStats(activeMediationData.status).step >= 1 ? 'text-brand-600 dark:text-brand-400' : ''}>Başvuru</span>
                             <span className={getProcessStats(activeMediationData.status).step >= 2 ? 'text-brand-600 dark:text-brand-400' : ''}>Müzakere</span>
                             <span className={getProcessStats(activeMediationData.status).step >= 3 ? 'text-green-600 dark:text-green-400' : ''}>Sonuç</span>
                         </div>
                     </div>
                </div>

                {/* TABS */}
                <div className="flex flex-wrap gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mb-6 w-full md:w-fit border border-slate-200 dark:border-slate-700">
                    {[
                        { id: 'overview', label: 'Genel Bakış', icon: Activity },
                        { id: 'sessions', label: 'Oturumlar', icon: Calendar },
                        { id: 'documents', label: 'Belgeler & İmza', icon: FileSignature },
                        { id: 'notes', label: 'Tutanak Editörü', icon: PenTool },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center transition-all ${activeTab === tab.id ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                        >
                            <tab.icon className="w-4 h-4 mr-2" /> {tab.label}
                        </button>
                    ))}
                </div>

                {/* TAB CONTENT */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <>
                            <div className="lg:col-span-2 space-y-6">
                                {/* Parties */}
                                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-bold text-slate-800 dark:text-white">Taraf Bilgileri</h3>
                                        <button 
                                            onClick={handleOpenEditParties}
                                            className="text-brand-600 hover:text-brand-700 text-xs font-bold bg-brand-50 hover:bg-brand-100 dark:bg-brand-900/20 dark:hover:bg-brand-900/40 px-3 py-1.5 rounded-lg transition flex items-center"
                                        >
                                            <Edit3 className="w-3 h-3 mr-1" /> Düzenle
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-900">
                                            <span className="text-xs font-bold text-green-600 dark:text-green-400 uppercase">Başvurucu(lar)</span>
                                            <div className="mt-2 space-y-3">
                                                {activeMediationData.parties?.filter(p => p.role === 'Başvurucu').map((p, i) => (
                                                    <div key={i} className="text-sm pb-2 border-b border-green-200/50 last:border-0 last:pb-0">
                                                        <p className="font-bold text-slate-800 dark:text-white">{p.name}</p>
                                                        {p.tcVkn && <p className="text-xs text-slate-500 dark:text-slate-400">TC/VKN: {p.tcVkn}</p>}
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center mb-1"><Phone className="w-3 h-3 mr-1"/> {p.phone}</p>
                                                        {p.representative && (
                                                            <div className="pl-2 border-l-2 border-green-300 mt-1">
                                                                <p className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center">
                                                                    <Briefcase className="w-3 h-3 mr-1 text-green-600"/> Vekil: {p.representative}
                                                                </p>
                                                                {p.representativePhone && <p className="text-[10px] text-slate-500 ml-4">{p.representativePhone}</p>}
                                                            </div>
                                                        )}
                                                    </div>
                                                )) || <p className="font-bold text-slate-800 dark:text-white whitespace-pre-line">{activeMediationData.clientName.replace(/, /g, '\n')}</p>}
                                            </div>
                                        </div>
                                        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-900">
                                            <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase">Karşı Taraf(lar)</span>
                                            <div className="mt-2 space-y-3">
                                                {activeMediationData.parties?.filter(p => p.role === 'Karşı Taraf').map((p, i) => (
                                                    <div key={i} className="text-sm pb-2 border-b border-red-200/50 last:border-0 last:pb-0">
                                                        <p className="font-bold text-slate-800 dark:text-white">{p.name}</p>
                                                        {p.tcVkn && <p className="text-xs text-slate-500 dark:text-slate-400">TC/VKN: {p.tcVkn}</p>}
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center mb-1"><Phone className="w-3 h-3 mr-1"/> {p.phone}</p>
                                                        {p.representative && (
                                                            <div className="pl-2 border-l-2 border-red-300 mt-1">
                                                                <p className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center">
                                                                    <Briefcase className="w-3 h-3 mr-1 text-red-600"/> Vekil: {p.representative}
                                                                </p>
                                                                {p.representativePhone && <p className="text-[10px] text-slate-500 ml-4">{p.representativePhone}</p>}
                                                            </div>
                                                        )}
                                                    </div>
                                                )) || <p className="font-bold text-slate-800 dark:text-white whitespace-pre-line">{activeMediationData.counterParty.replace(/, /g, '\n')}</p>}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Recent Activity */}
                                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                                    <h3 className="font-bold text-slate-800 dark:text-white mb-4">Son Hareketler</h3>
                                    <ul className="space-y-4">
                                        <li className="flex items-start">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-800 dark:text-white">Dosya Oluşturuldu</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">{activeMediationData.applicationDate}</p>
                                            </div>
                                        </li>
                                        {activeMediationData.meetings.map(m => (
                                            <li key={m.id} className="flex items-start">
                                                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3"></div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-800 dark:text-white">{m.type} Oturum Planlandı</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">{m.date}</p>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {/* Quick Actions Sidebar */}
                                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition group">
                                    {/* Davet Gönder */}
                                    <div className="flex items-center justify-between mb-2 cursor-pointer" onClick={() => handleSendDocumentAction('Davet')}>
                                        <Mail className={`w-5 h-5 ${activeMediationData.invitationSent ? 'text-green-600' : 'text-brand-600'}`} />
                                        {activeMediationData.invitationSent ? (
                                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                                        ) : (
                                            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-brand-600" />
                                        )}
                                    </div>
                                    <div className="mb-3">
                                        <p className="font-bold text-slate-700 dark:text-slate-200">{activeMediationData.invitationSent ? 'Davet İletildi' : 'Davet Gönder'}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">İlk oturum davet mektubu oluştur.</p>
                                    </div>
                                    {!activeMediationData.invitationSent ? (
                                        <button 
                                            onClick={() => handleSendDocumentAction('Davet')}
                                            className="w-full mt-2 bg-brand-50 dark:bg-brand-900/30 hover:bg-brand-100 dark:hover:bg-brand-900/50 text-brand-700 dark:text-brand-300 px-3 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center"
                                        >
                                            <Eye className="w-3 h-3 mr-1" />
                                            Önizle ve Gönder
                                        </button>
                                    ) : (
                                        <div className="mt-2 flex items-center justify-center text-xs font-bold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 py-2 rounded-lg border border-green-100 dark:border-green-900">
                                            <Check className="w-3 h-3 mr-1" /> Başarıyla Gönderildi
                                        </div>
                                    )}
                                </div>
                                
                                <button onClick={() => setIsMeetingModalOpen(true)} className="w-full bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-brand-300 shadow-sm hover:shadow-md transition text-left group">
                                    <div className="flex items-center justify-between mb-2">
                                        <Calendar className="w-5 h-5 text-brand-600" />
                                        <Plus className="w-4 h-4 text-slate-300 group-hover:text-brand-600" />
                                    </div>
                                    <p className="font-bold text-slate-700 dark:text-slate-200">Oturum Planla</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Yeni bir toplantı ekle.</p>
                                </button>

                                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition group">
                                    <div className="flex items-center justify-between mb-2 cursor-pointer" onClick={() => handleSendDocumentAction('Ucret')}>
                                        <CreditCard className={`w-5 h-5 ${activeMediationData.feeContractSent ? 'text-green-600' : 'text-brand-600'}`} />
                                        {activeMediationData.feeContractSent ? (
                                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                                        ) : (
                                            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-brand-600" />
                                        )}
                                    </div>
                                    <div className="mb-3">
                                        <p className="font-bold text-slate-700 dark:text-slate-200">{activeMediationData.feeContractSent ? 'Sözleşme İletildi' : 'Ücret Sözleşmesi'}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Asgari ücret tarifesi üzerinden.</p>
                                    </div>
                                    {!activeMediationData.feeContractSent ? (
                                        <button 
                                            onClick={() => handleSendDocumentAction('Ucret')}
                                            className="w-full mt-2 bg-brand-50 dark:bg-brand-900/30 hover:bg-brand-100 dark:hover:bg-brand-900/50 text-brand-700 dark:text-brand-300 px-3 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center"
                                        >
                                            <Eye className="w-3 h-3 mr-1" />
                                            Önizle ve Gönder
                                        </button>
                                    ) : (
                                        <div className="mt-2 flex items-center justify-center text-xs font-bold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 py-2 rounded-lg border border-green-100 dark:border-green-900">
                                            <Check className="w-3 h-3 mr-1" /> Başarıyla Gönderildi
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                    
                    {activeTab === 'sessions' && (
                        <div className="lg:col-span-3">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-slate-700 dark:text-slate-200">Oturum Listesi</h3>
                                <button onClick={() => setIsMeetingModalOpen(true)} className="bg-brand-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center hover:bg-brand-700">
                                    <Plus className="w-4 h-4 mr-1" /> Yeni Oturum
                                </button>
                            </div>
                            
                            {activeMediationData.meetings.length === 0 ? (
                                <div className="p-8 bg-slate-50 dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center text-slate-500 dark:text-slate-400">
                                    Henüz planlanmış bir oturum yok.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {activeMediationData.meetings.map(m => (
                                        <div key={m.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition flex flex-col md:flex-row md:items-center justify-between">
                                            <div className="flex items-start gap-4 mb-4 md:mb-0">
                                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg shrink-0 ${m.outcome === 'İptal' ? 'bg-slate-400' : m.type === 'Online' ? 'bg-purple-500' : 'bg-blue-500'}`}>
                                                    {new Date(m.date).getDate()}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-bold text-slate-800 dark:text-white">
                                                            {m.type === 'Online' ? 'Online Video Konferans' : 'Fiziksel Toplantı'}
                                                        </h4>
                                                        {m.outcome === 'İptal' && <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded">İPTAL</span>}
                                                    </div>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center mt-1">
                                                        <Clock className="w-3 h-3 mr-1" /> {new Date(m.date).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}
                                                        <span className="mx-2">•</span>
                                                        {m.type === 'Online' ? (
                                                            <span className="flex items-center text-purple-600 dark:text-purple-400"><Video className="w-3 h-3 mr-1"/> WebRTC</span>
                                                        ) : (
                                                            <span className="flex items-center"><MapPin className="w-3 h-3 mr-1"/> {m.location}</span>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {m.type === 'Online' && m.outcome !== 'İptal' && (
                                                    <button 
                                                        onClick={() => setActiveVideoMeeting(m.id)}
                                                        className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-purple-700 flex items-center shadow-sm animate-pulse"
                                                    >
                                                        <Video className="w-4 h-4 mr-2" /> Katıl
                                                    </button>
                                                )}
                                                {m.outcome !== 'İptal' && (
                                                    <button onClick={() => openCancelModal(m)} className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 px-3 py-2 rounded-lg text-sm font-medium transition">
                                                        İptal / Ertele
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'documents' && (
                        <div className="lg:col-span-3">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-slate-700 dark:text-slate-200">Belgeler ve İmza Durumu</h3>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => setIsMinuteSelectionOpen(true)}
                                        className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center"
                                    >
                                        <Plus className="w-4 h-4 mr-1" /> Tutanak Oluştur
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 text-xs uppercase font-bold text-slate-500 dark:text-slate-400">
                                        <tr>
                                            <th className="px-4 py-3">Belge Adı</th>
                                            <th className="px-4 py-3">Tip</th>
                                            <th className="px-4 py-3">Tarih</th>
                                            <th className="px-4 py-3">Durum</th>
                                            <th className="px-4 py-3 text-right">İşlem</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                        {(activeMediationData.documents || []).map(doc => (
                                            <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                                <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200 flex items-center">
                                                    <FileText className="w-4 h-4 mr-2 text-slate-400" /> {doc.name}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">{doc.type}</td>
                                                <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">{doc.createdDate}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                                        doc.status === 'İmzalandı' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                                                        doc.status === 'İmzada' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : 
                                                        doc.status === 'Gönderildi' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 
                                                        'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                                                    }`}>
                                                        {doc.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    {doc.status === 'Taslak' && (
                                                        <button 
                                                            onClick={() => handleSignDocument(doc.id)}
                                                            disabled={signingDocId === doc.id}
                                                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-bold flex items-center justify-end ml-auto"
                                                        >
                                                            {signingDocId === doc.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'İmzaya Gönder'}
                                                        </button>
                                                    )}
                                                    {doc.status === 'İmzalandı' && (
                                                        <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                                            <Printer className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        {(!activeMediationData.documents || activeMediationData.documents.length === 0) && (
                                            <tr>
                                                <td colSpan={5} className="text-center py-8 text-slate-500 dark:text-slate-400">Belge bulunamadı.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notes' && (
                        <div className="lg:col-span-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8 text-center">
                            <PenTool className="w-12 h-12 text-brand-200 dark:text-brand-800 mx-auto mb-4" />
                            <h3 className="font-bold text-lg text-slate-800 dark:text-white">Canlı Tutanak Düzenleyici</h3>
                            <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">Oturum sırasında tutanağı canlı olarak düzenleyebilir ve anında çıktı alabilirsiniz.</p>
                            <button onClick={() => openTemplateEditor('Tutanak_Acilis')} className="bg-brand-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-700 transition shadow-lg">
                                Editörü Başlat
                            </button>
                        </div>
                    )}

                </div>
            </div>
        ) : (
            // --- LIST VIEW ---
            <div className="animate-in fade-in">
                 <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Arabuluculuk Dosyaları</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Başvuru, süreç, online görüşme ve e-imza yönetimi</p>
                    </div>
                     <button 
                        onClick={() => {
                            setIsApplicationModalOpen(true);
                            setNewApplication({ subject: '', mediatorName: '', fileNumber: '', mediationNumber: '' });
                            setApplicantList([{name: '', phone: '', representative: '', representativePhone: '', tcVkn: '', address: '', email: ''}]);
                            setCounterPartyList([{name: '', phone: '', representative: '', representativePhone: '', tcVkn: '', address: '', email: ''}]);
                        }}
                        className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center shadow-lg transition"
                    >
                        <Plus className="w-5 h-5 mr-2" /> Yeni Başvuru
                    </button>
                 </div>

                  <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                     <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs uppercase font-bold">
                             <tr>
                                 <th className="px-6 py-4">Dosya No / Arb No</th>
                                 <th className="px-6 py-4">Taraf</th>
                                 <th className="px-6 py-4">Durum</th>
                                 <th className="px-6 py-4 text-right">İşlem</th>
                             </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                             {filteredMediations.map(m => (
                                 <tr key={m.id} onClick={() => setSelectedMediation(m)} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition">
                                     <td className="px-6 py-4">
                                         <div className="font-bold text-slate-700 dark:text-slate-200">{m.fileNumber}</div>
                                         {m.mediationNumber && <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{m.mediationNumber}</div>}
                                     </td>
                                     <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{m.clientName}</td>
                                     <td className="px-6 py-4"><span className={`text-xs font-bold px-2 py-1 rounded ${m.status === 'Anlaşma' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>{m.status}</span></td>
                                     <td className="px-6 py-4 text-right"><ArrowRight className="w-4 h-4 ml-auto text-slate-400" /></td>
                                 </tr>
                             ))}
                        </tbody>
                     </table>
                  </div>
            </div>
        )}
    </div>
  );
};
