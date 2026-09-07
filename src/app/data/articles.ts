/**
 * The Paw Journal, full articles.
 *
 * Original content written for ProxyPaw, grounded in published veterinary
 * guidance (AKC, American Humane, ASPCA, Preventive Vet, and practice blogs)
 * but rewritten for our audience: flat-dwellers in Gachibowli's gated
 * communities. Nothing here is copied text.
 *
 * Body format: a flat list of blocks so the reading view stays dumb-simple.
 *   h, section heading
 *   p, paragraph
 *   list, bullet list
 *   tip, highlighted ProxyPaw callout
 */

export interface ArticleBlock {
  type: 'h' | 'p' | 'list' | 'tip';
  text?: string;
  items?: string[];
}

export interface Article {
  slug: string;
  tag: string;
  title: string;
  dek: string;
  read: string;
  img: string;
  body: ArticleBlock[];
}

export const ARTICLES: Article[] = [
  {
    slug: 'apartment-grooming-guide',
    tag: 'grooming',
    title: 'The apartment grooming guide for dogs & cats',
    dek: 'Brushing beats bathing, monsoon coat care, and the nail-click rule every flat-dweller should know.',
    read: '5 min read',
    img: 'https://images.unsplash.com/photo-1519052537078-e6302a4968d4?w=1200&q=80&auto=format&fit=crop',
    body: [
      { type: 'p', text: 'Grooming in a flat is a different sport. There is no garden to shake off in, the lift lobby judges every muddy paw print, and in monsoon the walk from the tower gate to your door is a water hazard. The good news: most of what keeps a coat healthy happens with a brush on your living-room floor, not in a bathtub.' },
      { type: 'h', text: 'Brush first. Bathe rarely.' },
      { type: 'p', text: "Brushing does most of what people think bathing does. It lifts loose hair before it reaches your sofa, spreads natural oils down the coat, improves blood flow to the skin, and gives you a weekly hands-on check for ticks, lumps and sore spots. Bathing too often strips those same oils and leaves skin itchy, for most flat-living dogs, once every four to six weeks is plenty, and many cats never need a bath at all." },
      { type: 'list', items: [
        'Short coats (Beagles, Indies, most cats): a rubber brush once or twice a week.',
        'Medium and double coats (Spitz, Golden Retrievers): a slicker brush two to three times a week, daily when shedding season hits.',
        'Long coats (Shih Tzus, Lhasas, Persians): a few minutes every day, or mats form faster than you can book a groomer.',
      ]},
      { type: 'h', text: 'The nail-click rule' },
      { type: 'p', text: "Walk your dog across your tiled floor and listen. If you hear clicking, the nails are touching the ground, too long. Overgrown nails change how a dog stands, strain the joints, and on polished apartment tile they turn every corner into a skating rink. Most pets need a trim every three to four weeks. Clip only the pale outer tip, well clear of the pink quick; when in doubt, take off less and trim more often." },
      { type: 'h', text: 'Monsoon is its own season' },
      { type: 'p', text: 'From June to September, the enemy is damp. Wet fur against skin for hours is how hot spots and fungal infections start.' },
      { type: 'list', items: [
        'Keep a dedicated towel at the door and dry paws, belly and armpits after every wet walk, not just the back.',
        'Ask your groomer to trim the hair between paw pads; it traps water and mud like a sponge.',
        'Dry the collar and harness too. A damp collar worn all day is a rash factory.',
        'Wash towels and brushes often. In humidity they grow things you do not want against broken skin.',
      ]},
      { type: 'h', text: 'Cats: mostly leave them to it' },
      { type: 'p', text: "Cats run their own grooming department. Your job is backup: a weekly brush for short-haired cats, a daily one for long-haired breeds, and attention the moment grooming *stops*, a scruffy, oily coat on a cat that used to gleam is one of the earliest signs something is medically wrong, and worth a vet call before anything else." },
      { type: 'tip', text: 'ProxyPaw walkers towel-dry paws before bringing your dog back up in monsoon, and sitters note any coat or skin changes in your visit report, the small stuff a busy week makes easy to miss.' },
    ],
  },
  {
    slug: 'how-bookings-stay-safe',
    tag: 'safety',
    title: 'How every ProxyPaw booking stays safe',
    dek: 'Verification, live GPS, incident coverage and the one thing owners forget to share.',
    read: '4 min read',
    img: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=1200&q=80&auto=format&fit=crop',
    body: [
      { type: 'p', text: 'Handing your keys and your dog to someone is an act of trust, even when that someone lives four floors up. We built ProxyPaw so the trust is earned by the system, not just the smile. Here is exactly what stands behind every booking.' },
      { type: 'h', text: 'Everyone is verified before they walk anyone' },
      { type: 'p', text: 'Every walker, sitter and boarding host on ProxyPaw is Aadhaar-verified and background-checked before their profile goes live. They live in your community or one beside it, which means they are not anonymous gig workers but neighbours with a reputation to protect, rated by people you share a lift with.' },
      { type: 'h', text: 'Every walk is on the map' },
      { type: 'p', text: 'From pickup to drop-off, walks are GPS-tracked live. You can watch the loop around your towers from your desk at work. Visits and boarding stays send photo updates, so "how is she doing?" is answered before you ask it.' },
      { type: 'h', text: 'If something goes wrong' },
      { type: 'p', text: 'Every booking carries incident coverage, and every walker completes our safety training: leash protocols in lobbies and lifts, heat rules for Hyderabad summers, and what to do first if a pet is hurt or unwell. A vet-on-call line backs overnight boarding. We would rather over-prepare for the day nothing happens.' },
      { type: 'h', text: 'The one thing owners forget to share' },
      { type: 'p', text: "Quirks. The thing you have stopped noticing is the thing your sitter most needs to know: that he guards his food bowl, that she bolts at the sound of the garbage chute, that he cannot pass the third-floor cat without theatrics. Your pet's profile has a quirks section, fill it honestly. It is passed to every sitter automatically, and it prevents more incidents than any other feature we have built." },
      { type: 'list', items: [
        'Vet name, number and clinic location, saved once, attached to every booking.',
        'Food allergies and what "too many treats" means for your pet.',
        'Fear triggers: thunder, lifts, bikes, brooms, other dogs.',
        'Where the leash, towel and treats live in your flat.',
      ]},
      { type: 'tip', text: 'Two minutes on the quirks section when you join is the highest-value safety work you will ever do on ProxyPaw.' },
    ],
  },
  {
    slug: 'walking-gated-community',
    tag: 'walking',
    title: 'Walking do’s and don’ts in a gated community',
    dek: 'Short leads in lobbies, the 7-second pavement test, and why sniffing beats marching.',
    read: '6 min read',
    img: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1200&q=80&auto=format&fit=crop',
    body: [
      { type: 'p', text: 'A gated community is a strange landscape for a dog: hundreds of humans, dozens of dogs, shared lifts, polished lobbies, and one stretch of lawn everyone has opinions about. Walking well here is half dog skills, half neighbour skills.' },
      { type: 'h', text: 'Short lead in the lobby, always' },
      { type: 'p', text: 'Lifts and lobbies are pinch points, doors open suddenly onto children, delivery agents, and other dogs with no room to negotiate. Keep the lead short and your dog beside you until you are out the tower door, and never let a retractable lead lock someone into a corner. The lawn is where freedom happens; the lobby is where manners do.' },
      { type: 'h', text: 'The 7-second pavement test' },
      { type: 'p', text: "Hyderabad pavement in April can burn paw pads in under a minute, surfaces hit 60°C while the air reads 38. Before any afternoon walk, press the back of your hand flat on the pavement and hold it for seven seconds. If you cannot, your dog cannot walk on it. Shift walks to early morning and after sunset in summer, and stick to the shaded, planted paths inside the community." },
      { type: 'h', text: 'Let the sniff happen' },
      { type: 'p', text: "A walk where your dog gets to sniff is not a lazy walk, it is the whole point. Sniffing is how dogs read the news, and ten minutes of it tires a dog's brain the way thirty minutes of marching tires its legs. Trainers call these decompression walks. Build in stretches where your dog sets the pace and the route, especially around the compound's hedges and gateposts where every dog in the community leaves a story." },
      { type: 'h', text: 'The quick list' },
      { type: 'list', items: [
        'DO pick up every time. One skipped scoop is how communities end up banning dogs from the good lawn.',
        'DO ask before greetings, some dogs on leads are anxious, recovering, or in training.',
        'DO carry water past March; offer it every 20 minutes.',
        "DON'T let your dog charge lifts or corners; you can't see what's on the other side.",
        "DON'T walk brachycephalic breeds (Pugs, Shih Tzus, bulldogs) in midday heat at all.",
        "DON'T rush the walk. Fifteen unhurried minutes beat thirty distracted ones.",
      ]},
      { type: 'tip', text: 'Every ProxyPaw walker is trained on exactly these rules, lobby leads, the pavement test, sniff time, before their first booking in your community.' },
    ],
  },
  {
    slug: 'play-tails-wagging',
    tag: 'play',
    title: 'Play that keeps tails wagging (and whiskers happy)',
    dek: 'Consent checks for dogs, hunt-catch-eat for cats, and the toy rules that prevent vet visits.',
    read: '5 min read',
    img: 'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?w=1200&q=80&auto=format&fit=crop',
    body: [
      { type: 'p', text: 'Play is not a luxury add-on to pet care, it is how dogs regulate their emotions and how cats stay sane indoors. But dog play and cat play are completely different games, and playing the wrong one is why so many flats contain a bored dog and an aloof cat.' },
      { type: 'h', text: 'Dogs: check for consent' },
      { type: 'p', text: 'The best dog-play habit is a pause. Mid-game, stop, hold the toy still, and see what your dog does. Re-engages immediately, play-bows, nudges your hand? That is a yes, carry on. Wanders off, shakes, sits down panting? The game was over a minute ago and only one of you knew. This consent check keeps play fun instead of frantic, and it teaches excitable dogs that calm restarts the game, the single most useful thing an apartment dog can learn.' },
      { type: 'h', text: 'Cats: finish the hunt' },
      { type: 'p', text: 'A cat is not playing with the wand toy. It is hunting it. Feline play follows a hardwired sequence, stalk, chase, pounce, capture, and it needs an ending: the catch. If the red dot never gets caught, the sequence never completes, and the frustration lands on your ankles at 3 a.m. Let the toy be caught properly at the end of every session, then follow with a few treats or a meal. Hunt, catch, eat, groom, sleep: run the whole loop and you get the deep post-hunt nap every cat owner dreams of.' },
      { type: 'h', text: 'Toy rules that prevent vet visits' },
      { type: 'list', items: [
        'String, ribbon, wool and rubber bands are surgery, not toys. Swallowed string is one of the most common, and dangerous, cat emergencies.',
        'Size matters for dogs: a ball that can slip past the back teeth can choke. Bigger than the muzzle, always.',
        'Retire ripped toys. Squeakers and stuffing get eaten.',
        'Wand toys go in a cupboard after play, an unsupervised dangling string is a hazard, and scarcity keeps the toy exciting.',
        'Rotate. Three toys out and three in the drawer beats six ignored on the floor.',
      ]},
      { type: 'h', text: 'How much is enough?' },
      { type: 'p', text: 'For cats: two ten-minute hunt sessions a day, roughly dawn and dusk when the drive peaks. For dogs: it varies wildly by breed and age, but the tell is behaviour, a dog that chews furniture, barks at nothing, or zooms the corridor at midnight is asking for more, and a sniffy walk plus a proper game usually answers.' },
      { type: 'tip', text: 'ProxyPaw visits are not just feeding stops, cat sitters run a full hunt-catch-eat session every visit, and walkers log play time in your report.' },
    ],
  },
  {
    slug: 'feeding-right-portions-treats',
    tag: 'feeding',
    title: 'Feeding right: portions, treats and the no-no list',
    dek: 'The 10% treat rule, body-condition portions, and foods that should never leave your plate.',
    read: '6 min read',
    img: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=1200&q=80&auto=format&fit=crop',
    body: [
      { type: 'p', text: 'Most Indian pets are not underfed, they are over-loved. The extra roti, the biscuit at chai time, the "just one piece" from every family member adds up fast on an animal a tenth your size. Here is how to feed well without turning mealtimes into maths.' },
      { type: 'h', text: 'Portion by body, not by bowl' },
      { type: 'p', text: "The feeding chart on the packet is a starting point, not a verdict. The real measure is your pet's body: run your hands along the ribcage. You should feel ribs easily under a thin layer, like the back of your hand, and see a waist tuck when viewed from above. Ribs you can see: feed more. Ribs you have to press to find: feed less. Check monthly; adjust in small steps." },
      { type: 'h', text: 'The 10% treat rule' },
      { type: 'p', text: "Everything outside the bowl, training treats, chews, the bit of paneer, should stay under 10% of the day's calories. Past that, you are unbalancing a diet the main food was formulated to balance. The practical trick: portion the day's treats into a small box each morning. When the box is empty, the treat day is over, no matter how good the eyes are." },
      { type: 'h', text: 'The no-no list' },
      { type: 'p', text: 'Some human foods are not "unhealthy" for pets, they are poisonous. These should never leave your plate:' },
      { type: 'list', items: [
        'Chocolate, theobromine builds up to toxic levels; darker is deadlier. Affects dogs and cats both.',
        'Grapes and raisins, can cause kidney failure in dogs, even a handful. No one knows the safe dose because there may not be one.',
        'Onion and garlic, raw or cooked, damage red blood cells and cause anaemia. This includes gravy and biryani masala.',
        'Xylitol, the sweetener in sugar-free gum and some peanut butters. Triggers a catastrophic insulin dump in dogs within the hour.',
        'Alcohol, caffeine, raw dough, small bodies, big consequences.',
        'For cats, add lilies (the plant, not food, but flat-fatal) and cow’s milk, which most adult cats cannot digest.',
      ]},
      { type: 'p', text: 'If any of these go down, call your vet immediately, with an estimate of how much and when. Do not wait for symptoms; with xylitol and grapes, early beats sorry by a wide margin.' },
      { type: 'h', text: 'Water, always, everywhere' },
      { type: 'p', text: 'In Hyderabad heat, water matters as much as food. Two bowls in different rooms, refreshed daily. Cats drink more from wide bowls placed away from their food, and more still from a fountain, if yours deigns to accept one.' },
      { type: 'tip', text: 'Your ProxyPaw pet profile carries feeding portions, treat limits and allergies, every sitter follows your numbers, not their guesses.' },
    ],
  },
  {
    slug: 'indoor-cats-bigger-life',
    tag: 'cats',
    title: 'The indoor cat’s guide to a bigger life',
    dek: 'Vertical territory, window theatre and scent games that turn a flat into a kingdom.',
    read: '5 min read',
    img: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=1200&q=80&auto=format&fit=crop',
    body: [
      { type: 'p', text: 'A 1,200-square-foot flat sounds small for an animal built to patrol territory. But cats do not measure space the way we do, they measure it in levels, sightlines and smells. Get those right and a Gachibowli 2BHK becomes a kingdom.' },
      { type: 'h', text: 'Think vertical, not square feet' },
      { type: 'p', text: 'To a cat, a room with a cat tree, a wardrobe top and one wall shelf is three times bigger than the same room at floor level. Height is safety and ownership: a cat surveying the living room from above is a cat in charge of its world. You need vertical territory in at least two rooms, bought, built, or just permission to use furniture you already own.' },
      { type: 'h', text: 'Window theatre' },
      { type: 'p', text: 'A window perch is cat television, and tower living is premium content: kites and pigeons at eye level, the courtyard drama below, the wall lizards of monsoon. Clear the sill by your best-facing window, add a flat cushion, and you have solved the 2 p.m. boredom problem. Just check the mesh, high-rise falls are a real Hyderabad emergency, and a loose mosquito screen is not a barrier.' },
      { type: 'h', text: 'Scent games' },
      { type: 'p', text: 'Cats live through their noses, and a new smell is a miniature adventure. Bring the outside in: a leaf from the community garden, a stick of cinnamon, a pinch of dried catnip or silvervine, cardboard boxes from deliveries with all their warehouse smells. Rotate them weekly. One hard rule: no essential oils or diffusers, many, including eucalyptus and tea tree, are genuinely toxic to cats.' },
      { type: 'h', text: 'The daily minimum' },
      { type: 'list', items: [
        'Two 10-minute hunt-style play sessions (wand toy, ending in a catch).',
        'One meal or part-meal from a puzzle feeder instead of a bowl.',
        'Vertical territory in two rooms and one claimed window.',
        'A scratching post that is tall enough for a full stretch, or the sofa volunteers.',
        'Something new to smell every week.',
      ]},
      { type: 'tip', text: 'When you travel, cats do better in their kingdom than in a strange one. ProxyPaw home visits keep the routine, feeding, litter, one proper hunt session, inside the territory your cat already owns.' },
    ],
  },
  {
    slug: 'litter-box-science',
    tag: 'cats',
    title: 'Litter box science: count, placement and cleaning',
    dek: 'The n+1 rule, why the box hates the washing machine, and what changing habits really mean.',
    read: '4 min read',
    img: 'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=1200&q=80&auto=format&fit=crop',
    body: [
      { type: 'p', text: 'Nothing ends the peace of a flat faster than a cat that has gone off its litter box. The fix is almost never discipline and almost always logistics: count, placement, and cleanliness. Cats have standards. Meet them and the problem disappears.' },
      { type: 'h', text: 'The n+1 rule' },
      { type: 'p', text: 'One box per cat, plus one. One cat, two boxes. Two cats, three. It sounds excessive until you understand why: cats often prefer to urinate in one place and defecate in another, and in multi-cat homes a confident cat can quietly guard the only box, leaving the shyer one to find alternatives you will not enjoy. The +1 is conflict insurance.' },
      { type: 'h', text: 'Placement: quiet, open, never cornered' },
      { type: 'p', text: 'The classic flat mistake is putting the box in the utility area next to the washing machine. Then the spin cycle detonates mid-visit once, and the cat files the location as dangerous, permanently. A litter box needs quiet, an escape route the cat can see, and distance from food and water. In a 2BHK: one box in the second bathroom, one in a bedroom corner, neither behind a door that swings shut.' },
      { type: 'h', text: 'Cleaning: daily scoop, monthly reset' },
      { type: 'list', items: [
        'Scoop once a day minimum. A cat’s nose lives a few centimetres above that sand; what smells "fine" to you does not to them.',
        'Full litter change and a warm-water wash every few weeks. Skip harsh disinfectants, strong chemical smells repel cats as much as dirt does.',
        'Most cats prefer unscented, fine-grained, clumping litter, filled about 5–7 cm deep. Change brands gradually, mixing over a week.',
        'Uncovered boxes win with most cats: better airflow, better sightlines, no ambush anxiety.',
      ]},
      { type: 'h', text: 'When habits change, listen' },
      { type: 'p', text: 'A cat that suddenly goes outside the box, strains, visits repeatedly, or cries in the box is not being spiteful, cats do not do revenge. It is telling you something: often stress (new pet, renovation, guests) and sometimes a urinary problem that is a genuine emergency in male cats. Rule out the vet stuff first, always. A blocked male cat cannot wait until Monday.' },
      { type: 'tip', text: 'ProxyPaw cat visits include litter scooping and a notes field for exactly these changes, frequency, straining, anything off, so you hear about it the same day, not after a week away.' },
    ],
  },
];

export function getArticle(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}
