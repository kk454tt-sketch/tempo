import { EventCategory } from '@/types';

export interface CategoryFilterItem {
  id: EventCategory;
  label: string;
}

export const eventCategories: CategoryFilterItem[] = [
  { id: 'all', label: 'All' },
  { id: 'student', label: 'Student & Campus' },
  { id: 'wedding', label: 'Wedding' },
  { id: 'birthday', label: 'Birthday' },
  { id: 'party', label: 'Dinner & Party' },
  { id: 'opening', label: 'Business Opening' },
  { id: 'graduation', label: 'Graduation' },
  { id: 'anniversary', label: 'Anniversary' },
  { id: 'baby', label: 'Baby Shower' },
];

export interface MomentGridItem {
  number: string;
  category: EventCategory;
  title: string;
  subtitle: string;
  imageUrl: string;
}

export const momentCategories: MomentGridItem[] = [
  {
    number: '01',
    category: 'student',
    title: 'Student Life',
    subtitle: 'Classmate hubs, notices, hobby matchmaking',
    imageUrl:
      'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80',
  },
  {
    number: '02',
    category: 'wedding',
    title: 'Wedding',
    subtitle: 'Ceremonies, receptions, save the dates',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB9LcYRuTb_jKEoj-Kv6f64Jl_yXhhz3rvui8Itg-VXtWyWHdQZKqXqBVeIgwCpPJrIY0qPRnSEXCkQ1F-7-WwQ4aehh5OW9dywFV5oMh2ArCEm4da70W0-2Qjcnz8pqTwdiTyvJZp26zaWROrqtHnbZhm1e2aK_V6_fzSQqXEzhlbwYaDJrgJeii9RVxBRB8B_V9_GcgVNM_TDhli_ZkM5KRhWbcylyAYLKHSyAfYn_5XZxVpVxrhuzw',
  },
  {
    number: '03',
    category: 'birthday',
    title: 'Birthday',
    subtitle: 'Dinners, bashes, milestone years',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDan4eJmiropLJ-nEiKAHiic52FKfDhMrnUqsYDDJ7BDut32SeRXvubQdvFURoVvE6axJo-5eX_7jIJR-xCKQYEbFOPnaIHd2m2l27q6VP0DnNv97icGja_9q_RP4iB30d8_SruFpIi1Fkryh-KZ8IOyqBBHM2oCVSs11pSgbsBdVfFnTrNw8ZAM9zUhiZ51v0jrpNrzufp-mc7NVjHmWj65a1noSF-BNP5q-vp9LDWnmKrH1YLMtzNVQ',
  },
  {
    number: '04',
    category: 'party',
    title: 'Party',
    subtitle: 'Supper clubs, cocktail soirees',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAVORfRxavxTEpz4p6hPTDOezeaCypil8TrGAwdldWI2-jEHp9uTSjiF-1e6PnSfmuMIEnlbWQK3no7I3fq725y48E0iO8VG4R81VGmHtt0iiA9mN6Q3CCLR3zW7puZ2SNvU0c_AJIEdcX2lWY8sa1gA0M0mD49SUGWtg0L8O7xpCesJNSlfEUVvK8BjoCT_BOuDI2peJICYRouqWBWse3A18gyhvEerrS9TkxiXj9tKeiq6hWTdhAnwg',
  },
  {
    number: '05',
    category: 'opening',
    title: 'Opening',
    subtitle: 'Studio debuts & pop-ups',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDljEte_Rf7snHkECun7bOxoXif8rG6SHckce7jLg5Wz9CNw40gJP64SRIPwN6z3hMsyQKm_AZDVEXJwDnmmAYhqljgyVAV7golOk2wFIzCTtnyv4_P25OeUDj3MwxS6uqJfr3uGtqIBXnRSL8GTt4TYjwwvcIw8CPqGQEBKto_GGgohNiwPSwlSCTyl3sLw7YIYDegkAN_k65Px4GrtxEbDrI58FgNQwHTmdFfAAhAYwv6KiX9H05dRw',
  },
  {
    number: '06',
    category: 'graduation',
    title: 'Graduation',
    subtitle: 'Commencements & future chapters',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAloe9Z5EXDQEKNmm1VttTxhlWQhtojrzquSfZVlQ3mToOng-jAkWb24OWeFliOdTiEk1o-GzpO1XkaMZCsF9F0BOtFcffRgaL8l1LzyGRD_D_VFRcOfYGpPa8_ObQ8N_Zk42Ld2ozjijrRetx-4hlU7U_KNkui8cFQQgfsEQCXXmGxd-nBFN2do6flv1Mh3dKVedl13BjDW7I_TdxeHDLv101nGKbta1yk6E3Pe667vS_9vpaVoCkYoA',
  },
  {
    number: '07',
    category: 'anniversary',
    title: 'Anniversary',
    subtitle: 'Decades of memories & vow renewals',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBzg8AbpwweX3VgZ4zp-yuk4Ubnjt3mJKgOLv5I0iT4A0KcjNFIlVpZc-SnlkFHS1gB1RrEkX82kj8pCoyGxNghUDyo5PC594ayjwmatXhKO8IvD5RetTyfwOlqDtBKkLNxv7j9_nkhM1S24OIq1xtXXlvxBJF3YPssKfyjyQCU04YHLc-2tLSNZxUEsOk6QZM2TWsoVBMrDxzOMjwdPw7qynBqhjP-uyeWpw1O4TeT3ke3O_O1dvI3wg',
  },
  {
    number: '08',
    category: 'baby',
    title: 'Baby Shower',
    subtitle: 'Welcoming little arrivals',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBqx51QO0hvjjzp9UlEsKtOEviOuFAToBxEB5uSe56YLU_Bk1aXkHNYEBl8vL8bPby_tcM08TwMNXxnhnGDuTANzKYDEzylCgxvxKgOhbemy5oA7avrmDic7ksPxWUcnbRS5wWTqQrFsvqRWeOVle_vDPtTvmOo3SR4dAefQXjmZCZmzDHe4t2DZiRDkP4pdLd9PKxZG7cUCGFeZ253NAp8YXM8uYmtyIwk9FQROdxZmVyo4bNypvm7EQ',
  },
];
