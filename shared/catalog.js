/* The games on the hub.
   To add a game: add an entry here, create games/<id>.js, and set play: true.
   t = title, s = short name for small tiles, g = picture name from Ark.G, sky = two card colours,
   bg = card background scene (hills, meadow, sea, deep, palace, road, night, library, mountain),
   type = how it plays (see ARK_TYPES), b = one short line, hot = order in "Jump Straight In" (popular games). */
window.ARK_THEMES = [
  { id: 'heroes', t: 'Kingdom Heroes', d: 'Be brave like David, Esther, Moses and Jonah' },
  { id: 'stories', t: 'Bible Stories', d: 'Step inside the stories' },
  { id: 'word', t: 'God’s Word', d: 'Learn verses and the books of the Bible' },
  { id: 'grow', t: 'Grow in Faith', d: 'Quizzes and the fruit of the Spirit' }
];

window.ARK_TYPES = {
  action: 'Action', race: 'Race', match: 'Match', puzzle: 'Puzzle', quiz: 'Quiz', story: 'Story', seek: 'Seek & Find'
};

window.ARK_CATALOG = [
  { id: 'davids-sling', orient: 'landscape', t: 'David’s Sling Shot', s: 'David’s Sling', theme: 'heroes', type: 'action', bg: 'hills', g: 'stone', sky: ['#FF9A62', '#D7263D'], play: true, hot: 4, b: 'Gather five smooth stones, then face the giant.' },
  { id: 'queen-esther', t: 'Queen Esther: Courage of a Queen', s: 'Queen Esther', theme: 'heroes', type: 'story', bg: 'palace', g: 'crown', sky: ['#A98BFF', '#5B2A86'], play: true, b: 'Discover. Decide. Be Courageous. Explore the palace and save God’s people.' },
  { id: 'red-sea-run', t: 'Red Sea Run', s: 'Red Sea Run', theme: 'heroes', type: 'action', bg: 'sea', g: 'wave', sky: ['#7FD3FF', '#1F55D6'], play: true, hot: 3, b: 'Run Through the Sea. Discover God’s Power.' },
  { id: 'jericho-march', t: 'The Walls of Jericho', s: 'Jericho', theme: 'heroes', type: 'race', bg: 'mountain', g: 'trumpet', sky: ['#FFC46B', '#C2701E'], play: true, b: 'March. Blow the trumpets. Stay quiet. SHOUT!' },
  { id: 'jonah-maze', t: 'Jonah and the Big Fish Maze', s: 'Jonah’s Maze', theme: 'heroes', type: 'puzzle', bg: 'deep', g: 'fish', sky: ['#62D2C6', '#14707A'], play: true, b: 'Follow Jonah’s story through three mazes.' },
  { id: 'noahs-ark', t: 'Noah’s Ark Animal Match', s: 'Noah’s Ark', theme: 'stories', type: 'match', bg: 'sea', g: 'ark', sky: ['#FFD36B', '#F28C28'], play: true, hot: 2, b: 'Match. Rescue. Discover God’s Promise.' },
  { id: 'zacchaeus-climb', t: 'Zacchaeus Climbs Up', s: 'Zacchaeus', theme: 'stories', type: 'action', bg: 'meadow', g: 'sycamore', sky: ['#9BE38C', '#2E7D32'], play: true, b: 'Bounce up the sycamore tree. Jesus sees you!' },
  { id: 'bible-discovery', t: 'The Lost Sheep: Rescue Rush', s: 'Lost Sheep', theme: 'stories', type: 'action', bg: 'meadow', g: 'glass', sky: ['#9BE38C', '#14946B'], play: true, b: 'Gather. Search. Rescue!' },
  { id: 'calm-storm', t: 'Jesus Calms the Storm', s: 'Calm the Storm', theme: 'stories', type: 'action', bg: 'sea', g: 'boat', sky: ['#5B7FC9', '#1C2E5E'], play: true, b: 'Keep the boat afloat. Wake the Master. Peace, be still!' },
  { id: 'peter-water', t: 'Peter Walks on Water', s: 'Peter’s Walk', theme: 'stories', type: 'action', bg: 'sea', g: 'wave', sky: ['#4E6AA8', '#16213F'], play: true, b: 'Keep your eyes on Jesus. Don’t look at the storm!' },
  { id: 'ark-builder', t: 'Build the Ark Race', s: 'Build the Ark', theme: 'stories', type: 'action', bg: 'hills', g: 'ark', sky: ['#8FD0FF', '#2E7D32'], play: true, b: 'Stack the planks. Pair the animals. Beat the rain!' },
  { id: 'shepherd-run', t: 'David’s Shepherd Run', s: 'Shepherd Run', theme: 'heroes', type: 'race', bg: 'hills', g: 'stone', sky: ['#FFC46B', '#14946B'], play: true, b: 'Run the hills, gather the sheep, chase off the lion and the bear!' },
  { id: 'verse-racer', t: 'Verse Racer', s: 'Verse Racer', theme: 'word', type: 'race', bg: 'road', g: 'car', sky: ['#7FB2FF', '#2445B8'], play: true, hot: 1, b: 'Race to build Bible verses word by word.' },
  { id: 'lamp-path', t: 'Lamp to My Feet: Light the Way', s: 'Lamp Path', theme: 'word', type: 'puzzle', bg: 'night', g: 'lamp', sky: ['#4A4E8C', '#141B2D'], play: true, b: 'Connect the Path. Follow the Light. Discover God’s Word.' },
  { id: 'books-sort', t: 'Books of the Bible Sort', s: 'Books Sort', theme: 'word', type: 'puzzle', bg: 'library', g: 'book', sky: ['#F3C37A', '#B9770E'], play: true, b: 'Put the Bible’s books on the shelf in order.' },
  { id: 'ten-commandments', t: 'Ten Commandments Memory', s: '10 Commandments', theme: 'word', type: 'match', bg: 'mountain', g: 'tablet', sky: ['#D9C8A9', '#8A6F47'], b: 'Flip the cards and remember all ten.' },
  { id: 'fruit-catch', t: 'Fruit of the Spirit Challenge', s: 'Fruit Catch', theme: 'grow', type: 'action', bg: 'meadow', g: 'heart', sky: ['#B5F08C', '#2E9E4F'], play: true, hot: 5, b: 'Catch good fruit, make wise choices and beat your best score.' },
  { id: 'fruit-vs-flesh', t: 'Fruit Splash', s: 'Fruit Splash', theme: 'grow', type: 'action', bg: 'hills', g: 'tree', sky: ['#C9F28C', '#3E7B39'], play: true, b: 'Swipe the good fruit!' },
  { id: 'bible-trivia', t: 'Bible Trivia Challenge', s: 'Bible Trivia', theme: 'grow', type: 'quiz', bg: 'night', g: 'star', sky: ['#FF8FA3', '#B8264A'], play: true, hot: 6, b: 'Ten questions with a verse for every answer.' }
];

