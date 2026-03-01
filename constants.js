const GLADIATOR_CLASSES = ['Warrior', 'Paladin', 'Rogue', 'Hunter', 'Mage', 'Cleric'];

// Portrait lookup: only defined combinations have an image. Others return null.
const PORTRAITS = {
    'Warrior_m': 'portraits/portrait_warrior_m.png',
    'Warrior_f': 'portraits/portrait_warrior_f.png',
    'Paladin_m': 'portraits/portrait_paladin_m.png',
    'Paladin_f': 'portraits/portrait_paladin_f.png',
    'Rogue_m': 'portraits/portrait_rogue_m.png',
    'Rogue_f': 'portraits/portrait_rogue_f.png',
    'Hunter_m': 'portraits/portrait_hunter_m.png',
    'Hunter_f': 'portraits/portrait_hunter_f.png',
    'Mage_m': 'portraits/portrait_mage_m.png',
    'Mage_f': 'portraits/portrait_mage_f.png',
    'Cleric_m': 'portraits/portrait_cleric_m.png',
    'Cleric_f': 'portraits/portrait_cleric_f.png',
};

// 10 Distinct Cities and Teams
const TEAMS = [
    { id: 'madeirna_marauders', name: 'The Madeirna Marauders', mascot: 'Marauder', theme: 'Coastal Raiders' },
    { id: 'lucinda_lions', name: 'The Lucinda Lions', mascot: 'Lion', theme: 'Golden Royalty' },
    { id: 'kaelen_krakens', name: 'The Kaelen Krakens', mascot: 'Kraken', theme: 'Deep Sea Horrors' },
    { id: 'theron_thunder', name: 'The Theron Thunder', mascot: 'Thunderbird', theme: 'Storm Lords' },
    { id: 'zephyr_vipers', name: 'The Zephyr Vipers', mascot: 'Viper', theme: 'Desert Assassins' },
    { id: 'vane_vanguard', name: 'The Vane Vanguard', mascot: 'Shield', theme: 'Impenetrable Defenders' },
    { id: 'fenric_falcons', name: 'The Fenric Falcons', mascot: 'Falcon', theme: 'Sky Hunters' },
    { id: 'orion_owls', name: 'The Orion Owls', mascot: 'Owl', theme: 'Mystic Scholars' },
    { id: 'soren_serpents', name: 'The Soren Serpents', mascot: 'Serpent', theme: 'Jungle Stalkers' },
    { id: 'valen_valkyries', name: 'The Valen Valkyries', mascot: 'Valkyrie', theme: 'Celestial Warriors' }
];

const MALE_NAMES = ["Kaelen", "Theron", "Darius", "Zephyr", "Rian", "Caelum", "Vane", "Fenric", "Lucien", "Ronan", "Silas", "Cassian", "Evander", "Gael", "Idris", "Jace", "Kieran", "Leander", "Orion", "Soren", "Tavish", "Vorian", "Zane", "Alaric", "Bastian", "Darian", "Elias", "Finnick", "Gideon", "Halion", "Ilias", "Julian", "Kael", "Lorcan", "Mael", "Nico", "Oberon", "Pax", "Quintus", "Rhys", "Stellan", "Torin", "Urien", "Valen", "Wren", "Xander", "Yorick", "Zev", "Aegon", "Barris"];
const FEMALE_NAMES = ["Lyra", "Elara", "Seraphina", "Aria", "Isolde", "Maeve", "Freya", "Nova", "Amara", "Celeste", "Daphne", "Eira", "Fiona", "Gwen", "Hazel", "Iris", "Juno", "Kira", "Luna", "Mira", "Niamh", "Aura", "Petra", "Quinn", "Rhea", "Stella", "Thalassa", "Una", "Vera", "Willa", "Xanthe", "Yara", "Zara", "Aylin", "Bria", "Carys", "Dara", "Elin", "Faye", "Gia", "Halia", "Ianthe", "Jessa", "Kaia", "Lia", "Mina", "Nyssa", "Orla", "Pia", "Ria"];
const SURNAMES = ["Stormrider", "Nightshade", "Ironweave", "Silverleaf", "Bloodforge", "Swiftarrow", "Shadowwalker", "Dawnbreaker", "Frostbane", "Emberfall", "Starweaver", "Voidcaller", "Moonwhisper", "썬strike", "Wildblood", "Stoneheart", "Windrider", "Truthseeker", "Lightbringer", "Darkbane", "Flameheart", "Iceweaver", "Earthshaker", "Waterdancer", "Spiritwalker", "Soulreaper", "Dreamweaver", "Fateweaver", "Timekeeper", "Spacebender", "Mindreader", "Shadowcaster", "Lightweaver", "Stormcaller", "Firestarter", "Icebreaker", "Earthmover", "Waterbender", "Spiritguide", "Soulcatcher", "Dreamcatcher", "Fatechanger", "Timetraveler", "Spaceexplorer", "Mindcontroller", "Shadowweaver", "Lightbringer", "Stormchaser", "Fireweaver", "Iceweaver"];
