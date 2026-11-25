/**
 * The privacy note (/privacy) and the terms and conditions (/terms), as data.
 * Rendered by components/LegalPage.tsx.
 *
 * Rules for editing this file:
 *  - Say only what is true. "Today" sections must match what the code does
 *    (WaitlistModal.tsx, supabase/functions/*, index.html). Anything about
 *    bookings is written as "when booking opens".
 *  - Never fill a gap with an invented name, number, address or period. Where a
 *    fact is not decided yet, state the principle and add a `note` block; those
 *    render as "Before booking opens" and are the founder's to-do list.
 *  - Prices are copied from LandingPage.tsx (WALK_TIERS, VISIT_TIERS, PASSES).
 *    Change them there and here together.
 *  - Inline links use [label](/path) or [label](https://…).
 *  - Update UPDATED whenever the meaning of either page changes, and the
 *    <lastmod> for both pages in public/sitemap.xml.
 */

export const UPDATED = '26 November 2026';

export type Block =
  | { p: string }
  | { h: string }
  | { ul: string[] }
  /** term + explanation pairs */
  | { dl: [string, string][] }
  /** a small three-column table that stacks into cards on phones */
  | { rows: { head: [string, string, string]; items: [string, string, string][] } }
  /** something that will be filled in before booking opens */
  | { note: string };

export interface LegalSection {
  id: string;
  title: string;
  /** one-line summary shown in the "In short" card */
  short: string;
  blocks: Block[];
}

export interface LegalDoc {
  kind: 'privacy' | 'terms';
  title: string;
  kicker: string;
  intro: string;
  glance: string[];
  sections: LegalSection[];
}

/* ------------------------------ privacy note ------------------------------ */

