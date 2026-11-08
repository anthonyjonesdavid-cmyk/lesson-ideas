const SEED_VERSION = 2;  // v2: starters may belong to several sections
const STARTER_RAW = [];
function L(secs,title,summary,materials,steps,notes,tags){const sections=secs.split('+');STARTER_RAW.push({section:sections[0],sections,title,summary,materials:materials.split(';').map(s=>s.trim()),steps:steps.split('|').map(s=>s.trim()),notes,tags:tags.split(',').map(s=>s.trim())});}

/* ---------------- MATH ---------------- */
L('math','Number Line Hop',
 'Kids become the counters! Students hop forward and back on a giant floor number line to act out addition and subtraction stories within 20.',
 "Painter's tape;Index cards numbered 0–20;Story problem cards;Mini whiteboards & markers",
 'Tape a long line on the floor and lay number cards 0–20 in order.|Read a story problem: "Sam had 7 stickers and got 4 more."|A student stands on 7 and hops forward 4 while the class counts on aloud: "8, 9, 10, 11!"|Everyone writes the matching number sentence (7 + 4 = 11) on whiteboards.|Switch to "take away" stories and hop backward.|Let students invent their own story problems for a friend to hop.',
 'Perfect for wiggly days. Extend by hopping by 2s, or by starting on the bigger number to practice counting on (1.OA.C.5).',
 'Whole Group,Hands-on,Brain Break');
L('math','Make 10 Go Fish',
 'A twist on Go Fish where partners hunt for two cards that make ten — great for building fluency with ten-facts.',
 'Decks of cards (face cards removed; Ace = 1);Ten-frame mats;Two-color counters',
 'Model with a ten-frame: "I have 6. How many more do I need to make 10?"|Deal 5 cards to each player and spread the rest face-down as the "pond."|On your turn, ask a partner for the card that makes 10 with one in your hand: "Do you have a 4?"|If they don\'t, they say "Go fish!" and you draw.|Lay down each pair and say the fact aloud: "6 + 4 = 10!"|The player with the most pairs when the pond is empty wins.',
 'Leave ten-frames out for friends who still need the visual. Works great as a math center once modeled (1.OA.C.6).',
 'Centers,Small Group');
L('math','Paper Clip Measuring',
 'How long is it? Students measure classroom objects with paper clips to learn non-standard measurement — no gaps and no overlaps!',
 'Jumbo paper clips (some linked into chains);Recording sheet;Objects to measure: pencil, glue stick, crayon box, book, shoe',
 'Show a pencil measured the wrong way (with gaps and overlaps). Ask: "What went wrong?"|Model lining up clips end-to-end starting at the very edge.|Partners estimate first, then measure 5 objects and record.|Put the objects in order from shortest to longest.|Share: "Did anything measure exactly the same?"',
 'Next day, measure the same objects with cubes and talk about why the numbers changed (1.MD.A.2).',
 'Hands-on,Centers,Small Group');
L('math+holidays','100 Things Collections',
 'Families send in 100 small objects; students sort them into groups of ten and count by tens to 100.',
 'Zip bags with a family note;10-cup sorting mats or ten-frames;Hundreds chart;Recording sheet',
 'A week ahead, send home a note asking for 100 small items (cereal, buttons, pom-poms, LEGO).|On 100th Day, students sort their items into 10 groups of 10.|Count together by tens: 10, 20, 30… 100!|Double-check by coloring a hundreds chart while counting by ones.|Do a gallery walk: why do some collections look bigger even though they are all 100?',
 'Keep a few extra collections ready for anyone who forgets.',
 '100th Day,Hands-on,Whole Group');
