import { TemplateDefinition, TemplateMetadata, EventCategory } from '@/types/template';
import { WeddingTimeless } from './components/WeddingTimeless';
import { BirthdayEmma } from './components/BirthdayEmma';
import { OpeningCoffeeHouse } from './components/OpeningCoffeeHouse';
import { PartyEvening } from './components/PartyEvening';
import { EnrollDeskPortal } from './components/EnrollDeskPortal';

/**
 * Built-in Template Registry for Tempo
 *
 * Supports both Free Keepsake Templates and Pro Interactive Modular Sites (e.g. EnrollDesk)
 */
export const templatesRegistry: TemplateDefinition[] = [
  {
    id: 'enrolldesk-01',
    name: 'EnrollDesk',
    category: 'student',
    categoryLabel: 'Student & Campus',
    subtitle: 'Classmate Hub & Portal',
    description: 'Dynamic student space with classmate search, hobby matchmaker, self-enrollment, notices board, custom forms, memory wall, and admin 1-click broadcast.',
    previewImage:
      'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80',
    badge: 'Pro Interactive · Full Functions',
    isFeatured: true,
    tier: 'pro',
    availableFunctions: [
      'Classmate Directory with Search',
      'Hobby & Interest Matching Algorithm',
      'Student Self-Enrollment & Photo Cards',
      'Campus Notices & Urgent Broadcasts',
      'Dynamic Custom Forms & Batch Polls',
      'Classmate Memory Wall & Shoutouts',
      'Admin Control Desk & 1-Click WhatsApp Copy',
    ],
    featuredDetails: {
      headline: 'EnrollDesk Portal',
      subheadline: 'A personal space for student life & classmate connections.',
      description:
        'A dedicated digital lounge for your cohort, department, or student group. Search classmates by hobbies, organize study groups, view official announcements, fill custom forms, and leave peer memories.',
      features: [
        'Built-in hobby matchmaker with strict privacy protection',
        'Admin control center with 1-click WhatsApp & broadcast copy',
        'Customizable modular functions (toggle any section on/off)',
      ],
    },
    component: EnrollDeskPortal,
    defaultData: {
      title: 'EnrollDesk Classmate Hub',
      tagline: 'Student Community & Classmate Portal',
      eventType: 'Student Portal',
      date: 'Fall & Spring Academic Year',
      targetDateIso: '2027-05-30T18:00:00.000Z',
      time: 'Always Active & Live',
      venue: 'Class of 2027 Portal',
      address: 'University Main Quad & Digital Lounge',
      note: 'Welcome to our private batch portal! Connect with peers across departments, find project partners by hobby, and stay updated with official notices.',
      photos: [
        {
          id: 'p-ed1',
          url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80',
          isCover: true,
        },
      ],
      appearance: {
        atmosphere: 'campus-academic',
        palette: 'navy-gold-coral',
        typography: 'space-inter',
      },
      activeSections: {
        hero: true,
        countdown: false,
        story: false,
        schedule: false,
        venue: false,
        gallery: false,
        rsvp: false,
        guestbook: false,
        classmatesDirectory: true,
        hobbyMatchmaker: true,
        studentEnrollment: true,
        noticesBoard: true,
        dynamicForms: true,
        memoryWall: true,
        adminDesk: true,
      },
      rsvpSettings: {
        enabled: false,
        allowMealSelection: false,
        allowDietaryNotes: false,
        allowSongRequests: false,
        allowPlusOnes: false,
      },
      studentHub: {
        portalName: 'EnrollDesk Classmate Hub',
        tagline: 'Student Community & Classmate Portal',
        collegeOrBatchName: 'Class of 2027',
        adminPassword: 'admin123',
        departments: ['Computer Science', 'Design & Arts', 'Business & Finance', 'Mechanical Eng', 'Psychology', 'Biotech'],
        academicYears: ['1st Year (Freshman)', '2nd Year (Sophomore)', '3rd Year (Junior)', '4th Year (Senior)', 'Graduate / Alumni'],
        hobbiesList: ['Coding', 'Design & UI/UX', 'Music & Jamming', 'Gaming & Esports', 'Photography', 'Coffee & Cafes', 'Fitness & Gym', 'Anime & Manga', 'Reading', 'Travel & Hiking', 'Podcasts', 'Cooking'],
        students: [
          {
            id: 'st-1',
            fullName: 'Aarav Mehta',
            photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
            department: 'Computer Science',
            academicYear: '3rd Year (Junior)',
            instagram: 'aarav_codes',
            whatsapp: '+1 555-0192',
            gender: 'Male',
            hobbies: ['Coding', 'Gaming & Esports', 'Coffee & Cafes'],
            lookingFor: 'Hackathon Team',
            bio: 'Fullstack tinkerer, building indie web apps and looking for hackathon teammates!',
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
            gender: 'Female',
            hobbies: ['Design & UI/UX', 'Photography', 'Music & Jamming'],
            lookingFor: 'Study Buddy',
            bio: 'Visual designer exploring generative design and typography. Always down for coffee & playlist sharing.',
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
            gender: 'Male',
            hobbies: ['Fitness & Gym', 'Podcasts', 'Travel & Hiking'],
            lookingFor: 'Project Partner',
            bio: 'Finance nerd & startup enthusiast. Let us connect for case competitions or gym sessions!',
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
            gender: 'Female',
            hobbies: ['Coding', 'Reading', 'Coffee & Cafes'],
            lookingFor: 'Study Buddy',
            bio: 'Algorithms & AI enthusiast. Looking for peers to solve LeetCode or study in the library.',
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
            gender: 'Male',
            hobbies: ['Gaming & Esports', 'Fitness & Gym', 'Cooking'],
            lookingFor: 'Casual Friends',
            bio: 'Robotics team lead, graduating soon! Love multiplayer FPS and weekend cooking experiments.',
            enrolledAt: '2026-09-24',
          },
        ],
        notices: [
          {
            id: 'n-1',
            title: 'Spring Campus Hackathon & Showcase',
            department: 'Computer Science',
            date: 'Oct 12, 2026',
            content: 'Registration is now open for our 36-hour annual hackathon with prizes sponsored by top tech innovators. Form teams of 2-4.',
            isUrgent: true,
            author: 'Student Council',
            category: 'Event',
          },
          {
            id: 'n-2',
            title: 'Midterm Study Group Lounge Bookings',
            department: 'All Departments',
            date: 'Oct 08, 2026',
            content: 'Quiet study rooms in the library floor 3 can now be booked via the forms tab for peer study sessions.',
            isUrgent: false,
            author: 'Campus Library',
            category: 'Academic',
          },
          {
            id: 'n-3',
            title: 'Creative Portfolio Review & Coffee Night',
            department: 'Design & Arts',
            date: 'Oct 15, 2026',
            content: 'Bring your laptops and design files for constructive peer feedback, free pour-overs, and lo-fi beats.',
            isUrgent: false,
            author: 'Design Guild',
            category: 'Club',
          },
        ],
        forms: [
          {
            id: 'f-1',
            title: 'Class Project Partner Matching Form',
            description: 'Tell us your course codes, preferred time slots, and project domain to be automatically paired with a classmate.',
            department: 'All Departments',
            deadline: 'Oct 20, 2026',
            submissionsCount: 42,
            fields: [
              { id: 'f_name', label: 'Student Full Name', type: 'text', required: true, placeholder: 'e.g. Maya Chen' },
              { id: 'f_dept', label: 'Primary Course / Subject', type: 'text', required: true, placeholder: 'e.g. CS 301 - Distributed Systems' },
              { id: 'f_time', label: 'Preferred Meeting Hours', type: 'select', options: ['Weekday Evenings (6-9 PM)', 'Weekend Afternoons', 'Flexible / Async'], required: true },
              { id: 'f_notes', label: 'Specific Skills or Topic Interests', type: 'textarea', placeholder: 'e.g. Frontend React, Backend Python, Cloud...' },
            ],
          },
          {
            id: 'f-2',
            title: 'Class Merchandise & Hoodie Poll',
            description: 'Vote on hoodie colors, embroidered batch crest designs, and oversized vs classic fit for our graduation drop.',
            department: 'Class of 2027',
            deadline: 'Nov 01, 2026',
            submissionsCount: 118,
            fields: [
              { id: 'f_size', label: 'Preferred Apparel Size', type: 'select', options: ['Small', 'Medium', 'Large', 'XL', '2XL'], required: true },
              { id: 'f_color', label: 'Favorite Colorway', type: 'select', options: ['Midnight Navy & Gold', 'Vintage Charcoal', 'Forest Moss', 'Oatmeal Heather'], required: true },
              { id: 'f_custom_text', label: 'Back Custom Nickname', type: 'text', placeholder: 'e.g. "MAVERICK"' },
            ],
          },
        ],
        shoutouts: [
          {
            id: 'sh-1',
            fromName: 'Zara',
            toName: 'Aarav',
            message: 'Huge thanks for debugging my React state issue before midnight submission! True legend.',
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
            message: 'Always sharing the best concise lecture notes in the group chat. We appreciate you!',
            tag: 'Always Smiling',
            timestamp: '1 day ago',
            likes: 21,
          },
        ],
        defaultCopyMessage: '🎓 Hey classmates! Join our private batch portal to connect, find project partners by hobby, view notices, and submit course forms: ',
      },
    },
  },
  {
    id: 'wedding-01',
    name: 'Timeless',
    category: 'wedding',
    categoryLabel: 'Wedding',
    subtitle: 'Rahul & Priya',
    description: 'Minimalist typography meets full-bleed candid photography. Perfect for modern couples.',
    previewImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDrXhj_85XcFOKhkG4qY7qNgs75JdniIqqg054JAtSrKnln4teC7WRqqkzY48kGBbruY_4_cUhIArt9PE7A-kerr7mTPbUseCy9pU_VKItPqaxSXkZcMvMRZTXBNMSs9qHUm03eKWeoq-PYbeLR6r4ytLMvrK2knfksVMuwfAmphOJlY65goBMpd0GGc71snh-0EgvcSsqPoAeDE35RBSBUzN2LG7CkRU5WHzXAmu0inpXr1MuQdUTffA',
    badge: 'Save the Date · RSVP',
    isFeatured: false,
    tier: 'free',
    availableFunctions: ['RSVP Form', 'Countdown Clock', 'Photo Gallery', 'Schedule & Itinerary'],
    featuredDetails: {
      headline: 'Timeless',
      subheadline: 'A modern wedding website.',
      description:
        'A clean editorial design for couples who want something simple and elegant. Thoughtfully constructed with sections for your journey, weekend itinerary, travel accommodations, and guest dietary requirements.',
      features: [
        'Includes instant mobile RSVP & spreadsheet export',
        'Custom domain support with free SSL security',
        'Shared guest photo dropzone after the ceremony',
      ],
    },
    component: WeddingTimeless,
    defaultData: {
      title: 'Rahul & Priya',
      tagline: 'Save the Date',
      eventType: 'Wedding',
      date: '14 February 2027',
      targetDateIso: '2027-02-14T16:30:00.000Z',
      time: '4:30 PM Sunset Ceremony',
      venue: 'The Glasshouse Pavilion',
      address: 'Palmetto Bay, Carmel-by-the-Sea, California',
      note: 'Together with our beloved families, we invite you to join us in an intimate weekend celebrating love, laughter, and lifelong devotion overlooking the Pacific coast.',
      quote: {
        text: 'Whatever our souls are made of, his and mine are the same.',
        author: 'Emily Brontë',
      },
      photos: [
        {
          id: 'p-1',
          url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDrXhj_85XcFOKhkG4qY7qNgs75JdniIqqg054JAtSrKnln4teC7WRqqkzY48kGBbruY_4_cUhIArt9PE7A-kerr7mTPbUseCy9pU_VKItPqaxSXkZcMvMRZTXBNMSs9qHUm03eKWeoq-PYbeLR6r4ytLMvrK2knfksVMuwfAmphOJlY65goBMpd0GGc71snh-0EgvcSsqPoAeDE35RBSBUzN2LG7CkRU5WHzXAmu0inpXr1MuQdUTffA',
          caption: 'Ceremony Portrait',
          isCover: true,
        },
      ],
      appearance: {
        atmosphere: 'classic-elegance',
        palette: 'terracotta-ivory-olive',
        typography: 'playfair-sans',
      },
      activeSections: {
        hero: true,
        countdown: true,
        story: true,
        schedule: true,
        venue: true,
        gallery: true,
        rsvp: true,
        guestbook: false,
      },
      rsvpSettings: {
        enabled: true,
        deadline: 'December 1, 2026',
        allowMealSelection: true,
        allowDietaryNotes: true,
        allowSongRequests: true,
        allowPlusOnes: true,
      },
    },
  },
  {
    id: 'birthday-01',
    name: "Emma's 25th",
    category: 'birthday',
    categoryLabel: 'Birthday',
    subtitle: 'October 17',
    description: 'Vibrant, social celebration page with guest RSVP, photo dropzone, and venue map.',
    previewImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAuxVFfqJZlMyHEYGEJrEOx56kqF4pi-hChJHaV3Zxxi1h2KhXofNbMnt04LPd82qCHPTyU6snUwv2S7WLty4lwO20ZpH8myV67VKNSnoiyAWxa40_9ENHnQnHnggYbi_hPloEhzGFiG4lqKd2xKsFA9MR7YTeLy6rfd1z9Ae9Ip3agpGdR0zXO_SsHSaXzyFo-rEczPnhc9P-MlnPGBEDV8bjyWV8Y3wrkXZLGcFu002ngCg5EKqepyg',
    badge: "Let's celebrate together",
    tier: 'free',
    availableFunctions: ['RSVP Form', 'Guestbook', 'Countdown Clock', 'Photo Dropzone'],
    component: BirthdayEmma,
    defaultData: {
      title: "Emma's 25th Birthday",
      tagline: "Let's celebrate together",
      eventType: 'Birthday',
      date: '17 October 2026',
      targetDateIso: '2026-10-17T19:00:00.000Z',
      time: '7:30 PM Dinner & Toast',
      venue: 'The Amber Cellar Bistro',
      address: '420 Franklin Ave, Brooklyn, NY',
      note: 'Turning a quarter of a century! Join me for an evening of warm comfort food, good drinks, and favorite people.',
      photos: [
        {
          id: 'p-b1',
          url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAuxVFfqJZlMyHEYGEJrEOx56kqF4pi-hChJHaV3Zxxi1h2KhXofNbMnt04LPd82qCHPTyU6snUwv2S7WLty4lwO20ZpH8myV67VKNSnoiyAWxa40_9ENHnQnHnggYbi_hPloEhzGFiG4lqKd2xKsFA9MR7YTeLy6rfd1z9Ae9Ip3agpGdR0zXO_SsHSaXzyFo-rEczPnhc9P-MlnPGBEDV8bjyWV8Y3wrkXZLGcFu002ngCg5EKqepyg',
          isCover: true,
        },
      ],
      appearance: {
        atmosphere: 'modernist-warmth',
        palette: 'terracotta-ivory-olive',
        typography: 'playfair-sans',
      },
      activeSections: {
        hero: true,
        countdown: true,
        story: false,
        schedule: true,
        venue: true,
        gallery: true,
        rsvp: true,
        guestbook: true,
      },
      rsvpSettings: {
        enabled: true,
        deadline: '10 October 2026',
        allowMealSelection: true,
        allowDietaryNotes: true,
        allowSongRequests: true,
        allowPlusOnes: false,
      },
    },
  },
  {
    id: 'opening-01',
    name: 'The Coffee House',
    category: 'opening',
    categoryLabel: 'Opening',
    subtitle: '20 October',
    description: 'Handcrafted story page, menu teaser, and launch invitation for boutique business milestones.',
    previewImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCEzE92AaCFKTI-e_Mliy5h_SNTyTviGF5R2lEJqBC0jd-eVV_bpYVdhaPdOvxaJyRw_wixRCvgyQos3ZY0GwtzjmbLzuI1oCmbPpLMrYXrsu-J33NjeUGlfMff0Xr0S6Pk5_fxYhdLNZxhFUCBl6Z8dJ9BLEk9go_487lT8_BRf0oCAlzdcbPk_3tvCc1Xul0P1JuOdAwq5yr6YdNdDyrIfFI63C12L8HDPAYfblH2tqaaCD6nI1zptQ',
    badge: 'Grand Opening Event',
    tier: 'free',
    availableFunctions: ['RSVP Form', 'Countdown Clock', 'Story & Menu Teaser', 'Venue Directions'],
    component: OpeningCoffeeHouse,
    defaultData: {
      title: 'The Coffee House',
      tagline: 'Grand Opening Event',
      eventType: 'Business Opening',
      date: '20 October 2026',
      targetDateIso: '2026-10-20T09:00:00.000Z',
      time: '9:00 AM - 5:00 PM',
      venue: 'The Coffee House Flagship',
      address: '108 Market Street, Seattle, WA',
      note: 'We are thrilled to open our doors and welcome the community to our artisanal roastery and botanical cafe.',
      photos: [
        {
          id: 'p-c1',
          url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCEzE92AaCFKTI-e_Mliy5h_SNTyTviGF5R2lEJqBC0jd-eVV_bpYVdhaPdOvxaJyRw_wixRCvgyQos3ZY0GwtzjmbLzuI1oCmbPpLMrYXrsu-J33NjeUGlfMff0Xr0S6Pk5_fxYhdLNZxhFUCBl6Z8dJ9BLEk9go_487lT8_BRf0oCAlzdcbPk_3tvCc1Xul0P1JuOdAwq5yr6YdNdDyrIfFI63C12L8HDPAYfblH2tqaaCD6nI1zptQ',
          isCover: true,
        },
      ],
      appearance: {
        atmosphere: 'sunlit-botanical',
        palette: 'sage-cream',
        typography: 'playfair-sans',
      },
      activeSections: {
        hero: true,
        countdown: true,
        story: true,
        schedule: false,
        venue: true,
        gallery: true,
        rsvp: true,
        guestbook: false,
      },
      rsvpSettings: {
        enabled: true,
        deadline: '18 October 2026',
        allowMealSelection: false,
        allowDietaryNotes: false,
        allowSongRequests: false,
        allowPlusOnes: true,
      },
    },
  },
  {
    id: 'party-01',
    name: 'Evening With Friends',
    category: 'party',
    categoryLabel: 'Dinner Party',
    subtitle: '8:00 PM',
    description: 'Warm, candlelit invitation with menu preview, BYOB guidelines, and curated playlist link.',
    previewImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBw0PLAY1Q56NO4RJlZjSOP-IRzbuBCOxRNgu0MTd1kic_aEHTz9BQjQH3lMJsIPkyd0n11lMIzf9f06-xyZGz7ZsRfPwW_LuylJcDI0WrLBNlbozD-sieBWUAE67YTjjkIlzVS--ZSe_nIRsVndWdiAYMu_9i0vOkbd3enG4r_JgGXWighkJlg9iKm-z_ggl9JnXUi1mwkS9pTbQaP02qXu_ZMf0BOokzHQMG7vRQALwUDp378-D-VJA',
    badge: 'Intimate Gathering',
    tier: 'free',
    availableFunctions: ['RSVP Form', 'Countdown Clock', 'Venue Map'],
    component: PartyEvening,
    defaultData: {
      title: 'Evening With Friends',
      tagline: 'An Intimate Gathering',
      eventType: 'Dinner Party',
      date: '28 November 2026',
      targetDateIso: '2026-11-28T20:00:00.000Z',
      time: '8:00 PM',
      venue: 'The Garden Table',
      address: '74 Oakridge Lane, Mill Valley, CA',
      note: 'Gathering around the hearth for seasonal autumn fare, acoustic tunes, and long conversations over wine.',
      photos: [
        {
          id: 'p-d1',
          url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBw0PLAY1Q56NO4RJlZjSOP-IRzbuBCOxRNgu0MTd1kic_aEHTz9BQjQH3lMJsIPkyd0n11lMIzf9f06-xyZGz7ZsRfPwW_LuylJcDI0WrLBNlbozD-sieBWUAE67YTjjkIlzVS--ZSe_nIRsVndWdiAYMu_9i0vOkbd3enG4r_JgGXWighkJlg9iKm-z_ggl9JnXUi1mwkS9pTbQaP02qXu_ZMf0BOokzHQMG7vRQALwUDp378-D-VJA',
          isCover: true,
        },
      ],
      appearance: {
        atmosphere: 'classic-elegance',
        palette: 'terracotta-ivory-olive',
        typography: 'playfair-sans',
      },
      activeSections: {
        hero: true,
        countdown: true,
        story: false,
        schedule: false,
        venue: true,
        gallery: true,
        rsvp: true,
        guestbook: false,
      },
      rsvpSettings: {
        enabled: true,
        deadline: '20 November 2026',
        allowMealSelection: false,
        allowDietaryNotes: true,
        allowSongRequests: true,
        allowPlusOnes: true,
      },
    },
  },
];

