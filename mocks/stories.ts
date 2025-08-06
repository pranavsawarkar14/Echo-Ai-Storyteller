export interface Story {
  id: string;
  title: string;
  duration: string;
  author: string;
  imageUrl: string;
  category: string;
  content?: string; // Optional field for AI-generated story content
  images?: string[]; // Optional field for additional images (for AI-generated stories)
  rating?: number; // Story rating (1-5)
  description?: string; // Story description
  playCount?: number; // Number of times played
  tags?: string[]; // Story tags
  isNew?: boolean; // Is this a new story
  isPremium?: boolean; // Is this a premium story
}

const stories: Story[] = [
  {
    id: "1",
    title: "The Lost City of Atlantis",
    duration: "15 min",
    author: "Echo AI",
    imageUrl: "https://media.istockphoto.com/id/2181735944/photo/natural-mountains-landscapes.jpg?b=1&s=612x612&w=0&k=20&c=7WJMhHseLhVBEDa8N7ww7J_oqm_w_PlvUlxZPsmF3UI=",
    category: "Adventure",
    rating: 4.8,
    description: "Dive into the mysterious depths of the legendary lost city of Atlantis, where ancient secrets and hidden treasures await discovery.",
    playCount: 1250,
    tags: ["underwater", "mystery", "ancient"],
    isNew: false,
    isPremium: false,
    content: `Deep beneath the cerulean waves of the Atlantic Ocean, where sunlight fades into an endless twilight, lies the most magnificent city ever built by human hands. Atlantis. For thousands of years, it has remained hidden from the world above, its crystal spires and flowing water channels a testament to an advanced civilization lost to time.

Dr. Marina Wells adjusted her diving equipment as she descended through the crushing depths. At forty-two, she had dedicated her life to marine archaeology, but nothing had prepared her for this moment. The ancient coordinates she had discovered in a Byzantine manuscript had led her here, to this impossible place where myth and reality converged.

As her submersible's lights pierced the darkness, the outline of towering structures emerged from the abyss. Walls of what appeared to be living coral stretched impossibly high, pulsing with a faint bioluminescent glow. Gardens of sea anemones swayed in perfect rows, their movements synchronized as if choreographed by an unseen hand.

"Impossible," Marina whispered, her breath fogging the reinforced glass of her helmet. The city sprawled before her like a fever dream, its architecture defying everything she knew about ancient civilizations. Spiraling towers twisted upward through the water column, connected by graceful bridges that seemed to flow like liquid mercury.

At the heart of Atlantis stood a massive temple, its entrance guarded by towering statues of beings that were neither fully human nor entirely aquatic. Their eyes, carved from some unknown luminescent stone, seemed to track her movement through the water. Marina felt a chill that had nothing to do with the frigid depths.

As she guided her craft closer to the temple, ancient mechanisms began to activate. Runes along the temple walls flared to life with electric blue radiance, and the water around her began to stir with currents that followed no natural pattern. The city was awakening, responding to her presence after millennia of slumber.

Inside the temple, Marina discovered chambers filled with technology that seemed to merge organic and mechanical elements seamlessly. Panels of what looked like crystallized water displayed symbols that shifted and changed as she watched. At the chamber's center stood a device that hummed with barely contained energy, a power source that had kept this impossible city alive for thousands of years.

But as Marina reached out to touch the ancient machinery, she realized she was not alone. The guardians of Atlantis had awakened with their city, and they were not pleased to find an intruder in their sacred halls. The water around her began to glow with an ominous light as shapes moved in the shadows beyond her vision.

Her discovery would change everything, if she lived to tell the tale.`,
  },
  {
    id: "2",
    title: "Whispers in the Dark Forest",
    duration: "12 min",
    author: "Echo AI",
    imageUrl: "https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=1170&auto=format&fit=crop",
    category: "Mystery",
    rating: 4.6,
    description: "Strange sounds echo through the ancient woods as a traveler discovers that the forest holds more secrets than expected.",
    playCount: 980,
    tags: ["supernatural", "forest", "thriller"],
    isNew: false,
    isPremium: false,
    content: `The Thornwick Forest had stood for over a thousand years, its ancient oaks and towering pines creating a canopy so dense that even at midday, the forest floor remained shrouded in perpetual twilight. Local villagers had always whispered stories about the woods – tales of strange lights, ethereal voices, and travelers who entered but never returned.

Dr. Sarah Chen, a botanist from the university, had dismissed these stories as rural superstition. She was here on a research expedition, studying the unique bioluminescent fungi that had been reported growing deep within the forest's heart. Armed with her scientific instruments and a healthy dose of skepticism, she ventured into the woods just as the sun began its descent toward the horizon.

The first sign that something was amiss came as she walked along what appeared to be a well-worn path. The usual sounds of the forest – birdsong, rustling leaves, scurrying creatures – had fallen completely silent. The only sound was her own footsteps on the moss-covered ground and the occasional creak of ancient branches swaying overhead.

As darkness deepened, Sarah noticed something extraordinary. The trees themselves seemed to be communicating. Tiny points of light, like fairy lanterns, began to appear along their bark – the bioluminescent fungi she had come to study. But these lights weren't random. They pulsed in patterns, flickering from tree to tree in waves that rippled through the forest like silent conversations.

Sarah pulled out her equipment and began to record the phenomenon. The light patterns were remarkably complex, following rhythms that seemed almost musical. As she watched, entranced, she began to notice that the lights were responding to her presence. When she moved closer to a tree, its lights would pulse faster. When she stepped back, they would dim and slow.

"Impossible," she murmured, but the evidence was undeniable. The forest was alive in a way that defied everything she had learned about plant biology. The fungi weren't just growing on the trees – they were connecting them, creating a vast neural network that spanned the entire woodland.

Hours passed as Sarah documented her findings, too fascinated to notice how deep into the forest she had wandered. It was only when she looked up from her instruments that she realized the truth. The whispers the villagers had spoken of weren't human voices carried on the wind. They were the forest itself, speaking in a language of light and chemical signals that had existed long before humans walked the earth.

But as she tried to find her way back to the path, Sarah discovered that the forest had been watching her just as intently as she had been watching it. The lights began to form patterns that led her deeper into the woods, away from any hope of return. The ancient consciousness that dwelt within these trees had decided that some secrets were too important to let go.

In the heart of the forest, where the oldest oak stood like a living cathedral, Sarah would discover the truth about the whispers in the dark – and why some travelers never found their way home.`,
  },
  {
    id: "3",
    title: "Journey to the Stars",
    duration: "18 min",
    author: "Echo AI",
    imageUrl: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=1222&auto=format&fit=crop",
    category: "Sci-Fi",
    rating: 4.9,
    description: "An epic space adventure that takes you across galaxies to discover new worlds and encounter alien civilizations.",
    playCount: 2100,
    tags: ["space", "aliens", "exploration"],
    isNew: true,
    isPremium: true,
    content: `Captain Alex Rivera stood on the bridge of the UES Horizon, humanity's most advanced starship, gazing out at the swirling nebula that marked the edge of known space. After three years of travel at near-light speed, they had finally reached Proxima Centauri, humanity's first destination beyond the solar system. The crew of fifty had trained their entire lives for this moment – first contact with whatever lay waiting in the depths of space.

"Captain," called Lieutenant Torres from the navigation console, her voice tight with excitement. "We're detecting an artificial structure in orbit around Proxima Centauri B. It's massive – easily ten times the size of anything we've ever built."

Through the viewport, Alex could see the object as they approached. It was unlike anything in human engineering – a crystalline construct that seemed to shift and change as they watched, its faceted surfaces reflecting the light of the red dwarf star in patterns that hurt to look at directly. Energy readings from the structure were off the charts, suggesting technology far beyond human understanding.

"All stop," Alex commanded. "Maintain our distance and begin full scans. Whatever that is, it's been waiting here for a very long time."

Dr. Elena Vasquez, the mission's xenobiologist, looked up from her readings with wonder in her eyes. "Captain, this structure is over fifty thousand years old, but it's still actively drawing power from the star itself. The engineering required for such a feat..." She trailed off, unable to find words for what they were witnessing.

As the Horizon's sensors probed the alien artifact, it began to respond. Sections of its crystalline surface started to glow with internal light, and geometric patterns raced across its hull like living mathematics. Then, without warning, it sent out a pulse of energy that washed over their ship like a gentle tide.

In that instant, every human aboard the Horizon experienced something unprecedented. Images flooded their minds – visions of vast cities among the stars, beings of pure energy dancing between galaxies, and technologies that could reshape reality itself. They saw the rise and fall of civilizations spanning millions of years, and the slow, patient journey of knowledge as it passed from one species to the next.

"It's a library," Alex whispered, tears streaming down her face as the visions continued. "A repository of everything learned by every species that has ever reached for the stars. They've been waiting for us, waiting for humanity to take its first step into the greater galaxy."

But with knowledge came responsibility. The beings who had built this archive had faced the same choices that now lay before humanity. They had seen species use such power to create paradise, and others who had used it to bring about their own destruction. The test was not whether humanity was ready for the technology – it was whether they were wise enough to use it properly.

As the visions faded, Alex faced the most important decision in human history. Should they download the alien knowledge and risk unleashing forces beyond their control? Or should they turn back, leaving humanity to develop at its own pace, unaware of the wonders and dangers that awaited among the stars?

The artifact waited patiently, as it had for fifty millennia, for humanity's answer.`,
  },
  {
    id: "4",
    title: "The Enchanted Kingdom",
    duration: "20 min",
    author: "Echo AI",
    imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1169&auto=format&fit=crop",
    category: "Fantasy",
    rating: 4.7,
    description: "Enter a magical realm where dragons soar, wizards cast spells, and brave heroes embark on legendary quests.",
    playCount: 1800,
    tags: ["magic", "dragons", "heroes"],
    isNew: false,
    isPremium: false,
    content: `In the realm of Aethermoor, where magic flows through the very air like morning mist, Princess Lyra discovered her gift on her eighteenth birthday. It began as whispers in her dreams, voices calling from places that existed only in sleep. But when she awoke to find her bedchamber filled with shimmering butterflies made of pure starlight, she knew her life would never be the same.

Dream magic was the rarest of all the arcane arts, possessed by perhaps one person in a thousand generations. Those who wielded it could walk between the world of waking and the realm of dreams, bringing forth visions into reality and weaving impossible possibilities into existence. But such power came with a terrible price, for dream magic was as dangerous to its wielder as it was to those around them.

The kingdom of Aethermoor had known peace for three hundred years, protected by the great crystal barriers that kept the shadow creatures of the Void at bay. But now those barriers were failing, cracks of darkness spreading like spider webs across their surface. The court wizards spoke in hushed tones of an ancient evil stirring beyond the veil, something that had waited centuries for the barriers to weaken.

"You must learn to control your gift," warned Master Aldric, the kingdom's eldest mage, as he watched Lyra accidentally turn the castle's fountain into a cascade of liquid moonlight. "Dream magic is not like other forms of sorcery. It responds to emotion, to desire, to the deepest fears hidden in your heart. Without proper training, it will consume you from within."

But time was a luxury they did not possess. Reports arrived daily of shadow creatures breaching the weakened barriers, entire villages disappearing into pockets of nightmare made manifest. The scattered magical clans, who had maintained an uneasy peace for generations, were too proud and too divided to unite against the common threat.

As Lyra struggled to master her unpredictable powers, she began to understand the true scope of her destiny. The dream realm and the waking world were not separate places, but two sides of the same cosmic tapestry. The shadow creatures were not invaders from another dimension, they were manifestations of collective fear and despair that had been building for centuries, waiting for the barriers between dream and reality to thin enough for them to cross over.

In her dreams, Lyra walked through landscapes of impossible beauty and terrible danger. She spoke with the spirits of ancient dream mages who had given their lives to create the barriers, and learned of the great sacrifice that would be required to restore them. The magic needed to rebuild the barriers could only come from one source, the willing sacrifice of a dream mage's own connection to the waking world.

As the shadow creatures massed for their final assault on the kingdom, Lyra faced an impossible choice. She could save her people and her world, but only by entering the dream realm permanently, becoming a guardian spirit who could never again walk in the sunlight or feel the touch of mortal hands.

Standing on the battlements of her father's castle, watching the darkness gather on the horizon, Princess Lyra prepared to make the greatest sacrifice any ruler had ever made for their kingdom.`,
  },
  {
    id: "5",
    title: "Secrets of the Ancient Tomb",
    duration: "14 min",
    author: "Echo AI",
    imageUrl: "https://images.unsplash.com/photo-1544979590-37e9b47eb705?q=80&w=1170&auto=format&fit=crop",
    category: "Adventure",
    rating: 4.5,
    description: "Archaeological discovery leads to a dangerous adventure through booby-trapped chambers and ancient puzzles.",
    playCount: 1400,
    tags: ["archaeology", "puzzles", "danger"],
    isNew: false,
    isPremium: false,
  },
  {
    id: "6",
    title: "The Haunted Mansion",
    duration: "16 min",
    author: "Echo AI",
    imageUrl: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?q=80&w=1165&auto=format&fit=crop",
    category: "Horror",
    rating: 4.4,
    description: "A spine-chilling tale of a family that moves into a house with a dark past and ghostly inhabitants.",
    playCount: 900,
    tags: ["ghosts", "haunted", "scary"],
    isNew: false,
    isPremium: false,
  },
  {
    id: "7",
    title: "Love Beyond Time",
    duration: "22 min",
    author: "Echo AI",
    imageUrl: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=1287&auto=format&fit=crop",
    category: "Romance",
    rating: 4.6,
    description: "A timeless love story that spans centuries, proving that true love can overcome any obstacle, even time itself.",
    playCount: 1600,
    tags: ["romance", "time-travel", "eternal"],
    isNew: false,
    isPremium: true,
  },
  {
    id: "8",
    title: "The Detective's Last Case",
    duration: "25 min",
    author: "Echo AI",
    imageUrl: "https://images.unsplash.com/photo-1453873623425-04e3561289aa?q=80&w=1170&auto=format&fit=crop",
    category: "Mystery",
    rating: 4.8,
    description: "A veteran detective faces their most challenging case yet in this gripping noir mystery filled with twists and turns.",
    playCount: 2200,
    tags: ["detective", "noir", "investigation"],
    isNew: true,
    isPremium: false,
  },
];

export const categories = [
  "All",
  "Adventure",
  "Mystery",
  "Sci-Fi",
  "Fantasy",
  "Horror",
  "Romance",
];

export default stories;