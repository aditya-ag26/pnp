/** All copy and links in one place. */

/**
 * The Sort My Scene booking page. Every "Book" button on the site uses this.
 * TODO: replace with the exact Paws & Poses listing URL on Sort My Scene.
 */
export const BOOKING_URL = 'https://www.sortmyscene.com/'

export const INSTAGRAM_URL = 'https://www.instagram.com/pawsandposesindia/'
export const OWNER_INSTAGRAM_URL = 'https://www.instagram.com/riya_bedii/'

export const CONTACT = {
  email: 'info@pawsandposes.in',
  phone: '+91 97113 93973',
  phoneHref: 'tel:+919711393973',
  addressLines: ['A7 Naraina Industrial Area, Phase 1', 'New Delhi – 110028'],
}

export const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Experiences', to: '/experiences' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
]

export const HERO = {
  eyebrow: 'Welcome to Paws & Poses',
  titleLines: ['Happiness', 'has'],
  titleAccent: 'paws.',
  body: 'Puppy yoga, sip & paint and play sessions to heal your soul.',
  cta: 'Explore the island',
}

export interface Feature {
  id: 'yoga' | 'paint'
  number: string
  title: string
  tagline: string
  body: string
}

/** The two islands after the hero on the home page. */
export const FEATURES: Feature[] = [
  {
    id: 'yoga',
    number: '01',
    title: 'Puppy Yoga',
    tagline: 'Stretch. Breathe. Smile.',
    body: 'Unwind with gentle yoga and adorable puppy cuddles that melt your stress away.',
  },
  {
    id: 'paint',
    number: '02',
    title: 'Sip & Paint',
    tagline: 'Create. Laugh. Connect.',
    body: 'Sip your favorite drink, let your creativity flow and paint with furry friends by your side.',
  },
]

export const OWNER = {
  number: '03',
  titleLines: ['Meet the heart', 'behind'],
  titleAccent: 'Paws & Poses',
  paragraphs: [
    "Hi, I'm Riya! A dog lover, dreamer and believer in the magic of puppy cuddles.",
    'Paws & Poses is my little world where happiness has paws and every wagging tail brings a smile.',
  ],
  cta: { label: 'Read my story', to: '/about' },
  photos: [
    { src: '/images/owner-2.jpg', alt: 'Riya smiling at a puppy playing with a ball' },
    { src: '/images/owner-1.jpg', alt: 'Riya holding a puppy' },
    { src: '/images/owner-3.jpg', alt: 'Riya relaxing with her dogs' },
  ],
}

// ── Experiences page ────────────────────────────────────────────────────────
export const EXPERIENCES_PAGE = {
  eyebrow: 'Experiences',
  title: 'Three ways to spend time',
  titleAccent: 'with puppies.',
  lead: 'Every session is small, slow and built around one thing: an hour or so of pure, tail-wagging joy.',
  items: [
    {
      id: 'puppy-yoga',
      number: '01',
      title: 'Puppy Yoga',
      tagline: 'Stretch. Breathe. Smile.',
      image: '/images/experience-yoga.webp',
      paragraphs: [
        'The Puppy Yoga experience at Paws & Poses is where wellness meets pure joy. It combines the benefits of yoga with playful, cuddly puppies.',
        'Whether you’re a yoga enthusiast or simply need a dose of puppy love, this session is designed to relieve stress, boost serotonin and keep you smiling from start to finish.',
      ],
    },
    {
      id: 'sip-and-paint',
      number: '02',
      title: 'Sip & Paint',
      tagline: 'Create. Laugh. Connect.',
      image: '/images/experience-paint.webp',
      paragraphs: [
        'Imagine a cozy evening filled with creativity: a paintbrush in one hand, a canvas in front of you, and lively puppies bouncing around.',
        'With a refreshing drink in hand and a snuggly pup nestled in your lap, it’s an atmosphere of laughter, art and warm puppy cuddles — the perfect heartwarming, relaxing experience.',
      ],
    },
    {
      id: 'paws-and-play',
      number: '03',
      title: 'Paws & Play',
      tagline: 'Roll the dice. Rub a belly.',
      image: '/images/experience-play.webp',
      paragraphs: [
        'Picture a cozy gathering with your loved ones, enjoying your favorite board games as adorable puppies wander around, spreading joy and offering cuddles.',
        'Between turns you get to pet and play with these furry friends. It’s the perfect blend of relaxation, laughter and puppy love.',
      ],
    },
  ],
  notesTitle: 'Good to know',
  notes: [
    {
      title: 'Guided, gently',
      body: 'Yoga sessions are led by a certified yoga teacher and are friendly to complete beginners.',
    },
    {
      title: 'Puppies come first',
      body: 'A team of volunteers looks after the puppies throughout every session.',
    },
    {
      title: 'Small groups',
      body: 'Each session hosts only a handful of people, so spots are limited — book early.',
    },
  ],
  corporate: {
    title: 'Planning something for your team?',
    body: 'We also bring puppy sessions to workplaces and private events.',
    cta: { label: 'Get in touch', to: '/contact' },
  },
}

// ── About page ──────────────────────────────────────────────────────────────
export const ABOUT_PAGE = {
  eyebrow: 'Our story',
  title: 'It started with one',
  titleAccent: 'puppy yoga class.',
  lead: 'Paws & Poses was born in New Delhi from a simple idea: time with puppies makes people feel better.',
  story: [
    "Hi, I'm Riya. A few years ago I walked into a puppy yoga session in Vancouver and walked out feeling lighter than I had in months. There was a kind of calm in that room I hadn't found anywhere else.",
    'I came home to New Delhi wanting everyone to feel it. So I started Paws & Poses — a little world where happiness has paws and every wagging tail brings a smile.',
    'Today we host puppy yoga, sip & paint evenings and game nights, all built around the same thing: slowing down, laughing a lot, and cuddling a puppy while you do it.',
  ],
  values: [
    {
      title: 'Joy, on purpose',
      body: 'We believe in the power of puppy cuddles to bring joy, relaxation and a boost of serotonin to people’s lives.',
    },
    {
      title: 'Kind to every pup',
      body: 'Sessions are paced around the puppies, with volunteers on hand to make sure they are happy, rested and safe.',
    },
    {
      title: 'Giving back',
      body: 'We use our sessions to raise awareness for rescued and stray dogs, and to encourage adoption and fostering.',
    },
  ],
  closing: {
    title: 'Come say hi.',
    body: 'Follow along for new session dates, or come meet the puppies yourself.',
  },
}

// ── Contact page ────────────────────────────────────────────────────────────
export const CONTACT_PAGE = {
  eyebrow: 'Contact',
  title: 'Let’s',
  titleAccent: 'talk puppies.',
  lead: 'Questions about a session, a private event or a collaboration? Send a note and we’ll get back to you.',
}

export const FOOTER = {
  about:
    "At Paws and Poses, we believe in the power of puppy cuddles to bring joy, relaxation, and a boost of serotonin to people's lives.",
  socials: [{ label: 'Instagram', href: INSTAGRAM_URL, icon: 'instagram' }] as const,
  copyright: `© ${new Date().getFullYear()} pawsandposes.in — All rights reserved.`,
}
