/**
 * js/data/events.js
 * 300 Random Events (3 per personality trait)
 * Outlines events, choices, and potential outcomes.
 */

const TRAIT_EVENTS = {
    // TEMPERAMENT (1-20)
    "stoic": [
        {
            id: "stoic_endurance",
            title: "Silent Resilience",
            description: "A heavy beam fell during training, but $NAME simply shrugged it off and kept working. The display of grit impressed the team.",
            outcome: { teamWide: true, hp: 120, news: "$NAME's stoicism boosted team resolve." }
        },
        {
            id: "stoic_meditation",
            title: "Inner Calm",
            description: "$NAME spent the morning in deep meditation while others bickered over rations. Their focus has never been sharper.",
            outcome: { stat: { wis: 2 }, news: "$NAME gained wisdom through meditation." }
        },
        {
            id: "stoic_discipline",
            title: "Monastic Focus",
            description: "$NAME spent their day cleaning every piece of equipment in the stable, refusing all breaks. Their discipline is contagious.",
            outcome: { stat: { con: 1 }, news: "$NAME's discipline hardened their constitution." }
        }
    ],
    "hot_headed": [
        {
            id: "hot_headed_brawl",
            title: "Tavern Scuffle",
            description: "$NAME took offense at a minor comment and started a brawl. They won, but took some bruises.",
            outcome: { hp: -50, news: "$NAME got into a fight at the local tavern." }
        },
        {
            id: "hot_headed_risk",
            title: "A Reckless Challenge",
            description: "$NAME challenged a local tough to an arm-wrestling match for gold. They were too angry to lose.",
            outcome: { gold: 50, news: "$NAME won a heated challenge." }
        },
        {
            id: "hot_headed_tantrum",
            title: "Equipment Smash",
            description: "$NAME smashed a training dummy in a fit of rage after a poor session. Gear needs replacing.",
            outcome: { gold: -100, news: "$NAME's temper caused property damage." }
        }
    ],
    "jovial": [
        {
            id: "jovial_feast",
            title: "Impromptu Celebration",
            description: "$NAME organized a small feast with some hidden wine. Everyone is in high spirits!",
            outcome: { teamWide: true, hp: 240, news: "$NAME's feast raised everyone's spirits." }
        },
        {
            id: "jovial_prank",
            title: "The Golden Bucket",
            description: "$NAME played a harmless prank on a rival team's coach. It was hilarious, and even the coach laughed.",
            outcome: { gold: 100, news: "A successful prank earned some local fame (and gold)." }
        },
        {
            id: "jovial_bond",
            title: "Hearty Laughter",
            description: "$NAME spent the day telling stories. The camaraderie has never been better.",
            outcome: { teamWide: true, stat: { wis: 1 }, news: "$NAME's stories improved team cohesion." }
        }
    ],
    "melancholic": [
        {
            id: "melancholic_poetry",
            title: "Somber Reflections",
            description: "$NAME spent the day writing mournful poetry. It was beautiful, but draining.",
            outcome: { hp: -60, stat: { int: 2 }, news: "$NAME reflected on the tragedy of the arena." }
        },
        {
            id: "melancholic_solitude",
            title: "A Glimpse of the End",
            description: "$NAME spent hours staring at the graveyard. They seem more prepared for their own end, in a dark way.",
            outcome: { stat: { wis: 1, con: 1 }, news: "$NAME's morbid focus hardened them." }
        },
        {
            id: "melancholic_withdrawal",
            title: "Deep Despair",
            description: "$NAME stayed in their room all day, refusing to eat. They seem physically weaker.",
            outcome: { hp: -100, news: "$NAME was overcome by a fit of melancholy." }
        }
    ],
    "sanguine": [
        {
            id: "sanguine_rush",
            title: "Bounding Energy",
            description: "$NAME woke up feeling invincible and ran twice the normal laps. They are brimming with vitality.",
            outcome: { hp: 360, news: "$NAME's optimism is restorative." }
        },
        {
            id: "sanguine_investment",
            title: "A Big Idea",
            description: "$NAME is sure their new 'surefire' business idea will work. They convinced you to invest.",
            choices: [
                { text: "Invest (200 G)", outcome: { chance: 0.4, gold: 600, news: "$NAME's idea was a goldmine!", alt_gold: -200, alt_news: "$NAME's business idea failed miserably." } },
                { text: "Politely Decline", outcome: { news: "You played it safe and declined the investment." } }
            ]
        },
        {
            id: "sanguine_rebound",
            title: "Always Next Time",
            description: "$NAME failed a drill but insisted they'll get it right tomorrow. Their spirit is infectious.",
            outcome: { hp: 120, news: "$NAME's positivity boosted the barracks." }
        }
    ],
    "phlegmatic": [
        {
            id: "phlegmatic_ignore",
            title: "Unfazed",
            description: "A rival tried to taunt $NAME. They didn't even look up from their bowl of porridge.",
            outcome: { wis: 1, news: "$NAME's steady aura calmed the team." }
        },
        {
            id: "phlegmatic_slow_and_steady",
            title: "Steady Progress",
            description: "$NAME didn't rush their training, but they didn't stop either. High quality work.",
            outcome: { stat: { con: 1 }, news: "$NAME's methodical approach is paying off." }
        },
        {
            id: "phlegmatic_efficiency",
            title: "Minimum Effort",
            description: "$NAME found the most efficient way to finish their chores, giving them more time for rest.",
            outcome: { hp: 180, news: "$NAME optimized their rest time." }
        }
    ],
    "volatile": [
        {
            id: "volatile_high",
            title: "Peak Performance",
            description: "$NAME is in an amazing mood today and is training like a demon.",
            outcome: { stat: { str: 2 }, news: "$NAME is on a high today." }
        },
        {
            id: "volatile_low",
            title: "The Deep Slump",
            description: "$NAME is in a terrible mood and won't leave their bunk.",
            outcome: { hp: -100, news: "$NAME is having a rough day emotionally." }
        },
        {
            id: "volatile_outburst",
            title: "Sudden Change",
            description: "During a friendly game, $NAME suddenly flipped the table and walked out.",
            outcome: { news: "$NAME's mood swung violently today." }
        }
    ],
    "cynical": [
        {
            id: "cynical_doubt",
            title: "Hard Truths",
            description: "$NAME pointed out all the flaws in your training plan. They're right, but it's annoying.",
            outcome: { stat: { int: 2 }, news: "$NAME's skepticism led to a better plan." }
        },
        {
            id: "cynical_reject",
            title: "Suspicious Gift",
            description: "A fan tried to give $NAME a lucky charm. They threw it away, calling it a 'tricky bribe'.",
            outcome: { news: "$NAME rejected a fan's gift." }
        },
        {
            id: "cynical_warning",
            title: "Conspiracy",
            description: "$NAME is convinced the next match is rigged and spent all day investigating.",
            outcome: { stat: { wis: 1 }, news: "$NAME's paranoia kept the team alert." }
        }
    ],
    "earnest": [
        {
            id: "earnest_overtime",
            title: "Extra Miles",
            description: "$NAME stayed late to practice their footwork. They are determined to do their best for you.",
            outcome: { stat: { dex: 1 }, hp: -60, news: "$NAME worked twice as hard today." }
        },
        {
            id: "earnest_confession",
            title: "The Honest Truth",
            description: "$NAME confessed they accidentally dented a shield. You appreciate the honesty.",
            outcome: { news: "$NAME's integrity impressed the roster." }
        },
        {
            id: "earnest_pledge",
            title: "Life Debt",
            description: "$NAME swore an oath to protect the team's honor. They mean every word.",
            outcome: { stat: { con: 1 }, news: "$NAME's commitment is unshakable." }
        }
    ],
    "flippant": [
        {
            id: "flippant_joke",
            title: "Bad Timing",
            description: "$NAME made a joke while the coach was explaining a life-saving maneuver.",
            outcome: { news: "$NAME's attitude is grating on the veterans." }
        },
        {
            id: "flippant_gamble",
            title: "Careless Bet",
            description: "$NAME bet their breakfast on a coin toss and lost. Now they're hungry.",
            outcome: { hp: -60, news: "$NAME's carelessness cost them a meal." }
        },
        {
            id: "flippant_lucky_break",
            title: "Accidental Win",
            description: "$NAME was messing around and accidentally discovered a new way to throw a net.",
            outcome: { stat: { dex: 1 }, news: "$NAME's goofing off actually helped." }
        }
    ],
    "curious": [
        {
            id: "curious_scavenge",
            title: "Forgotten Item",
            description: "$NAME was poking around the old stables and found a pouch of gold coins.",
            outcome: { gold: 120, news: "$NAME's curiosity led to a small treasure." }
        },
        {
            id: "curious_injury",
            title: "Forbidden Door",
            description: "$NAME touched something they shouldn't have in the blacksmith's shop and got a nasty burn.",
            outcome: { hp: -120, news: "$NAME's curiosity got them into trouble." }
        },
        {
            id: "curious_info",
            title: "Overheard Secret",
            description: "$NAME overheard a rival scout talking about a gladiator's old injury.",
            outcome: { stat: { int: 2 }, news: "$NAME learned some valuable intel." }
        }
    ],
    "apathetic": [
        {
            id: "apathetic_rest",
            title: "Minimum Necessary",
            description: "$NAME did the bare minimum and spent the rest of the day napping.",
            outcome: { hp: 180, news: "$NAME took it very easy today." }
        },
        {
            id: "apathetic_miss",
            title: "Lapsed Guard",
            description: "$NAME forgot to sharpen their blade today. It's dull and useless.",
            outcome: { news: "$NAME's lack of interest is becoming an issue." }
        },
        {
            id: "apathetic_boredom",
            title: "Pure Boredom",
            description: "$NAME is so bored they've started teaching a rat to do tricks.",
            outcome: { stat: { wis: 1 }, news: "$NAME found a strange way to pass the time." }
        }
    ],
    "introspective": [
        {
            id: "introspective_epiphany",
            title: "New Insight",
            description: "After hours of quiet thought, $NAME has a better understanding of their own fighting style.",
            outcome: { stat: { int: 2 }, news: "$NAME gained a new perspective on combat." }
        },
        {
            id: "introspective_quiet",
            title: "The Silent Day",
            description: "$NAME didn't speak a word all day, lost in their own mind.",
            outcome: { news: "$NAME is deep in thought." }
        },
        {
            id: "introspective_journal",
            title: "The Secret Scroll",
            description: "You found a scroll where $NAME has been documenting the team's tactics. It's brilliant.",
            outcome: { stat: { int: 1, wis: 1 }, news: "$NAME's reflections are helping the team." }
        }
    ],
    "gregarious": [
        {
            id: "gregarious_recruitment",
            title: "New Connection",
            description: "$NAME made friends with a wandering gladiator and convinced them to join the team's trials.",
            choices: [
                { text: "Recruit them (300 G)", outcome: { recruit: true, gold: -300, news: "$NAME brought a new face to the team." } },
                { text: "Passing by", outcome: { news: "$NAME's new friend moved on." } }
            ]
        },
        {
            id: "gregarious_party",
            title: "Social Butterfly",
            description: "$NAME spent the evening entertaining the local crowd. They brought back some tips.",
            outcome: { gold: 80, news: "$NAME's popularity earned us some coin." }
        },
        {
            id: "gregarious_distraction",
            title: "Too Much Talk",
            description: "$NAME's constant talking during drills slowed everyone down.",
            outcome: { news: "$NAME's social energy was a bit distracting today." }
        }
    ],
    "aloof": [
        {
            id: "aloof_observation",
            title: "Silent Watcher",
            description: "While others were playing dice, $NAME was watching a rival team practice. They saw several openings.",
            outcome: { stat: { int: 2 }, news: "$NAME's distance allowed for better scouting." }
        },
        {
            id: "aloof_resentment",
            title: "The Outsider",
            description: "$NAME's refusal to join the team meal caused some bad feelings in the barracks.",
            outcome: { news: "$NAME is distancing themselves from the team." }
        },
        {
            id: "aloof_perfection",
            title: "Private Drill",
            description: "$NAME worked on their own all day, achieving a level of focus others can't match.",
            outcome: { stat: { dex: 1 }, news: "$NAME's solitary training was very effective." }
        }
    ],
    "competitive": [
        {
            id: "competitive_spar",
            title: "High Stakes Spar",
            description: "$NAME challenged the strongest teammate to a spar for 50 gold.",
            choices: [
                { text: "Let them fight", outcome: { chance: 0.5, gold: 50, news: "$NAME won the wager!", alt_gold: -50, alt_news: "$NAME lost the wager." } },
                { text: "Stop them", outcome: { news: "You prevented the internal gambling." } }
            ]
        },
        {
            id: "competitive_push",
            title: "Beating the Best",
            description: "$NAME pushed themselves to the limit to beat a rival's record.",
            outcome: { stat: { str: 1, con: 1 }, hp: -60, news: "$NAME broke a training record." }
        },
        {
            id: "competitive_jealousy",
            title: "Sour Loser",
            description: "$NAME is upset they weren't named MVP and is working twice as hard in spite.",
            outcome: { stat: { str: 1 }, news: "$NAME is fueled by their competitive drive." }
        }
    ],
    "humble": [
        {
            id: "humble_aid",
            title: "Quiet Help",
            description: "$NAME spent the day helping a teammate fix their armor, asking for nothing in return.",
            outcome: { news: "$NAME's kindness improved team morale." }
        },
        {
            id: "humble_refusal",
            title: "No Praise Needed",
            description: "A fan tried to heap praise on $NAME, but they redirected it to the whole team.",
            outcome: { news: "$NAME's humility is becoming legendary." }
        },
        {
            id: "humble_service",
            title: "Silent Labor",
            description: "$NAME did the most difficult chores without being asked, just because it needed doing.",
            outcome: { hp: 120, news: "$NAME's quiet work kept the barracks running." }
        }
    ],
    "arrogant": [
        {
            id: "arrogant_demand",
            title: "Special Treatment",
            description: "$NAME demands a better weapon, claiming the current one is 'beneath them'.",
            choices: [
                { text: "Give in (200 G)", outcome: { gold: -200, stat: { str: 2 }, news: "$NAME got their way and feels powerful." } },
                { text: "Refuse", outcome: { news: "$NAME is sulking after your refusal." } }
            ]
        },
        {
            id: "arrogant_boast",
            title: "Tall Tales",
            description: "$NAME spent the day telling anyone who would listen how they're the best the arena has ever seen.",
            outcome: { news: "$NAME's ego is reaching new heights." }
        },
        {
            id: "arrogant_clash",
            title: "Insulted Noble",
            description: "$NAME insulted a visiting noble. We had to pay a fine to keep them out of trouble.",
            outcome: { gold: -150, news: "$NAME's big mouth cost us some gold." }
        }
    ],
    "neurotic": [
        {
            id: "neurotic_check",
            title: "Double Checking",
            description: "$NAME checked their armor straps fifty times today. They're certain something will break.",
            outcome: { stat: { wis: 1 }, news: "$NAME's nervousness kept them safe." }
        },
        {
            id: "neurotic_panic",
            title: "Night Terrors",
            description: "$NAME had a panic attack about the upcoming match and didn't sleep.",
            outcome: { hp: -180, news: "$NAME is frayed and anxious." }
        },
        {
            id: "neurotic_cleaning",
            title: "Nervous Habit",
            description: "$NAME spent the day obsessively cleaning the same blade until it shone like a mirror.",
            outcome: { stat: { dex: 1 }, news: "$NAME's nerves resulted in very clean gear." }
        }
    ],
    "resilient": [
        {
            id: "resilient_bounce",
            title: "Quick Recovery",
            description: "$NAME was injured in a spar but was back on their feet in hours. Impressive.",
            outcome: { hp: 360, news: "$NAME's body heals remarkably fast." }
        },
        {
            id: "resilient_mind",
            title: "Unshakable",
            description: "A series of setbacks would have broken another gladiator, but $NAME is just as focused as ever.",
            outcome: { stat: { wis: 1, con: 1 }, news: "$NAME's spirit is made of iron." }
        },
        {
            id: "resilient_endurance",
            title: "Stamina Plus",
            description: "$NAME outran everyone in the morning drills and looked like they could go for ten more miles.",
            outcome: { stat: { con: 2 }, news: "$NAME's endurance is peak." }
        }
    ],

    // COMBAT STYLE (21-40)
    "bloodthirsty": [
        {
            id: "bloodthirsty_frenzy",
            title: "Blood Moon",
            description: "$NAME spent hours sharpening their blade, muttering about the glory of the kill. They are unnervingly ready.",
            outcome: { stat: { str: 2 }, news: "$NAME's bloodlust is reaching a fever pitch." }
        },
        {
            id: "bloodthirsty_bounty",
            title: "Headhunter",
            description: "$NAME brought back a pouch of gold from a 'private disagreement' in the pits.",
            outcome: { gold: 150, news: "$NAME engaged in some unofficial pit-fighting." }
        },
        {
            id: "bloodthirsty_excess",
            title: "Too Far",
            description: "$NAME nearly killed a training partner in a 'friendly' sparring match. They had to be pulled away.",
            outcome: { news: "$NAME's aggression is causing fear among the team." }
        }
    ],
    "cautious": [
        {
            id: "cautious_armor",
            title: "Extra Padding",
            description: "$NAME spent the day reinforcing their armor with scavenged scrap metal. It's heavy, but safe.",
            outcome: { stat: { con: 2 }, news: "$NAME prioritized safety over speed." }
        },
        {
            id: "cautious_retreat",
            title: "Safe Path",
            description: "$NAME mapped out the quickest exits from the barracks. They feel more secure tonight.",
            outcome: { hp: 180, news: "$NAME made safety preparations." }
        },
        {
            id: "cautious_delay",
            title: "Over-analyzing",
            description: "$NAME spent so long checking for traps that they missed the morning training session entirely.",
            outcome: { hp: -60, news: "$NAME's caution delayed their training." }
        }
    ],
    "frenzied": [
        {
            id: "frenzied_bash",
            title: "Berserker Rage",
            description: "$NAME went into a trance-like state during drills and smashed a stone pillar. Terrifying.",
            outcome: { stat: { str: 3 }, hp: -120, news: "$NAME's wild energy is peaking." }
        },
        {
            id: "frenzied_scare",
            title: "Wild Eyes",
            description: "A local gang tried to harass our team. $NAME just stared at them until they ran away in terror.",
            outcome: { news: "$NAME's intense gaze intimidated some locals." }
        },
        {
            id: "frenzied_exhaustion",
            title: "The Crash",
            description: "$NAME pushed themselves so hard they collapsed and slept for 14 hours straight.",
            outcome: { hp: -120, news: "$NAME collapsed from pure exhaustion." }
        }
    ],
    "tactical": [
        {
            id: "tactical_map",
            title: "War Room",
            description: "$NAME spent the day sketching elaborate maps of the local arenas. They know every corner now.",
            outcome: { stat: { int: 2 }, news: "$NAME studied the arena layouts carefully." }
        },
        {
            id: "tactical_flank",
            title: "Flanking Drill",
            description: "$NAME organized a complex group drill. The team's coordination has significantly improved.",
            outcome: { stat: { dex: 1, wis: 1 }, news: "$NAME led a tactical training session." }
        },
        {
            id: "tactical_supply",
            title: "Logistical Win",
            description: "$NAME noticed a more efficient way to store and transport our gear, saving us time and money.",
            outcome: { gold: 80, news: "$NAME optimized the team's logistics." }
        }
    ],
    "defensive": [
        {
            id: "defensive_wall",
            title: "Living Bastion",
            description: "$NAME stood in the rain for hours, practicing their shield-stance. They are immovable.",
            outcome: { stat: { con: 2 }, news: "$NAME worked on their defensive form." }
        },
        {
            id: "defensive_parry",
            title: "Perfect Parry",
            description: "$NAME spent the day teaching the juniors how to turn a strike aside rather than taking it full on.",
            outcome: { hp: 120, news: "$NAME's defensive tips helped the whole roster." }
        },
        {
            id: "defensive_slow",
            title: "Dull Blade",
            description: "$NAME is so focused on shields that they've neglected their offensive training.",
            outcome: { news: "$NAME is falling behind in offensive drills." }
        }
    ],
    "aggressive": [
        {
            id: "aggressive_strike",
            title: "First Blood",
            description: "$NAME insisted on being the first to spar, and they didn't hold back. They are ready for any fight.",
            outcome: { stat: { str: 1, dex: 1 }, news: "$NAME's aggression is contagious." }
        },
        {
            id: "aggressive_loot",
            title: "Hostile Takeover",
            description: "$NAME 'persuaded' a rival scout to leave the area and leave behind their coin purse.",
            outcome: { gold: 110, news: "$NAME aggressively chased off a rival scout." }
        },
        {
            id: "aggressive_injury",
            title: "Over-extension",
            description: "$NAME swung so hard they pulled a muscle. They need to learn when to stop.",
            outcome: { hp: -60, news: "$NAME over-exerted themselves in a fit of aggression." }
        }
    ],
    "opportunistic": [
        {
            id: "opportunistic_find",
            title: "Scavenger's Luck",
            description: "$NAME found a discarded, high-quality weapon after a match ended. We can sell it or use it for parts.",
            outcome: { gold: 200, news: "$NAME scavenged something valuable." }
        },
        {
            id: "opportunistic_weakness",
            title: "Vulture's Eyes",
            description: "$NAME noticed a structural weakness in the opponent's gate. This info might be useful...",
            outcome: { stat: { int: 1 }, news: "$NAME found a tactical advantage." }
        },
        {
            id: "opportunistic_betrayal",
            title: "Switching Sides",
            description: "$NAME was caught trying to steal from our own supply chest. They claim it was just a 'test' of our security.",
            choices: [
                { text: "Fine them (200 G)", outcome: { gold: 200, news: "You fined $NAME for their 'test'." } },
                { text: "Forgive them", outcome: { news: "You let $NAME's shady behavior slide." } }
            ]
        }
    ],
    "reckless": [
        {
            id: "reckless_leap",
            title: "Leap of Faith",
            description: "$NAME jumped off the barracks roof for a dare. It was impressive, but they broke a toe.",
            outcome: { hp: -120, news: "$NAME did something incredibly stupid for a dare." }
        },
        {
            id: "reckless_gambit",
            title: "All-In",
            description: "$NAME bet half their pay on a single roll of the dice and actually won!",
            outcome: { gold: 150, news: "$NAME's reckless gambling paid off." }
        },
        {
            id: "reckless_charge",
            title: "No Fear",
            description: "$NAME charged headfirst into a training obstacle. They're battered, but their courage is higher than ever.",
            outcome: { hp: -60, stat: { str: 2 }, news: "$NAME's recklessness grew their strength." }
        }
    ],
    "mercy_giver": [
        {
            id: "mercy_charity",
            title: "A Kind Soul",
            description: "$NAME gave half their meal to a beggar at the gates. The local populace seems to like us more now.",
            outcome: { gold: -50, news: "$NAME's charity bought us some goodwill." }
        },
        {
            id: "mercy_healing",
            title: "Gentle Touch",
            description: "$NAME spent the day tending to the sick. They've learned a lot about the human body.",
            outcome: { stat: { wis: 2 }, news: "$NAME studied healing techniques." }
        },
        {
            id: "mercy_hesitation",
            title: "Soft Heart",
            description: "$NAME hesitated during a finishing drill, unable to bring themselves to deliver the killing blow to an animal.",
            outcome: { news: "$NAME is struggling with the brutal nature of the arena." }
        }
    ],
    "ruthless": [
        {
            id: "ruthless_interrogation",
            title: "Dark Methods",
            description: "$NAME 'convinced' a city guard to ignore our lack of permits. It wasn't pretty.",
            outcome: { gold: 100, news: "$NAME used ruthless tactics to save us some trouble." }
        },
        {
            id: "ruthless_training",
            title: "No Mercy",
            description: "$NAME made a junior gladiator cry during training. It was brutal, but the junior's defense is much better now.",
            outcome: { stat: { str: 1 }, news: "$NAME's ruthless training methods were effective." }
        },
        {
            id: "ruthless_poison",
            title: "Back Alley Deal",
            description: "$NAME was seen buying 'supplements' from a shady merchant. Best not to ask what they are.",
            outcome: { gold: -100, stat: { con: 2 }, hp: -120, news: "$NAME compromised their health for power." }
        }
    ],
    "precise": [
        {
            id: "precise_practice",
            title: "Pinpoint Accuracy",
            description: "$NAME spent the day hitting a target the size of a coin from fifty paces.",
            outcome: { stat: { dex: 2 }, news: "$NAME's precision is reaching new heights." }
        },
        {
            id: "precise_anatomy",
            title: "Vital Knowledge",
            description: "$NAME spent hours studying anatomical diagrams, learning exactly where to strike for maximum effect.",
            outcome: { stat: { int: 1, wis: 1 }, news: "$NAME studied the body's weak points." }
        },
        {
            id: "precise_mending",
            title: "Fine Repair",
            description: "$NAME used their steady hands to repair some delicate gear that everyone else had given up on.",
            outcome: { gold: 90, news: "$NAME saved us money on equipment repairs." }
        }
    ],
    "unorthodox": [
        {
            id: "unorthodox_dance",
            title: "Strange Rhythm",
            description: "$NAME spent the day practicing a combat style that looks more like dancing. It's confusing to watch.",
            outcome: { stat: { dex: 1, int: 1 }, news: "$NAME's strange style is developing well." }
        },
        {
            id: "unorthodox_weapon",
            title: "Improvised Tool",
            description: "$NAME spent the day training with a heavy chain instead of a sword. It's effective, somehow.",
            outcome: { stat: { str: 1 }, news: "$NAME experimented with unorthodox weaponry." }
        },
        {
            id: "unorthodox_insight",
            title: "Weird Idea",
            description: "$NAME suggests we change our defensive formations to something totally illogical.",
            choices: [
                { text: "Try it", outcome: { chance: 0.5, news: "$NAME's weird formation was a genius move!", alt_news: "The new formation was a disaster." } },
                { text: "Reject it", outcome: { news: "You stuck to traditional methods." } }
            ]
        }
    ],
    "relentless": [
        {
            id: "relentless_overdrive",
            title: "No Sleep",
            description: "$NAME has been training for 24 hours straight. They are practically a machine.",
            outcome: { stat: { con: 2 }, hp: -60, news: "$NAME's relentless drive is literal." }
        },
        {
            id: "relentless_pursuit",
            title: "Never Let Go",
            description: "$NAME chased down a pickpocket through three districts, finally catching them through pure stamina.",
            outcome: { gold: 120, news: "$NAME's persistence recovered some stolen gold." }
        },
        {
            id: "relentless_will",
            title: "Unbroken",
            description: "Despite a nagging injury, $NAME refused to miss a single second of training.",
            outcome: { stat: { str: 1 }, news: "$NAME's tenacity is a model for the team." }
        }
    ],
    "skittish": [
        {
            id: "skittish_flee",
            title: "Shadows and Dust",
            description: "$NAME was spooked by a loud bang and hid in the cellar for the rest of the day.",
            outcome: { hp: -60, news: "$NAME was easily rattled today." }
        },
        {
            id: "skittish_awareness",
            title: "High Alert",
            description: "$NAME is so nervous they notice every tiny movement. Nothing gets past them.",
            outcome: { stat: { dex: 1, wis: 1 }, news: "$NAME's nervousness kept them alert." }
        },
        {
            id: "skittish_comfort",
            title: "Warm Meal",
            description: "$NAME needs some reassurance. A good meal and some kind words would go a long way.",
            choices: [
                { text: "Support them (30 G)", outcome: { gold: -30, hp: 360, news: "You helped $NAME find their courage." } },
                { text: "Let them be", outcome: { hp: -120, news: "$NAME is feeling neglected." } }
            ]
        }
    ],
    "valiant": [
        {
            id: "valiant_rescue",
            title: "Heroic Deed",
            description: "$NAME saved a child from a runaway carriage. The city is talking about their bravery.",
            outcome: { gold: 100, news: "$NAME's heroism brought positive attention." }
        },
        {
            id: "valiant_challenge",
            title: "Champion's Stand",
            description: "$NAME challenged a veteran gladiator to a spar to prove our team's worth. They held their own.",
            outcome: { stat: { str: 1, wis: 1 }, news: "$NAME fought a valiant sparring match." }
        },
        {
            id: "valiant_inspiration",
            title: "Inner Light",
            description: "$NAME's sheer presence makes everyone feel braver. It's almost magical.",
            outcome: { hp: 120, news: "$NAME's valor gave the team a boost." }
        }
    ],
    "efficient": [
        {
            id: "efficient_shortcut",
            title: "Maximum Gain",
            description: "$NAME figured out how to do the entire training routine in half the time with double the results.",
            outcome: { stat: { str: 1, dex: 1 }, hp: 240, news: "$NAME found an efficient training path." }
        },
        {
            id: "efficient_save",
            title: "Penny Pincher",
            description: "$NAME found a way to reuse old bandages and oil, saving us a surprising amount of gold.",
            outcome: { gold: 70, news: "$NAME cut down on daily expenses." }
        },
        {
            id: "efficient_minimalism",
            title: "Done and Dusted",
            description: "$NAME finished their work early and spent the rest of the day resting. Wise.",
            outcome: { hp: 360, news: "$NAME managed their energy perfectly." }
        }
    ],
    "showy": [
        {
            id: "showy_performance",
            title: "Crowd Pleaser",
            description: "$NAME performed for coins in the square. Their style is undeniable.",
            outcome: { gold: 130, news: "$NAME earned some coin through flash and flair." }
        },
        {
            id: "showy_clothes",
            title: "Fine Silk",
            description: "$NAME insisted on buying a new, brightly colored cape. It looks great, but it was expensive.",
            outcome: { gold: -100, news: "$NAME's vanity cost the team." }
        },
        {
            id: "showy_accident",
            title: "The Wrong Move",
            description: "$NAME tried a flashy flip during practice and landed on their head. Embarrassing and painful.",
            outcome: { hp: -180, news: "$NAME's style got the better of them." }
        }
    ],
    "determined": [
        {
            id: "determined_focus",
            title: "Single Minded",
            description: "$NAME has decided they will master the poleaxe. They didn't stop until they could split a hair.",
            outcome: { stat: { str: 2 }, news: "$NAME's determination is paying off." }
        },
        {
            id: "determined_recovery",
            title: "Will to Live",
            description: "$NAME simply refused to stay sick today. They willed their body back to health.",
            outcome: { hp: 480, news: "$NAME's iron will sped up their recovery." }
        },
        {
            id: "determined_stand",
            title: "Unshakable",
            description: "No matter how hard the drill, $NAME would not quit. Their resolve is inspiring.",
            outcome: { stat: { con: 1 }, news: "$NAME's determination is an asset." }
        }
    ],
    "calculating": [
        {
            id: "calculating_market",
            title: "Market Analysis",
            description: "$NAME spent the day analyzing the price of gladiator gear. They know exactly when to buy.",
            outcome: { gold: 120, news: "$NAME's math saved us some coin." }
        },
        {
            id: "calculating_weakness",
            title: "The Math of Death",
            description: "$NAME spent the day calculating the optimal angle for a killing blow. Cold, but effective.",
            outcome: { stat: { int: 2 }, news: "$NAME analyzed combat efficiency." }
        },
        {
            id: "calculating_scheme",
            title: "A Risky Plan",
            description: "$NAME has a complex plan to rig a local minor match to our advantage.",
            choices: [
                { text: "Agree", outcome: { chance: 0.4, news: "The plan worked! You made a killing.", alt_news: "The authorities caught wind of the scheme!" } },
                { text: "Reject", outcome: { news: "You played it safe." } }
            ]
        }
    ],
    "feral": [
        {
            id: "feral_instinct",
            title: "Wild Hunter",
            description: "$NAME disappeared into the woods and came back with a fresh deer and some mountain herbs.",
            outcome: { hp: 240, gold: 30, news: "$NAME's hunting provided for the team." }
        },
        {
            id: "feral_bite",
            title: "Animalistic",
            description: "$NAME bit a training partner during an intense grapple. We had to pay for the stitches.",
            outcome: { gold: -60, news: "$NAME's wild side got out of control." }
        },
        {
            id: "feral_strength",
            title: "Primal Power",
            description: "$NAME spent the day roaring and lifting heavy boulders. They seem more beast than man.",
            outcome: { stat: { str: 2, con: 1, int: -1 }, news: "$NAME embraced their feral nature." }
        }
    ],
    // ETHICS & LOYALTY (41-60)
    "honorable": [
        {
            id: "honorable_duel",
            title: "Fair Fight",
            description: "$NAME refused to attack a defenseless opponent during a street disagreement. Their honor is intact.",
            outcome: { stat: { wis: 2 }, news: "$NAME's code of honor stayed strong." }
        },
        {
            id: "honorable_return",
            title: "Returned Gold",
            description: "$NAME found a merchant's lost bag and returned it without taking a single coin. The merchant rewarded the team.",
            outcome: { gold: 200, news: "$NAME's honesty brought a reward." }
        },
        {
            id: "honorable_stand",
            title: "Defense of the Weak",
            description: "$NAME stood up for a local servant being harassed by guards. They were bruised but the servant is safe.",
            outcome: { hp: -120, news: "$NAME's honor is the talk of the town." }
        }
    ],
    "mercenary": [
        {
            id: "mercenary_bonus",
            title: "Extra Pay",
            description: "$NAME insists they need a 'performance bonus' to stay focused on the next match.",
            choices: [
                { text: "Pay them (150 G)", outcome: { gold: -150, stat: { str: 2 }, news: "$NAME's loyalty was bought... for today." } },
                { text: "Refuse", outcome: { news: "$NAME is doing the bare minimum." } }
            ]
        },
        {
            id: "mercenary_side_job",
            title: "Moonlighting",
            description: "$NAME took a job as an escort for a caravan during their time off. They brought back gold.",
            outcome: { gold: 120, news: "$NAME made some coin on the side." }
        },
        {
            id: "mercenary_negotiation",
            title: "Cold Business",
            description: "$NAME negotiated a better deal for our supplies, saving us some gold to keep for themselves.",
            outcome: { gold: 60, news: "$NAME's business sense saved us coin." }
        }
    ],
    "loyal": [
        {
            id: "loyal_shield",
            title: "Human Shield",
            description: "During a riot near the barracks, $NAME stood in front of you, taking a stone to the head.",
            outcome: { hp: -240, news: "$NAME's loyalty is beyond question." }
        },
        {
            id: "loyal_refusal",
            title: "Bribe Refused",
            description: "A rival team tried to bribe $NAME to throw the next match. They laughed in the scout's face.",
            outcome: { stat: { wis: 1 }, news: "$NAME's loyalty is ironclad." }
        },
        {
            id: "loyal_extra_effort",
            title: "For the Team",
            description: "$NAME inspired the roster with a speech about brotherhood. Everyone is training harder.",
            outcome: { hp: 120, news: "$NAME's devotion is infectious." }
        }
    ],
    "treacherous": [
        {
            id: "treacherous_theft",
            title: "Broken Trust",
            description: "$NAME was caught stealing from the team's medical supplies to sell them.",
            choices: [
                { text: "Lash them", outcome: { hp: -100, news: "You punished $NAME for their betrayal." } },
                { text: "Banish them", outcome: { remove: true, news: "You kicked $NAME off the team." } }
            ]
        },
        {
            id: "treacherous_leak",
            title: "Loose Lips",
            description: "$NAME sold our tactical secrets to a rival for a pint of ale.",
            outcome: { news: "Our secrets have been exposed by $NAME." }
        },
        {
            id: "treacherous_shadow",
            title: "Shady Deal",
            description: "$NAME was seen talking to a known assassin. They claim it was 'nothing'.",
            outcome: { news: "$NAME's behavior is highly suspicious." }
        }
    ],
    "idealistic": [
        {
            id: "idealistic_prayer",
            title: "Pure Glory",
            description: "$NAME spent the day cleaning the arena, believing it to be a sacred place of talent.",
            outcome: { stat: { wis: 1 }, news: "$NAME's faith in the arena is inspiring." }
        },
        {
            id: "idealistic_speech",
            title: "Better World",
            description: "$NAME gave a speech about how gladiators should be honored as heroes, not slaves.",
            outcome: { hp: 120, news: "$NAME's words raised team morale." }
        },
        {
            id: "idealistic_loss",
            title: "Shattered Dreams",
            description: "$NAME witnessed a fixed match and is deeply depressed by the lack of honor.",
            outcome: { hp: -60, news: "$NAME's ideals are taking a hit." }
        }
    ],
    "greedy": [
        {
            id: "greedy_hoard",
            title: "Stashed Gold",
            description: "You found a stash of gold $NAME had been hiding from the team's shared purse.",
            choices: [
                { text: "Seize it (400 G)", outcome: { gold: 400, news: "You reclaimed the team's gold." } },
                { text: "Let them keep it", outcome: { news: "You let $NAME's greed slide." } }
            ]
        },
        {
            id: "greedy_extortion",
            title: "The Toll",
            description: "$NAME 'charged' local merchants for 'protection'. They brought back a lot of gold.",
            outcome: { gold: 300, news: "$NAME's greed brought in significant coin." }
        },
        {
            id: "greedy_scraps",
            title: "Bottom Line",
            description: "$NAME refused to share their high-quality whetstone with the team.",
            outcome: { news: "$NAME's selfishness is causing friction." }
        }
    ],
    "selfless": [
        {
            id: "selfless_ration",
            title: "Giving Soul",
            description: "$NAME gave their meat ration to a hungry teammate who was struggling with recovery.",
            outcome: { hp: -60, news: "$NAME's sacrifice helped a teammate." }
        },
        {
            id: "selfless_training",
            title: "Mentor",
            description: "$NAME spent their free time training the newest recruit instead of resting.",
            outcome: { news: "$NAME's selflessness is improving the roster." }
        },
        {
            id: "selfless_risk",
            title: "Took the Blow",
            description: "In a training accident, $NAME pushed a teammate out of the way of a falling gate.",
            outcome: { stat: { con: 2 }, hp: -120, news: "$NAME risked themselves for another." }
        }
    ],
    "vengeful": [
        {
            id: "vengeful_scout",
            title: "Old Grudge",
            description: "$NAME found the person who sold them into slavery and... 'dealt' with them.",
            outcome: { stat: { str: 1, dex: 1 }, news: "$NAME found closure through violence." }
        },
        {
            id: "vengeful_sabotage",
            title: "Get Even",
            description: "$NAME sabotaged the equipment of a gladiator who beat them last season.",
            outcome: { news: "$NAME's pursuit of revenge is relentless." }
        },
        {
            id: "vengeful_fire",
            title: "Burning Hate",
            description: "$NAME spent the day training harder than anyone, fueled by pure spite.",
            outcome: { stat: { str: 2 }, hp: -120, news: "$NAME's hatred is a powerful motivator." }
        }
    ],
    "honest": [
        {
            id: "honest_report",
            title: "The Truth Hurts",
            description: "$NAME admitted they were the one who broke the training dummy, even though no one saw.",
            outcome: { news: "$NAME's honesty is commendable." }
        },
        {
            id: "honest_witness",
            title: "Pure Testimony",
            description: "$NAME's honest account of a street fight saved a teammate from a jail sentence.",
            outcome: { news: "$NAME's integrity saved a teammate." }
        },
        {
            id: "honest_fail",
            title: "Brutal Honesty",
            description: "$NAME told the coach exactly why their new strategy is terrible. It was awkward.",
            outcome: { news: "$NAME's honesty caused some social tension." }
        }
    ],
    "deceptive": [
        {
            id: "deceptive_cheat",
            title: "Rigged Dice",
            description: "$NAME won 100 gold from the city guards using a pair of loaded dice.",
            outcome: { gold: 100, news: "$NAME's tricks paid off today." }
        },
        {
            id: "deceptive_frown",
            title: "Fake Injury",
            description: "$NAME pretended to be sick to skip training. They spent the day at the docks.",
            outcome: { hp: 120, news: "$NAME's deceit gave them a day of rest." }
        },
        {
            id: "deceptive_scout",
            title: "Deep Cover",
            description: "$NAME infiltrated a rival camp by pretending to be a runaway and brought back intel.",
            outcome: { stat: { int: 2 }, news: "$NAME's lies were very useful." }
        }
    ],
    "pious": [
        {
            id: "pious_blessing",
            title: "Divine Favor",
            description: "$NAME spent the day in prayer. They claim they feel the gods watching over them.",
            outcome: { hp: 240, news: "$NAME's faith is restorative." }
        },
        {
            id: "pious_tithe",
            title: "Generous Offering",
            description: "$NAME gave a large portion of the team's gold to the temple 'for protection'.",
            outcome: { gold: -200, news: "$NAME's piety cost the team some coin." }
        },
        {
            id: "pious_miracle",
            title: "Strong Spirit",
            description: "$NAME's unshakable faith in the face of a loss encouraged the whole team.",
            outcome: { stat: { wis: 1 }, news: "$NAME's spirituality is a cornerstone for the team." }
        }
    ],
    "rebellious": [
        {
            id: "rebellious_refusal",
            title: "I Won't",
            description: "$NAME refused to clean the stables, leading to a loud argument with the coach.",
            outcome: { news: "$NAME is challenging authority again." }
        },
        {
            id: "rebellious_shave",
            title: "Non-Conformist",
            description: "$NAME dyed their hair a bright, garish color just to annoy the team owner.",
            outcome: { news: "$NAME's defiance is visible for all to see." }
        },
        {
            id: "rebellious_escape",
            title: "Night Out",
            description: "$NAME snuck out of the barracks at night. They came back tired but happy.",
            outcome: { hp: -60, news: "$NAME broke curfew." }
        }
    ],
    "disciplined": [
        {
            id: "disciplined_drill",
            title: "Perfection",
            description: "$NAME performed the same strike 1,000 times today. Their form is flawless.",
            outcome: { stat: { dex: 2 }, news: "$NAME's discipline is yielding results." }
        },
        {
            id: "disciplined_routine",
            title: "Clockwork",
            description: "$NAME organized the barracks, making sure everything is in its proper place.",
            outcome: { hp: 60, news: "$NAME's orderliness improved the living space." }
        },
        {
            id: "disciplined_wait",
            title: "Immovable",
            description: "$NAME stood guard for 8 hours without moving an inch. Their focus is absolute.",
            outcome: { stat: { con: 1 }, news: "$NAME's discipline is a model for the team." }
        }
    ],
    "principled": [
        {
            id: "principled_refusal",
            title: "Clean Hands",
            description: "$NAME refused to use a poisoned blade during training, even though it was allowed.",
            outcome: { news: "$NAME's principles are more important than victory." }
        },
        {
            id: "principled_stand",
            title: "The Right Choice",
            description: "$NAME spoke out against a cruel punishment being given to a local slave.",
            outcome: { news: "$NAME's moral compass is strong." }
        },
        {
            id: "principled_trust",
            title: "Man of Words",
            description: "A merchant agreed to a deal based solely on $NAME's word. Their reputation is growing.",
            outcome: { gold: 100, news: "$NAME's principles saved us gold." }
        }
    ],
    "selfish": [
        {
            id: "selfish_meal",
            title: "Extra Rations",
            description: "$NAME stole an extra meal from the stores, leaving a teammate hungry.",
            outcome: { hp: 240, news: "$NAME prioritized their own hunger." }
        },
        {
            id: "selfish_glory",
            title: "All Me",
            description: "$NAME hogged the center of the training ring all day, preventing others from practicing.",
            outcome: { stat: { str: 1 }, news: "$NAME's ego is getting in the way." }
        },
        {
            id: "selfish_theft",
            title: "Private Stash",
            description: "$NAME was caught hiding medical supplies for their own exclusive use.",
            outcome: { news: "$NAME is only looking out for themselves." }
        }
    ],
    "ambitious": [
        {
            id: "ambitious_networking",
            title: "Climbing the Ladder",
            description: "$NAME spent the evening talking to several high-profile arena scouts.",
            outcome: { news: "$NAME is looking to make a name for themselves." }
        },
        {
            id: "ambitious_training",
            title: "Overdrive",
            description: "$NAME took on a significantly more dangerous training regime to speed up their growth.",
            outcome: { stat: { str: 1, dex: 1, con: 1 }, hp: -180, news: "$NAME's ambition is pushing them hard." }
        },
        {
            id: "ambitious_scheme",
            title: "Power Play",
            description: "$NAME suggested a way to undermine a rival team's leader.",
            choices: [
                { text: "Approve", outcome: { chance: 0.5, news: "The plan worked! Rival weakened.", alt_news: "The plan failed and backfired." } },
                { text: "Dismiss", outcome: { news: "You rejected $NAME's shady ambition." } }
            ]
        }
    ],
    "stoical_loyalty": [
        {
            id: "stoical_loyalty_silent",
            title: "Unspoken Vow",
            description: "$NAME stood in the rain to guard the equipment while others were at the tavern.",
            outcome: { con: 1, news: "$NAME's quiet loyalty is a blessing." }
        },
        {
            id: "stoical_loyalty_blow",
            title: "Took the Hit",
            description: "$NAME accepted a punishment for a mistake another teammate made.",
            outcome: { hp: -60, news: "$NAME's loyalty is self-sacrificing." }
        },
        {
            id: "stoical_loyalty_steady",
            title: "Rock of the Team",
            description: "$NAME's steady presence prevented a team argument from escalating into a fight.",
            outcome: { news: "$NAME's loyalty kept the team together." }
        }
    ],
    "corruptible": [
        {
            id: "corruptible_bribe",
            title: "The Offer",
            description: "A shady man offered $NAME gold to leak our training schedule. They look tempted.",
            choices: [
                { text: "Match the bribe (200 G)", outcome: { gold: -200, news: "You bought $NAME's silence." } },
                { text: "Ignore it", outcome: { chance: 0.6, news: "$NAME resisted the temptation.", alt_news: "$NAME sold the info!" } }
            ]
        },
        {
            id: "corruptible_shortcut",
            title: "Easy Path",
            description: "$NAME was caught using illegal performance stimulants from a back-alley merchant.",
            outcome: { stat: { str: 2 }, hp: -120, news: "$NAME chose power over health." }
        },
        {
            id: "corruptible_betrayal",
            title: "Greener Pastures",
            description: "$NAME was seen talking to a recruiter for a rival team.",
            outcome: { news: "$NAME's loyalty is clearly for sale." }
        }
    ],
    "righteous": [
        {
            id: "righteous_judgment",
            title: "Moral Stand",
            description: "$NAME refused to work with a teammate they consider 'unclean' or 'sinful'.",
            outcome: { news: "$NAME's rigid morality is causing friction." }
        },
        {
            id: "righteous_crusade",
            title: "Holy War",
            description: "$NAME spent the day preaching to the other gladiators about the one true way.",
            outcome: { stat: { wis: 1 }, news: "$NAME's fervor is intense." }
        },
        {
            id: "righteous_aid",
            title: "Blessed Hands",
            description: "$NAME spent the day tending the poor in the city's slums. A noble act.",
            outcome: { news: "$NAME's righteousness brought us goodwill." }
        }
    ],
    "empathetic": [
        {
            id: "empathetic_bond",
            title: "Shared Pain",
            description: "$NAME spent the night by the bedside of a wounded teammate, offering comfort.",
            outcome: { teamWide: true, hp: 120, news: "$NAME's empathy helped a teammate recover." }
        },
        {
            id: "empathetic_distress",
            title: "Heavy Heart",
            description: "$NAME is so affected by a teammate's injury that they can't even train today.",
            outcome: { hp: -60, news: "$NAME is struggling with their emotions." }
        },
        {
            id: "empathetic_aid",
            title: "True Kindness",
            description: "$NAME spent their own gold to buy medicine for a local orphan. It was a noble act.",
            outcome: { stat: { wis: 2 }, news: "$NAME's compassion is truly notable." }
        }
    ],

    // HABITS & QUIRKS (61-80)
    "gambler": [
        {
            id: "gambler_win",
            title: "Big Winner",
            description: "$NAME won a high-stakes dice game at the local tavern.",
            outcome: { gold: 250, news: "$NAME's gambling paid off today." }
        },
        {
            id: "gambler_loss",
            title: "Bad Luck",
            description: "$NAME lost a significant amount of the team's gold in a card game.",
            outcome: { gold: -200, news: "$NAME's luck ran out." }
        },
        {
            id: "gambler_risk",
            title: "Double or Nothing",
            description: "$NAME wants to bet our next match's winnings for a chance at double the prize.",
            choices: [
                { text: "Accept Bet", outcome: { chance: 0.5, news: "You're in! High stakes ahead.", alt_news: "Risky move, but you're committed." } },
                { text: "Decline", outcome: { news: "You played it safe." } }
            ]
        }
    ],
    "gourmet": [
        {
            id: "gourmet_feast",
            title: "True Flavor",
            description: "$NAME found a rare spice in the market and prepared an amazing meal. Everyone feels great.",
            outcome: { hp: 300, news: "$NAME's cooking revitalized the team." }
        },
        {
            id: "gourmet_hunger",
            title: "Poor Rations",
            description: "$NAME refused to eat the standard gruel and is feeling weak as a result.",
            outcome: { hp: -60, news: "$NAME is pining for better food." }
        },
        {
            id: "gourmet_expensive",
            title: "Fine Dining",
            description: "$NAME spent a huge chunk of gold on a single bottle of imported wine.",
            outcome: { gold: -150, news: "$NAME's refined taste is expensive." }
        }
    ],
    "insomniac": [
        {
            id: "insomniac_training",
            title: "Night Drills",
            description: "$NAME couldn't sleep, so they spent the night practicing by moonlight.",
            outcome: { stat: { dex: 1 }, hp: -60, news: "$NAME's sleeplessness led to extra practice." }
        },
        {
            id: "insomniac_exhaustion",
            title: "Sleep Deprivation",
            description: "$NAME's lack of sleep has finally caught up with them. They are a mess.",
            outcome: { hp: -180, news: "$NAME is suffering from extreme fatigue." }
        },
        {
            id: "insomniac_watch",
            title: "Eagle Eyes",
            description: "Because $NAME was awake all night, they caught a thief trying to enter the barracks.",
            outcome: { news: "$NAME's insomnia kept us safe." }
        }
    ],
    "superstitious": [
        {
            id: "superstitious_ritual",
            title: "Lucky Ritual",
            description: "$NAME insists on wearing their socks inside out for 'luck'. Others are laughing, but $NAME feels great.",
            outcome: { hp: 120, news: "$NAME's strange ritual gave them a mental boost." }
        },
        {
            id: "superstitious_omen",
            title: "Dark Crow",
            description: "$NAME saw a black bird and refuses to train today, fearing it's a sign of death.",
            outcome: { hp: -60, news: "$NAME is spooked by an omen." }
        },
        {
            id: "superstitious_shrine",
            title: "Small Offering",
            description: "$NAME built a tiny shrine to a forgotten god in the corner of the barracks.",
            outcome: { stat: { wis: 1 }, news: "$NAME found comfort in their beliefs." }
        }
    ],
    "literate": [
        {
            id: "literate_scout",
            title: "Read the Plans",
            description: "$NAME was able to read a discarded letter from a rival manager.",
            outcome: { stat: { int: 2 }, news: "$NAME's reading skills provided valuable intel." }
        },
        {
            id: "literate_teach",
            title: "Schooling",
            description: "$NAME spent the afternoon teaching a teammate how to write their own name.",
            outcome: { stat: { wis: 1 }, news: "$NAME's literacy is helping the roster's education." }
        },
        {
            id: "literate_history",
            title: "Old Texts",
            description: "$NAME found an old book on legendary combat styles and studied it for hours.",
            outcome: { stat: { int: 1, dex: 1 }, news: "$NAME studied ancient techniques." }
        }
    ],
    "musician": [
        {
            id: "musician_song",
            title: "Comforting Tune",
            description: "$NAME played a soft melody on their flute, helping everyone sleep better tonight.",
            outcome: { hp: 180, news: "$NAME's music was very restful." }
        },
        {
            id: "musician_street",
            title: "Busing",
            description: "$NAME played their instrument in the town square and earned some coins.",
            outcome: { gold: 60, news: "$NAME's music brought in some extra gold." }
        },
        {
            id: "musician_disraction",
            title: "Loud Practice",
            description: "$NAME's late-night practice on the drums kept everyone awake.",
            outcome: { teamWide: true, hp: -60, news: "$NAME's music was a bit much today." }
        }
    ],
    "early_bird": [
        {
            id: "early_bird_dawn",
            title: "First Light",
            description: "$NAME was already training when the sun came up, catching the freshest air and best light.",
            outcome: { stat: { con: 1 }, news: "$NAME is always the first one up." }
        },
        {
            id: "early_bird_setup",
            title: "Early Prep",
            description: "$NAME had all the training equipment ready before anyone else even woke up.",
            outcome: { hp: 60, news: "$NAME organized the morning session early." }
        },
        {
            id: "early_bird_tired",
            title: "Early Crash",
            description: "$NAME started so early they are completely exhausted by mid-afternoon.",
            outcome: { hp: -60, news: "$NAME ran out of steam today." }
        }
    ],
    "night_owl": [
        {
            id: "night_owl_scout",
            title: "Midnight Rounds",
            description: "$NAME is most active at night and caught a glimpse of a rival trainer in the shadows.",
            outcome: { stat: { int: 1 }, news: "$NAME spotted something in the dark." }
        },
        {
            id: "night_owl_practice",
            title: "Shadow Boxing",
            description: "$NAME spent the night practicing in the dark, improving their instincts.",
            outcome: { stat: { dex: 1, wis: 1 }, news: "$NAME trained while others slept." }
        },
        {
            id: "night_owl_morning",
            title: "Late Start",
            description: "$NAME is completely useless in the morning and missed the early briefing.",
            outcome: { news: "$NAME is struggling with the early schedule." }
        }
    ],
    "neat_freak": [
        {
            id: "neat_freak_polish",
            title: "Shining Armor",
            description: "$NAME spent the day polishing every surface in the barracks. It's spotless.",
            outcome: { hp: 60, news: "$NAME's cleaning made for a better environment." }
        },
        {
            id: "neat_freak_tinker",
            title: "Perfect Gear",
            description: "$NAME organized the weapon rack by size, weight, and material.",
            outcome: { stat: { int: 1 }, news: "$NAME's organization helped with equipment management." }
        },
        {
            id: "neat_freak_clash",
            title: "Messy Teammate",
            description: "$NAME got into a heated argument with a teammate about a dirty pair of boots.",
            outcome: { news: "$NAME's obsession with neatness caused some friction." }
        }
    ],
    "slovenly": [
        {
            id: "slovenly_rust",
            title: "Rusty Blade",
            description: "$NAME forgot to oil their sword and it's starting to rust. It's less effective now.",
            outcome: { news: "$NAME's neglect is showing on their gear." }
        },
        {
            id: "slovenly_nap",
            title: "Lazy Day",
            description: "$NAME spent the day lying in the dirt instead of training.",
            outcome: { hp: 120, news: "$NAME took a very lazy break." }
        },
        {
            id: "slovenly_infestation",
            title: "Uninvited Guests",
            description: "$NAME's pile of dirty laundry attracted a swarm of flies to the barracks.",
            outcome: { hp: -60, news: "$NAME's lack of hygiene is a problem." }
        }
    ],
    "talkative": [
        {
            id: "talkative_rumors",
            title: "Village Gossip",
            description: "$NAME spent the day talking to anyone who would listen. They brought back some interesting rumors.",
            outcome: { stat: { int: 2 }, news: "$NAME's chatter revealed some local secrets." }
        },
        {
            id: "talkative_distraction",
            title: "Mouth Running",
            description: "$NAME wouldn't stop talking during the tactical meeting. No one could focus.",
            outcome: { news: "$NAME's talking is becoming a distraction." }
        },
        {
            id: "talkative_friend",
            title: "New Best Friend",
            description: "$NAME talked a traveling merchant into giving the team a discount on basic supplies.",
            outcome: { gold: 100, news: "$NAME's gift of gab saved us money." }
        }
    ],
    "laconic": [
        {
            id: "laconic_focus",
            title: "Few Words",
            description: "$NAME said only three words all day: 'Strike. Parry. Win.' Their focus is terrifying.",
            outcome: { stat: { str: 1, dex: 1 }, news: "$NAME's brevity is productive." }
        },
        {
            id: "laconic_order",
            title: "Direct Command",
            description: "$NAME gave the simplest, most effective instructions possible during a chaotic drill.",
            outcome: { stat: { wis: 2 }, news: "$NAME's directness improved the team's efficiency." }
        },
        {
            id: "laconic_mystery",
            title: "Stone Face",
            description: "$NAME refused to explain why they were late. They just pointed at their sharpening stone and grunted.",
            outcome: { news: "$NAME is as mysterious as ever." }
        }
    ],
    "jinxed": [
        {
            id: "jinxed_accident",
            title: "Broken Bench",
            description: "$NAME sat down and the bench immediately shattered. Then a bird pooped on them.",
            outcome: { hp: -60, news: "Bad luck is following $NAME today." }
        },
        {
            id: "jinxed_spill",
            title: "Spilled Oil",
            description: "$NAME accidentally knocked over the special blade oil, wasting half of it.",
            outcome: { gold: -80, news: "$NAME's clumsiness cost the team." }
        },
        {
            id: "jinxed_narrow_miss",
            title: "Almost Died",
            description: "A loose tile nearly hit $NAME's head. They look shaken.",
            outcome: { hp: -60, news: "$NAME narrowly avoided a freak accident." }
        }
    ],
    "lucky": [
        {
            id: "lucky_coin",
            title: "Silver Lining",
            description: "$NAME found a rare silver coin in the mud outside the barracks.",
            outcome: { gold: 150, news: "$NAME's luck is holding out." }
        },
        {
            id: "lucky_miss",
            title: "The Near Miss",
            description: "A training blade snapped and nearly hit $NAME, but they had just leaned over to tie their shoe.",
            outcome: { news: "$NAME's luck is almost supernatural." }
        },
        {
            id: "lucky_find",
            title: "Stumbled Upon",
            description: "$NAME tripped and fell directly onto a hidden cache of forgotten equipment.",
            outcome: { gold: 200, news: "$NAME's 'accident' was a win." }
        }
    ],
    "obsessive": [
        {
            id: "obsessive_perfection",
            title: "One Thousand Strikes",
            description: "$NAME performed the exact same strike until their hands bled. It's now perfect.",
            outcome: { stat: { str: 1, dex: 1 }, hp: -60, news: "$NAME is obsessed with a single move." }
        },
        {
            id: "obsessive_cleaning",
            title: "Mirror Finish",
            description: "$NAME spent 10 hours cleaning their helmet. You can see your reflection in it from across the room.",
            outcome: { stat: { wis: 1 }, news: "$NAME's fixation is intense." }
        },
        {
            id: "obsessive_tracking",
            title: "Enemy Files",
            description: "$NAME has been obsessively tracking the stats of every rival gladiator.",
            outcome: { stat: { int: 2 }, news: "$NAME's obsession provided great intel." }
        }
    ],
    "forgetful": [
        {
            id: "forgetful_helmet",
            title: "Lost Gear",
            description: "$NAME forgot where they put their helmet. We had to buy a new one.",
            outcome: { gold: -100, news: "$NAME's forgetfulness cost us." }
        },
        {
            id: "forgetful_orders",
            title: "What Now?",
            description: "$NAME completely forgot the training schedule and spent the day doing nothing.",
            outcome: { news: "$NAME's memory is failing them." }
        },
        {
            id: "forgetful_surprise",
            title: "Hidden Treasure",
            description: "$NAME found 50 gold in their own pocket that they'd forgotten they even had.",
            outcome: { gold: 50, news: "$NAME's forgetfulness had a silver lining." }
        }
    ],
    "fastidious": [
        {
            id: "fastidious_accuracy",
            title: "Exact Measurement",
            description: "$NAME weighed every ration to the gram, ensuring everyone got exactly their share.",
            outcome: { hp: 60, news: "$NAME's precision is helping the barracks." }
        },
        {
            id: "fastidious_repair",
            title: "Better than New",
            description: "$NAME repaired a torn cloak with such fine stitching it's now worth more than before.",
            outcome: { gold: 40, news: "$NAME's attention to detail is profitable." }
        },
        {
            id: "fastidious_delay",
            title: "Too Slow",
            description: "$NAME spent so long checking their armor straps that the practice session was over.",
            outcome: { news: "$NAME's perfectionism is slowing things down." }
        }
    ],
    "bibliophile": [
        {
            id: "bibliophile_scroll",
            title: "Ancient Wisdom",
            description: "$NAME spent the day reading an old scroll they found in the market.",
            outcome: { stat: { int: 2 }, news: "$NAME learned something from an old text." }
        },
        {
            id: "bibliophile_expense",
            title: "Full Library",
            description: "$NAME spent the team's gold on a rare book about botanical history.",
            outcome: { gold: -120, news: "$NAME's book habit is draining the purse." }
        },
        {
            id: "bibliophile_story",
            title: "Inspiration",
            description: "$NAME read a story of a legendary gladiator to the team, boosting morale.",
            outcome: { teamWide: true, hp: 120, news: "$NAME's books are a source of team spirit." }
        }
    ],
    "wanderer": [
        {
            id: "wanderer_map",
            title: "Extra Miles",
            description: "$NAME went for a long walk and mapped out the surrounding terrain.",
            outcome: { stat: { int: 1, wis: 1 }, news: "$NAME's wandering was useful." }
        },
        {
            id: "wanderer_absence",
            title: "Gone Fishin'",
            description: "$NAME disappeared for several hours and missed a crucial drill.",
            outcome: { state: { dex: -1 }, news: "$NAME's restless feet are causing problems." }
        },
        {
            id: "wanderer_gift",
            title: "Roadside Find",
            description: "While wandering the docks, $NAME found a crate of high-quality medicinal herbs.",
            outcome: { teamWide: true, hp: 240, news: "$NAME's exploration paid off." }
        }
    ],
    "stout": [
        {
            id: "stout_feast",
            title: "Bottomless Pit",
            description: "$NAME ate an entire roast pig by themselves. They are now glowing with health.",
            outcome: { hp: 480, gold: -80, news: "$NAME's appetite is legendary." }
        },
        {
            id: "stout_strength",
            title: "Extra Weight",
            description: "$NAME's bulk makes them incredibly hard to push around in the ring.",
            outcome: { stat: { con: 2 }, news: "$NAME is looking particularly solid." }
        },
        {
            id: "stout_broken_chair",
            title: "Timber!",
            description: "$NAME sat on a training stool and it splintered into a thousand pieces.",
            outcome: { state: { con: 1 }, news: "$NAME's size is a bit much for the furniture." }
        }
    ],

    // BACKGROUND & FLAVOR (81-100)
    "ex_soldier": [
        {
            id: "ex_soldier_drill",
            title: "Military Precision",
            description: "$NAME ran a formal military drill for the whole team. Coordination has spiked.",
            outcome: { teamWide: true, stat: { dex: 1, wis: 1 }, news: "$NAME brought some army discipline to the group." }
        },
        {
            id: "ex_soldier_medals",
            title: "Old Stories",
            description: "$NAME showed off their old medals, inspiring the younger gladiators.",
            outcome: { hp: 120, news: "$NAME's service record is a point of pride." }
        },
        {
            id: "ex_soldier_pains",
            title: "Old Wounds",
            description: "An old battle injury flared up today, making it hard for $NAME to move.",
            outcome: { hp: -60, news: "$NAME's military past left some scars." }
        }
    ],
    "noble_born": [
        {
            id: "noble_born_etiquette",
            title: "High Society",
            description: "$NAME convinced a local noble to grant us access to a private training ground.",
            outcome: { teamWide: true, stat: { str: 1, dex: 1, con: 1, int: 1, wis: 1 }, news: "$NAME's connections are useful." }
        },
        {
            id: "noble_born_arrogance",
            title: "Silver Spoon",
            description: "$NAME refused to sleep on the straw mattress, demanding silk linens.",
            outcome: { gold: -100, news: "$NAME's noble habits are expensive." }
        },
        {
            id: "noble_born_education",
            title: "Literate Advice",
            description: "$NAME helped you draft a formal letter to the arena board.",
            outcome: { stat: { wis: 2 }, news: "$NAME's noble upbringing provided some needed class." }
        }
    ],
    "orphan": [
        {
            id: "orphan_streets",
            title: "Street Smarts",
            description: "$NAME knows all the back alleys. They found a shortcut to the market, avoiding the crowd.",
            outcome: { stat: { wis: 1 }, news: "$NAME's past on the streets is an asset." }
        },
        {
            id: "orphan_stealing",
            title: "Old Habits",
            description: "$NAME was caught 'borrowing' a loaf of bread from a vendor.",
            outcome: { news: "$NAME is struggling to leave the street life behind." }
        },
        {
            id: "orphan_resilience",
            title: "Hard Knock Life",
            description: "$NAME has been through worse. They simply ignored a minor infection that would've laid out another.",
            outcome: { hp: 240, news: "$NAME is tough as nails." }
        }
    ],
    "scholar": [
        {
            id: "scholar_research",
            title: "Combat Theory",
            description: "$NAME spent the day sketching anatomy diagrams, figuring out the best places to strike.",
            outcome: { stat: { int: 2 }, news: "$NAME's research is very promising." }
        },
        {
            id: "scholar_distracted",
            title: "Head in the Clouds",
            description: "$NAME was so busy thinking about philosophy they nearly got hit in the head during practice.",
            outcome: { news: "$NAME is a bit too academic for the pits." }
        },
        {
            id: "scholar_invention",
            title: "Improved Oil",
            description: "$NAME mixed several chemicals and created a more effective whetting oil.",
            outcome: { gold: 90, news: "$NAME's knowledge is very practical." }
        }
    ],
    "blacksmith": [
        {
            id: "blacksmith_repair",
            title: "Free Fix",
            description: "$NAME spent the evening fixing the whole team's armor. No charge!",
            outcome: { gold: 200, news: "$NAME's skills saved us a fortune." }
        },
        {
            id: "blacksmith_craft",
            title: "Custom Blade",
            description: "$NAME forged a custom handle for their sword, making it much easier to wield.",
            outcome: { stat: { dex: 2 }, news: "$NAME's gear is top-tier now." }
        },
        {
            id: "blacksmith_burn",
            title: "Soot and Fire",
            description: "$NAME spent too long at the forge and is suffering from heat exhaustion.",
            outcome: { hp: -60, news: "$NAME pushed themselves too hard in the shop." }
        }
    ],
    "hermit": [
        {
            id: "hermit_herbs",
            title: "Forest Medicine",
            description: "$NAME brought back several rare plants that have incredible healing properties.",
            outcome: { hp: 480, news: "$NAME's knowledge of the wild is a lifesaver." }
        },
        {
            id: "hermit_isolation",
            title: "Silence Please",
            description: "$NAME hasn't spoken in three days. The other gladiators find it unnerving.",
            outcome: { news: "$NAME is being particularly quiet." }
        },
        {
            id: "hermit_instinct",
            title: "Wild Mind",
            description: "$NAME's senses are so sharp they react to things before they even happen.",
            outcome: { stat: { dex: 1, wis: 1 }, news: "$NAME is reaching a new level of focus." }
        }
    ],
    "sailor": [
        {
            id: "sailor_knots",
            title: "Tight Straps",
            description: "$NAME used nautical knots to secure everyone's armor. It's not going anywhere.",
            outcome: { teamWide: true, stat: { def: 1 }, news: "$NAME's sailor skills were useful." }
        },
        {
            id: "sailor_mouth",
            title: "Sea Shanty",
            description: "$NAME's foul language and loud songs kept the tavern awake half the night.",
            outcome: { news: "$NAME is as rowdy as a storm at sea." }
        },
        {
            id: "sailor_weather",
            title: "Weather Vane",
            description: "$NAME correctly predicted the afternoon storm, allowing the team to move the equipment indoors.",
            outcome: { news: "$NAME's sea-sense saved the gear from a soaking." }
        }
    ],
    "thief": [
        {
            id: "thief_scout",
            title: "Night Creep",
            description: "$NAME snuck into a rival's barracks and stole their training log.",
            outcome: { stat: { int: 2 }, news: "$NAME's old job is very useful for scouting." }
        },
        {
            id: "thief_gold",
            title: "Lifting Wallets",
            description: "$NAME spent their free time pickpocketing in the market. They brought back quite a bit of coin.",
            outcome: { gold: 180, news: "$NAME's 'private work' was profitable." }
        },
        {
            id: "thief_caught",
            title: "Chain and Ball",
            description: "$NAME was caught stealing from the magistrate. We had to pay a massive fine to get them back.",
            outcome: { gold: -400, news: "$NAME's past caught up with them." }
        }
    ],
    "zealot": [
        {
            id: "zealot_drive",
            title: "Divine Fury",
            description: "$NAME believes they are fighting for a holy cause. They are unstoppable today.",
            outcome: { stat: { str: 2, wis: 2 }, news: "$NAME's fervor is a powerful force." }
        },
        {
            id: "zealot_preach",
            title: "The Word",
            description: "$NAME spent the day shouting scripture at the other gladiators.",
            outcome: { stat: { wis: 1 }, news: "$NAME's zeal is a bit overwhelming." }
        },
        {
            id: "zealot_miracle",
            title: "True Believer",
            description: "$NAME's conviction in the afterlife gave them the courage to take a massive hit during a spar.",
            outcome: { stat: { con: 2, wis: 2 }, news: "$NAME's faith is their strongest armor." }
        }
    ],
    "pacifist_at_heart": [
        {
            id: "pacifist_negotiation",
            title: "Peaceful End",
            description: "$NAME talked a heated disagreement down without any blood being spilled.",
            outcome: { stat: { wis: 2 }, news: "$NAME's gentle nature saved us from more injuries." }
        },
        {
            id: "pacifist_hesitation",
            title: "Weak Hand",
            description: "$NAME hesitated during a finishing strike, failing the assessment.",
            outcome: { state: { str: -2, wis: 2 }, news: "$NAME's heart isn't in the killing business." }
        },
        {
            id: "pacifist_comfort",
            title: "A Kind Word",
            description: "$NAME spent the day caring for the animals in the stables. They seem more at peace now.",
            outcome: { hp: 180, news: "$NAME find solace in non-violence." }
        }
    ],
    "outlaw": [
        {
            id: "outlaw_bounty",
            title: "Wanted Man",
            description: "A bounty hunter came looking for $NAME. We had to pay them off.",
            outcome: { gold: -250, news: "$NAME's past is causing trouble." }
        },
        {
            id: "outlaw_traps",
            title: "Bushcraft",
            description: "$NAME taught the team how to set traps and avoid being followed.",
            outcome: { stat: { wis: 1, int: 1 }, news: "$NAME's rogue skills are helpful." }
        },
        {
            id: "outlaw_raid",
            title: "Bandit Tactics",
            description: "$NAME suggested a more aggressive and underhanded way to attack.",
            outcome: { stat: { str: 1, dex: 1 }, news: "$NAME's outlaw past is showing through." }
        }
    ],
    "aristocrat": [
        {
            id: "aristocrat_presence",
            title: "Natural Leader",
            description: "$NAME's sheer presence makes everyone stand taller and work harder.",
            outcome: { stat: { wis: 1 }, news: "$NAME's high-born air commands respect." }
        },
        {
            id: "aristocrat_expense",
            title: "The Best",
            description: "$NAME insists on only wearing the finest silk tunics. Very expensive.",
            outcome: { gold: -150, news: "$NAME's taste is draining the coffers." }
        },
        {
            id: "aristocrat_scout",
            title: "Noble Intel",
            description: "$NAME's knowledge of the city's hierarchy allowed them to gather some high-level information.",
            outcome: { stat: { int: 2 }, news: "$NAME's background gives us an edge." }
        }
    ],
    "peasant": [
        {
            id: "peasant_work",
            title: "Hard Labor",
            description: "$NAME spent the day doing the work of three men. They used to much worse.",
            outcome: { stat: { con: 2 }, news: "$NAME's work ethic is unmatched." }
        },
        {
            id: "peasant_survival",
            title: "Scraps",
            description: "$NAME knows how to make a meal out of almost nothing. They saved us on food costs.",
            outcome: { gold: 60, news: "$NAME's humble beginnings are helpful." }
        },
        {
            id: "peasant_tough",
            title: "Old Bark",
            description: "$NAME's hands are like stone from years of manual labor. They don't even feel the pain.",
            outcome: { stat: { con: 1, str: 1 }, news: "$NAME's background made them strong." }
        }
    ],
    "tribal": [
        {
            id: "tribal_rites",
            title: "Ancient Rites",
            description: "$NAME performed a traditional ceremony that invigorated the whole team.",
            outcome: { hp: 360, news: "$NAME's tribal wisdom is restorative." }
        },
        {
            id: "tribal_scout",
            title: "Hunter's Eyes",
            description: "$NAME used tracking skills to find a more efficient path for the team's travels.",
            outcome: { stat: { wis: 1 }, news: "$NAME's tracking skills are excellent." }
        },
        {
            id: "tribal_clash",
            title: "Cultural Difference",
            description: "$NAME got into a fight about 'civilized' behavior.",
            outcome: { news: "$NAME is struggling to adapt to the city." }
        }
    ],
    "exiled": [
        {
            id: "exiled_wisdom",
            title: "World Traveler",
            description: "Having been cast out, $NAME has seen more of the world than anyone else.",
            outcome: { stat: { int: 2, wis: 1 }, news: "$NAME's journeys gave them deep knowledge." }
        },
        {
            id: "exiled_sorrow",
            title: "Homesick",
            description: "$NAME spent the day staring at the horizon, missing their homeland.",
            outcome: { hp: -60, news: "$NAME is feeling the weight of their exile." }
        },
        {
            id: "exiled_strength",
            title: "Survivor",
            description: "$NAME has already lost everything. They have nothing left to fear.",
            outcome: { stat: { con: 2 }, news: "$NAME's exile has hardened them." }
        }
    ],
    "widowed": [
        {
            id: "widowed_memento",
            title: "Lost Love",
            description: "$NAME spent the day staring at a faded portrait. It was heartbreaking.",
            outcome: { hp: -60, news: "$NAME is mourning." }
        },
        {
            id: "widowed_drive",
            title: "Nothing to Lose",
            description: "Having already lost their loved one, $NAME fights with a terrifying lack of regard for their own life.",
            outcome: { stat: { str: 2 }, news: "$NAME's grief is a dangerous weapon." }
        },
        {
            id: "widowed_kindness",
            title: "Gentle Spirit",
            description: "$NAME's shared understanding of loss helped a teammate through a difficult time.",
            outcome: { hp: 240, news: "$NAME's empathy is a gift to the team." }
        }
    ],
    "vengeful_spirit": [
        {
            id: "vengeful_spirit_focus",
            title: "Dark Drive",
            description: "$NAME is purely driven by the need for revenge. They are training like a demon.",
            outcome: { stat: { str: 2, dex: 2, int: 2 }, news: "$NAME is consumed by their quest." }
        },
        {
            id: "vengeful_spirit_intel",
            title: "Tracking a Ghost",
            description: "$NAME found some information about their target and spent the day planning their strike.",
            outcome: { stat: { int: 2 }, news: "$NAME's sharp mind is focused on one thing." }
        },
        {
            id: "vengeful_spirit_loss",
            title: "Burning Out",
            description: "$NAME's need for revenge is starting to affect their physical health.",
            outcome: { hp: -60, news: "$NAME is being consumed by their hate." }
        }
    ],
    "mystic": [
        {
            id: "mystic_vison",
            title: "Future Sight",
            description: "$NAME claimed to have seen the outcome of the next match in a dream.",
            outcome: { stat: { wis: 2 }, news: "$NAME's visions are quite convincing." }
        },
        {
            id: "mystic_offering",
            title: "Sacrifice",
            description: "$NAME was seen talking to a wall. They claim it was 'the spirits'.",
            outcome: { stat: { wis: 2, int: -2 }, news: "$NAME is acting very strange today." }
        },
        {
            id: "mystic_blessing",
            title: "Otherworldly Aid",
            description: "$NAME performed a ritual that seemingly healed a teammate's old injury over night.",
            outcome: { hp: 360, news: "$NAME's powers are truly mysterious." }
        }
    ],
    "mercenary_vet": [
        {
            id: "mercenary_vet_advice",
            title: "Been There",
            description: "$NAME gave the team some valuable advice about surviving the arena's hazards.",
            outcome: { stat: { wis: 2 }, news: "$NAME's experience is worth more than gold." }
        },
        {
            id: "mercenary_vet_scars",
            title: "Counting Wounds",
            description: "$NAME showed off their scars, proving just how hard it is to kill them.",
            outcome: { stat: { con: 2 }, news: "$NAME is a true survivor." }
        },
        {
            id: "mercenary_vet_price",
            title: "The Cost of War",
            description: "$NAME is feeling the years in their joints today and needs extra rest.",
            outcome: { hp: -60, news: "$NAME is showing their age." }
        }
    ],
    "redeemed": [
        {
            id: "redeemed_act",
            title: "Second Chance",
            description: "$NAME performed an amazing act of heroism, trying to make up for their past crimes.",
            outcome: { hp: 360, news: "$NAME's quest for redemption is inspiring." }
        },
        {
            id: "redeemed_guilt",
            title: "Weight of the Past",
            description: "$NAME is struggling with the memories of things they've done.",
            outcome: { news: "$NAME is having a difficult day emotionally." }
        },
        {
            id: "redeemed_training",
            title: "New Path",
            description: "$NAME is training with a renewed vigor, determined to be better.",
            outcome: { stat: { str: 1, wis: 1 }, news: "$NAME is working toward a new life." }
        }
    ],
};