L('math+holidays+science','Pumpkin Investigation',
 'A hands-on pumpkin day: estimate, measure, test sink or float, and count the seeds by tens.',
 'One small pumpkin per group;Yarn & scissors;Scale;Tub of water;Cups & paper towels;Pumpkin recording booklet',
 'Estimate how big around the pumpkin is by cutting a piece of yarn. Wrap it around to check who was close!|Weigh the pumpkin and compare it to classroom objects.|Predict: sink or float? Test it in the tub (it floats!).|Scoop the seeds and count them by putting 10 in each cup.|Write one sentence about something surprising.',
 'Messy but memorable! Cut the tops off ahead of time. Pumpkins float because they are hollow inside.',
 'Fall,Halloween,Hands-on,Small Group');
L('math+art','Shape Monster Builders',
 'Students compose new shapes with pattern blocks, then design a friendly "shape monster" and count its sides and corners.',
 'Pattern blocks;Paper shape cutouts;Glue sticks;Construction paper;Googly eyes (optional)',
 'Review shape names, sides, and vertices (corners).|Challenge: build a hexagon out of other blocks. How many ways can you find?|Students glue paper shapes together to build a monster.|Fill in: "My monster has __ triangles and __ squares."|Partners count the total number of sides on each other\'s monsters.',
 'Covers 1.G.A.1–2. Hallway display idea: "Shape Monsters Ate Our Hallway!"',
 'Hands-on,Centers,Halloween');

/* ---------------- LITERACY ---------------- */
L('literacy','Sight Word Swat',
 'Two players race to swat the sight word that is called — quick, active practice with high-frequency words.',
 '2 fly swatters;Sight word cards (or words written on the board);Tape',
 'Post 10–15 sight words on the board.|Two students stand ready with swatters.|Say a word (or use it in a sentence). The first to swat it reads it aloud for a point.|Rotate players quickly so everyone gets a turn.|Finish by reading all the words together chorally.',
 'A great 5-minute warm-up. For small group, play on the table with word cards.',
 'Whole Group,Small Group,Brain Break');
L('literacy','Roll & Read Word Families',
 'Students roll a die and read a CVC word from that column, building decoding speed with word families.',
 'Roll & Read sheet (6 columns: -at, -an, -ig, -op, -ug, -et);Dice;Highlighters',
 'Model blending sounds: /c/ /a/ /t/ — cat!|A partner rolls the die and reads a word from the matching column.|If read correctly, they highlight it.|Keep playing until one column is completely highlighted.|Challenge: write a silly sentence using two of the words.',
 'Easy to differentiate — swap in blends, digraphs, or silent-e words.',
 'Centers,Small Group');
L('literacy','Story Map Sticky Notes',
 'After a read-aloud, students retell the story by placing sticky notes under Beginning, Middle, and End.',
 'Picture book;Chart paper with B / M / E columns;Sticky notes;Crayons or pencils',
 'Read the book aloud, stopping to predict.|Turn and talk: What happened first? Next? At the end?|Each student draws or writes one event on a sticky note.|Place the notes in the right column and retell the story together.|Add the characters and setting at the top.',
 'Supports RL.1.2 and RL.1.3. Follow up by letting students make their own mini-book retell.',
 'Whole Group');
L('literacy','Sound Boxes',
 'Students push a counter into a box for each sound they hear — powerful phonemic awareness and spelling practice.',
 'Elkonin box mats (3 and 4 boxes);Counters or mini erasers;Dry-erase markers',
 'Say a word slowly: "ship."|Students repeat it and push one counter per sound: /sh/ /i/ /p/.|Count it up: 3 sounds, but 4 letters!|Replace the counters with letters.|Read the word back together.',
 'Keep it short (5–8 minutes). Fantastic for intervention groups.',
 'Small Group,Hands-on');
L('literacy+holidays','How to Build a Snowman',
 'Sequencing writing with First, Next, Then, and Last — students write a how-to for building a snowman.',
 'Snowman picture cards;Four-flap writing paper;Crayons;Cotton balls (optional)',
 'Read a snowman book and talk about the steps.|Put the picture cards in order as a class.|Model a sentence for each transition word.|Students write and illustrate each step on their flaps.|Share with a partner and act out the steps.',
 'Swap the topic by season: How to Carve a Pumpkin, How to Plant a Seed, How to Make a Valentine.',
 'Winter,Whole Group');
