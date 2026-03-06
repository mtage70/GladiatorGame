const MONTHS_PER_YEAR = 6;
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
    { id: 'madeirna_marauders', name: 'The Madeirna Marauders', mascot: 'Marauder', theme: 'Coastal Raiders', primaryColor: '#000080', secondaryColor: '#C0C0C0', logo: 'portraits/logo_madeirna.png' },
    { id: 'lucinda_lions', name: 'The Lucinda Lions', mascot: 'Lion', theme: 'Golden Royalty', primaryColor: '#FFD700', secondaryColor: '#DC143C', logo: 'portraits/logo_lucinda.png' },
    { id: 'kaelen_krakens', name: 'The Kaelen Krakens', mascot: 'Kraken', theme: 'Deep Sea Horrors', primaryColor: '#2E8B57', secondaryColor: '#4B0082', logo: 'portraits/logo_kaelen.png' },
    { id: 'theron_thunder', name: 'The Theron Thunder', mascot: 'Thunderbird', theme: 'Storm Lords', primaryColor: '#FFFF00', secondaryColor: '#708090', logo: 'portraits/logo_theron.png' },
    { id: 'sacre_scarabs', name: 'The Sacre Scarabs', mascot: 'Scarab', theme: 'Desert Sun-Weavers', primaryColor: '#800080', secondaryColor: '#F5F5DC', logo: 'portraits/logo_sacre.png' },
    { id: 'vane_vanguard', name: 'The Vane Vanguard', mascot: 'Shield', theme: 'Impenetrable Defenders', primaryColor: '#B0C4DE', secondaryColor: '#4169E1', logo: 'portraits/logo_vane.png' },
    { id: 'fenric_falcons', name: 'The Fenric Falcons', mascot: 'Falcon', theme: 'Sky Hunters', primaryColor: '#87CEEB', secondaryColor: '#FFFFFF', logo: 'portraits/logo_fenric.png' },
    { id: 'orion_owls', name: 'The Orion Owls', mascot: 'Owl', theme: 'Mystic Scholars', primaryColor: '#191970', secondaryColor: '#D3D3D3', logo: 'portraits/logo_orion.png' },
    { id: 'soren_serpents', name: 'The Soren Serpents', mascot: 'Serpent', theme: 'Jungle Stalkers', primaryColor: '#228B22', secondaryColor: '#32CD32', logo: 'portraits/logo_soren.png' },
    { id: 'valen_valkyries', name: 'The Valen Valkyries', mascot: 'Valkyrie', theme: 'Celestial Warriors', primaryColor: '#FFC0CB', secondaryColor: '#FFD700', logo: 'portraits/logo_valen.png' }
];

// Calculate contrast background color for team names
function getContrastColor(hexColor) {
    if (!hexColor) return 'rgba(0, 0, 0, 0.6)';
    // Remove hash
    hexColor = hexColor.replace('#', '');

    // Convert to RGB
    const r = parseInt(hexColor.substr(0, 2), 16);
    const g = parseInt(hexColor.substr(2, 2), 16);
    const b = parseInt(hexColor.substr(4, 2), 16);

    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // Return dark background for light colors, light background for dark colors
    return luminance > 0.5 ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.7)';
}

function calculateMaxHp(glad) {
    let baseHp = Math.floor(50 + ((glad.stats.con || 25) * 2));
    if (glad.class === 'Warrior') baseHp += 25;
    if (glad.class === 'Paladin') baseHp += 50;
    return baseHp;
}

const MALE_NAMES = ["Kaelen", "Theron", "Darius", "Zephyr", "Rian", "Caelum", "Vane", "Fenric", "Lucien", "Ronan", "Silas", "Cassian", "Evander", "Gael", "Idris", "Jace", "Kieran", "Leander", "Orion", "Soren", "Tavish", "Vorian", "Zane", "Alaric", "Bastian", "Darian", "Elias", "Finnick", "Gideon", "Halion", "Ilias", "Julian", "Kael", "Lorcan", "Mael", "Nico", "Oberon", "Pax", "Quintus", "Rhys", "Stellan", "Torin", "Urien", "Valen", "Wren", "Xander", "Yorick", "Zev", "Aegon", "Barris"];
const FEMALE_NAMES = ["Lyra", "Elara", "Seraphina", "Aria", "Isolde", "Maeve", "Freya", "Nova", "Amara", "Celeste", "Daphne", "Eira", "Fiona", "Gwen", "Hazel", "Iris", "Juno", "Kira", "Luna", "Mira", "Niamh", "Aura", "Petra", "Quinn", "Rhea", "Stella", "Thalassa", "Una", "Vera", "Willa", "Xanthe", "Yara", "Zara", "Aylin", "Bria", "Carys", "Dara", "Elin", "Faye", "Gia", "Halia", "Ianthe", "Jessa", "Kaia", "Lia", "Mina", "Nyssa", "Orla", "Pia", "Ria"];
const SURNAMES = ["Stormrider", "Nightshade", "Ironweave", "Silverleaf", "Bloodforge", "Swiftarrow", "Shadowwalker", "Dawnbreaker", "Frostbane", "Emberfall", "Starweaver", "Voidcaller", "Moonwhisper", "썬strike", "Wildblood", "Stoneheart", "Windrider", "Truthseeker", "Lightbringer", "Darkbane", "Flameheart", "Iceweaver", "Earthshaker", "Waterdancer", "Spiritwalker", "Soulreaper", "Dreamweaver", "Fateweaver", "Timekeeper", "Spacebender", "Mindreader", "Shadowcaster", "Lightweaver", "Stormcaller", "Firestarter", "Icebreaker", "Earthmover", "Waterbender", "Spiritguide", "Soulcatcher", "Dreamcatcher", "Fatechanger", "Timetraveler", "Spaceexplorer", "Mindcontroller", "Shadowweaver", "Lightbringer", "Stormchaser", "Fireweaver", "Iceweaver"];
