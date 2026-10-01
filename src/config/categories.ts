import { EventCategory } from '@/types';

export interface CategoryFilterItem {
  id: EventCategory;
  label: string;
  count?: number;
}

export const eventCategories: CategoryFilterItem[] = [
  { id: 'all', label: 'All', count: 240 },
  { id: 'birthday', label: 'Birthday', count: 42 },
  { id: 'wedding', label: 'Wedding', count: 68 },
  { id: 'portfolio', label: 'Portfolio', count: 114 },
  { id: 'business', label: 'Business', count: 89 },
  { id: 'restaurant', label: 'Restaurant', count: 54 },
  { id: 'events', label: 'Events', count: 37 },
  { id: 'saas', label: 'SaaS', count: 26 },
  { id: 'ecommerce', label: 'E-commerce', count: 48 },
  { id: 'education', label: 'Education', count: 31 },
  { id: 'personal', label: 'Personal', count: 50 },
];

export interface MomentGridItem {
  number: string;
  category: EventCategory;
  title: string;
  subtitle: string;
  count: string;
  imageUrl: string;
}

export const momentCategories: MomentGridItem[] = [
  {
    number: '01',
    category: 'birthday',
    title: 'Birthday & Celebrations',
    subtitle: 'Dinners, milestones, party invitations',
    count: '42 Templates',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDyHyi904IQ28ukMWNaUYpHK7BDS8wz0_YBxmSUx-02RJGuEOZrYXeyu8IQJ0c_03C0vwdRErSOepvcyHewxGtIkFI10f0wE9LjArQtg2C_bbJiiaDd2NSl1g4uj5oeQUXwrABwMPYA-nGsg-TuZwkjrEzKoRTDlM1wAIs7HiNhxwpPrDfAftkYdLzDJ-6O_bGIlsDxg90Jl7NsRJWCYGRAb0X1RXd8J73YxawJNy3fH-MZrqMoaZw',
  },
  {
    number: '02',
    category: 'wedding',
    title: 'Weddings & RSVP',
    subtitle: 'Ceremonies, receptions, save the dates',
    count: '68 Templates',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuABb0OgmvJGVh7ZP7es8WAU_TyN9O-cDu3cZZS8b4KG7ZUi_eWNBgcVhKHTwNyEy1NPGrKZ_oPoomuaiVoq4g--EdMMInrc_jBd4-OA_jozoQRs_o9s0APUH3ODLi3yBQP6_NyGhLaXPOIep1wEK0c7aInPUf8D40o39QoyPUtl_X4Le5IngnXjmGOu-2eiZfBYb3GaPWUOJaY2at3IrJVL3QumMvUT5NhZby9UWpFHU4N9SiR2yck',
  },
  {
    number: '03',
    category: 'portfolio',
    title: 'Portfolios & Creative',
    subtitle: 'Art direction, photography, design archives',
    count: '114 Templates',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBFDfhDrFmBJrFzUm9Prq6fDvoQ-USUVZygGcPlJk1g5q69NRbWr3EvkUQxpJsm1zh8Q7zhY2PgT8wU2A-0s0YDBdWCeZ2v9r5KSBJjyDzR8HHe4KUagRsxVyOisNKpI2FDCqcOCfylMmfGrP6XiW-NiUBJPESFDA8yPgHg2Wy5yPjLdsXSqVMCN6iCCeBGMlVjFftpsETlIZ8bvcS1CiEJDBy1YBMuGN3LA8MmL_EXrusLcKjbl90',
  },
  {
    number: '04',
    category: 'restaurant',
    title: 'Restaurants & Culinary',
    subtitle: 'Gastronomy, wine bars, tasting menus',
    count: '54 Templates',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDOHMidfbDGd3NjV1tourlH_kcXqpNkB3weyIt3ZsY2AT2UhLsyzPBX4ROZUQpkMxdbLh0LbBgjtuCTaY6SXIX5jkiv-kNeorecOh6_9-knwLXBLhUocl90lCnHppP9MkNhuXet8T9s3Frt0Iv35viPe6PIwH2itLiCNgxCP0vb6qLn4XYtghusof61R7V1qcPJtRwJkJzMOqmMFX-CUwCmFbPJvmgGYbfmBC3m25cPOtCGS8BwnGs',
  },
  {
    number: '05',
    category: 'business',
    title: 'Business & Consultancies',
    subtitle: 'Agencies, strategic advisory, corporate',
    count: '89 Templates',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuADKdSW1im5W0Oi1QAhHs7cdZOKvdRfKfhzZGYXBbgFsgPVAY9QfIjYqi7e7QAcLa31OyhaaBQy-sOvf6imraHwwFYLvjYsjTVrqeJfrDLTMdbUCWR0FScZBxArmcUHJyi2cQYffquknpdkmJGDjN_b_VmovL6CWAZcLOh5Ao7FiDE6REQsGlY6TYoe3nU7kUvlzpodY44z_NHZbD2EW0O7JEx2LrXSJeLifvbDQ0MargZ7dLQ6FII',
  },
  {
    number: '06',
    category: 'events',
    title: 'Events & Conferences',
    subtitle: 'Summits, exhibitions, festival schedules',
    count: '37 Templates',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuANP0-AbR4lFTRTqqyERonZlGsyQ-I8a7SaqxkyxIuZdX4yM0-1rJKN4ERSqJZbtsIwlUnNhbXkYyu5b2FK-WPmPA9aY4wZD0W_8O8Z5aKbcX5L5eAx3ZLWTmqy0o2MNNs_pKXsZbE2yec6mmwCEcj2ULF_Wlqcz7qE22OqcHD4xWuzWwUVr_wvYcQSNzsy99gN--0JRb9f_HEMaWaD0f2MZiOhL_y9XGp0EzO_JsiN-HpKvH6tTmU',
  },
];