L('literacy+holidays+sel','Valentine Kindness Letters',
 'Students learn the parts of a friendly letter and write a kind valentine to a classmate or school helper.',
 'Heart stationery;Friendly letter anchor chart;Crayons & stickers;Envelopes',
 'Introduce the parts: date, greeting, body, closing, signature.|Brainstorm kind words and compliments together.|Draw names so everyone receives a letter.|Write and decorate the letters.|Deliver them to mailboxes on Valentine\'s Day.',
 'Include the custodian, cafeteria staff, and nurse for a schoolwide smile.',
 "Valentine's Day,Whole Group");

/* ---------------- SCIENCE ---------------- */
L('science','Sink or Float?',
 'Students predict, test, and sort everyday objects that sink or float.',
 'Clear tub of water;Objects: cork, penny, crayon, foil, sponge, apple, rock, plastic spoon;T-chart;Towels',
 'Show each object. Students predict with a thumbs up (float) or down (sink).|Test one at a time and record on the T-chart.|Ask: What do the floaters have in common?|Challenge: Can you make the foil float? Can you make it sink?|Draw one surprising result in science journals.',
 'Lay towels down! A foil-boat "how many pennies?" challenge makes a great follow-up.',
 'Hands-on,Small Group');
L('science','Seed in a Bag Greenhouse',
 'Students sprout a bean in a zip bag taped to the window and observe it grow day by day.',
 'Zip bags;Paper towels;Lima beans (soaked overnight);Tape;Spray bottle;Observation journal',
 'Wet a paper towel and fold it into the bag.|Place 2–3 beans in the middle and seal it.|Tape the bags to a sunny window with names on them.|Observe each day and draw roots, shoots, and leaves.|After a week, measure growth with cubes.',
 'Beans usually sprout in 3–5 days. Mist if the towel dries out.',
 'Spring,Hands-on');
L('science','Five Senses Popcorn',
 'Explore all five senses with popcorn — see it, hear it pop, smell it, touch it, and taste it!',
 'Air popper or microwave popcorn;Small cups;Five-senses recording sheet;Unpopped kernels',
 'Introduce the five senses with an anchor chart.|Look at and touch unpopped kernels. Describe them.|Pop the popcorn — listen and smell!|Taste and describe it with adjectives.|Complete the five-senses sheet.',
 'Check for allergies first. Pair with a "popcorn words" adjective chart.',
 'Hands-on,Whole Group');
L('science','Melting Ice Race',
 'Where will ice melt fastest? Students predict and test ice cubes in different spots around school.',
 'Ice cubes;Small cups or trays;Timer;Recording chart',
 'Ask: What makes ice melt?|Choose 4 spots: sunny window, shady corner, desk, and in a zip bag held in hands.|Predict which cube will melt first.|Check every 10 minutes and record.|Discuss heat and compare results to predictions.',
 'Add a cube sprinkled with salt for a bonus investigation.',
 'Winter,Hands-on,Small Group');
L('science','Shadow Tracing',
 'Students trace a partner\'s shadow with chalk in the morning and afternoon to see how the sun "moves."',
 'Sidewalk chalk;A sunny day;Recording sheet;Flashlight & small toy (indoor model)',
 'Model shadows indoors with a flashlight and a toy.|Outside in the morning, trace partner shadows and mark where their feet were.|Return after lunch, stand in the same spot, and trace again.|Compare: What changed? Why?|Record observations and draw both shadows.',
 'Connects to 1-ESS1-1 (patterns of the sun). Check the forecast for a sunny day!',
 'Spring,Hands-on,Whole Group');
L('science+music','Good Vibrations',
 'Students discover that sound is made by vibrations using rubber bands, drums, and dancing rice.',
 'Rubber bands;Shoebox or plastic container;Rice;Bowl covered with plastic wrap;Tuning fork (optional)',
 'Hum with a hand on your throat — what do you feel?|Stretch rubber bands over a box and pluck them.|Sprinkle rice on the plastic-wrap drum and tap nearby — watch it bounce!|Compare loud taps and soft taps.|Finish the sentence: "Sound is made when…"',
 'Matches 1-PS4-1. The rice dance is always a hit.',
 'Hands-on,Centers');