/* Collections on the homepage. A game can be in more than one.
   soon = a note shown at the end of the collection (not a game, not tappable). */
window.ARK_COLLECTIONS = [
  { id: 'heroes', t: 'Kingdom Heroes', d: 'Be brave like the heroes of faith', icon: 'crown', c: ['#FFB547', '#D7263D'],
    ids: ['davids-sling', 'shepherd-run', 'jericho-march', 'red-sea-run', 'queen-esther', 'jonah-maze', 'noahs-ark'] },
  { id: 'jesus', t: 'Jesus Series', d: 'Stories Jesus told and things He did', icon: 'heart', c: ['#FFD86B', '#E0752D'],
    ids: ['calm-storm', 'peter-water', 'zacchaeus-climb', 'bible-discovery'], soon: 'More adventures from the life of Jesus are on the way.' },
  { id: 'challenges', t: 'Bible Challenges', d: 'Test what you know and beat your best', icon: 'star', c: ['#FF8FA3', '#7A3E9D'],
    ids: ['bible-trivia', 'shepherd-run', 'jericho-march', 'verse-racer', 'lamp-path', 'books-sort', 'fruit-vs-flesh'] },
  { id: 'stories', t: 'Bible Stories', d: 'Step inside the stories', icon: 'ark', c: ['#7FD3FF', '#1F55D6'],
    ids: ['calm-storm', 'peter-water', 'ark-builder', 'noahs-ark', 'zacchaeus-climb', 'bible-discovery', 'queen-esther', 'jonah-maze'] },
  { id: 'word', t: 'God’s Word', d: 'Verses and the books of the Bible', icon: 'book', c: ['#9FB8FF', '#2445B8'],
    ids: ['verse-racer', 'lamp-path', 'books-sort'] },
  { id: 'grow', t: 'Grow in Faith', d: 'The fruit of the Spirit and wise choices', icon: 'tree', c: ['#B5F08C', '#14946B'],
    ids: ['fruit-catch', 'fruit-vs-flesh', 'bible-trivia'] }
];