export const PRIVACY: LegalDoc = {
  kind: 'privacy',
  title: 'Privacy note',
  kicker: 'Your data, plainly',
  intro:
    'This note explains what ProxyPaw collects about you, why, where it is kept, who can see it, and what you can ask us to do with it. It is a plain-language summary of how ProxyPaw works today, while we are a waitlist, and of how it will work when booking opens.',
  glance: [
    'Today we collect only what you type into the waitlist, volunteer and feedback forms, plus basic visit statistics.',
    'We use it to tell you when your community opens and to verify volunteers.',
    'We do not sell or rent your details, and we do not give them to advertisers.',
    'Your records are stored in India. A few providers we rely on, for email, hosting and analytics, may process data elsewhere.',
    'You can ask to see, correct or delete what we hold, and withdraw your consent, at any time.',
  ],
  sections: [
    {
      id: 'who-we-are',
      title: 'Who we are',
      short: 'ProxyPaw is a pet-care platform based in Hyderabad. We decide how your details are used, so we are answerable for them.',
      blocks: [
        { p: 'ProxyPaw (“we”, “us”) connects pet parents in gated communities with verified neighbours who walk dogs, visit cats at home and host overnight boarding. We are based in Hyderabad, Telangana, and were founded by Deekshitha. Today she is also the only person who can open the records described in this note.' },
        { p: 'Under India’s Digital Personal Data Protection Act, 2023, we are the “data fiduciary” for these details and you are the “data principal”. In plain words: the details are yours, and we are responsible for how we handle them. We follow that Act and the Digital Personal Data Protection Rules, 2025, as they come into force.' },
        { p: 'This note covers proxypaw.com and, once it opens, the ProxyPaw app. The rules for using them are in our [terms and conditions](/terms).' },
        { note: 'The registered name and address of the business will be listed here.' },
      ],
    },
    {
      id: 'what-we-collect-today',
      title: 'What we collect today',
      short: 'Only what you type into our forms, plus basic visit statistics. There are no accounts, no payments and no location tracking yet.',
      blocks: [
        { p: 'ProxyPaw is a waitlist right now. You cannot create an account, book or pay, so the list is short.' },
        {
          rows: {
            head: ['What', 'When', 'Why'],
            items: [
              ['Your name, phone number, email address and community', 'When you join the waitlist as a pet parent, or register as a volunteer', 'To tell you when your community opens and to contact you about your place'],
              ['Which button or page you signed up from', 'Saved with your signup', 'To learn which parts of the site are useful'],
              ['Your date of birth', 'Volunteers only', 'To confirm that you are at least 21'],
              ['A short note about your experience with pets', 'Volunteers only', 'To decide who we invite to a conversation'],
              ['A copy of your e-Aadhaar, or of your PAN card if you do not have one, and optionally your driving licence', 'Volunteers only, uploaded by you', 'To verify that you are who you say you are'],
              ['Your three confirmations (terms, original documents, background check) and the time you gave them', 'Volunteers only', 'As our record of your consent'],
              ['Anything you write in the feedback box or in the “Write to us” form on these pages, with your email address', 'After you sign up, or whenever you write to us', 'To improve ProxyPaw, to correct your registration if you ask, and to answer your request'],
              ['Pages visited, rough location, device and browser type', 'Whenever you browse the site, through Google Analytics', 'To see how the site is used. It is tied to a random identifier, not to your name'],
            ],
          },
        },
        { p: 'We do not ask pet parents for Aadhaar or any other identity document.' },
        { p: 'When you submit a form, our server also sees your IP address. We use it only to stop automated abuse of the forms, and we do not save it with your signup. The companies that host the site keep their own standard technical logs.' },
        { p: 'The 3D community, the walk demos and the scroll journey on the home page run in your browser. We do not record what you do in them, beyond the general visit statistics above, and the photo updates you take in the 3D walk never leave your device.' },
      ],
    },
    {
      id: 'when-booking-opens',
      title: 'What we will collect when booking opens',
      short: 'Running real walks and visits needs more: your pet’s details, where you live in the community, live location during a walk, photos, payments and ratings. We will ask before any of it starts.',
      blocks: [
        { p: 'None of the following is collected today. We list it now so there are no surprises later, and we will ask for your consent in the app before any of it begins.' },
        {
          dl: [
            ['Your profile', 'Name, phone, email, a photo if you add one, your community, tower and flat.'],
            ['Your pet’s details', 'Name, species, breed, age, health and vaccination notes, temperament, feeding and care instructions, your vet and an emergency contact.'],
            ['Volunteer verification', 'Identity check, background and police verification, references, and interview and training records, as described on our [About page](/about).'],
            ['Live location', 'The GPS position of the volunteer’s phone during a walk, shown to the pet parent for that booking.'],
            ['Photo updates', 'Photos the volunteer sends during walks, visits and sleepovers.'],
            ['Bookings and messages', 'Your booking history, messages with your matched neighbour, ratings and reviews, and anything you send to support.'],
            ['Payments', 'The amount, time and status of each payment. Card and UPI details are handled by a payment gateway. ProxyPaw will not store your card number or your UPI PIN.'],
          ],
        },
        { note: 'The payment gateway, and any verification agency we use for background checks, will be named here before your details are sent to them. So will the way identity documents are checked and how long they are kept afterwards.' },
      ],
    },
    {
      id: 'why-we-use-it',
      title: 'Why we use it, and on what basis',
      short: 'We use your details only for the purpose you gave them for, and we rely on your consent.',
      blocks: [
        { p: 'We process your personal data on the basis of your consent, which you give when you submit a form or, later, when you agree in the app. We ask for it in clear words and for a stated purpose, and we do not use your details for anything else.' },
        {
          ul: [
            'To tell you when ProxyPaw opens in your community, and to manage your place on the waitlist.',
            'To check that volunteers are real people, are at least 21, have experience with pets, and can be trusted with a neighbour’s pet and home.',
            'To reply to your feedback and to requests about your data.',
            'To understand, in total and not person by person, how the site is used so we can improve it.',
            'When booking opens: to match pet parents with volunteers, run and track bookings, take payments, pay volunteers, handle complaints and keep everyone safe.',
          ],
        },
        { p: 'We may also keep or disclose details where Indian law requires it or allows it without consent, for example to comply with a court order.' },
      ],
    },
    {
      id: 'who-can-see-it',
      title: 'Who can see it',
      short: 'The founder, the companies that run the site for us and, once you book, the neighbour you are matched with. We do not sell your details.',
      blocks: [
        { p: 'Today, waitlist and volunteer details can be opened only by the founder, through a private dashboard restricted to her account. Volunteer documents sit in a private storage area and can be opened only through links that expire within an hour.' },
        { h: 'Companies that process data for us' },
        {
          rows: {
            head: ['Provider', 'What it does for us', 'What it handles'],
            items: [
              ['Supabase', 'Database, file storage and the server code behind our forms', 'Everything you submit, stored in its Mumbai, India region'],
              ['Resend', 'Sends our emails', 'Your first name, email address and community, to send your confirmation'],
              ['Vercel', 'Hosts the website', 'Ordinary web requests, including IP address and browser details'],
              ['Google', 'Analytics, web fonts, and sign-in for the founder’s dashboard', 'Visit statistics tied to a random identifier, and your IP address when fonts load'],
            ],
          },
        },
        { h: 'When booking opens' },
        {
          ul: [
            'The neighbour you are matched with will see what they need for that booking, such as your pet’s care notes, where to collect your pet and how to reach you. You will see your volunteer’s profile, ratings, live location during the walk and photo updates.',
            'A payment gateway will process your payment.',
            'A verification agency may carry out background checks on volunteers who have consented to them.',
          ],
        },
        { h: 'When the law requires it' },
        { p: 'We will share details with a court, the police or a government authority only when we are legally required to, and only as much as is required.' },
        { p: 'We do not sell or rent your personal data, and we do not give it to advertisers. If ProxyPaw is ever merged with or transferred to another business, we will tell you before your details move.' },
      ],
    },
    {
      id: 'storage-and-security',
      title: 'Where it is kept and how we protect it',
      short: 'In India, in a database that cannot be read from the public internet, with volunteer documents in a separate private store.',
      blocks: [
        {
          ul: [
            'Our database and file storage are hosted by Supabase in its Mumbai region.',
            'The database cannot be read or written from a browser. Only our own server code can reach it, using a key that never leaves the server.',
            'Volunteer identity documents are kept in a private storage area, apart from the database. They are opened only through links that expire within an hour, and are used only for verification.',
            'Before the founder’s dashboard returns any data, the server checks that the person signed in is the founder.',
            'Forms are sent over an encrypted (HTTPS) connection and are protected against automated abuse.',
          ],
        },
        { p: 'No system is perfectly secure. If a breach affects your personal data, we will tell you and the Data Protection Board of India, as the law requires.' },
      ],
    },
    {
      id: 'how-long-we-keep-it',
      title: 'How long we keep it',
      short: 'Only as long as the purpose lasts, and we delete it sooner if you ask.',
      blocks: [
        {
          dl: [
            ['Waitlist details', 'Until your community opens and you decide whether to join, or until you ask us to remove you.'],
            ['Volunteer registrations and documents', 'Until verification is complete, and for as long as you remain a volunteer. If you withdraw or are not taken on, we delete your documents.'],
            ['Feedback', 'Kept with your email address so we can follow up, until you ask us to delete it.'],
            ['Visit statistics', 'Held in Google Analytics and not linked to your name.'],
            ['When booking opens', 'Booking, payment and safety records will be kept for as long as tax, consumer and other laws require, and no longer.'],
          ],
        },
        { p: 'Where a law requires us to keep a record for a set time, we keep it for that time even if you ask us to delete it, and we will tell you when that applies.' },
        { note: 'The exact retention period for each type of record will be listed here.' },
      ],
    },
    {
      id: 'outside-india',
      title: 'Processing outside India',
      short: 'Your records are stored in India. A few of our providers may process data in other countries.',
      blocks: [
        { p: 'Your signup and any documents you upload are stored in India. Some of the providers listed above, such as our email and hosting services and Google, may process data on servers outside India. Indian law allows this except to countries the Government of India has restricted, and we will not send your details to a restricted country.' },
      ],
    },
    {
      id: 'children',
      title: 'Children',
      short: 'ProxyPaw is for adults. We do not knowingly collect details from anyone under 18.',
      blocks: [
        { p: 'You must be 18 or older to join the waitlist or use ProxyPaw, and 21 or older to register as a volunteer. If you believe someone under 18 has given us their details, tell us and we will delete them.' },
      ],
    },
    {
      id: 'your-rights',
      title: 'Your rights',
      short: 'You can see, correct and delete what we hold, withdraw your consent, name someone to act for you, and complain.',
      blocks: [
        { p: 'Under the Digital Personal Data Protection Act, 2023, you have the right to:' },
        {
          dl: [
            ['Know what we hold', 'Ask for a summary of the personal data we have about you, what we are doing with it, and who we have shared it with.'],
            ['Correct and update', 'Ask us to fix anything that is wrong, complete anything that is missing, or bring it up to date.'],
            ['Erase', 'Ask us to delete your details, unless a law requires us to keep them.'],
            ['Withdraw consent', 'At any time, and as easily as you gave it. We will stop using your details from then on. It does not undo what was done before, and it may mean we can no longer hold a place or offer a service for you.'],
            ['Nominate', 'Name another person who can use these rights for you if you die or are unable to act.'],
            ['Complain', 'Raise a grievance with us and, if you are not satisfied with our answer, take it to the Data Protection Board of India.'],
          ],
        },
        { h: 'How to use them' },
        { p: 'Write to us with the [form at the end of this note](/privacy#contact), or through the feedback box that appears after you sign up, and say which right you want to use. Give the email address you signed up with so we can find your record. We may ask a question or two to confirm it is you.' },
        { p: 'The Act also asks something of you: to give details that are true, not to pretend to be someone else, and not to file false complaints.' },
      ],
    },
    {
      id: 'cookies',
      title: 'Cookies and browser storage',
      short: 'One analytics service, web fonts from Google, and one small setting saved in your browser. The site loads no advertising or social-media trackers.',
      blocks: [
        {
          ul: [
            'Google Analytics sets cookies in your browser to count visits and to tell one visitor from another by a random identifier. It records pages viewed, rough location, and device and browser type. You can block these cookies in your browser settings, or install Google’s [Analytics opt-out add-on](https://tools.google.com/dlpage/gaoptout).',
            'Our fonts load from Google Fonts, so Google receives your IP address and browser details when a page loads.',
            'The site saves one setting, the colour theme, in your browser’s local storage. It holds no personal details.',
            'The founder’s dashboard keeps a sign-in session in the founder’s own browser. Visitors never get one.',
            'If you use a share button, the service you share to, for example WhatsApp, receives the message you choose to send.',
          ],
        },
      ],
    },
    {
      id: 'changes',
      title: 'Changes to this note',
      short: 'If we change how we use your details, we will change this note first and tell you.',
      blocks: [
        { p: 'We will update this note as ProxyPaw grows, and certainly before booking opens. The date at the top shows the latest version. If a change affects details you have already given us, we will email you before it takes effect, and ask for your consent again where the law requires it.' },
      ],
    },
    {
      id: 'contact',
      title: 'Contact and grievances',
      short: 'The founder reads every message herself. Write to us with the form below.',
      blocks: [
        { p: 'For any question, request or complaint about your personal data, use the form below, or the feedback box that appears after you sign up. Today both reach the founder directly.' },
        { p: 'If you are not satisfied with our answer, you may complain to the Data Protection Board of India, once you have first given us the chance to put things right.' },
        { note: 'The name and contact details of our grievance officer, and a dedicated address for privacy requests, will be listed here.' },
      ],
    },
  ],
};