/* ---------------- SOCIAL STUDIES ---------------- */
L('social','Me on the Map',
 'Students make nested circles that show where they live: me → home → street → town → state → country → world.',
 'Paper circles in 7 sizes;Crayons;Glue;Globe;Google Earth (optional)',
 'Zoom out from the school on Google Earth or a map.|Talk about each level: home, street, town, state, country, continent.|Students label and decorate each circle.|Stack and glue them largest to smallest.|Share: "I live in ___, which is in ___."',
 'Send a note home so families can help students learn their address.',
 'Whole Group,Hands-on');
L('social','Community Helpers Interview',
 'Students learn about jobs in their community and interview a real community helper.',
 'Community helper picture cards;Interview question sheet;Dress-up props (optional);A guest speaker',
 'Sort helper cards by what they do (keep us safe, keep us healthy, help us learn).|Brainstorm interview questions as a class.|Invite a guest (nurse, firefighter, parent) to answer questions.|Students draw and write about a job they might like.|Bind the pages into a class book: "When I Grow Up."',
 'Ask families ahead of time — many love to visit!',
 'Whole Group');
L('social','Then and Now: School Long Ago',
 'Students compare photos of schools long ago with school today using a T-chart.',
 'Old schoolhouse photos;T-chart;Picture sort cards (slate, chalkboard, tablet, pencil);Paper',
 'Show a one-room schoolhouse photo. What do you notice? What do you wonder?|Compare it with a photo of your classroom.|Sort picture cards into Then and Now.|Write: "Long ago, kids ___. Today we ___."|Discuss: What is still the same?',
 'Invite a grandparent to share school memories.',
 'Whole Group,Small Group');
L('social+sel','Our Class Promise',
 'Students create and sign a class promise, learning why rules help a community work together.',
 'Chart paper;Markers;Washable paint for handprints (or crayons);A picture book about rules',
 'Read a story about rules.|Discuss: Why do families, schools, and towns need rules?|Brainstorm promises as positive statements ("We use kind words").|Vote on 4–5 promises.|Everyone signs or adds a handprint.',
 'Refer back to it all year. Pairs well with the SEL section.',
 'Back to School,Whole Group');
L('social+holidays','Family Traditions Graph',
 'Students share family traditions and build a class graph showing how families celebrate.',
 'Family survey sheet;Sticky notes;Graph chart;Picture books about traditions',
 'Send home a short survey about a favorite family tradition.|Students share their tradition in a circle.|Group similar traditions and graph them with sticky notes.|Discuss what is the same and different.|Make a class book of traditions.',
 'Keep it inclusive — every tradition counts (even pancake Saturdays!).',
 'Thanksgiving,Fall,Whole Group');
L('social+math','Needs vs. Wants Shop',
 'Students sort pictures into needs and wants, then "shop" with a pretend budget.',
 'Needs/wants picture cards;Play money ($10 each);Price tags;Small items for a pretend store',
 'Define needs (food, water, shelter, clothing) and wants.|Sort picture cards together.|Give each student $10 to shop.|They must buy a need first, then a want if money remains.|Reflect: Was it hard to choose?',
 'A gentle introduction to economics: choices and scarcity.',
 'Hands-on,Small Group,Centers');

/* ---------------- ART ---------------- */
L('art','Kandinsky Circles',
 'Students create concentric circles inspired by Wassily Kandinsky while exploring warm and cool colors.',
 'Square paper;Oil pastels;Watercolors & brushes;A Kandinsky print',
 'Show "Squares with Concentric Circles" and talk about colors.|Fold paper into 4 squares.|Draw circles inside circles in each square with oil pastels.|Paint over them with watercolors (the pastel resists!).|Assemble everyone\'s work into a class quilt.',
 'Makes a stunning bulletin board.',
 'Hands-on,Whole Group');
