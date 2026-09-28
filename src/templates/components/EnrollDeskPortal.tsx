import React, { useState, useMemo, useEffect } from 'react';
import { EventData, StudentProfile, CampusNotice, ClassmateShoutout, DynamicFormItem } from '@/types';
import { eventService } from '@/services/eventService';
import { getThemeStyles } from '@/utils/themeHelper';

interface EnrollDeskPortalProps {
  data: EventData;
  isLivePreview?: boolean;
  onStudentSubmit?: (student: Record<string, unknown>) => void;
}

export const EnrollDeskPortal: React.FC<EnrollDeskPortalProps> = ({
  data,
  isLivePreview: _isLivePreview = false,
  onStudentSubmit,
}) => {
  // Always derive a stable scoped portal slug for persistent storage
  const portalId = (data as { slug?: string }).slug || (data.title ? data.title.toLowerCase().replace(/\s+/g, '-') : 'enrolldesk-portal');

  // Standard clean default dataset
  const defaultHub = {
    portalName: data.title || 'EnrollDesk Classmate Hub',
    tagline: data.tagline || 'Student Community & Classmate Directory',
    collegeOrBatchName: data.venue || 'Class of 2027',
    adminPassword: 'admin123',
    batchWhatsappLink: '',
    batchDiscordLink: '',
    departments: ['Computer Science', 'Design & Arts', 'Business & Finance', 'Mechanical Eng', 'Psychology', 'Biotech'],
    academicYears: ['1st Year (Freshman)', '2nd Year (Sophomore)', '3rd Year (Junior)', '4th Year (Senior)', 'Graduate / Alumni'],
    hobbiesList: [
      'Coding',
      'Design & UI/UX',
      'Music & Jamming',
      'Gaming & Esports',
      'Photography',
      'Coffee & Cafes',
      'Fitness & Gym',
      'Anime & Manga',
      'Reading',
      'Travel & Hiking',
      'Podcasts',
      'Cooking',
    ],
    activeFunctions: {
      directory: data.activeSections?.classmatesDirectory ?? true,
      matchmaker: data.activeSections?.hobbyMatchmaker ?? true,
      notices: data.activeSections?.noticesBoard ?? true,
      shoutouts: data.activeSections?.memoryWall ?? true,
      forms: data.activeSections?.dynamicForms ?? true,
      selfEnrollment: data.activeSections?.studentEnrollment ?? true,
    },
    students: [
      {
        id: 'st-1',
        fullName: 'Aarav Mehta',
        photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
        department: 'Computer Science',
        academicYear: '3rd Year (Junior)',
        instagram: 'aarav_codes',
        whatsapp: '+1 555-0192',
        hobbies: ['Coding', 'Gaming & Esports', 'Coffee & Cafes'],
        lookingFor: 'Hackathon Team',
        bio: 'Fullstack tinkerer building indie web apps. Looking for hackathon teammates!',
        enrolledAt: '2026-09-15',
      },
      {
        id: 'st-2',
        fullName: 'Zara Al-Mansoor',
        photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        department: 'Design & Arts',
        academicYear: '3rd Year (Junior)',
        instagram: 'zara.creates',
        whatsapp: '+1 555-0143',
        hobbies: ['Design & UI/UX', 'Photography', 'Music & Jamming'],
        lookingFor: 'Study Buddy',
        bio: 'Visual designer exploring typography. Always down for coffee & playlist sharing.',
        enrolledAt: '2026-09-18',
      },
      {
        id: 'st-3',
        fullName: 'Marcus Vance',
        photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
        department: 'Business & Finance',
        academicYear: '2nd Year (Sophomore)',
        instagram: 'marcus_vance',
        whatsapp: '+1 555-0188',
        hobbies: ['Fitness & Gym', 'Podcasts', 'Travel & Hiking'],
        lookingFor: 'Project Partner',
        bio: 'Finance nerd & startup enthusiast. Let us connect for case competitions!',
        enrolledAt: '2026-09-20',
      },
      {
        id: 'st-4',
        fullName: 'Chloe Lin',
        photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
        department: 'Computer Science',
        academicYear: '2nd Year (Sophomore)',
        instagram: 'chloe_lin_dev',
        whatsapp: '+1 555-0112',
        hobbies: ['Coding', 'Reading', 'Coffee & Cafes'],
        lookingFor: 'Study Buddy',
        bio: 'Algorithms & AI enthusiast. Looking for study buddies in the library.',
        enrolledAt: '2026-09-22',
      },
      {
        id: 'st-5',
        fullName: 'Devon Wright',
        photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
        department: 'Mechanical Eng',
        academicYear: '4th Year (Senior)',
        instagram: 'devon_robotics',
        whatsapp: '+1 555-0177',
        hobbies: ['Gaming & Esports', 'Fitness & Gym', 'Cooking'],
        lookingFor: 'Casual Hangouts',
        bio: 'Robotics team lead graduating soon. Love multiplayer games and weekend cooking.',
        enrolledAt: '2026-09-24',
      },
    ],
    notices: [
      {
        id: 'n-1',
        title: 'Spring Campus Hackathon & Project Showcase',
        department: 'Computer Science',
        date: 'Oct 12, 2026',
        content: 'Registration is now open for our 36-hour annual hackathon with prizes sponsored by top tech innovators. Teams of 2 to 4.',
        isUrgent: true,
        author: 'Student Council',
        category: 'Event' as const,
      },
      {
        id: 'n-2',
        title: 'Midterm Study Group Lounge Bookings',
        department: 'All Departments',
        date: 'Oct 08, 2026',
        content: 'Quiet study rooms in library floor 3 are now open for peer study reservations.',
        isUrgent: false,
        author: 'Campus Library',
        category: 'Academic' as const,
      },
      {
        id: 'n-3',
        title: 'Design Portfolio Review & Coffee Evening',
        department: 'Design & Arts',
        date: 'Oct 15, 2026',
        content: 'Bring your laptops and design files for constructive peer feedback, pour-overs, and lo-fi tunes.',
        isUrgent: false,
        author: 'Design Guild',
        category: 'Club' as const,
      },
    ],
    shoutouts: [
      {
        id: 'sh-1',
        fromName: 'Zara',
        toName: 'Aarav',
        message: 'Huge thanks for debugging my React code before midnight! True legend.',
        tag: 'Study Hero',
        timestamp: '2 hours ago',
        likes: 14,
      },
      {
        id: 'sh-2',
        fromName: 'Devon',
        toName: 'Marcus',
        message: 'Great presentation on market valuation today, killed the Q&A session!',
        tag: 'MVP',
        timestamp: '5 hours ago',
        likes: 9,
      },
      {
        id: 'sh-3',
        fromName: 'Sam',
        toName: 'Chloe',
        message: 'Always sharing the best concise lecture notes in our group chat. We appreciate you!',
        tag: 'Always Helpful',
        timestamp: '1 day ago',
        likes: 21,
      },
    ],
    forms: [
      {
        id: 'form-1',
        title: 'Annual Batch Hoodie Size & Color Intake',
        description: 'Official Class of 2027 embroidered fleece hoodies. Vote on color and select your fit.',
        department: 'All Departments',
        deadline: 'Oct 20, 2026',
        fields: [
          {
            id: 'f-1',
            label: 'Preferred Hoodie Color',
            type: 'select' as const,
            options: ['Oatmeal Heather', 'Deep Forest Green', 'Vintage Midnight Navy', 'Charcoal Black'],
            required: true,
          },
          {
            id: 'f-2',
            label: 'Hoodie Size',
            type: 'select' as const,
            options: ['S (Small)', 'M (Medium)', 'L (Large)', 'XL', '2XL Oversized'],
            required: true,
          },
        ],
        submissionsCount: 42,
      },
    ],
    defaultCopyMessage: '🎓 Hey classmates! Join our batch portal to find peers with matching hobbies and stay updated on notices: ',
  };

  // 1. Persistent Storage Loader
  const initialHub = useMemo(() => {
    return eventService.getPersistentHubData(
      portalId,
      (data.studentHub || defaultHub) as unknown as Record<string, unknown>
    ) as typeof defaultHub;
  }, [portalId, data.studentHub]);

  // 2. Active Tab State
  const [activeTab, setActiveTab] = useState<'directory' | 'matchmaker' | 'notices' | 'shoutouts' | 'forms' | 'admin'>('directory');

  // 3. Site Settings State (Admin editable)
  const [portalSettings, setPortalSettings] = useState({
    portalName: initialHub.portalName || data.title || 'EnrollDesk Classmate Hub',
    tagline: initialHub.tagline || data.tagline || 'Student Community & Classmate Directory',
    collegeOrBatchName: initialHub.collegeOrBatchName || data.venue || 'Class of 2027',
    adminPassword: initialHub.adminPassword || 'admin123',
    defaultCopyMessage: initialHub.defaultCopyMessage || defaultHub.defaultCopyMessage,
    batchWhatsappLink: initialHub.batchWhatsappLink || '',
    batchDiscordLink: initialHub.batchDiscordLink || '',
  });

  // 4. Feature Modules Toggle State
  const [activeFunctions, setActiveFunctions] = useState({
    directory: data.activeSections?.classmatesDirectory ?? initialHub.activeFunctions?.directory ?? true,
    matchmaker: data.activeSections?.hobbyMatchmaker ?? initialHub.activeFunctions?.matchmaker ?? true,
    notices: data.activeSections?.noticesBoard ?? initialHub.activeFunctions?.notices ?? true,
    shoutouts: data.activeSections?.memoryWall ?? initialHub.activeFunctions?.shoutouts ?? true,
    forms: data.activeSections?.dynamicForms ?? initialHub.activeFunctions?.forms ?? true,
    selfEnrollment: data.activeSections?.studentEnrollment ?? initialHub.activeFunctions?.selfEnrollment ?? true,
  });

  // 5. Dynamic Lists (Departments & Hobbies)
  const [departments, setDepartments] = useState<string[]>(initialHub.departments || defaultHub.departments);
  const [hobbiesList, setHobbiesList] = useState<string[]>(initialHub.hobbiesList || defaultHub.hobbiesList);

  // 6. Core Student Data
  const [students, setStudents] = useState<StudentProfile[]>(initialHub.students || defaultHub.students);
  const [notices, setNotices] = useState<CampusNotice[]>(initialHub.notices || defaultHub.notices);
  const [shoutouts, setShoutouts] = useState<ClassmateShoutout[]>(initialHub.shoutouts || defaultHub.shoutouts);
  const [forms, setForms] = useState<DynamicFormItem[]>(initialHub.forms || defaultHub.forms);

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHobby, setSelectedHobby] = useState('All');
  const [selectedDept, setSelectedDept] = useState('All');

  // Matchmaker State
  const [matchName, setMatchName] = useState('');
  const [matchDept, setMatchDept] = useState(departments[0] || 'Computer Science');
  const [matchLookingFor, setMatchLookingFor] = useState('Study Buddy');
  const [matchHobbies, setMatchHobbies] = useState<string[]>(['Coding', 'Coffee & Cafes']);
  const [matchResults, setMatchResults] = useState<Array<{ student: StudentProfile; score: number; sharedHobbies: string[] }> | null>(null);

  // Self-Enrollment Modal State
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [enrollName, setEnrollName] = useState('');
  const [enrollDept, setEnrollDept] = useState(departments[0] || 'Computer Science');
  const [enrollYear, setEnrollYear] = useState('3rd Year (Junior)');
  const [enrollInsta, setEnrollInsta] = useState('');
  const [enrollWhatsApp, setEnrollWhatsApp] = useState('');
  const [enrollLookingFor, setEnrollLookingFor] = useState('Study Buddy');
  const [enrollBio, setEnrollBio] = useState('');
  const [enrollHobbies, setEnrollHobbies] = useState<string[]>(['Coding', 'Coffee & Cafes']);

  // Shoutout Modal State
  const [showShoutoutModal, setShowShoutoutModal] = useState(false);
  const [shoutoutFrom, setShoutoutFrom] = useState('');
  const [shoutoutTo, setShoutoutTo] = useState('');
  const [shoutoutMsg, setShoutoutMsg] = useState('');
  const [shoutoutTag, setShoutoutTag] = useState('MVP');

  // Admin Control Center State
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  const [adminSubTab, setAdminSubTab] = useState<'overview' | 'settings' | 'functions' | 'notices' | 'students' | 'departments' | 'hobbies' | 'forms'>('overview');
  const [adminSearchStudent, setAdminSearchStudent] = useState('');

  // Admin Quick Add Inputs
  const [newDeptInput, setNewDeptInput] = useState('');
  const [newHobbyInput, setNewHobbyInput] = useState('');
  const [newNoticeTitle, setNewNoticeTitle] = useState('');
  const [newNoticeDept, setNewNoticeDept] = useState('All Departments');
  const [newNoticeContent, setNewNoticeContent] = useState('');
  const [newNoticeUrgent, setNewNoticeUrgent] = useState(false);

  // Dynamic Form / Poll Vote Submission State
  const [pollResponses, setPollResponses] = useState<Record<string, Record<string, string>>>({});
  const [newPollTitle, setNewPollTitle] = useState('');
  const [newPollDesc, setNewPollDesc] = useState('');
  const [newPollOptions, setNewPollOptions] = useState('Option A, Option B, Option C');

  const [toast, setToast] = useState<string | null>(null);

  // Automatic Persistence to LocalStorage on every single state change
  useEffect(() => {
    const hubPayload = {
      ...portalSettings,
      departments,
      hobbiesList,
      activeFunctions,
      students,
      notices,
      shoutouts,
      forms,
      academicYears: initialHub.academicYears || defaultHub.academicYears,
    };
    eventService.savePersistentHubData(portalId, hubPayload);
  }, [portalSettings, departments, hobbiesList, activeFunctions, students, notices, shoutouts, forms, portalId, initialHub.academicYears, defaultHub.academicYears]);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const copyLink = (text: string, label = 'Copied to clipboard!') => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    triggerToast(label);
  };

  // Filtered Students for Directory
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        s.fullName.toLowerCase().includes(q) ||
        s.department.toLowerCase().includes(q) ||
        (s.instagram && s.instagram.toLowerCase().includes(q)) ||
        (s.bio && s.bio.toLowerCase().includes(q)) ||
        s.hobbies.some((h) => h.toLowerCase().includes(q));

      const matchHobbyFilter = selectedHobby === 'All' || s.hobbies.includes(selectedHobby);
      const matchDeptFilter = selectedDept === 'All' || s.department === selectedDept;

      return matchSearch && matchHobbyFilter && matchDeptFilter;
    });
  }, [students, searchQuery, selectedHobby, selectedDept]);

  // Handle Enrollment Submission
  const handleEnrollSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollName.trim()) return;

    const newStudent: StudentProfile = {
      id: `st-${Date.now()}`,
      fullName: enrollName.trim(),
      photoUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(enrollName.trim())}`,
      department: enrollDept,
      academicYear: enrollYear,
      instagram: enrollInsta.replace('@', '').trim(),
      whatsapp: enrollWhatsApp.trim(),
      hobbies: enrollHobbies.length > 0 ? enrollHobbies : ['Coding'],
      lookingFor: enrollLookingFor,
      bio: enrollBio.trim() || `Student in ${enrollDept}.`,
      enrolledAt: new Date().toISOString().split('T')[0],
    };

    setStudents([newStudent, ...students]);
    setShowEnrollModal(false);
    setEnrollName('');
    setEnrollBio('');
    setEnrollInsta('');
    setEnrollWhatsApp('');
    triggerToast('🎉 Registered! Your profile is live in the classmate roster.');
    if (onStudentSubmit) onStudentSubmit(newStudent as unknown as Record<string, unknown>);
  };

  // Handle Hobby Matchmaker
  const handleMatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matchName.trim()) {
      triggerToast('Please enter your name');
      return;
    }

    const scored = students
      .filter((s) => s.fullName.toLowerCase() !== matchName.toLowerCase())
      .map((student) => {
        const shared = student.hobbies.filter((h) => matchHobbies.includes(h));
        let score = shared.length * 30;
        if (student.lookingFor === matchLookingFor) score += 25;
        if (student.department === matchDept) score += 15;
        return {
          student,
          score: Math.min(Math.max(score, 45), 98),
          sharedHobbies: shared,
        };
      })
      .sort((a, b) => b.score - a.score);

    setMatchResults(scored);
    triggerToast(`Found ${scored.length} matching peers!`);
  };

  // Handle Shoutout Submission
  const handleShoutoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shoutoutFrom.trim() || !shoutoutTo.trim() || !shoutoutMsg.trim()) return;

    const newShout: ClassmateShoutout = {
      id: `sh-${Date.now()}`,
      fromName: shoutoutFrom.trim(),
      toName: shoutoutTo.trim(),
      message: shoutoutMsg.trim(),
      tag: shoutoutTag,
      timestamp: 'Just now',
      likes: 1,
    };

    setShoutouts([newShout, ...shoutouts]);
    setShowShoutoutModal(false);
    setShoutoutMsg('');
    triggerToast('💖 Shoutout posted to the Memory Wall!');
  };

  // Handle Shoutout Like
  const handleLike = (id: string) => {
    setShoutouts(shoutouts.map((s) => (s.id === id ? { ...s, likes: s.likes + 1 } : s)));
  };

  // Handle Notice Publishing
  const handleNoticeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoticeTitle.trim() || !newNoticeContent.trim()) return;

    const notice: CampusNotice = {
      id: `n-${Date.now()}`,
      title: newNoticeTitle.trim(),
      department: newNoticeDept,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      content: newNoticeContent.trim(),
      isUrgent: newNoticeUrgent,
      author: 'Admin Desk',
      category: 'Administrative',
    };

    setNotices([notice, ...notices]);
    setNewNoticeTitle('');
    setNewNoticeContent('');
    setNewNoticeUrgent(false);
    triggerToast('📢 Campus notice published!');
  };

  // Handle Notice Deletion
  const handleDeleteNotice = (id: string) => {
    setNotices(notices.filter((n) => n.id !== id));
    triggerToast('Notice deleted.');
  };

  // Handle Student Deletion
  const handleDeleteStudent = (id: string) => {
    if (confirm('Are you sure you want to remove this student from the roster?')) {
      setStudents(students.filter((s) => s.id !== id));
      triggerToast('Student removed from directory.');
    }
  };

  // Add Department
  const handleAddDept = (e: React.FormEvent) => {
    e.preventDefault();
    const d = newDeptInput.trim();
    if (d && !departments.includes(d)) {
      setDepartments([...departments, d]);
      setNewDeptInput('');
      triggerToast(`Added department: ${d}`);
    }
  };

  // Remove Department
  const handleRemoveDept = (deptName: string) => {
    if (departments.length <= 1) {
      triggerToast('At least one department is required.');
      return;
    }
    setDepartments(departments.filter((d) => d !== deptName));
    triggerToast(`Removed department: ${deptName}`);
  };

  // Add Hobby
  const handleAddHobby = (e: React.FormEvent) => {
    e.preventDefault();
    const h = newHobbyInput.trim();
    if (h && !hobbiesList.includes(h)) {
      setHobbiesList([...hobbiesList, h]);
      setNewHobbyInput('');
      triggerToast(`Added hobby: ${h}`);
    }
  };

  // Remove Hobby
  const handleRemoveHobby = (hobbyName: string) => {
    if (hobbiesList.length <= 1) {
      triggerToast('At least one hobby is required.');
      return;
    }
    setHobbiesList(hobbiesList.filter((h) => h !== hobbyName));
    triggerToast(`Removed hobby: ${hobbyName}`);
  };

  // Create New Dynamic Poll
  const handleCreatePoll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPollTitle.trim()) return;

    const options = newPollOptions
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean);

    const newForm: DynamicFormItem = {
      id: `form-${Date.now()}`,
      title: newPollTitle.trim(),
      description: newPollDesc.trim() || 'Classmate Batch Survey & Intake',
      department: 'All Departments',
      deadline: 'Active Survey',
      fields: [
        {
          id: `field-${Date.now()}`,
          label: 'Select Your Choice',
          type: 'select',
          options: options.length > 0 ? options : ['Option 1', 'Option 2'],
          required: true,
        },
      ],
      submissionsCount: 0,
    };

    setForms([newForm, ...forms]);
    setNewPollTitle('');
    setNewPollDesc('');
    setNewPollOptions('Option A, Option B, Option C');
    triggerToast('🎉 New batch poll published!');
  };

  // Handle Poll Vote
  const handleVotePoll = (formId: string, choice: string) => {
    setPollResponses((prev) => ({
      ...prev,
      [formId]: { choice, timestamp: new Date().toLocaleTimeString() },
    }));
    setForms(forms.map((f) => (f.id === formId ? { ...f, submissionsCount: (f.submissionsCount || 0) + 1 } : f)));
    triggerToast('✅ Vote recorded! Thank you for participating.');
  };

  const theme = getThemeStyles(data.appearance);

  return (
    <div
      style={theme.bgStyle}
      className={`min-h-screen ${theme.fontBodyClass} ${theme.paletteClass} antialiased flex flex-col selection:bg-slate-200 transition-colors duration-300`}
    >
      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs sm:text-sm font-semibold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 border border-slate-700 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span>{toast}</span>
        </div>
      )}

      {/* 1. TOP HEADER & INSTITUTION IDENTITY */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo & College Identification */}
          <div
            onClick={() => setActiveTab('directory')}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white flex items-center justify-center shadow-sm ring-1 ring-black/5 group-hover:scale-105 transition-transform flex-shrink-0">
              <svg className="w-6 h-6 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base text-slate-900 tracking-tight leading-tight">
                  {portalSettings.portalName}
                </span>
                <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                  Verified
                </span>
              </div>
              <span className="text-xs text-slate-500 block leading-none mt-0.5 font-medium">
                {portalSettings.collegeOrBatchName}
              </span>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1">
            {activeFunctions.directory && (
              <button
                onClick={() => setActiveTab('directory')}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                  activeTab === 'directory' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Directory ({students.length})
              </button>
            )}

            {activeFunctions.matchmaker && (
              <button
                onClick={() => setActiveTab('matchmaker')}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                  activeTab === 'matchmaker' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Matchmaker
              </button>
            )}

            {activeFunctions.notices && (
              <button
                onClick={() => setActiveTab('notices')}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                  activeTab === 'notices' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Notices ({notices.length})
              </button>
            )}

            {activeFunctions.shoutouts && (
              <button
                onClick={() => setActiveTab('shoutouts')}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                  activeTab === 'shoutouts' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Memory Wall
              </button>
            )}

            {activeFunctions.forms && (
              <button
                onClick={() => setActiveTab('forms')}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                  activeTab === 'forms' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Polls ({forms.length})
              </button>
            )}

            <button
              onClick={() => setActiveTab('admin')}
              className={`ml-2 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'admin' ? 'bg-amber-500 text-slate-900 shadow-sm' : 'text-slate-700 bg-slate-100 hover:bg-slate-200'
              }`}
            >
              <span>⚙️</span>
              <span>Admin Desk</span>
            </button>
          </nav>

          {/* Quick Share / Join Action */}
          <div className="flex items-center gap-2">
            {portalSettings.batchWhatsappLink && (
              <a
                href={portalSettings.batchWhatsappLink}
                target="_blank"
                rel="noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold transition-colors cursor-pointer border border-emerald-200"
              >
                <span>💬</span>
                <span>WhatsApp Group</span>
              </a>
            )}

            <button
              onClick={() => copyLink(`${window.location.origin}/e/${portalId}`, '🔗 Portal link copied to clipboard!')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">share</span>
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Scrollbar */}
        <div className="md:hidden flex overflow-x-auto no-scrollbar px-3 py-2 bg-slate-900 gap-1.5 text-xs">
          {activeFunctions.directory && (
            <button
              onClick={() => setActiveTab('directory')}
              className={`px-3 py-1.5 rounded-md font-semibold whitespace-nowrap ${
                activeTab === 'directory' ? 'bg-white text-slate-900 font-bold' : 'text-slate-300'
              }`}
            >
              Directory ({students.length})
            </button>
          )}
          {activeFunctions.matchmaker && (
            <button
              onClick={() => setActiveTab('matchmaker')}
              className={`px-3 py-1.5 rounded-md font-semibold whitespace-nowrap ${
                activeTab === 'matchmaker' ? 'bg-white text-slate-900 font-bold' : 'text-slate-300'
              }`}
            >
              Matchmaker
            </button>
          )}
          {activeFunctions.notices && (
            <button
              onClick={() => setActiveTab('notices')}
              className={`px-3 py-1.5 rounded-md font-semibold whitespace-nowrap ${
                activeTab === 'notices' ? 'bg-white text-slate-900 font-bold' : 'text-slate-300'
              }`}
            >
              Notices ({notices.length})
            </button>
          )}
          {activeFunctions.shoutouts && (
            <button
              onClick={() => setActiveTab('shoutouts')}
              className={`px-3 py-1.5 rounded-md font-semibold whitespace-nowrap ${
                activeTab === 'shoutouts' ? 'bg-white text-slate-900 font-bold' : 'text-slate-300'
              }`}
            >
              Memory Wall
            </button>
          )}
          {activeFunctions.forms && (
            <button
              onClick={() => setActiveTab('forms')}
              className={`px-3 py-1.5 rounded-md font-semibold whitespace-nowrap ${
                activeTab === 'forms' ? 'bg-white text-slate-900 font-bold' : 'text-slate-300'
              }`}
            >
              Polls ({forms.length})
            </button>
          )}
          <button
            onClick={() => setActiveTab('admin')}
            className={`px-3 py-1.5 rounded-md font-semibold whitespace-nowrap ${
              activeTab === 'admin' ? 'bg-amber-400 text-slate-900 font-bold' : 'text-amber-300'
            }`}
          >
            ⚙️ Admin
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* ================= TAB 1: DIRECTORY ================= */}
        {activeTab === 'directory' && activeFunctions.directory && (
          <div className="space-y-6">
            {/* Header Card */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {portalSettings.collegeOrBatchName} Directory
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                  Classmates &amp; Peer Roster
                </h1>
                <p className="text-sm text-slate-600 mt-1 max-w-xl">
                  {portalSettings.tagline}
                </p>
              </div>

              {activeFunctions.selfEnrollment ? (
                <button
                  onClick={() => setShowEnrollModal(true)}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold shadow transition-all cursor-pointer shrink-0"
                >
                  <span className="material-symbols-outlined text-[18px]">person_add</span>
                  <span>+ Join Roster</span>
                </button>
              ) : (
                <div className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-semibold">
                  🔒 Enrollment is closed by Admin
                </div>
              )}
            </div>

            {/* Search & Filter Controls */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Search by student name, major, bio, or hobby..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-slate-50 text-slate-900 placeholder:text-slate-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Hobbies Filter Pills */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Filter by Hobby &amp; Interest:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setSelectedHobby('All')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      selectedHobby === 'All' ? 'bg-slate-900 text-white font-bold' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    All Hobbies ({students.length})
                  </button>
                  {hobbiesList.map((h) => {
                    const count = students.filter((s) => s.hobbies.includes(h)).length;
                    return (
                      <button
                        key={h}
                        onClick={() => setSelectedHobby(h === selectedHobby ? 'All' : h)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          selectedHobby === h ? 'bg-slate-900 text-white font-bold' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {h} {count > 0 && <span className="opacity-75">({count})</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Department Filter */}
              <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Department:
                </span>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-800 bg-white"
                >
                  <option value="All">All Departments</option>
                  {departments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Students Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredStudents.map((st) => (
                <div
                  key={st.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start gap-3.5">
                      <img
                        src={st.photoUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(st.fullName)}`}
                        alt={st.fullName}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 bg-slate-50 flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <h3 className="font-bold text-base text-slate-900 truncate">{st.fullName}</h3>
                        <p className="text-xs text-slate-500 truncate">{st.department}</p>
                        <span className="inline-block mt-0.5 px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-semibold rounded">
                          {st.academicYear}
                        </span>
                      </div>
                    </div>

                    {st.bio && <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{st.bio}</p>}

                    {/* Hobbies Badges */}
                    <div className="flex flex-wrap gap-1">
                      {st.hobbies.map((h) => (
                        <span
                          key={h}
                          className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[11px] font-medium"
                        >
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Footer & Actions */}
                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Looking for: {st.lookingFor || 'Study Buddy'}</span>
                    {st.instagram ? (
                      <a
                        href={`https://instagram.com/${st.instagram}`}
                        target="_blank"
                        rel="noreferrer"
                        className="font-bold text-slate-900 hover:text-amber-600 transition-colors"
                      >
                        @{st.instagram}
                      </a>
                    ) : (
                      <span className="text-slate-400">Classmate</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {filteredStudents.length === 0 && (
              <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
                <span className="text-4xl">🔍</span>
                <h3 className="text-lg font-bold text-slate-900">No classmates found</h3>
                <p className="text-xs text-slate-500">Try adjusting your hobby filters or search query.</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedHobby('All');
                    setSelectedDept('All');
                  }}
                  className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 2: HOBBY MATCHMAKER ================= */}
        {activeTab === 'matchmaker' && activeFunctions.matchmaker && (
          <div className="space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm max-w-2xl mx-auto space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Peer Discovery Algorithm
                </span>
                <h2 className="text-2xl font-bold text-slate-900 mt-1">Classmate Hobby Matchmaker</h2>
                <p className="text-sm text-slate-600 mt-1">
                  Select your top interests to discover batchmates who share the same passions, study goals, or project ideas.
                </p>
              </div>

              <form onSubmit={handleMatchSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={matchName}
                    onChange={(e) => setMatchName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Department
                    </label>
                    <select
                      value={matchDept}
                      onChange={(e) => setMatchDept(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white"
                    >
                      {departments.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Looking For
                    </label>
                    <select
                      value={matchLookingFor}
                      onChange={(e) => setMatchLookingFor(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white"
                    >
                      <option value="Study Buddy">Study Buddy</option>
                      <option value="Project Partner">Project Partner</option>
                      <option value="Hackathon Team">Hackathon Team</option>
                      <option value="Casual Hangouts">Casual Hangouts</option>
                      <option value="Fitness & Sports">Fitness & Sports</option>
                      <option value="Gaming Squad">Gaming Squad</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Select Your Hobbies:
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {hobbiesList.map((hobby) => {
                      const isSelected = matchHobbies.includes(hobby);
                      return (
                        <button
                          type="button"
                          key={hobby}
                          onClick={() => {
                            if (isSelected) {
                              setMatchHobbies(matchHobbies.filter((h) => h !== hobby));
                            } else {
                              setMatchHobbies([...matchHobbies, hobby]);
                            }
                          }}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                            isSelected ? 'bg-slate-900 text-white font-bold' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {isSelected ? '✓ ' : '+ '}
                          {hobby}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow cursor-pointer transition-colors"
                >
                  Find Matching Classmates
                </button>
              </form>

              {matchResults && (
                <div className="pt-6 border-t border-slate-100 space-y-4">
                  <h3 className="text-base font-bold text-slate-900">
                    Compatible Classmates ({matchResults.length})
                  </h3>
                  <div className="space-y-3">
                    {matchResults.map(({ student, score, sharedHobbies }) => (
                      <div
                        key={student.id}
                        className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={student.photoUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${student.fullName}`}
                            alt={student.fullName}
                            className="w-10 h-10 rounded-lg object-cover bg-white"
                          />
                          <div>
                            <h4 className="font-bold text-sm text-slate-900">{student.fullName}</h4>
                            <p className="text-xs text-slate-500">{student.department}</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {sharedHobbies.map((sh) => (
                                <span key={sh} className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                                  ★ {sh}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <span className="text-lg font-black text-emerald-600">{score}%</span>
                          <span className="block text-[10px] text-slate-500">Compatibility</span>
                          {student.instagram && (
                            <a
                              href={`https://instagram.com/${student.instagram}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs font-bold text-slate-900 underline mt-1 block"
                            >
                              Message
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 3: NOTICES BOARD ================= */}
        {activeTab === 'notices' && activeFunctions.notices && (
          <div className="space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Campus Announcements
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">Batch Notice Board</h2>
                <p className="text-sm text-slate-600 mt-1">
                  Official announcements, academic milestones, and council notices for {portalSettings.collegeOrBatchName}.
                </p>
              </div>
              <button
                onClick={() => {
                  setActiveTab('admin');
                  setAdminSubTab('notices');
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold cursor-pointer transition-colors"
              >
                + Publish Notice (Admin)
              </button>
            </div>

            <div className="space-y-4">
              {notices.map((n) => (
                <div
                  key={n.id}
                  className={`p-6 rounded-2xl border transition-all ${
                    n.isUrgent
                      ? 'bg-amber-50/60 border-amber-300 shadow-sm'
                      : 'bg-white border-slate-200 shadow-sm'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      {n.isUrgent && (
                        <span className="px-2 py-0.5 rounded bg-red-600 text-white font-bold text-[10px] uppercase tracking-wide animate-pulse">
                          Urgent Notice
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-semibold">
                        {n.department}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 font-medium">{n.date}</span>
                  </div>

                  <div className="mt-3">
                    <h3 className="text-lg font-bold text-slate-900">{n.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">{n.content}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                    <span>Published by {n.author || 'Batch Administration'}</span>
                    <button
                      onClick={() => copyLink(`${window.location.origin}/e/${portalId}`, 'Notice link copied!')}
                      className="text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
                    >
                      Copy Share Link
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 4: MEMORY WALL ================= */}
        {activeTab === 'shoutouts' && activeFunctions.shoutouts && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Peer Appreciation
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">Memory &amp; Shoutout Wall</h2>
                <p className="text-sm text-slate-600 mt-1">
                  Celebrate classmates, thank study partners, and leave memories for your batch.
                </p>
              </div>

              <button
                onClick={() => setShowShoutoutModal(true)}
                className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow cursor-pointer transition-colors"
              >
                + Post a Shoutout
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {shoutouts.map((shout) => (
                <div
                  key={shout.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-[10px] tracking-wide">
                        {shout.tag}
                      </span>
                      <span className="text-[11px] text-slate-400">{shout.timestamp}</span>
                    </div>

                    <div className="text-xs font-bold text-slate-900">
                      To: <span className="text-amber-700">{shout.toName}</span>
                    </div>

                    <p className="text-xs text-slate-700 italic leading-relaxed">
                      "{shout.message}"
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">— {shout.fromName}</span>
                    <button
                      onClick={() => handleLike(shout.id)}
                      className="inline-flex items-center gap-1 font-bold text-amber-600 hover:scale-110 transition-transform cursor-pointer"
                    >
                      <span>❤️</span>
                      <span>{shout.likes}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 5: BATCH FORMS & POLLS ================= */}
        {activeTab === 'forms' && activeFunctions.forms && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Student Polling &amp; Questionnaires
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">Batch Forms &amp; Polls</h2>
                <p className="text-sm text-slate-600 mt-1">
                  Vote on batch merch, trip locations, and project preferences with live counts.
                </p>
              </div>

              <button
                onClick={() => {
                  setActiveTab('admin');
                  setAdminSubTab('forms');
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold cursor-pointer transition-colors"
              >
                + Create Poll (Admin)
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {forms.map((form) => {
                const voted = pollResponses[form.id];
                return (
                  <div key={form.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        {form.deadline}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        {form.submissionsCount || 0} Submissions
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{form.title}</h3>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{form.description}</p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      {form.fields.map((field) => (
                        <div key={field.id} className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-700">{field.label}</label>
                          <div className="space-y-1.5">
                            {field.options?.map((opt) => {
                              const isSelected = voted?.choice === opt;
                              return (
                                <button
                                  key={opt}
                                  onClick={() => handleVotePoll(form.id, opt)}
                                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center justify-between ${
                                    isSelected
                                      ? 'bg-slate-900 text-white border-slate-900'
                                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                                  }`}
                                >
                                  <span>{opt}</span>
                                  {isSelected && <span className="font-bold text-amber-300">✓ Voted</span>}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>

                    {voted && (
                      <p className="text-[11px] text-emerald-600 font-semibold">
                        ✓ Your choice "{voted.choice}" was recorded at {voted.timestamp}.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= TAB 6: ADMIN DESK (COMPREHENSIVE SUITE) ================= */}
        {activeTab === 'admin' && (
          <div className="space-y-6">
            {!isAdminAuth ? (
              <div className="max-w-md mx-auto bg-white p-8 rounded-2xl border border-slate-200 shadow-md text-center space-y-4">
                <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center mx-auto text-xl font-bold">
                  🔒
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Admin Control Center</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Enter master portal password to customize site information, toggle functions, manage students, and edit options.
                  </p>
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (adminPasswordInput === portalSettings.adminPassword) {
                      setIsAdminAuth(true);
                      triggerToast('✅ Admin authenticated');
                    } else {
                      triggerToast('❌ Incorrect password (default: admin123)');
                    }
                  }}
                  className="space-y-3"
                >
                  <input
                    type="password"
                    placeholder="Enter Admin Password (admin123)"
                    value={adminPasswordInput}
                    onChange={(e) => setAdminPasswordInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-slate-900"
                  />
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs shadow cursor-pointer"
                  >
                    Unlock Admin Center
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                {/* Admin Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                        Admin Management Console
                      </h2>
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        Online
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Configure your site live. Changes persist immediately to public visitors.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        copyLink(
                          `${portalSettings.defaultCopyMessage}${window.location.origin}/e/${portalId}`,
                          '📋 WhatsApp broadcast text copied!'
                        )
                      }
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow cursor-pointer flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[16px]">content_copy</span>
                      <span>Copy WhatsApp Broadcast</span>
                    </button>
                    <button
                      onClick={() => setIsAdminAuth(false)}
                      className="px-3 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold rounded-xl cursor-pointer"
                    >
                      Lock Desk
                    </button>
                  </div>
                </div>

                {/* Admin Sub-Tabs Navigation */}
                <div className="flex overflow-x-auto no-scrollbar gap-1 border-b border-slate-100 pb-2 text-xs">
                  <button
                    onClick={() => setAdminSubTab('overview')}
                    className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer whitespace-nowrap ${
                      adminSubTab === 'overview' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Overview &amp; Stats
                  </button>
                  <button
                    onClick={() => setAdminSubTab('settings')}
                    className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer whitespace-nowrap ${
                      adminSubTab === 'settings' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Site &amp; Batch Settings
                  </button>
                  <button
                    onClick={() => setAdminSubTab('functions')}
                    className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer whitespace-nowrap ${
                      adminSubTab === 'functions' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Toggle Modules
                  </button>
                  <button
                    onClick={() => setAdminSubTab('students')}
                    className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer whitespace-nowrap ${
                      adminSubTab === 'students' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Students Roster ({students.length})
                  </button>
                  <button
                    onClick={() => setAdminSubTab('departments')}
                    className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer whitespace-nowrap ${
                      adminSubTab === 'departments' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Departments ({departments.length})
                  </button>
                  <button
                    onClick={() => setAdminSubTab('hobbies')}
                    className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer whitespace-nowrap ${
                      adminSubTab === 'hobbies' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Hobbies ({hobbiesList.length})
                  </button>
                  <button
                    onClick={() => setAdminSubTab('notices')}
                    className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer whitespace-nowrap ${
                      adminSubTab === 'notices' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Publish Notices ({notices.length})
                  </button>
                  <button
                    onClick={() => setAdminSubTab('forms')}
                    className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer whitespace-nowrap ${
                      adminSubTab === 'forms' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Batch Polls ({forms.length})
                  </button>
                </div>

                {/* --- 1. OVERVIEW & STATS --- */}
                {adminSubTab === 'overview' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-2xl font-bold text-slate-900">{students.length}</span>
                        <span className="block text-xs text-slate-500 mt-0.5">Enrolled Classmates</span>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-2xl font-bold text-slate-900">{departments.length}</span>
                        <span className="block text-xs text-slate-500 mt-0.5">Active Departments</span>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-2xl font-bold text-slate-900">{notices.length}</span>
                        <span className="block text-xs text-slate-500 mt-0.5">Campus Notices</span>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-2xl font-bold text-slate-900">{shoutouts.length}</span>
                        <span className="block text-xs text-slate-500 mt-0.5">Memory Wall Notes</span>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3">
                      <h4 className="text-sm font-bold text-slate-900">Broadcast WhatsApp Message</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Copy this pre-formatted invitation to post into your college, department, or batch WhatsApp group:
                      </p>
                      <div className="p-3 bg-white rounded-lg border border-slate-200 font-mono text-xs text-slate-800">
                        {portalSettings.defaultCopyMessage}
                        <span className="text-amber-700 font-bold">{window.location.origin}/e/{portalId}</span>
                      </div>
                      <button
                        onClick={() =>
                          copyLink(
                            `${portalSettings.defaultCopyMessage}${window.location.origin}/e/${portalId}`,
                            '📋 WhatsApp invitation copied!'
                          )
                        }
                        className="px-4 py-2 bg-slate-900 text-white rounded-lg font-bold text-xs cursor-pointer shadow"
                      >
                        Copy to Clipboard
                      </button>
                    </div>
                  </div>
                )}

                {/* --- 2. SITE & BATCH SETTINGS --- */}
                {adminSubTab === 'settings' && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      triggerToast('💾 Site & Batch settings saved live!');
                    }}
                    className="max-w-xl space-y-4"
                  >
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Portal Name
                      </label>
                      <input
                        type="text"
                        value={portalSettings.portalName}
                        onChange={(e) => setPortalSettings({ ...portalSettings, portalName: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        College or Batch Name
                      </label>
                      <input
                        type="text"
                        value={portalSettings.collegeOrBatchName}
                        onChange={(e) => setPortalSettings({ ...portalSettings, collegeOrBatchName: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Tagline / Subtitle
                      </label>
                      <input
                        type="text"
                        value={portalSettings.tagline}
                        onChange={(e) => setPortalSettings({ ...portalSettings, tagline: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Official Batch WhatsApp Invite Link
                      </label>
                      <input
                        type="url"
                        placeholder="https://chat.whatsapp.com/..."
                        value={portalSettings.batchWhatsappLink}
                        onChange={(e) => setPortalSettings({ ...portalSettings, batchWhatsappLink: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Admin Password
                      </label>
                      <input
                        type="text"
                        value={portalSettings.adminPassword}
                        onChange={(e) => setPortalSettings({ ...portalSettings, adminPassword: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm bg-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Default WhatsApp Broadcast Copy Text
                      </label>
                      <textarea
                        rows={2}
                        value={portalSettings.defaultCopyMessage}
                        onChange={(e) => setPortalSettings({ ...portalSettings, defaultCopyMessage: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                      />
                    </div>

                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs shadow cursor-pointer"
                    >
                      Save Settings
                    </button>
                  </form>
                )}

                {/* --- 3. TOGGLE MODULES / FUNCTIONS --- */}
                {adminSubTab === 'functions' && (
                  <div className="space-y-4 max-w-xl">
                    <p className="text-xs text-slate-600">
                      Enable or disable features across the student portal. Disabled modules will be hidden immediately from student view.
                    </p>

                    <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                      {[
                        { key: 'directory', label: 'Classmates Directory & Search', desc: 'Allows students to browse peers, search by major and hobby.' },
                        { key: 'matchmaker', label: 'Hobby & Interest Matchmaker', desc: 'Enables the AI/rule compatibility matching tool.' },
                        { key: 'notices', label: 'Campus Notice Board', desc: 'Enables official college and batch announcements.' },
                        { key: 'shoutouts', label: 'Memory & Shoutouts Wall', desc: 'Enables peer notes, memories, and appreciation hearts.' },
                        { key: 'forms', label: 'Batch Polls & Dynamic Surveys', desc: 'Enables custom questionnaires, merch sizing, and trip votes.' },
                        { key: 'selfEnrollment', label: 'Allow Student Self-Registration', desc: 'If turned off, students cannot add new profiles to the roster.' },
                      ].map(({ key, label, desc }) => (
                        <div key={key} className="p-4 bg-white flex items-center justify-between gap-4">
                          <div>
                            <h4 className="font-bold text-sm text-slate-900">{label}</h4>
                            <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={Boolean(activeFunctions[key as keyof typeof activeFunctions])}
                              onChange={(e) => {
                                setActiveFunctions({
                                  ...activeFunctions,
                                  [key]: e.target.checked,
                                });
                                triggerToast(`Updated module: ${label}`);
                              }}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-900"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* --- 4. STUDENTS ROSTER MANAGER --- */}
                {adminSubTab === 'students' && (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <input
                        type="text"
                        placeholder="Search student records..."
                        value={adminSearchStudent}
                        onChange={(e) => setAdminSearchStudent(e.target.value)}
                        className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs w-full sm:w-64"
                      />
                      <button
                        onClick={() => {
                          const csv = students.map((s) => `"${s.fullName}","${s.department}","${s.instagram || ''}","${s.whatsapp || ''}","${s.lookingFor || ''}"`).join('\n');
                          copyLink(`Name,Department,Instagram,WhatsApp,LookingFor\n${csv}`, '📊 CSV copied to clipboard!');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold cursor-pointer"
                      >
                        Export CSV Roster
                      </button>
                    </div>

                    <div className="overflow-x-auto border border-slate-200 rounded-xl">
                      <table className="w-full text-left text-xs text-slate-600">
                        <thead className="bg-slate-50 text-slate-900 font-bold uppercase text-[10px] border-b border-slate-200">
                          <tr>
                            <th className="p-3">Student Name</th>
                            <th className="p-3">Department</th>
                            <th className="p-3">Instagram</th>
                            <th className="p-3 bg-amber-50 text-amber-900">WhatsApp (Admin View)</th>
                            <th className="p-3">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {students
                            .filter(
                              (s) =>
                                !adminSearchStudent ||
                                s.fullName.toLowerCase().includes(adminSearchStudent.toLowerCase()) ||
                                s.department.toLowerCase().includes(adminSearchStudent.toLowerCase())
                            )
                            .map((st) => (
                              <tr key={st.id} className="hover:bg-slate-50">
                                <td className="p-3 font-semibold text-slate-900">{st.fullName}</td>
                                <td className="p-3">{st.department}</td>
                                <td className="p-3">{st.instagram ? `@${st.instagram}` : '—'}</td>
                                <td className="p-3 bg-amber-50/50 font-mono text-amber-900 font-bold">
                                  {st.whatsapp || '—'}
                                </td>
                                <td className="p-3">
                                  <button
                                    onClick={() => handleDeleteStudent(st.id)}
                                    className="text-red-600 hover:text-red-800 font-bold text-xs cursor-pointer"
                                  >
                                    Delete
                                  </button>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* --- 5. DEPARTMENTS MANAGER --- */}
                {adminSubTab === 'departments' && (
                  <div className="space-y-4 max-w-xl">
                    <p className="text-xs text-slate-600">
                      Add or remove academic majors &amp; departments available for student registration.
                    </p>

                    <form onSubmit={handleAddDept} className="flex gap-2">
                      <input
                        type="text"
                        required
                        placeholder="New Department (e.g. Artificial Intelligence)"
                        value={newDeptInput}
                        onChange={(e) => setNewDeptInput(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer"
                      >
                        + Add Department
                      </button>
                    </form>

                    <div className="space-y-2">
                      {departments.map((dept) => (
                        <div
                          key={dept}
                          className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                        >
                          <span className="font-semibold text-slate-900">{dept}</span>
                          <button
                            onClick={() => handleRemoveDept(dept)}
                            className="text-red-500 hover:text-red-700 font-bold cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* --- 6. HOBBIES MANAGER --- */}
                {adminSubTab === 'hobbies' && (
                  <div className="space-y-4 max-w-xl">
                    <p className="text-xs text-slate-600">
                      Manage peer hobbies that appear in filters, matchmaking algorithm, and registration forms.
                    </p>

                    <form onSubmit={handleAddHobby} className="flex gap-2">
                      <input
                        type="text"
                        required
                        placeholder="New Hobby (e.g. Robotics, Filmmaking)"
                        value={newHobbyInput}
                        onChange={(e) => setNewHobbyInput(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer"
                      >
                        + Add Hobby
                      </button>
                    </form>

                    <div className="flex flex-wrap gap-2 pt-2">
                      {hobbiesList.map((hobby) => (
                        <div
                          key={hobby}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-800 text-xs font-semibold"
                        >
                          <span>{hobby}</span>
                          <button
                            onClick={() => handleRemoveHobby(hobby)}
                            className="text-slate-400 hover:text-red-600 font-bold ml-1 cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* --- 7. NOTICES MANAGER --- */}
                {adminSubTab === 'notices' && (
                  <div className="space-y-6 max-w-2xl">
                    <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3">
                      <h4 className="font-bold text-sm text-slate-900">Publish New Notice</h4>
                      <form onSubmit={handleNoticeSubmit} className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            required
                            placeholder="Notice Title"
                            value={newNoticeTitle}
                            onChange={(e) => setNewNoticeTitle(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                          />
                          <select
                            value={newNoticeDept}
                            onChange={(e) => setNewNoticeDept(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                          >
                            <option value="All Departments">All Departments</option>
                            {departments.map((d) => (
                              <option key={d} value={d}>
                                {d}
                              </option>
                            ))}
                          </select>
                        </div>
                        <textarea
                          rows={3}
                          required
                          placeholder="Notice Content / Broadcast Body"
                          value={newNoticeContent}
                          onChange={(e) => setNewNoticeContent(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                        />
                        <div className="flex items-center justify-between">
                          <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={newNoticeUrgent}
                              onChange={(e) => setNewNoticeUrgent(e.target.checked)}
                              className="rounded accent-slate-900"
                            />
                            <span>Mark as Urgent Notice</span>
                          </label>
                          <button
                            type="submit"
                            className="px-4 py-2 rounded-lg bg-slate-900 text-white font-bold text-xs cursor-pointer"
                          >
                            Publish Notice
                          </button>
                        </div>
                      </form>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-bold text-sm text-slate-900">Published Notices ({notices.length})</h4>
                      <div className="space-y-2">
                        {notices.map((nt) => (
                          <div
                            key={nt.id}
                            className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-3 text-xs"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900">{nt.title}</span>
                                {nt.isUrgent && (
                                  <span className="px-1.5 py-0.2 rounded bg-red-100 text-red-800 text-[10px] font-bold">
                                    Urgent
                                  </span>
                                )}
                              </div>
                              <span className="text-slate-500 text-[11px]">
                                {nt.department} • {nt.date}
                              </span>
                            </div>
                            <button
                              onClick={() => handleDeleteNotice(nt.id)}
                              className="text-red-600 hover:text-red-800 font-bold cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* --- 8. DYNAMIC POLLS MANAGER --- */}
                {adminSubTab === 'forms' && (
                  <div className="space-y-6 max-w-xl">
                    <form onSubmit={handleCreatePoll} className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3">
                      <h4 className="font-bold text-sm text-slate-900">Create New Batch Poll</h4>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Poll Title
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Batch Trip Destination 2026"
                          value={newPollTitle}
                          onChange={(e) => setNewPollTitle(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Description
                        </label>
                        <input
                          type="text"
                          placeholder="Vote for where we should hold our annual retreat"
                          value={newPollDesc}
                          onChange={(e) => setNewPollDesc(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Select Options (Comma-separated)
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Option 1, Option 2, Option 3"
                          value={newPollOptions}
                          onChange={(e) => setNewPollOptions(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold cursor-pointer"
                      >
                        Publish Batch Poll
                      </button>
                    </form>

                    <div className="space-y-3">
                      <h4 className="font-bold text-sm text-slate-900">Active Polls ({forms.length})</h4>
                      <div className="space-y-2">
                        {forms.map((f) => (
                          <div key={f.id} className="p-3.5 rounded-xl bg-white border border-slate-200 flex justify-between items-center text-xs">
                            <div>
                              <span className="font-bold text-slate-900">{f.title}</span>
                              <span className="block text-slate-500 text-[11px]">
                                {f.submissionsCount || 0} votes recorded
                              </span>
                            </div>
                            <button
                              onClick={() => {
                                setForms(forms.filter((x) => x.id !== f.id));
                                triggerToast('Poll deleted.');
                              }}
                              className="text-red-500 hover:text-red-700 font-bold cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ================= MODAL: JOIN ROSTER ================= */}
      {showEnrollModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowEnrollModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-2 cursor-pointer"
            >
              ✕
            </button>

            <div>
              <h3 className="text-xl font-bold text-slate-900">Join Your Classmate Roster</h3>
              <p className="text-xs text-slate-500 mt-0.5">Register your profile to connect with peers and find teammates.</p>
            </div>

            <form onSubmit={handleEnrollSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maya Chen"
                  value={enrollName}
                  onChange={(e) => setEnrollName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Department
                  </label>
                  <select
                    value={enrollDept}
                    onChange={(e) => setEnrollDept(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                  >
                    {departments.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Academic Year
                  </label>
                  <select
                    value={enrollYear}
                    onChange={(e) => setEnrollYear(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                  >
                    <option value="1st Year (Freshman)">1st Year (Freshman)</option>
                    <option value="2nd Year (Sophomore)">2nd Year (Sophomore)</option>
                    <option value="3rd Year (Junior)">3rd Year (Junior)</option>
                    <option value="4th Year (Senior)">4th Year (Senior)</option>
                    <option value="Graduate / Alumni">Graduate / Alumni</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Instagram Handle <span className="text-slate-400 font-normal">(Public)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="maya.creates"
                    value={enrollInsta}
                    onChange={(e) => setEnrollInsta(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    WhatsApp Number <span className="text-amber-700 font-bold">(Private to Admin)</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="+1 555-0199"
                    value={enrollWhatsApp}
                    onChange={(e) => setEnrollWhatsApp(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Select Your Hobbies:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {hobbiesList.map((hobby) => {
                    const isSelected = enrollHobbies.includes(hobby);
                    return (
                      <button
                        type="button"
                        key={hobby}
                        onClick={() => {
                          if (isSelected) {
                            setEnrollHobbies(enrollHobbies.filter((h) => h !== hobby));
                          } else {
                            setEnrollHobbies([...enrollHobbies, hobby]);
                          }
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                          isSelected ? 'bg-slate-900 text-white font-bold' : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {hobby}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Looking For
                </label>
                <select
                  value={enrollLookingFor}
                  onChange={(e) => setEnrollLookingFor(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                >
                  <option value="Study Buddy">Study Buddy</option>
                  <option value="Project Partner">Project Partner</option>
                  <option value="Hackathon Team">Hackathon Team</option>
                  <option value="Casual Hangouts">Casual Hangouts</option>
                  <option value="Fitness & Sports">Fitness & Sports</option>
                  <option value="Gaming Squad">Gaming Squad</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Short Bio
                </label>
                <textarea
                  rows={2}
                  placeholder="What are you working on or interested in?"
                  value={enrollBio}
                  onChange={(e) => setEnrollBio(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow cursor-pointer transition-colors"
              >
                Save Profile to Roster
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: POST SHOUTOUT ================= */}
      {showShoutoutModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowShoutoutModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-2 cursor-pointer"
            >
              ✕
            </button>

            <div>
              <h3 className="text-xl font-bold text-slate-900">Post a Shoutout</h3>
              <p className="text-xs text-slate-500 mt-0.5">Celebrate a peer on the batch wall.</p>
            </div>

            <form onSubmit={handleShoutoutSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sam"
                  value={shoutoutFrom}
                  onChange={(e) => setShoutoutFrom(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  To (Classmate Name)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chloe"
                  value={shoutoutTo}
                  onChange={(e) => setShoutoutTo(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Badge Tag
                </label>
                <select
                  value={shoutoutTag}
                  onChange={(e) => setShoutoutTag(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                >
                  <option value="MVP">MVP</option>
                  <option value="Study Hero">Study Hero</option>
                  <option value="Always Helpful">Always Helpful</option>
                  <option value="Creative Soul">Creative Soul</option>
                  <option value="Life of the Batch">Life of the Batch</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Message
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Write your appreciation or memory note..."
                  value={shoutoutMsg}
                  onChange={(e) => setShoutoutMsg(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs shadow cursor-pointer"
              >
                Post Note
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