/* --------------------------- terms and conditions --------------------------- */

export const TERMS: LegalDoc = {
  kind: 'terms',
  title: 'Terms and conditions',
  kicker: 'The rules, in plain words',
  intro:
    'These are the terms for using proxypaw.com and, once it opens, the ProxyPaw app. They are a plain-language summary of how ProxyPaw works: what we do, what we ask of pet parents and volunteers, and what happens when something goes wrong. By joining the waitlist, registering as a volunteer or, later, booking a service, you agree to them.',
  glance: [
    'ProxyPaw connects pet parents with verified neighbours in the same gated community. The neighbour provides the care.',
    'Today ProxyPaw is a waitlist. Nobody can book or pay yet, and joining holds your place without guaranteeing a date.',
    'Every first booking starts with a meet-and-greet at your door.',
    'The price is shown before you confirm, and 70% of every booking goes to the volunteer.',
    'The community guidelines apply to everyone. Mistreating a pet means permanent removal.',
  ],
  sections: [
    {
      id: 'what-proxypaw-is',
      title: 'What ProxyPaw is',
      short: 'A platform that introduces pet parents to verified neighbours in their own gated community. The neighbour provides the care. We arrange, check and support it.',
      blocks: [
        { p: 'ProxyPaw (“we”, “us”) is a pet-care platform based in Hyderabad, India. It connects pet parents who live in gated communities with neighbours from the same community who walk dogs, visit cats at home and host overnight boarding.' },
        { p: 'The care itself is provided by the volunteer you book. Volunteers are independent neighbours who choose whether and when to accept a booking. They are not employees, agents or partners of ProxyPaw.' },
        { p: 'Our part is to verify and train volunteers before they take a booking, to provide the tools for booking, payment, live tracking and photo updates, and to support both sides when something needs sorting out.' },
        { p: 'In these terms, a “pet parent” is anyone who books, or plans to book, care for their pet. A “volunteer” is a neighbour who has registered to provide that care. The site also calls volunteers “neighbours”. Volunteers are paid for each booking they complete.' },
        { note: 'The registered name and address of the business will be listed here.' },
      ],
    },
    {
      id: 'where-we-are-today',
      title: 'Where we are today',
      short: 'A waitlist. There are no bookings, no payments and no app to download yet.',
      blocks: [
        { p: 'ProxyPaw is opening one gated community at a time, starting in Hyderabad. Right now you can join the waitlist as a pet parent or register as a volunteer. You cannot book, pay or download the app yet.' },
        { p: 'Everything on the site about bookings, tracking, payments and passes describes how the service will work when it opens in your community. The parts of these terms about bookings, prices, payments and cancellations apply from that point.' },
        { p: 'We do not promise a date for any community, or that ProxyPaw will open in every community named on the site.' },
      ],
    },
    {
      id: 'who-can-use-it',
      title: 'Who can use ProxyPaw',
      short: 'Adults who live in a community we serve. Volunteers must be 21 or older.',
      blocks: [
        {
          ul: [
            'You must be at least 18 and able to enter a contract under Indian law.',
            'Volunteers must be at least 21 on the day they register, and must have real experience of caring for pets.',
            'ProxyPaw works inside gated communities. Pet parents and volunteers are matched within the same community.',
            'Sign up as yourself, once, with your own phone number and email address.',
          ],
        },
      ],
    },
    {
      id: 'your-details',
      title: 'Your details and your account',
      short: 'Give us true details, keep them up to date, and keep your login to yourself.',
      blocks: [
        {
          ul: [
            'The details you give us must be true, current and your own. Tell us when they change.',
            'When accounts open, you are responsible for what happens under your login. Keep it private, and tell us at once if someone else has used it.',
            'We may ask you to confirm who you are before we act on a request about your account or your data.',
          ],
        },
        { p: 'How we handle your details is set out in the [privacy note](/privacy).' },
      ],
    },
    {
      id: 'waitlist',
      title: 'The waitlist and the founding offer',
      short: 'Joining is free and holds your place. It does not guarantee access, a date or a booking.',
      blocks: [
        {
          ul: [
            'Joining the waitlist is free. We use your details to tell you when your community opens.',
            'We send one confirmation email when you join, and an email when your access is ready. You can ask to be removed at any time.',
            'The Founding 1,000: the first 1,000 pet parents get a free onboarding session for their pet and ₹100 off their first booking, as described on the home page.',
          ],
        },
        { note: 'The full conditions of the founding offer will be listed here: how it is claimed, when it ends, and whether it can be combined with a care pass.' },
      ],
    },
    {
      id: 'volunteers',
      title: 'Registering as a volunteer',
      short: 'Registering is a request to be considered. You become a volunteer only when every check is complete.',
      blocks: [
        {
          ul: [
            'You give us your details, your date of birth, a note about your experience with pets, and an original identity document: your e-Aadhaar, or your PAN card if you do not have one. A driving licence is optional.',
            'You confirm that your documents are original, and you consent to a background verification check.',
            'Registration is complete only after we verify your identity, finish background and reference checks, speak with you in person, and you complete our safety training and supervised trial bookings. The six checks are described on our [About page](/about).',
            'We may decline an application, or pause or remove a volunteer, at any time. We will tell you when we do.',
            'Volunteers keep 70% of every booking they complete. How and when payouts are made is shared at onboarding.',
            'Volunteers are responsible for their own taxes on what they earn. Where the law requires us to deduct tax before paying out, we will.',
          ],
        },
      ],
    },
    {
      id: 'bookings',
      title: 'Bookings',
      short: 'You choose a neighbour and a time, and your first booking always begins with a meet-and-greet at your door.',
      blocks: [
        {
          ul: [
            'The services are dog walks, cat home visits, and overnight boarding for dogs and cats, as listed on the home page.',
            'ProxyPaw arranges and supports each booking. The care is provided by the volunteer who accepts it.',
            'Your first booking starts with an in-person meet-and-greet with you and your pet. Either side may decide not to go ahead after it.',
            'A booking is confirmed only when the volunteer has accepted it and you see the confirmation.',
            'Walks are tracked by live GPS. Volunteers send photo updates during walks, visits and sleepovers, and a short report at the end.',
            'Volunteers may decline any booking. We cannot promise that a volunteer will be free at the time you want.',
          ],
        },
      ],
    },
    {
      id: 'prices',
      title: 'Prices and the volunteer’s share',
      short: 'The price is shown before you confirm. 70% goes to your neighbour and 30% to ProxyPaw.',
      blocks: [
        { p: 'The prices on the home page today are:' },
        {
          dl: [
            ['Dog walks', '₹149 for 30 minutes, ₹249 for 1 hour, ₹349 for 1.5 hours and ₹449 for 2 hours.'],
            ['Cat home visit', '₹129.'],
            ['Boarding', '₹549 a night for dogs, ₹449 a night for cats, and ₹499 a night for stays of five nights or more.'],
            ['Care passes', 'Day pass ₹349, week pass ₹1,499, month pass ₹4,999 and cat month pass ₹2,999. What each pass includes is listed in the pricing section of the home page.'],
          ],
        },
        { p: 'Of every booking, 70% goes to the volunteer for their time and care. The remaining 30% goes to ProxyPaw and pays for verification, insurance, GPS tracking and support.' },
        { p: 'Prices are in Indian rupees. The price you pay is the total shown on the confirmation screen before you pay, including any taxes that apply. We may change prices for future bookings. A change never affects a booking you have already confirmed.' },
        { note: 'Whether the listed prices include GST, and how long each care pass stays valid, will be stated here.' },
      ],
    },
    {
      id: 'payments',
      title: 'Payments, cancellations, refunds and no-shows',
      short: 'You pay in the app by UPI or card. The cancellation and refund rules for your booking are shown before you confirm it.',
      blocks: [
        {
          dl: [
            ['Paying', 'Payment is taken in the app, by UPI or card, through a payment gateway. ProxyPaw will not store your card number or your UPI PIN.'],
            ['Only through ProxyPaw', 'A booking arranged or paid for outside the app is not a ProxyPaw booking. It is not tracked or supported, and nothing in these terms covers it.'],
            ['Cancelling', 'Either side can cancel. The cut-off for a free cancellation, and what is charged after it, are shown on the booking screen before you confirm.'],
            ['Refunds', 'When a refund is due, it is returned to the payment method you used.'],
            ['If the volunteer cancels or does not arrive', 'Tell us through the app. You will not pay for care you did not receive.'],
            ['If the pet parent is not there', 'If you or your pet are not available at the agreed time, the booking may be charged as shown on the booking screen.'],
            ['Paying volunteers', 'Volunteers receive their 70% share after a booking is completed. The payout schedule is shared at onboarding.'],
          ],
        },
        { note: 'The payment gateway, the exact cancellation cut-offs, refund timelines and no-show charges will be listed here.' },
      ],
    },
    {
      id: 'community-guidelines',
      title: 'Community guidelines',
      short: 'Be honest, be kind, keep the leash on, and keep everything on ProxyPaw. These apply to everyone, on every booking.',
      blocks: [
        { p: 'ProxyPaw only works if neighbours can trust each other. These guidelines are part of these terms.' },
        { h: 'For pet parents' },
        {
          ul: [
            'Be honest about your pet: age, health, medication, allergies, fears, and any history of biting, scratching, fighting or running off. Say it at the meet-and-greet, and update your pet’s profile when something changes.',
            'Keep vaccinations, deworming and tick control up to date, as your vet advises. If your pet is ill with something that can spread, tell the volunteer before the booking.',
            'Hand over safely and in person, at your door or the agreed place, with a well-fitting harness or collar, a sturdy leash and an ID tag. Cats leave the flat only in a secure carrier.',
            'Provide what your pet needs for the booking: food, any medication with written instructions, litter, bedding, and whatever keeps them calm.',
            'Make your home safe for a visit. Tell the volunteer about locks, balcony doors, windows, other pets, and anyone else who will be at home.',
            'Give an emergency contact and your vet’s details, and say in advance whether the volunteer may take your pet to a vet if you cannot be reached.',
            'Be reachable during the booking, and be on time for pick-up and drop-off.',
            'Follow your community’s rules for pets, and make sure any registration your community or the city requires is in place.',
            'Treat your volunteer with respect. They are a neighbour doing a careful job.',
          ],
        },
        { h: 'For volunteers' },
        {
          ul: [
            'Complete every check before your first booking: identity, background and references, the conversation with us, safety training and supervised trial bookings.',
            'Care for one household’s pets at a time, unless every pet parent involved has agreed otherwise.',
            'Leash on, always, in lobbies, lifts, corridors, car parks, roads and every shared area. Off-leash time happens only inside a fenced pet area, and only if the pet parent has agreed.',
            'Never leave a pet unattended: not tied up outside a shop, not alone in a vehicle, not on a balcony, not with someone else. Hand a pet back only to the pet parent or to a person they have named.',
            'Follow the pet parent’s instructions on food, treats, medication, routes and routines. Give no food or medicine they have not approved.',
            'Keep live GPS on for the whole walk, send the photo updates the booking promises, and finish with a short report.',
            'Check the weather and the ground. Use the pavement test in the heat, carry water, and cut a walk short if the pet is struggling.',
            'Pick up after the pet, every time, and leave shared areas clean.',
            'In someone’s home: enter only for the booking, go only where the visit needs you, bring no one with you, and lock up exactly as you were asked. Keys, access cards and door codes are for the booking only. Never copy or share them, and return or delete them when it ends.',
            'When you host a sleepover, your home must be as you described it and safe for the pet, with no other pets or guests beyond what the pet parent has agreed.',
            'Follow the community’s bye-laws: pet lifts and pet areas, quiet hours, and gate and visitor rules.',
            'Do not take a booking if you are unwell, have been drinking, or are otherwise not fit to care for a pet.',
            'Tell the pet parent and ProxyPaw at once about any injury, illness, escape, bite, fight or damage, however small.',
            'Any mistreatment of a pet means immediate and permanent removal.',
          ],
        },
        { h: 'For everyone' },
        {
          ul: [
            'Be kind and respectful, in person and in messages. No harassment, threats, discrimination or abuse of any kind.',
            'Keep bookings and payments on ProxyPaw. Do not ask for, offer or accept payment outside the app.',
            'Use other people’s details only for the booking. Do not share a neighbour’s phone number, address, door code, photos or pet details with anyone else, and do not contact them about anything unrelated.',
            'Photos taken during a booking are for the pet parent. Do not post pictures of someone else’s pet, home or family without their permission, and do not photograph people without asking.',
            'Write honest ratings and reviews, based on your own booking.',
            'Do not use ProxyPaw to break the law, including the laws that protect animals from cruelty.',
            'Report a safety concern as soon as you see it, even when it is about someone you like.',
          ],
        },
        { p: 'If someone breaks these guidelines, tell us. We look at every report, and we may warn, pause or remove a member depending on what happened.' },
      ],
    },
    {
      id: 'safety',
      title: 'Pet safety, emergencies and insurance',
      short: 'The volunteer calls you first. If your pet needs urgent care and you cannot be reached, they act on the instructions you gave in advance.',
      blocks: [
        {
          ul: [
            'If a pet is hurt, ill or lost during a booking, the volunteer contacts the pet parent immediately, then the emergency contact, and tells ProxyPaw.',
            'If neither can be reached and the pet needs urgent care, the volunteer follows the instructions the pet parent gave in advance, which may include taking the pet to the named vet or to the nearest one available.',
            'If a pet injures a person or another animal, or damages property, both sides tell ProxyPaw the same day and share what they know.',
            'The pet parent remains the pet’s owner throughout, and is responsible for the accuracy of what they told us and the volunteer about the pet.',
          ],
        },
        { p: 'The site describes every booking as insured. No booking can be made today, and the details of that cover will be published here, and shown to you, before the first one is.' },
        { note: 'To be published here: the insurer, what the cover includes and excludes, how to make a claim, and who pays for emergency vet treatment.' },
      ],
    },
    {
      id: 'content',
      title: 'Photos, reviews and other content',
      short: 'What you post stays yours. You let us show it inside ProxyPaw so the service can work.',
      blocks: [
        {
          ul: [
            'Photo updates, messages, ratings, reviews and feedback remain yours. You give ProxyPaw permission to store them and to show them, inside the service, to the people they are meant for.',
            'We will not use a photo of you, your pet or your home in marketing, or publish your words with your name, without asking you first.',
            'Ideas and suggestions you send us may be used to improve ProxyPaw.',
            'Do not post anything that is false, abusive or obscene, or that reveals someone else’s private details.',
            'We may remove content that breaks these terms or the law. If you believe something another member has posted is unlawful or harms you, tell us and we will look at it.',
          ],
        },
      ],
    },
    {
      id: 'fair-use',
      title: 'Using the site and app fairly',
      short: 'Use ProxyPaw as it is meant to be used. Do not break it, copy it, or misuse other people’s details.',
      blocks: [
        {
          ul: [
            'Do not submit false signups, pretend to be someone else, or sign other people up without their knowledge.',
            'Do not use bots or scripts on our forms, scrape the site, or try to get around its security or rate limits.',
            'Do not try to reach other people’s data, the founder’s dashboard, or any part of the service you have not been given.',
            'Do not upload anything harmful, such as malware, or use the service to send spam.',
          ],
        },
      ],
    },
    {
      id: 'our-content',
      title: 'Our content',
      short: 'The ProxyPaw name, logo, design, words and software are ours. Enjoy the site, and please do not copy it.',
      blocks: [
        { p: 'The ProxyPaw name and logo, the design of the site and app, the illustrations, the 3D community, the articles in the Paw Journal and the software behind them belong to ProxyPaw or to those who license them to us. You may view and share pages for your own use. You may not copy, republish or sell them, or use the name or logo, without our written permission.' },
      ],
    },
    {
      id: 'illustrative',
      title: 'What on the site is illustrative',
      short: 'The 3D community, the photographs and the demo names are illustrations. The journal is general information.',
      blocks: [
        {
          ul: [
            'The 3D community is an illustrative model based on a community’s published master plan. ProxyPaw is not affiliated with, endorsed by or in partnership with the developer of that community, or of any community named on the site.',
            'Community names show where ProxyPaw is being built for. They do not mean ProxyPaw has an agreement with a community, its developer or its residents’ association.',
            'Photographs are illustrative scenes of Hyderabad gated communities. They are not pictures of real customers or volunteers.',
            'Names in the demos, such as the pets and neighbours in the walk and the app tour, are samples.',
            'App screens show how the app is designed to work. Details may change before it opens.',
            'The Paw Journal is general information about pet care. It is not veterinary advice. Ask your vet about your own pet.',
          ],
        },
      ],
    },
    {
      id: 'responsibility',
      title: 'Our responsibility, and its limits',
      short: 'We are responsible for doing our part with care. We are not responsible for what we cannot control, and nothing here removes rights the law gives you.',
      blocks: [
        { p: 'We will run ProxyPaw with reasonable care and skill: carry out the checks we describe, keep the service working as well as we reasonably can, and deal fairly with complaints.' },
        { p: 'The care during a booking is provided by an independent volunteer. We verify and train volunteers, but we cannot supervise every moment of every booking, and we do not promise that a booking will be free of accident, illness or loss.' },
        { p: 'To the extent Indian law allows, we are not responsible for:' },
        {
          ul: [
            'Outcomes caused by details that were not shared with us or the volunteer, or that were untrue.',
            'Anything arranged or paid for outside ProxyPaw.',
            'Indirect losses, such as lost income or missed travel.',
            'Interruptions outside our reasonable control, such as network, power or payment-system failures, extreme weather, or an order from a community or an authority.',
            'The site being unavailable or containing an error. During the waitlist phase the site is provided as it is.',
          ],
        },
        { p: 'Nothing in these terms limits or excludes any liability that cannot be limited or excluded under Indian law, including your rights under the Consumer Protection Act, 2019.' },
      ],
    },
    {
      id: 'your-responsibility',
      title: 'Your responsibility to us',
      short: 'If you break these terms and that costs ProxyPaw or another member money, you agree to make it good.',
      blocks: [
        { p: 'If you break these terms or the law, or give false details, and that leads to a claim, loss or cost for ProxyPaw or for another member, you agree to cover the reasonable loss that results from what you did. This does not apply to loss caused by our own fault.' },
      ],
    },
    {
      id: 'ending-access',
      title: 'Pausing or ending your access',
      short: 'You can leave whenever you like. We can pause or remove anyone who breaks these terms or puts a pet or a person at risk.',
      blocks: [
        {
          ul: [
            'You may leave the waitlist, or close your account once accounts open, at any time by writing to us.',
            'We may refuse, pause or end access for anyone who breaks these terms or the community guidelines, gives false details, or puts a pet, a person or the community at risk. Where we can, we will tell you why.',
            'Any mistreatment of a pet means immediate and permanent removal, and we may report it to the authorities.',
            'Ending access does not cancel what either side already owes for completed bookings.',
            'What happens to your data when you leave is set out in the [privacy note](/privacy).',
          ],
        },
      ],
    },
    {
      id: 'changes',
      title: 'Changes to these terms',
      short: 'We will update these terms before booking opens, and tell you when we do.',
      blocks: [
        { p: 'These terms will grow as ProxyPaw does, and the details marked “Before booking opens” will be filled in. The date at the top shows the latest version. If a change matters to you, we will email you before it takes effect. If you keep using ProxyPaw after that date, the new terms apply. If you do not agree, you can leave at any time.' },
      ],
    },
    {
      id: 'law',
      title: 'Governing law and disputes',
      short: 'Indian law applies. Talk to us first. Most things can be sorted out directly.',
      blocks: [
        { p: 'These terms are governed by the laws of India.' },
        { p: 'If you have a complaint, raise it with us first, using the contact route below, and give us a fair chance to put it right. If we cannot resolve it together, the courts at Hyderabad, Telangana, will have jurisdiction.' },
        { p: 'This does not take away any right you have as a consumer to approach a consumer commission or another authority under the Consumer Protection Act, 2019.' },
        { p: 'If any part of these terms is found to be unenforceable, the rest still applies.' },
      ],
    },
    {
      id: 'contact',
      title: 'Contact and grievance officer',
      short: 'The founder reads every message herself. Write to us with the form below. A named grievance officer will be listed here before booking opens.',
      blocks: [
        { p: 'Today, the way to reach us is the form below, or the feedback box that appears after you sign up. Both reach the founder directly.' },
        { p: 'Before booking opens we will name a grievance officer here, with their contact details, as the Consumer Protection (E-Commerce) Rules, 2020 require of online platforms. Those rules ask that a complaint is acknowledged within 48 hours and resolved within one month, and we will work to those timelines.' },
        { p: 'Complaints about something another member has posted will be handled under the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021.' },
        { note: 'The grievance officer’s name, designation, phone number and email address will be listed here.' },
      ],
    },
  ],
};

export const LEGAL: Record<'privacy' | 'terms', LegalDoc> = { privacy: PRIVACY, terms: TERMS };