L('art','Eric Carle Painted Paper Collage',
 'Students paint textured papers, then cut them up to build an animal collage just like Eric Carle.',
 'White paper;Tempera paints;Texture tools (forks, combs, sponges);Glue sticks;Scissors',
 'Read an Eric Carle book and look closely at the illustrations.|Day 1: Paint papers and add texture with tools.|Day 2: Cut shapes from the painted papers.|Assemble an animal on background paper.|Write: "___, ___, what do you see?"',
 'Spread over two days so the papers can dry.',
 'Hands-on,Spring');
L('art','Symmetry Butterflies',
 'Fold-and-blot painting makes beautifully symmetrical butterflies.',
 'Butterfly cutouts (folded in half);Tempera paint;Droppers or spoons;Pipe cleaners',
 'Talk about symmetry in nature.|Drop paint on one side of the fold.|Fold, press, and open to reveal the match.|When dry, add a pipe-cleaner body.|Hang them in the windows.',
 'Ties nicely to a life cycle science unit.',
 'Spring,Hands-on');
L('art+holidays','Salt Watercolor Snowflakes',
 'Draw snowflakes with glue, sprinkle salt, and touch on watercolor — the color spreads like magic.',
 'Dark blue or black cardstock;White glue;Table salt;Liquid watercolors;Droppers',
 'Look at real snowflake photos — six points!|Draw a snowflake with glue.|Cover it with salt and shake off the extra.|Gently touch watercolor to the salt and watch it travel.|Dry flat overnight.',
 'Use trays to catch the salt. Drip slowly for the best effect.',
 'Winter,Christmas,Hands-on');
L('art+science','Fall Leaf Rubbings',
 'Students collect leaves and make crayon rubbings to reveal veins, edges, and shapes.',
 'Fresh leaves;Peeled crayons in fall colors;Thin paper;Tape',
 'Go on a leaf walk around the playground.|Place a leaf vein-side up under the paper.|Rub with the side of a peeled crayon.|Layer more leaves in different colors.|Label the leaf parts (stem, veins, edge).',
 'Use fresh leaves — dry ones crumble.',
 'Fall,Hands-on');
L('art','Mirror Self-Portraits',
 'Students study their faces in a mirror and draw detailed self-portraits.',
 'Small mirrors;Paper;Pencils;Crayons including skin-tone colors;Example portraits',
 'Show a few self-portraits by famous artists.|Look in mirrors: notice the shapes of eyes, nose, and hair.|Draw lightly in pencil, then add color.|Add a background showing something you love.|Display as "Our Class Family."',
 'Repeat at the end of the year to see how much they have grown!',
 'Back to School,Whole Group');

/* ---------------- MUSIC & MOVEMENT ---------------- */
L('music+sel','Feelings Freeze Dance',
 'Dance when the music plays; when it stops, freeze in the shape of the feeling on the card.',
 'Music player;Feelings cards (happy, sad, mad, surprised, scared);Open space',
 'Review the feelings and what our faces and bodies look like for each.|Play music while students dance.|Stop the music and hold up a feelings card.|Students freeze showing that feeling.|Ask: "When have you felt that way?"',
 'A brain break and SEL lesson in one.',
 'Whole Group,Brain Break');
L('music+literacy','Rhythm Names',
 'Clap the syllables in names, then read simple rhythm notation with "ta" and "ti-ti."',
 'Rhythm cards (quarter & eighth notes);Name cards;Rhythm sticks',
 'Clap each student\'s name.|Introduce "ta" (one sound on a beat) and "ti-ti" (two sounds on a beat).|Match names to rhythm cards.|Play the rhythms with sticks.|Students compose their own 4-beat rhythm.',
 'Builds phonological awareness too!',
 'Whole Group,Small Group');