export const getAllTemplates = (): TemplateMetadata[] => {
  return templatesRegistry.map(({ component: _c, defaultData: _d, ...meta }) => meta);
};

export const getTemplatesByCategory = (category: EventCategory): TemplateMetadata[] => {
  if (category === 'all') {
    return getAllTemplates();
  }
  return templatesRegistry
    .filter((t) => t.category === category)
    .map(({ component: _c, defaultData: _d, ...meta }) => meta);
};

export const getTemplateById = (id: string): TemplateMetadata | undefined => {
  const match = templatesRegistry.find((t) => t.id === id);
  if (!match) return undefined;
  const { component: _c, defaultData: _d, ...meta } = match;
  return meta;
};

export const getTemplateDefinition = (id: string): TemplateDefinition | undefined => {
  return templatesRegistry.find((t) => t.id === id);
};

export const getFeaturedTemplate = (): TemplateDefinition => {
  const featured = templatesRegistry.find((t) => t.isFeatured);
  return featured || templatesRegistry[0];
};

export const registerTemplate = (definition: TemplateDefinition): void => {
  const existingIdx = templatesRegistry.findIndex((t) => t.id === definition.id);
  if (existingIdx !== -1) {
    templatesRegistry[existingIdx] = definition;
  } else {
    templatesRegistry.push(definition);
  }
};
