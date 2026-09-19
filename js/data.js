(function () {
  const enc = (name) => encodeURIComponent(name.replace(/ /g, '_'))
    .replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/'/g, '%27');

  const thumb = (hash, name, w) =>
    `https://upload.wikimedia.org/wikipedia/commons/thumb/${hash}/${enc(name)}/${w}px-${enc(name)}`;
  const orig = (hash, name) =>
    `https://upload.wikimedia.org/wikipedia/commons/${hash}/${enc(name)}`;
  const page = (name) =>
    `https://commons.wikimedia.org/wiki/File:${enc(name)}`;

  const pic = (hash, name, by, license, small) => ({
    card: small ? orig(hash, name) : thumb(hash, name, 960),
    large: small ? orig(hash, name) : thumb(hash, name, 1280),
    page: page(name),
    by,
    license
  });

  const ERAS = [
    {
      id: 'predynastic', name: 'Predynastic', start: -5000, end: -3100,
      dynasties: 'Before the dynasties',
      glyph: '𓎼',
      summary: 'Farming villages along the Nile grow into towns. Pottery, ivory and the first images of kings and boats appear before any writing does.',
      events: ['Badarian and Naqada cultures flourish in Upper Egypt', 'Painted pottery shows boats, animals and dancing figures', 'Chiefdoms at Hierakonpolis and Abydos compete for the valley']
    },
    {
      id: 'early-dynastic', name: 'Early Dynastic', start: -3100, end: -2686,
      dynasties: 'Dynasties 1 to 2',
      glyph: '𓆤',
      summary: 'Narmer unites the two lands and a single state takes shape. Memphis is founded, hieroglyphs settle into a system and royal tombs rise at Abydos.',
      events: ['Unification of Upper and Lower Egypt', 'Hieroglyphic writing becomes a working script', 'First royal tombs built at Abydos and Saqqara']
    },
    {
      id: 'old-kingdom', name: 'Old Kingdom', start: -2686, end: -2181,
      dynasties: 'Dynasties 3 to 6',
      glyph: '𓉴',
      summary: 'The age of the pyramids. A confident state builds in stone on a scale never seen before while sculptors set the rules that Egyptian art keeps for two thousand years.',
      events: ['Djoser builds the Step Pyramid at Saqqara', 'Khufu, Khafre and Menkaure raise the Giza pyramids', 'Provincial governors gain power as the crown weakens']
    },
    {
      id: 'first-intermediate', name: 'First Intermediate Period', start: -2181, end: -2055,
      dynasties: 'Dynasties 7 to 11',
      glyph: '𓊖',
      summary: 'Central rule breaks down. Local rulers at Herakleopolis and Thebes govern their own stretches of the river and the arts turn local and lively.',
      events: ['Nile floods fail and famine spreads', 'Rival courts at Herakleopolis and Thebes', 'Theban kings begin to push north']
    },
    {
      id: 'middle-kingdom', name: 'Middle Kingdom', start: -2055, end: -1650,
      dynasties: 'Dynasties 11 to 13',
      glyph: '𓇋',
      summary: 'Mentuhotep II reunites the country from Thebes. Literature flowers, Nubia is fortified and royal portraits take on a careworn, human face.',
      events: ['Mentuhotep II reunites Egypt', 'Senusret III campaigns in Nubia and builds forts', 'Classic literature such as the Tale of Sinuhe is written']
    },
    {
      id: 'second-intermediate', name: 'Second Intermediate Period', start: -1650, end: -1550,
      dynasties: 'Dynasties 14 to 17',
      glyph: '𓏴',
      summary: 'The Hyksos rule the Delta from Avaris while Theban kings hold the south. Horses, chariots and composite bows enter Egypt.',
      events: ['Hyksos rulers take the Delta', 'Thebes and Avaris fight for the valley', 'Ahmose drives the Hyksos out and founds the 18th Dynasty']
    },
    {
      id: 'new-kingdom', name: 'New Kingdom', start: -1550, end: -1069,
      dynasties: 'Dynasties 18 to 20',
      glyph: '𓋹',
      summary: 'Egypt at the height of its power. Empire in Syria and Nubia, gold from every direction and the names everyone knows: Hatshepsut, Akhenaten, Tutankhamun and Ramesses.',
      events: ['Hatshepsut rules as king and trades with Punt', 'Akhenaten moves the capital to Amarna', 'Ramesses II fights at Kadesh and builds Abu Simbel']
    },
    {
      id: 'third-intermediate', name: 'Third Intermediate Period', start: -1069, end: -664,
      dynasties: 'Dynasties 21 to 25',
      glyph: '𓅃',
      summary: 'Power splits between Tanis in the north and the priests of Amun at Thebes. Libyan and then Kushite kings wear the double crown.',
      events: ['Kings at Tanis buried with gold and silver', 'Libyan dynasties rule from the Delta', 'Kushite pharaohs from Napata take Egypt']
    },
    {
      id: 'late-period', name: 'Late Period', start: -664, end: -332,
      dynasties: 'Dynasties 26 to 31',
      glyph: '𓃠',
      summary: 'Saite kings restore old forms, then Persia conquers twice. Animal cults, bronze casting and a deliberate return to Old Kingdom styles mark the age.',
      events: ['Saite renaissance looks back to the pyramids', 'Persian conquest under Cambyses', 'Last native pharaoh Nectanebo II loses to Persia']
    },
    {
      id: 'ptolemaic', name: 'Ptolemaic Kingdom', start: -332, end: -30,
      dynasties: 'Ptolemaic dynasty',
      glyph: '𓏏',
      summary: 'Alexander takes Egypt and his general Ptolemy founds a Greek dynasty at Alexandria. Two cultures share one country until Cleopatra loses it to Rome.',
      events: ['Alexandria founded with its library and lighthouse', 'Decree of Ptolemy V carved on the Rosetta Stone', 'Cleopatra VII dies and Egypt becomes a Roman province']
    },
    {
      id: 'roman', name: 'Roman Egypt', start: -30, end: 641,
      dynasties: 'Roman and Byzantine rule',
      glyph: '𓂀',
      summary: 'Egypt feeds Rome with grain. Temples keep being built for emperors dressed as pharaohs, mummies get painted portraits and the old religion slowly gives way.',
      events: ['Egypt becomes the personal province of the emperor', 'Fayum mummy portraits painted in encaustic', 'Temples close and the last hieroglyphs are carved at Philae in 394 CE']
    }
  ];

  const CATEGORIES = [
    { id: 'sculpture', name: 'Sculpture' },
    { id: 'gold', name: 'Gold and jewels' },
    { id: 'writing', name: 'Writing' },
    { id: 'funerary', name: 'Funerary' },
    { id: 'daily', name: 'Everyday life' }
  ];

  const ARTIFACTS = [
    {
      id: 'gebel-el-arak-knife', title: 'Gebel el-Arak Knife', era: 'predynastic',
      date: 'c. 3300 to 3200 BCE', year: -3250, category: 'sculpture',
      material: 'Flint blade with a hippopotamus ivory handle', dims: '25.5 cm long',
      findspot: 'Reportedly Gebel el-Arak, near Abydos', museum: 'Musée du Louvre, Paris', inventory: 'E 11517',
      summary: 'A ripple flaked flint blade with an ivory handle carved on both faces, one of the earliest narrative scenes from the Nile valley.',
      story: 'The handle shows a bearded figure holding two lions apart, a motif borrowed from Mesopotamia, above rows of wild animals. The other face shows a battle on land and on the river with two different kinds of boat. Bought in Cairo in 1914, the knife has become the key witness to contact between Egypt and the Near East before the first dynasty.',
      facts: ['The blade was knapped from one flint in parallel ripples', 'The handle scene is often read as the oldest picture of a battle', 'The Louvre bought it from a dealer with no record of the excavation'],
      tags: ['ivory', 'flint', 'naqada', 'louvre'],
      focus: 'center 20%',
      img: pic('5/54', 'Gebel el-Arak knife (front and back).jpg', 'Einsamer Schütze and Rama', 'CC BY-SA 3.0')
    },
    {
      id: 'naqada-jar', title: 'Decorated Jar with Boats', era: 'predynastic',
      date: 'c. 3650 to 3300 BCE', year: -3450, category: 'daily',
      material: 'Marl clay with red ochre paint', dims: '',
      findspot: 'Upper Egypt', museum: 'Metropolitan Museum of Art, New York', inventory: '',
      summary: 'A buff coloured jar painted with many oared boats, standards, flamingos and the hills of the desert.',
      story: 'Naqada II potters fired pale marl clay and painted it in red with the world around them. Boats with dozens of oars carry shrines and standards, the earliest hint of the processions that would fill temple walls millennia later. Jars like this were placed in graves, so the scenes may show a journey the dead hoped to make.',
      facts: ['Painted before the potter had any wheel to work with', 'The boats carry standards that later become the emblems of Egyptian provinces', 'Flamingos and ibex stand in for the desert and the marsh'],
      tags: ['pottery', 'naqada', 'boat', 'met'],
      img: pic('3/3a', 'Jar depicting boats and animals Naqada II 3650-3300 BCE pottery predynastic Egypt (2502069858).jpg', 'Mary Harrsch', 'CC BY 2.0')
    },
    {
      id: 'narmer-palette', title: 'Narmer Palette', era: 'early-dynastic',
      date: 'c. 3100 BCE', year: -3100, category: 'writing', featured: true,
      material: 'Siltstone', dims: '64 cm tall',
      findspot: 'Temple of Horus at Hierakonpolis', museum: 'Egyptian Museum, Cairo', inventory: 'JE 32169',
      summary: 'A ceremonial palette showing King Narmer wearing the crowns of both Upper and Lower Egypt, read for a century as the record of unification.',
      story: 'On this face Narmer, in the white crown of the south, raises a mace over a kneeling enemy while the falcon Horus holds a captive by the nose. On the other face he wears the red crown of the north and walks in procession toward beheaded foes. The palette is one of the first documents to use hieroglyphs together with pictures. Its layout in horizontal registers set the pattern for Egyptian art.',
      facts: ['Found in 1898 by Quibell and Green in a temple deposit', 'One of the earliest surviving uses of hieroglyphic signs', 'The scene of the king smiting an enemy is repeated on temple walls for 3,000 years'],
      tags: ['narmer', 'unification', 'hierakonpolis', 'palette', 'cairo'],
      img: pic('e/e3', 'Narmer Palette smiting side.jpg', 'Unknown photographer', 'Public domain')
    },
    {
      id: 'djoser-statue', title: 'Seated Statue of Djoser', era: 'old-kingdom',
      date: 'c. 2650 BCE', year: -2650, category: 'sculpture',
      material: 'Painted limestone', dims: '142 cm tall',
      findspot: 'Serdab of the Step Pyramid, Saqqara', museum: 'Egyptian Museum, Cairo', inventory: 'JE 49158',
      summary: 'The oldest known life size statue from Egypt, found sealed inside a stone box beside the Step Pyramid.',
      story: 'Djoser sits wrapped in a jubilee cloak, wearing a heavy wig and the striped nemes headcloth. The statue was walled into a small chamber called a serdab with two holes drilled at eye level so the king could watch the offerings brought to him. The inlaid eyes were prised out long ago, which gives the face its hollow stare.',
      facts: ['Discovered in 1924 by Cecil Firth', 'A replica now sits in the serdab at Saqqara', 'The base names Imhotep, the architect of the pyramid'],
      tags: ['djoser', 'saqqara', 'step pyramid', 'serdab', 'cairo'],
      focus: 'center 14%',
      img: pic('9/9e', 'Statue of Djoser from Step Pyramid Complex at Saqqara, 2630-2611 BCE; Egyptian Museum, Cairo (2).jpg', 'Prof. Mortel', 'CC BY 2.0')
    },
    {
      id: 'khafre-enthroned', title: 'Khafre Enthroned', era: 'old-kingdom',
      date: 'c. 2570 BCE', year: -2570, category: 'sculpture',
      material: 'Diorite gneiss', dims: '168 cm tall',
      findspot: 'Valley Temple of Khafre, Giza', museum: 'Egyptian Museum, Cairo', inventory: 'CG 14',
      summary: 'The builder of the second pyramid at Giza, carved in a hard dark stone quarried far to the south in Nubia.',
      story: 'Khafre sits on a lion throne with the plants of the two lands knotted together on its sides. Behind his head the falcon Horus spreads its wings to shelter him, a way of saying the king and the god are one. The statue was found upside down in a pit in the valley temple, where Mariette recovered it in 1860.',
      facts: ['The stone came from Gebel el-Asr in the Nubian desert', 'One of a set of 23 statues that once lined the temple', 'Polished so finely that the surface still reflects light'],
      tags: ['khafre', 'giza', 'horus', 'diorite', 'cairo'],
      img: pic('d/d5', 'Khafre statue.jpg', 'Jon Bodsworth', 'Free use', true)
    },
    {
      id: 'menkaure-and-queen', title: 'Menkaure and a Queen', era: 'old-kingdom',
      date: 'c. 2490 BCE', year: -2490, category: 'sculpture',
      material: 'Greywacke', dims: '142 cm tall',
      findspot: 'Valley Temple of Menkaure, Giza', museum: 'Museum of Fine Arts, Boston', inventory: '11.1738',
      summary: 'A king and a woman, probably his queen, step forward together in the most famous pair statue of the Old Kingdom.',
      story: 'The queen wraps one arm around Menkaure and rests her other hand on his arm, an embrace that is formal and warm at the same time. The sculptor left the lower part unpolished and never carved an inscription, so the identity of the woman is a matter of argument. The statue was found by George Reisner in 1910 and went to Boston by agreement with the Egyptian government.',
      facts: ['Left unfinished, probably because the king died', 'The woman may be Khamerernebty II or the king\'s mother', 'Both figures stand with the left foot forward, the classic Egyptian pose'],
      tags: ['menkaure', 'giza', 'pair statue', 'boston'],
      img: pic('f/f9', 'King Menkaura and queen-11.1738-IMG 4932.JPG', 'Rama', 'CC BY-SA 3.0 fr')
    },
    {
      id: 'seated-scribe', title: 'The Seated Scribe', era: 'old-kingdom',
      date: 'c. 2600 to 2350 BCE', year: -2500, category: 'writing', featured: true,
      material: 'Painted limestone with inlaid eyes of rock crystal, magnesite and copper', dims: '53.7 cm tall',
      findspot: 'Saqqara', museum: 'Musée du Louvre, Paris', inventory: 'E 3023',
      summary: 'An unnamed official sits cross legged with a papyrus roll open on his lap, looking up as if waiting for the next word.',
      story: 'Nobody knows who he was. The base that carried his name was lost before Auguste Mariette recorded the find in 1850. What survives is the most alive face from the Old Kingdom: soft belly, alert eyes with copper rims and a right hand curled around a reed pen that has long since gone. Scribes ran the state and this one clearly knew it.',
      facts: ['The eyes are rock crystal set in copper, with a small drilled pupil', 'His paunch marks him as a man who never had to work in the fields', 'Red ochre skin was the convention for men in Egyptian art'],
      tags: ['scribe', 'saqqara', 'papyrus', 'louvre'],
      img: pic('8/8d', 'Le Scribe accroupi - Musée du Louvre Antiquités égyptiennes E 3023.jpg', 'Shonagon', 'CC0')
    },
    {
      id: 'meketre-boat', title: 'Model Paddling Boat of Meketre', era: 'middle-kingdom',
      date: 'c. 1981 to 1975 BCE', year: -1978, category: 'daily',
      material: 'Painted wood, linen and twine', dims: '',
      findspot: 'Tomb of Meketre, Thebes', museum: 'Metropolitan Museum of Art, New York', inventory: '20.3.5',
      summary: 'A crew of wooden paddlers drives the chancellor Meketre upriver, part of a whole fleet found hidden in a chamber of his tomb.',
      story: 'In 1920 Herbert Winlock\'s team found a sealed room under the floor of a plundered tomb. Inside were two dozen models of boats, workshops, granaries and gardens, untouched for four thousand years. This boat carries Meketre under a canopy while men paddle and a lookout tests the depth with a pole. The models were meant to keep working for him in the next life.',
      facts: ['Found in a hidden chamber that robbers had missed', 'Half the models went to Cairo and half to New York', 'The paddlers are carved with different faces'],
      tags: ['meketre', 'model', 'boat', 'thebes', 'met'],
      img: pic('7/7d', 'Model Paddling Boat MET DP354724.jpg', 'Metropolitan Museum of Art', 'CC0')
    },
    {
      id: 'senusret-iii', title: 'Statues of Senusret III', era: 'middle-kingdom',
      date: 'c. 1850 BCE', year: -1850, category: 'sculpture',
      material: 'Granite', dims: '',
      findspot: 'Temple of Mentuhotep II, Deir el-Bahari', museum: 'British Museum, London', inventory: 'EA 684, 685 and 686',
      summary: 'Three portraits of the same king with heavy eyelids and a drawn mouth, faces that seem to carry the weight of ruling.',
      story: 'Senusret III broke with the serene royal face of earlier dynasties. His statues show lined cheeks, deep set eyes and ears that stick out to hear everything. Whether this was a true likeness or a message about a king who listened and worried is still debated. He campaigned in Nubia, built forts along the second cataract and was worshipped there as a god for centuries.',
      facts: ['Found by Naville in 1905 at Deir el-Bahari', 'The large ears may show a king who hears all petitions', 'He centralised power and cut the provincial governors down to size'],
      tags: ['senusret', 'sesostris', 'portrait', 'british museum'],
      img: pic('a/ae', 'Statues of Senusret III, British Museum 01.jpg', '14GTR', 'CC0')
    },
    {
      id: 'ka-statue-hor', title: 'Ka Statue of King Hor', era: 'middle-kingdom',
      date: 'c. 1750 BCE', year: -1750, category: 'funerary',
      material: 'Wood, once covered in plaster and paint, with inlaid eyes', dims: '170 cm tall',
      findspot: 'Dahshur, beside the pyramid of Amenemhat III', museum: 'Egyptian Museum, Cairo', inventory: 'CG 259',
      summary: 'A life size wooden king with the sign for ka, two raised arms, on his head. The statue was a body for his spirit to live in.',
      story: 'Egyptians believed every person had a ka, a life force that needed a home after death. Hor, a shadowy king of the 13th Dynasty, was buried with this figure inside a wooden shrine so that his ka would have somewhere to receive offerings. De Morgan found it in 1894 still standing in its shrine, the eyes inlaid and the body once wrapped in gilded plaster.',
      facts: ['The raised arms are the hieroglyph for ka', 'Found still inside its naos in an undisturbed shaft', 'The king was naked except for a kilt and staff now lost'],
      tags: ['ka', 'hor', 'dahshur', 'wood', 'cairo'],
      focus: 'center 15%',
      img: pic('5/54', 'Ka Statue of horawibra.jpg', 'Jon Bodsworth', 'Free use', true)
    },
    {
      id: 'hatshepsut-seated', title: 'Seated Statue of Hatshepsut', era: 'new-kingdom',
      date: 'c. 1479 to 1458 BCE', year: -1470, category: 'sculpture', featured: true,
      material: 'Indurated limestone', dims: 'About 195 cm tall',
      findspot: 'Deir el-Bahari, Thebes', museum: 'Metropolitan Museum of Art, New York', inventory: '29.3.2',
      summary: 'The woman who ruled as king, shown in the nemes headcloth of a pharaoh but with a face and body that are unmistakably her own.',
      story: 'Hatshepsut took the throne as regent for her stepson and kept it for twenty years. Her temple at Deir el-Bahari was lined with statues like this one, most of them smashed after her death when Thutmose III had her name removed. The Metropolitan Museum reassembled this figure from fragments found in a quarry pit in the 1920s.',
      facts: ['Pieced together from fragments dumped in a pit near her temple', 'She sent a trading fleet to Punt on the Red Sea', 'Her name was chipped off monuments decades after she died'],
      tags: ['hatshepsut', 'queen', 'deir el-bahari', 'met'],
      img: pic('0/0e', 'Large Seated Statue of Hatshepsut MET 223754.jpg', 'Metropolitan Museum of Art', 'CC0')
    },
    {
      id: 'akhenaten-colossus', title: 'Colossus of Akhenaten', era: 'new-kingdom',
      date: 'c. 1353 to 1336 BCE', year: -1345, category: 'sculpture',
      material: 'Sandstone', dims: 'About 4 m tall',
      findspot: 'Gempaaten temple, Karnak', museum: 'Egyptian Museum, Cairo', inventory: '',
      summary: 'A king with a long face, narrow eyes and a swelling belly, carved in a style no pharaoh before or after would allow.',
      story: 'Early in his reign Akhenaten built an open air temple to the sun disc Aten east of Karnak and lined it with statues of himself. The elongated skull, full lips and wide hips have been read as illness, as a religious idea of the king as mother and father of the land or as plain artistic choice. After his death the temple was torn down and the colossi buried face down.',
      facts: ['Found in 1925 when a drainage canal was dug at Karnak', 'The Aten temple was dismantled by Horemheb', 'Akhenaten closed the temples of the other gods'],
      tags: ['akhenaten', 'amarna', 'aten', 'karnak', 'cairo'],
      focus: 'center 12%',
      img: pic('0/0f', 'Colossal Statue of Amenhotep IV from Karnak, 1356-1350 BCE (4).jpg', 'Prof. Mortel', 'CC BY 2.0')
    },
    {
      id: 'nefertiti-bust', title: 'Bust of Nefertiti', era: 'new-kingdom',
      date: 'c. 1345 BCE', year: -1345, category: 'sculpture', featured: true,
      material: 'Limestone core with painted stucco', dims: '48 cm tall',
      findspot: 'Workshop of the sculptor Thutmose, Amarna', museum: 'Neues Museum, Berlin', inventory: 'ÄM 21300',
      summary: 'The most reproduced face of the ancient world, a workshop model that was never meant to leave the sculptor\'s studio.',
      story: 'Ludwig Borchardt\'s team found the bust on 6 December 1912 in the ruins of a sculptor\'s house at Amarna, lying face up in the sand. It was a master model for other portraits of the queen, which is why the left eye was never inlaid. The tall blue crown, the painted collar and the long neck have made it a symbol of beauty for a century. The question of whether it should go back to Egypt has never gone away.',
      facts: ['The left eye was left empty on purpose, probably because it was a model', 'A hidden inner face was found by CT scan in 2009', 'Egypt first asked for its return in 1924'],
      tags: ['nefertiti', 'amarna', 'thutmose', 'berlin'],
      img: pic('1/1f', 'Nofretete Neues Museum.jpg', 'Philip Pikart', 'CC BY-SA 3.0')
    },
    {
      id: 'tutankhamun-mask', title: 'Mask of Tutankhamun', era: 'new-kingdom',
      date: 'c. 1323 BCE', year: -1323, category: 'gold', featured: true,
      material: 'Gold with lapis lazuli, quartz, obsidian, carnelian and coloured glass', dims: '54 cm tall, 10.2 kg',
      findspot: 'Tomb KV62, Valley of the Kings', museum: 'Grand Egyptian Museum, Giza', inventory: 'JE 60672',
      summary: 'Two sheets of beaten gold shaped over the face of a young king who died at about nineteen and was forgotten for three thousand years.',
      story: 'Howard Carter reached the mask on 28 October 1925, three years after he first opened the tomb. It sat over the head of the mummy inside three nested coffins. The stripes of the nemes are inlaid with glass and the eyes are quartz and obsidian. On the back and shoulders a spell from the Book of the Dead protects each part of the face. The beard came off in 2014 and was badly reglued, then properly restored a year later.',
      facts: ['Made from two sheets of gold hammered together', 'The Book of the Dead spell 151b runs across the shoulders', 'Moved to the Grand Egyptian Museum with the rest of the tomb'],
      tags: ['tutankhamun', 'tut', 'gold', 'mask', 'carter', 'valley of the kings'],
      img: pic('3/35', 'Mask of Tutankhamun in 2025.jpg', 'Dawid Wdowczyk', 'CC BY 4.0')
    },
    {
      id: 'tutankhamun-throne', title: 'Golden Throne of Tutankhamun', era: 'new-kingdom',
      date: 'c. 1330 BCE', year: -1330, category: 'gold',
      material: 'Wood covered in gold and silver sheet, inlaid with glass, faience and stone', dims: '104 cm tall',
      findspot: 'Tomb KV62, Valley of the Kings', museum: 'Grand Egyptian Museum, Giza', inventory: 'JE 62028',
      summary: 'A wooden chair sheathed in gold, its back panel showing the queen anointing the king under the rays of the sun disc.',
      story: 'The scene on the backrest is the tender heart of the tomb. Ankhesenamun reaches out to touch her husband\'s shoulder while the Aten shines down with little hands on the ends of its rays. The style and the sun disc belong to Akhenaten\'s religion, so the throne was probably made early in the reign before the old gods were restored. The lions on the legs and the winged serpents on the arms guard the seat.',
      facts: ['Found in the antechamber under a hippopotamus couch', 'The names on it were altered when the king changed his from Tutankhaten', 'Silver was rarer than gold in Egypt and was used for the couple\'s clothing'],
      tags: ['tutankhamun', 'throne', 'ankhesenamun', 'aten', 'gold'],
      img: pic('b/bd', 'Golden throne (22674627783).jpg', 'Thomas Quine', 'CC BY 2.0')
    },
    {
      id: 'tutankhamun-pectoral', title: 'Scarab Pectoral of Tutankhamun', era: 'new-kingdom',
      date: 'c. 1325 BCE', year: -1325, category: 'gold',
      material: 'Gold inlaid with silver, carnelian, turquoise, lapis lazuli, feldspar and glass', dims: '',
      findspot: 'Tomb KV62, Valley of the Kings', museum: 'Grand Egyptian Museum, Giza', inventory: '',
      summary: 'A chest ornament of scarab beetles pushing the sun, worn by the king and buried in a box of jewellery beside him.',
      story: 'The scarab was the god Khepri, the sun at dawn rolling itself over the horizon the way a beetle rolls a ball of dung. Jewellers layered gold cells with coloured stone and glass so tightly that the piece reads like an enamel painting. Tutankhamun\'s tomb held over a hundred pieces of jewellery, many of which had been disturbed by robbers and hastily put back by the necropolis guards.',
      facts: ['The scarab spells part of the king\'s throne name Nebkheperure', 'Glass was used alongside real stone and valued just as highly', 'Found in a jewellery box in the treasury of the tomb'],
      tags: ['tutankhamun', 'scarab', 'khepri', 'pectoral', 'jewellery'],
      img: pic('a/a9', 'Pectoral depicting Khepri from Tutankhamun’s tomb.jpg', 'Al Pavangkanan', 'CC BY 2.0')
    },
    {
      id: 'hunefer-papyrus', title: 'Book of the Dead of Hunefer', era: 'new-kingdom',
      date: 'c. 1275 BCE', year: -1275, category: 'writing', featured: true,
      material: 'Ink and paint on papyrus', dims: '39 cm tall',
      findspot: 'Thebes', museum: 'British Museum, London', inventory: 'EA 9901',
      summary: 'The weighing of the heart. Anubis checks the scales, Thoth writes down the result and a monster waits in case the heart is heavy.',
      story: 'Hunefer was a royal scribe under Seti I and could afford the best. In this scene he is led by the hand to a balance where his heart is weighed against the feather of Maat, the goddess of truth. Ammit, part crocodile, part lion, part hippopotamus, crouches ready to eat a heart that fails. He passes and Horus presents him to Osiris enthroned. The papyrus was a guide and a passport in one.',
      facts: ['The Book of the Dead was a set of spells, not one fixed book', 'Hunefer\'s wife Nasha appears with him on the first sheet', 'Ammit the devourer sits beside the scales'],
      tags: ['book of the dead', 'papyrus', 'anubis', 'osiris', 'weighing', 'british museum'],
      img: pic('c/cf', 'Book of the Dead of Hunefer sheet 3.jpg', 'Hunefer, photograph by the British Museum', 'Public domain')
    },
    {
      id: 'nefertari-tomb', title: 'Wall Painting from the Tomb of Nefertari', era: 'new-kingdom',
      date: 'c. 1255 BCE', year: -1255, category: 'funerary',
      material: 'Paint on plaster over limestone', dims: '',
      findspot: 'Tomb QV66, Valley of the Queens', museum: 'In place, Valley of the Queens', inventory: 'QV66',
      summary: 'The best preserved painted tomb in Egypt, made for the chief wife of Ramesses II and covered with the queen meeting the gods.',
      story: 'Ramesses called his wife the one for whom the sun shines. Her tomb was cut into the cliffs west of Luxor and every wall was plastered and painted with scenes of her journey through the underworld. Salt crystals nearly destroyed the paintings in the twentieth century until a long conservation project in the 1980s stabilised them. Visitor numbers are still limited to keep the colour alive.',
      facts: ['Found by Ernesto Schiaparelli in 1904', 'The tomb was robbed in antiquity and little of the burial survived', 'Restored by the Getty Conservation Institute between 1986 and 1992'],
      tags: ['nefertari', 'tomb', 'painting', 'valley of the queens', 'ramesses'],
      img: pic('d/d7', 'Maler der Grabkammer der Nefertari 004.jpg', 'The Yorck Project', 'Public domain')
    },
    {
      id: 'ramesses-ii-turin', title: 'Seated Statue of Ramesses II', era: 'new-kingdom',
      date: 'c. 1279 to 1213 BCE', year: -1250, category: 'sculpture',
      material: 'Granodiorite', dims: '196 cm tall',
      findspot: 'Karnak', museum: 'Museo Egizio, Turin', inventory: 'C 1380',
      summary: 'Ramesses in the blue war crown, holding the crook and staff, with a small queen and prince at his feet. Champollion called it the finest statue in Turin.',
      story: 'The great king sits in a pleated robe and sandals, more like a man at court than a god. The khepresh crown with its cobra marks him as a warrior. Beside his legs stand tiny figures of his wife Nefertari and his son Amunherkhepeshef, an unusual touch of family in a royal image. The statue came to Turin in 1824 with the Drovetti collection that founded the museum.',
      facts: ['Ramesses ruled for 66 years and outlived many of his sons', 'The statue was reworked, the original face may have belonged to another king', 'Turin holds the largest Egyptian collection outside Cairo'],
      tags: ['ramesses', 'rameses', 'turin', 'karnak', 'khepresh'],
      focus: 'center 22%',
      img: pic('e/e6', 'Statue of Ramesses II, granodiorite - Museo Egizio (Turin) C 1380 p01.jpg', 'Museo Egizio', 'CC0')
    },
    {
      id: 'canopic-jars-kv55', title: 'Canopic Jars from Tomb KV55', era: 'new-kingdom',
      date: 'c. 1340 BCE', year: -1340, category: 'funerary',
      material: 'Calcite with glass and stone inlay', dims: '',
      findspot: 'Tomb KV55, Valley of the Kings', museum: 'Egyptian Museum, Cairo', inventory: 'JE 39637',
      summary: 'Four jars for the organs of the dead, their lids carved with the face of a royal woman, probably Kiya, a wife of Akhenaten.',
      story: 'When the body was mummified the lungs, liver, stomach and intestines were removed and stored in jars like these. The lids here are portraits in the Amarna style with heavy wigs and calm faces. The names on the jars were erased and the set was reused in the confused burial of KV55, a tomb that has puzzled everyone since Theodore Davis opened it in 1907. Three jars are in Cairo and the fourth is in New York.',
      facts: ['The four jars were guarded by the four sons of Horus', 'The inscriptions were rubbed out before reuse', 'KV55 may hold the body of Akhenaten himself'],
      tags: ['canopic', 'kiya', 'amarna', 'kv55', 'cairo'],
      img: pic('9/97', 'Canopic jars KV55.jpg', 'Merytat3n', 'CC BY-SA 4.0')
    },
    {
      id: 'senet-box', title: 'Game Box for Senet and Twenty Squares', era: 'new-kingdom',
      date: 'c. 1635 to 1458 BCE', year: -1550, category: 'daily',
      material: 'Wood with inlay', dims: '',
      findspot: 'Thebes', museum: 'Metropolitan Museum of Art, New York', inventory: '16.10.475a',
      summary: 'A double sided game box, senet on one face and twenty squares on the other, with a drawer for the pieces.',
      story: 'Senet was played for two thousand years and turned from a pastime into a picture of the soul\'s passage through the underworld. Players moved pieces along thirty squares according to throws of sticks or knucklebones. The other side carries the game of twenty squares, an import from the Near East. Hounds, gazelles and lions decorate the box, the same animals hunted in the desert.',
      facts: ['Tutankhamun was buried with four senet boards', 'The rules are lost, modern versions are reconstructions', 'Nefertari is shown playing senet in her tomb'],
      tags: ['senet', 'game', 'board', 'met', 'thebes'],
      img: pic('9/9c', 'Game Box for Playing Senet and Twenty Squares MET 16.10.475a.bot.jpg', 'Metropolitan Museum of Art', 'CC0')
    },
    {
      id: 'heart-scarab', title: 'Heart Scarab', era: 'new-kingdom',
      date: 'c. 1550 to 1070 BCE', year: -1300, category: 'funerary',
      material: 'Steatite', dims: '',
      findspot: 'Thebes', museum: 'Museo Egizio, Turin', inventory: 'Cat. 5988',
      summary: 'A beetle of green stone laid over the heart of a mummy, inscribed with a spell that begged the heart not to speak against its owner.',
      story: 'Spell 30B of the Book of the Dead is written on the flat underside. It asks the heart, the seat of memory and conscience, not to stand as a witness against the dead person at the judgement. Heart scarabs were made from green or dark stone and often mounted in gold. This one shows the beetle with its wing cases and legs carefully cut.',
      facts: ['The heart was the only organ left inside the mummy', 'Spell 30B is one of the most common texts on amulets', 'Green stone stood for renewal and growth'],
      tags: ['scarab', 'amulet', 'heart', 'turin', 'spell'],
      img: pic('6/65', 'Amulet Heart Scarab, steatite - Museo Egizio (Turin) C 5988 p01.jpg', 'Museo Egizio', 'CC0')
    },
    {
      id: 'psusennes-mask', title: 'Gold Mask of Psusennes I', era: 'third-intermediate',
      date: 'c. 1000 BCE', year: -1000, category: 'gold', featured: true,
      material: 'Gold with lapis lazuli and glass', dims: '48 cm tall',
      findspot: 'Royal tombs at Tanis', museum: 'Egyptian Museum, Cairo', inventory: 'JE 85913',
      summary: 'The only royal gold mask found in an untouched tomb since Tutankhamun, discovered in the Delta in 1940 while the world was at war.',
      story: 'Pierre Montet had been digging at Tanis for eleven years when he opened the tomb of Psusennes in the spring of 1940. Inside a silver coffin lay the king, his face covered by this mask. Because it was wartime the find was reported and then largely forgotten, so the treasure of Tanis has never had the fame of the Valley of the Kings. The mask is thinner and simpler than Tutankhamun\'s but the goldsmith\'s work on the eyes is every bit as fine.',
      facts: ['Found in a silver coffin inside a pink granite sarcophagus', 'Montet also found the intact burial of King Shoshenq II', 'Tanis in the Delta was the capital of the 21st Dynasty'],
      tags: ['psusennes', 'tanis', 'gold', 'mask', 'montet', 'cairo'],
      img: pic('5/56', 'Psusennes I\'s Funerary Mask in 2012 (gold).jpg', 'Tjflex2', 'CC BY-SA 2.0')
    },
    {
      id: 'gayer-anderson-cat', title: 'Gayer-Anderson Cat', era: 'late-period',
      date: 'c. 664 to 332 BCE', year: -500, category: 'sculpture',
      material: 'Bronze with gold earrings and nose ring, silver inlay', dims: '42 cm tall',
      findspot: 'Unknown, probably Saqqara', museum: 'British Museum, London', inventory: 'EA 64391',
      summary: 'A hollow cast bronze cat wearing jewellery, an image of the goddess Bastet made in the last centuries of native rule.',
      story: 'The cat sits upright with a scarab on its brow and a wedjat eye on its chest, both cut in silver. Gold rings hang from its ears and nose. It was given to the British Museum by Major Robert Gayer-Anderson in 1939, who had bought it in Egypt and kept it in his Cairo house, now a museum itself. X rays showed the head was once broken off and skilfully rejoined.',
      facts: ['Cast in one piece using the lost wax method', 'Bronze cats were left as offerings at the temple of Bastet at Bubastis', 'The scarab on the head links the cat to the sun god'],
      tags: ['cat', 'bastet', 'bronze', 'british museum', 'gayer-anderson'],
      focus: 'center 30%',
      img: pic('5/57', 'Gayer-Anderson Cat, British Museum.jpg', 'Peter D. Tillman', 'CC BY-SA 2.0')
    },
    {
      id: 'ushabti-group', title: 'Ushabti Figures', era: 'late-period',
      date: 'c. 664 to 332 BCE', year: -450, category: 'funerary',
      material: 'Glazed faience', dims: '',
      findspot: 'Egypt', museum: 'Istanbul Archaeology Museums', inventory: '',
      summary: 'Small glazed servants buried with the dead so they could answer when work was called for in the fields of the afterlife.',
      story: 'The name means answerer. If the dead were called to dig canals or carry sand in the next world, the ushabti would step forward and say here I am. A full set had 365 workers, one for every day of the year, plus overseers. By the Late Period they were mass produced in moulds and coated in a blue green glaze that stood for rebirth.',
      facts: ['Each figure carries a hoe and a seed basket', 'Spell 6 of the Book of the Dead is written down the front', 'Wealthy burials held over four hundred of them'],
      tags: ['ushabti', 'shabti', 'faience', 'servant', 'istanbul'],
      img: pic('0/0f', 'Ushabti Istanbul.jpg', 'AlexanderStambul', 'CC BY-SA 4.0')
    },
    {
      id: 'rosetta-stone', title: 'Rosetta Stone', era: 'ptolemaic',
      date: '196 BCE', year: -196, category: 'writing', featured: true,
      material: 'Granodiorite', dims: '112 cm tall, 76 cm wide, 760 kg',
      findspot: 'Fort Julien, Rashid', museum: 'British Museum, London', inventory: 'EA 24',
      summary: 'One decree in three scripts. The stone that let Champollion read hieroglyphs for the first time in fourteen centuries.',
      story: 'The text is a decree from a council of priests praising the thirteen year old Ptolemy V on the anniversary of his coronation. It was cut in hieroglyphs for the gods, in demotic for daily use and in Greek for the rulers. French soldiers found it in 1799 rebuilding a fort and the British took it after Napoleon\'s defeat. Thomas Young and then Jean-François Champollion worked from the Greek to crack the other two. Champollion announced his breakthrough in 1822.',
      facts: ['The hieroglyphic section is the most damaged, only 14 lines survive', 'Copies were made with ink and paper and sent across Europe', 'The stone has been in the British Museum since 1802'],
      tags: ['rosetta', 'champollion', 'decree', 'hieroglyphs', 'demotic', 'british museum'],
      img: pic('2/23', 'Rosetta Stone.JPG', 'Hans Hillewaert', 'CC BY-SA 4.0')
    },
    {
      id: 'dendera-zodiac', title: 'Dendera Zodiac', era: 'ptolemaic',
      date: 'c. 50 BCE', year: -50, category: 'writing',
      material: 'Sandstone relief', dims: '253 cm by 255 cm',
      findspot: 'Ceiling of a chapel in the Temple of Hathor, Dendera', museum: 'Musée du Louvre, Paris', inventory: 'D 38',
      summary: 'A map of the sky carved into a temple ceiling, mixing Egyptian constellations with the twelve signs of the Babylonian zodiac.',
      story: 'Four goddesses and eight falcon headed figures hold up a disc filled with stars. Inside it the Egyptian sky, with the hippopotamus and the bull\'s foreleg, meets the ram, the bull and the twins of the zodiac that Egypt had learned from Mesopotamia and Greece. In 1821 a French antiquities dealer sawed the ceiling out with explosives and shipped it to Paris. A plaster cast now fills the hole at Dendera.',
      facts: ['The positions of the planets may date the carving to 50 BCE', 'Removed with saws and gunpowder in 1821', 'Bought by Louis XVIII for 150,000 francs'],
      tags: ['zodiac', 'dendera', 'astronomy', 'stars', 'louvre'],
      img: pic('4/4c', 'Dendera zodiac, Louvre.jpg', 'Neithsabes', 'Public domain', true)
    },
    {
      id: 'cleopatra-tetradrachm', title: 'Tetradrachm of Cleopatra VII', era: 'ptolemaic',
      date: 'c. 51 to 30 BCE', year: -40, category: 'daily',
      material: 'Silver', dims: '',
      findspot: 'Minted at Ascalon', museum: 'Private collection', inventory: '',
      summary: 'The last queen of Egypt as her own mint saw her: strong nose, firm chin, hair tied back in a bun and a diadem on her brow.',
      story: 'Almost nothing survives of Cleopatra\'s face except coins. This one was struck at Ascalon on the Levant coast, a city that minted in her name to show its loyalty. The portrait has none of the Hollywood softness. It shows a Ptolemaic ruler in the Greek tradition, meant to look like her father and to be taken seriously. She spoke nine languages and was the first of her dynasty to learn Egyptian.',
      facts: ['The eagle on the reverse is the badge of the Ptolemies', 'Coins are the only certain portraits of the queen', 'Ascalon issued her coins from her first year as ruler'],
      tags: ['cleopatra', 'coin', 'silver', 'ptolemy', 'portrait'],
      img: pic('1/1e', 'Cleopatra VII tetradrachm Ascalon mint.jpg', 'PHGCOM', 'Public domain')
    },
    {
      id: 'fayum-portrait', title: 'Mummy Portrait of a Young Man', era: 'roman',
      date: 'c. 160 to 180 CE', year: 170, category: 'funerary',
      material: 'Encaustic on wood', dims: '',
      findspot: 'Fayum', museum: 'British Museum, London', inventory: 'EA 74710',
      summary: 'A face painted in hot wax and bound over the head of a mummy, one of the earliest portraits in the world that looks straight back at you.',
      story: 'Under Roman rule, Egyptians who could afford it had their likeness painted on a thin wooden panel and set into the mummy wrappings over the face. The painters worked in encaustic, pigment mixed with beeswax. Their brushwork has stayed fresh for eighteen centuries. Roman haircuts and dress meet an Egyptian burial, a single object that belongs to two worlds at once.',
      facts: ['Around a thousand Fayum portraits are known', 'Most were painted while the sitter was still alive', 'The panels were often trimmed to fit the mummy'],
      tags: ['fayum', 'portrait', 'encaustic', 'roman', 'mummy', 'british museum'],
      focus: 'center 30%',
      img: pic('7/71', 'Fayum mummy portrait (160-180 AD) - British museum, EA74710.jpg', 'Unknown painter', 'Public domain', true)
    }
  ];

  const EXHIBITIONS = [
    {
      id: 'gold-of-tanis', title: 'Gold of Tanis', room: 'Room 1',
      start: '2026-08-14', end: '2026-12-13',
      blurb: 'The forgotten treasure. Silver coffins, gold masks and the story of a discovery made while Europe went to war.',
      objects: ['psusennes-mask', 'tutankhamun-mask', 'tutankhamun-pectoral'],
      bg: thumb('5/56', 'Psusennes I\'s Funerary Mask in 2012 (gold).jpg', 960)
    },
    {
      id: 'signal-and-scribe', title: 'Signal and Scribe', room: 'Room 2',
      start: '2026-10-24', end: '2027-03-07',
      blurb: 'Five thousand years of writing, from the first labels on jars to the decree that cracked the code. Bring a pen.',
      objects: ['narmer-palette', 'seated-scribe', 'hunefer-papyrus', 'rosetta-stone'],
      bg: thumb('2/23', 'Rosetta Stone.JPG', 960)
    },
    {
      id: 'the-sphinx-at-dusk', title: 'The Sphinx at Dusk', room: 'Room 3',
      start: '2026-05-02', end: '2026-09-27',
      blurb: 'The Giza plateau across four seasons of light. Photography, survey drawings and the long argument about the face.',
      objects: ['khafre-enthroned', 'menkaure-and-queen', 'djoser-statue'],
      bg: thumb('4/4e', 'Great Sphinx of Giza (2).jpg', 960)
    },
    {
      id: 'faces-from-the-fayum', title: 'Faces from the Fayum', room: 'Room 4',
      start: '2026-01-10', end: '2026-06-30',
      blurb: 'Painted portraits from Roman Egypt. The room is closed but every object stays in the archive.',
      objects: ['fayum-portrait', 'cleopatra-tetradrachm', 'dendera-zodiac'],
      bg: orig('7/71', 'Fayum mummy portrait (160-180 AD) - British museum, EA74710.jpg')
    }
  ];

  const ROUTES = [
    {
      id: 'gold', title: 'Gold of the Pharaohs', glyph: '𓋞', minutes: 8,
      blurb: 'Two masks, a throne and a pectoral. How goldsmiths turned metal into eternity.',
      objects: ['tutankhamun-mask', 'tutankhamun-throne', 'tutankhamun-pectoral', 'psusennes-mask', 'heart-scarab']
    },
    {
      id: 'written', title: 'Written in Stone', glyph: '𓏞', minutes: 10,
      blurb: 'From the first signs on a palette to the stone that unlocked them all.',
      objects: ['narmer-palette', 'seated-scribe', 'hunefer-papyrus', 'dendera-zodiac', 'rosetta-stone']
    },
    {
      id: 'faces', title: 'Faces of Power', glyph: '𓀭', minutes: 12,
      blurb: 'Eight rulers, eight ways of being looked at. Watch the royal face change across two thousand years.',
      objects: ['djoser-statue', 'khafre-enthroned', 'menkaure-and-queen', 'senusret-iii', 'hatshepsut-seated', 'akhenaten-colossus', 'nefertiti-bust', 'ramesses-ii-turin']
    },
    {
      id: 'afterlife', title: 'Journey to the Afterlife', glyph: '𓇼', minutes: 9,
      blurb: 'What you needed for the trip: a home for your spirit, jars for your organs, servants and a good lawyer.',
      objects: ['ka-statue-hor', 'canopic-jars-kv55', 'hunefer-papyrus', 'nefertari-tomb', 'ushabti-group', 'fayum-portrait']
    }
  ];

  const MARQUEE = [
    ['𓋹', 'ankh', 'life'], ['𓊽', 'djed', 'stability'], ['𓌀', 'was', 'power'],
    ['𓂀', 'wedjat', 'protection'], ['𓆣', 'kheper', 'becoming'], ['𓇳', 'ra', 'sun'],
    ['𓄤', 'nefer', 'beauty'], ['𓄣', 'ib', 'heart'], ['𓂓', 'ka', 'spirit'],
    ['𓆄', 'maat', 'truth'], ['𓉐', 'per', 'house'], ['𓊖', 'niwt', 'city'],
    ['𓅃', 'hor', 'falcon'], ['𓏞', 'sesh', 'scribe']
  ];

  const GLYPHS = {
    a: ['𓄿', 'vulture', 'a'],
    b: ['𓃀', 'foot', 'b'],
    c: ['𓎡', 'basket', 'k'],
    d: ['𓂧', 'hand', 'd'],
    e: ['𓇋', 'reed', 'i'],
    f: ['𓆑', 'horned viper', 'f'],
    g: ['𓎼', 'jar stand', 'g'],
    h: ['𓉔', 'reed shelter', 'h'],
    i: ['𓇋', 'reed', 'i'],
    j: ['𓆓', 'cobra', 'dj'],
    k: ['𓎡', 'basket', 'k'],
    l: ['𓃭', 'lion', 'l'],
    m: ['𓅓', 'owl', 'm'],
    n: ['𓈖', 'water', 'n'],
    o: ['𓅱', 'quail chick', 'w'],
    p: ['𓊪', 'stool', 'p'],
    q: ['𓈎', 'hill slope', 'q'],
    r: ['𓂋', 'mouth', 'r'],
    s: ['𓋴', 'folded cloth', 's'],
    t: ['𓏏', 'bread loaf', 't'],
    u: ['𓅱', 'quail chick', 'w'],
    v: ['𓆑', 'horned viper', 'f'],
    w: ['𓅱', 'quail chick', 'w'],
    x: ['𓎡𓋴', 'basket and cloth', 'ks'],
    y: ['𓇌', 'two reeds', 'y'],
    z: ['𓊃', 'door bolt', 'z'],
    sh: ['𓈙', 'pool', 'sh'],
    ch: ['𓍿', 'tethering rope', 'tj'],
    kh: ['𓐍', 'placenta', 'kh'],
    th: ['𓍿', 'tethering rope', 'tj'],
    ph: ['𓆑', 'horned viper', 'f'],
    qu: ['𓎡𓅱', 'basket and chick', 'kw']
  };

  window.MUSEUM = { ERAS, CATEGORIES, ARTIFACTS, EXHIBITIONS, ROUTES, MARQUEE, GLYPHS };
})();