L('music+math','Skip-Count Workout',
 'Count by 2s, 5s, and 10s while doing exercises — math and movement together.',
 'Hundreds chart or skip-counting song;Exercise picture cards',
 'Choose a number to count by.|Pick an exercise (jumping jacks, squats, arm circles).|Count aloud with every move up to 100.|Switch exercises and numbers.|Cool down by counting backward slowly.',
 'Skip-counting songs on YouTube add variety.',
 'Brain Break,Whole Group');
L('music','Animal Moves Dice',
 'Roll a giant die to pick an animal movement — perfect for brain breaks and indoor recess.',
 'Large foam die or cube with animal pictures;Music',
 'Make the die: frog jump, bear crawl, crab walk, flamingo stand, snake slither, kangaroo hop.|Roll the die.|Everyone moves like that animal for 20 seconds.|Roll again!|End with a slow "sloth" breathing stretch.',
 'Swap in seasonal animals (penguin waddle in winter!).',
 'Brain Break,Whole Group');
L('music','Shaker Eggs & Steady Beat',
 'Students make shakers and use them to keep a steady beat with songs.',
 'Plastic eggs;Rice, beans, or beads;Tape;Stickers',
 'Fill eggs with rice or beans and seal them with tape.|Compare the sounds of different fillings.|Practice a steady beat with a favorite song.|Play loud/soft and fast/slow.|Form a class band!',
 'Tape the eggs very well!',
 'Hands-on,Spring');
L('music+math','Parachute Patterns',
 'Use a play parachute to make AB and ABC movement patterns.',
 'Play parachute;Soft balls;Music',
 'Everyone holds a handle.|Make small waves and big waves.|Create a pattern: up-down-up-down (AB).|Add more: up-down-shake (ABC).|Pop balls off the top!',
 'Best in the gym or outside. Ties to pattern work in math.',
 'Whole Group,Hands-on');

/* ---------------- HOLIDAYS & SEASONS ---------------- */
L('holidays+sel','All About Me Bag',
 'Students bring three items in a paper bag that tell about themselves, then share with the class.',
 'Paper lunch bags;Family letter;Sharing schedule',
 'Model by sharing your own bag.|Send bags home with a note.|Each day, 3–4 students share their items.|Classmates ask one question each.|Graph the things you have in common.',
 'Builds community during the first weeks.',
 'Back to School,Whole Group');
L('holidays+literacy','Build-a-Monster Adjectives',
 'Students create friendly monsters and describe them using adjectives.',
 'Construction paper shapes;Googly eyes;Glue;Adjective word bank',
 'Read "Go Away, Big Green Monster!"|Brainstorm describing words together.|Build a monster.|Write three sentences with adjectives.|Classmates guess which monster is being described.',
 'Friendly monsters, not scary ones!',
 'Halloween,Fall,Centers');
L('holidays+sel','Gratitude Turkey',
 'Students write what they are thankful for on feathers to build a class turkey.',
 'Feather cutouts;Brown turkey body;Markers;Glue',
 'Talk about gratitude.|Students write one thank-you on each feather.|Add the feathers to the class turkey.|Share in a circle.|Send home a mini version for families.',
 'Display in the hallway all November.',
 'Thanksgiving,Fall,Whole Group');
L('holidays+literacy','Gingerbread Man Hunt',
 'After reading The Gingerbread Man, the class follows clues around school to find him.',
 'The Gingerbread Man book;Clue cards;Gingerbread cookies;School map',
 'Read the story together.|Discover the gingerbread man has run away!|Follow clues to the office, library, and gym.|Find him back in class with cookies.|Write a retell of the adventure.',
 'Let other staff in on the fun. Great for learning school locations.',
 'Christmas,Winter,Whole Group');
L('holidays+math','Conversation Heart Graphing',
 'Sort, graph, and compare candy hearts by color.',
 'Conversation hearts (or paper hearts);Graph sheet;Crayons',
 'Estimate how many hearts are in your bag.|Sort them by color.|Make a bar graph.|Answer: Most? Least? How many more?|Read the messages for fun.',
 'Check for allergies; paper hearts work as an alternative.',
 "Valentine's Day,Hands-on,Small Group");
L('holidays+literacy',"When I'm 100 Years Old",
 'Students imagine life at 100 years old and write and draw about it.',
 'Writing paper;Crayons;Cotton balls (for white hair);Aging photo app (optional)',
 'Talk about what life might be like at 100.|Brainstorm ideas together.|Write: "When I am 100, I will…"|Draw yourself at 100.|Share with the class.',
 'Always a huge hit!',
 '100th Day,Whole Group');
L('holidays+science','Leprechaun Trap STEM',
 'Teams design and build a leprechaun trap from recyclables.',
 'Recyclables;Tape & glue;Gold coins;Planning sheet',
 'Read a leprechaun story.|Plan a trap.|Build with a partner.|Test it out.|Next morning, find tiny footprints!',
 'Mid-March fun. Tiny green footprints sell the magic.',
 "St. Patrick's Day,Spring,Hands-on,Small Group");

/* ---------------- SEL / MANAGEMENT ---------------- */
L('sel','Morning Meeting Greeting Circle',
 'Start the day with a greeting, a share, a quick group activity, and the morning message.',
 'Carpet circle;Greeting choice cards;Morning message chart',
 'Gather in a circle.|Greeting: handshake, wave, or elbow bump.|Share: one or two students share something.|Group activity: a quick game or song.|Read the morning message together.',
 '15–20 minutes daily; it pays off all year.',
 'Whole Group,Back to School');
L('sel','Calm-Down Corner',
 'Set up a cozy space with tools for big feelings and teach breathing strategies.',
 'Pillows or a beanbag;Feelings chart;Sand timer;Breathing cards (smell the flower, blow out the candle);Squishy toys',
 'Introduce the corner as a place to help, not a punishment.|Teach each tool, one at a time.|Practice breathing strategies together.|Role-play when to use it.|Check in with students afterward.',
 'Model using it yourself!',
 'Back to School');
L('sel','Bucket Filling',
 'Students learn to fill each other\'s buckets with kindness.',
 '"Have You Filled a Bucket Today?";Small cups or buckets;Pom-poms or paper notes',
 'Read the book.|Discuss bucket fillers and bucket dippers.|Each student gets a bucket.|Write or draw kind notes to fill each other\'s buckets.|Reflect at the end of the week.',
 'An ongoing routine all year long.',
 'Whole Group');
L('sel','Attention Getters',
 'A collection of fun call-and-response attention getters.',
 'Anchor chart with call-and-responses',
 'Teach one at a time: "Class, class!" — "Yes, yes!"|"Hocus pocus!" — "Everybody focus!"|"Macaroni and cheese!" — "Everybody freeze!"|"1, 2, 3, eyes on me!" — "1, 2, eyes on you!"|Practice until automatic.',
 'Rotate them to keep things fresh.',
 'Whole Group,Back to School');
L('sel','Classroom Jobs Chart',
 'Give every student a job to build responsibility and ownership.',
 'Pocket chart;Name cards;Job cards with pictures',
 'Brainstorm classroom jobs together.|Explain each job.|Assign jobs and rotate them weekly.|Check in on how jobs went.|Celebrate a job well done.',
 'Ideas: line leader, door holder, plant waterer, librarian, messenger.',
 'Back to School,Whole Group');
L('sel','Feelings Check-In',
 'Students check in each morning by moving their name to a feelings chart.',
 'Feelings chart with zones or emojis;Clothespins with names',
 'Teach feelings vocabulary.|Each morning, students clip their name on a feeling.|Quietly check in with anyone who needs it.|Discuss strategies for each feeling.|Notice patterns over time.',
 'Make it part of the arrival routine.',
 'Whole Group');

const STARTERS = STARTER_RAW.map((l,i)=>{
  const n = STARTER_RAW.slice(0,i+1).filter(x=>x.section===l.section).length;
  return Object.assign({id:`st-${l.section}-${n}`, starter:true, mine:false, fav:false, hidden:false, photo:null, order:i, created:0, updated:0}, l);
});
