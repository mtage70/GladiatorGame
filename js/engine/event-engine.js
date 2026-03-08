/**
 * js/engine/event-engine.js
 * Logic for daily random events based on gladiator traits.
 */

const EventEngine = {
    /**
     * Picks and triggers a daily event.
     * @returns {Promise|null} Resolves when event is handled (if manual pause needed)
     */
    triggerDailyEvent: function (saveContext) {
        // Collect all gladiators in the league
        const playerRoster = saveContext.roster.map(g => ({ ...g, isPlayer: true }));
        let allGladiators = [...playerRoster];

        if (saveContext.opposingRosters) {
            Object.keys(saveContext.opposingRosters).forEach(teamId => {
                const teamData = saveContext.opposingRosters[teamId];
                const roster = teamData.roster || teamData; // Handle both structures
                roster.forEach(g => {
                    allGladiators.push({ ...g, isPlayer: false, teamId: teamId });
                });
            });
        }

        // Filter for those with traits
        const potentialCandidates = allGladiators.filter(g => g.traits && g.traits.length > 0);
        if (potentialCandidates.length === 0) return null;

        // Pick 1 gladiator
        const glad = potentialCandidates[Math.floor(Math.random() * potentialCandidates.length)];

        // Pick one of their traits
        const traitId = glad.traits[Math.floor(Math.random() * glad.traits.length)];

        // Get events for this trait
        const events = TRAIT_EVENTS[traitId];
        if (!events || events.length === 0) return null;

        const event = events[Math.floor(Math.random() * events.length)];

        return this.processEvent(event, glad, saveContext);
    },

    processEvent: function (event, glad, saveContext) {
        const isPlayer = glad.isPlayer;

        if (isPlayer) {
            // Player gladiator - show interactive popup
            return new Promise((resolve) => {
                this.showPopup(event, glad, saveContext, resolve);
            });
        } else {
            // AI gladiator - auto-resolve and log to news
            // If No outcome but choices, pick first choice
            const outcome = event.outcome || (event.choices && event.choices.length > 0 ? event.choices[0].outcome : null);
            if (outcome) {
                this.applyOutcome(glad, outcome, saveContext);
                this.logRichNews(outcome, glad, saveContext);
            }
            return null; // No need to pause
        }
    },

    showPopup: function (event, glad, saveContext, resolve) {
        const overlay = document.getElementById('eventOverlay');
        const modal = document.getElementById('eventModal');
        const title = document.getElementById('eventTitle');
        const category = document.getElementById('eventCategory');
        const desc = document.getElementById('eventDescription');
        const choiceContainer = document.getElementById('eventChoiceContainer');
        const outcomeContainer = document.getElementById('eventOutcomeContainer');
        const outcomeText = document.getElementById('eventOutcomeText');
        const outcomeDetails = document.getElementById('eventOutcomeDetails');
        const gladInfo = document.getElementById('eventGladiatorInfo');
        const closeBtn = document.getElementById('closeEventBtn');

        // Reset UI
        choiceContainer.innerHTML = '';
        if (outcomeDetails) outcomeDetails.innerHTML = '';
        if (gladInfo) gladInfo.innerHTML = '';
        outcomeContainer.classList.add('hidden');
        choiceContainer.classList.remove('hidden');
        overlay.classList.remove('hidden');

        // Scroll to the top of the popup widget
        if (modal) modal.scrollTop = 0;
        if (overlay) overlay.scrollTop = 0;

        // Populate Gladiator Info
        if (gladInfo) {
            gladInfo.innerHTML = `
                <img src="${glad.portrait || 'assets/ui/default_portrait.png'}" class="modal-glad-portrait" alt="${glad.name}">
                <div class="modal-glad-meta">
                    <h3 class="modal-glad-name">${glad.name}</h3>
                    <span class="glad-class ${glad.class.toLowerCase()}">${glad.class}</span>
                </div>
            `;
        }

        // Populate Content
        category.textContent = `Event: ${glad.name}`;
        title.textContent = event.title;
        desc.textContent = event.description.replace(/\$NAME/g, glad.name);

        if (event.choices && event.choices.length > 0) {
            // Multiple choices
            event.choices.forEach(choice => {
                const btn = document.createElement('button');
                btn.className = 'action-btn';
                btn.textContent = choice.text;
                btn.onclick = () => {
                    this.handleChoice(choice, glad, saveContext, resolve);
                };
                choiceContainer.appendChild(btn);
            });
        } else {
            // Single "Continue" button for events without choices
            const btn = document.createElement('button');
            btn.className = 'action-btn primary';
            btn.textContent = "See Outcome";
            btn.onclick = () => {
                this.handleChoice({ outcome: event.outcome }, glad, saveContext, resolve);
            };
            choiceContainer.appendChild(btn);
        }

        // Close logic (only after outcome is displayed)
        closeBtn.onclick = () => {
            overlay.classList.add('hidden');
            resolve(); // Resume time advancement manual check (though home-screen handles the pause)
        };
    },

    handleChoice: function (choice, glad, saveContext, resolve) {
        const choiceContainer = document.getElementById('eventChoiceContainer');
        const outcomeContainer = document.getElementById('eventOutcomeContainer');
        const outcomeText = document.getElementById('eventOutcomeText');

        choiceContainer.classList.add('hidden');
        outcomeContainer.classList.remove('hidden');

        // Apply outcome
        let result = this.applyOutcome(glad, choice.outcome, saveContext);
        outcomeText.textContent = result.news.replace(/\$NAME/g, glad.name);

        // Display additional details
        this.displayOutcomeDetails(result);

        // Log to news with rich UI (for player)
        this.logRichNews(result, glad, saveContext);

        // Re-render UI
        if (typeof renderRoster === 'function') renderRoster();
    },

    applyOutcome: function (glad, outcome, saveContext) {
        if (!outcome) return { news: "Nothing happened." };
        let finalOutcome = { ...outcome };

        // Chance logic
        if (outcome.chance !== undefined) {
            if (Math.random() > outcome.chance) {
                // Secondary outcome
                finalOutcome.gold = outcome.alt_gold !== undefined ? outcome.alt_gold : (outcome.gold ? -outcome.gold : 0);
                finalOutcome.news = outcome.alt_news || "The attempt failed.";
                // Clear state modifications if they were positive
                finalOutcome.stat = null;
                finalOutcome.hp = outcome.alt_hp !== undefined ? outcome.alt_hp : -10;
            }
        }

        // Apply Gold (Player Only)
        if (finalOutcome.gold && glad.isPlayer) {
            saveContext.gold = Math.max(0, saveContext.gold + finalOutcome.gold);
        }

        // Find the actual gladiator object in the saveContext (allGladiators was a map)
        let actualGlad;
        if (glad.isPlayer) {
            actualGlad = saveContext.roster.find(g => g.id === glad.id);
        } else {
            const team = saveContext.opposingRosters[glad.teamId];
            const roster = team.roster || team;
            actualGlad = roster.find(g => g.id === glad.id);
        }

        if (actualGlad) {
            // Apply HP
            if (finalOutcome.hp) {
                const maxHp = actualGlad.maxHp || calculateMaxHp(actualGlad);
                actualGlad.hp = Math.max(0, Math.min(maxHp, (actualGlad.hp || maxHp) + finalOutcome.hp));

                // Death check
                let deathChance = 0.30 - (((actualGlad.stats.con || 25) - 25) * 0.003);
                if (deathChance < 0.10) {
                    deathChance = 0.10;
                }
                if (actualGlad.hp <= 0 && Math.random() < deathChance) {
                    if (glad.isPlayer) {
                        finalOutcome.news += ` ${actualGlad.name} has DIED from their wounds.`;
                        if (!saveContext.graveyard) saveContext.graveyard = [];
                        saveContext.graveyard.push({ ...actualGlad });
                        saveContext.roster = saveContext.roster.filter(g => g.id !== actualGlad.id);
                    } else {
                        finalOutcome.news += ` ${actualGlad.name} has perished.`;
                        // Remove from AI roster
                        const team = saveContext.opposingRosters[glad.teamId];
                        const roster = team.roster || team;
                        if (team.roster) team.roster = team.roster.filter(g => g.id !== actualGlad.id);
                        else saveContext.opposingRosters[glad.teamId] = roster.filter(g => g.id !== actualGlad.id);
                    }
                }

                // Apply Stats
                if (finalOutcome.stat) {
                    Object.keys(finalOutcome.stat).forEach(s => {
                        if (actualGlad.stats[s] !== undefined) {
                            actualGlad.stats[s] = Math.max(1, Math.min(100, actualGlad.stats[s] + finalOutcome.stat[s]));
                        }
                    });
                }

                // Recruitment (Player Only)
                if (finalOutcome.recruit && glad.isPlayer && typeof generateGladiator === 'function') {
                    if (saveContext.roster.length < 10) {
                        const newGlad = generateGladiator();
                        saveContext.roster.push(newGlad);
                        finalOutcome.news += ` ${newGlad.name} has joined your ranks!`;
                    } else {
                        finalOutcome.news += ` Your roster was full, so the recruit walked away.`;
                    }
                }

                // Removal (AI mostly, or player punishment)
                if (finalOutcome.remove) {
                    if (glad.isPlayer) {
                        saveContext.roster = saveContext.roster.filter(g => g.id !== actualGlad.id);
                    } else {
                        const team = saveContext.opposingRosters[glad.teamId];
                        const roster = team.roster || team;
                        if (team.roster) team.roster = team.roster.filter(g => g.id !== actualGlad.id);
                        else saveContext.opposingRosters[glad.teamId] = roster.filter(g => g.id !== actualGlad.id);
                    }
                }
            }
        }

        localStorage.setItem('gladiatorSaveContext', JSON.stringify(saveContext));
        return finalOutcome;
    },

    logRichNews: function (outcome, glad, saveContext) {
        const newsList = document.getElementById('newsList');
        if (!newsList || !outcome || !outcome.news) return;

        const team = TEAMS.find(t => t.id === (glad.isPlayer ? saveContext.teamId : glad.teamId));
        const teamName = team ? team.name : (glad.isPlayer ? saveContext.teamName : "A rival team");
        const teamLogo = team ? team.logo : (glad.isPlayer ? saveContext.teamLogo : "assets/ui/default_logo.png");

        // Find the actual gladiator from state for current stats (OVR)
        let actualGlad;
        if (glad.isPlayer) {
            actualGlad = saveContext.roster.find(g => g.id === glad.id);
        } else {
            const teamData = saveContext.opposingRosters[glad.teamId];
            const roster = teamData.roster || teamData;
            actualGlad = roster.find(g => g.id === glad.id);
        }

        if (!actualGlad) actualGlad = glad; // Fallback

        const ovr = typeof getPrimaryStat === 'function' ? getPrimaryStat(actualGlad) : 0;
        const portraitHtml = actualGlad.portrait
            ? `<img src="${actualGlad.portrait}" class="news-glad-portrait" alt="${actualGlad.name}">`
            : `<div class="news-glad-portrait-blank">?</div>`;

        const newsItem = document.createElement('div');
        newsItem.className = 'news-item-rich';

        // Apply team-colored border
        if (team && team.primaryColor) {
            newsItem.style.borderLeftColor = team.primaryColor;
        }

        // Use a color vibe if possible (now secondary to team color if specified)
        if (outcome.hp && outcome.hp < 0) newsItem.classList.add('news-negative');
        if (outcome.hp && outcome.hp > 0) newsItem.classList.add('news-positive');
        if (outcome.gold && outcome.gold > 0) newsItem.classList.add('news-gold');

        newsItem.innerHTML = `
            <div class="news-rich-header">
                <img src="${teamLogo}" class="news-team-logo" alt="${teamName} Logo">
                <span class="news-team-name">${teamName}</span>
            </div>
            <div class="news-rich-content">
                <div class="news-glad-info">
                    <div class="news-portrait-container">
                        ${portraitHtml}
                    </div>
                    <div class="news-glad-meta">
                        <span class="news-glad-name">${actualGlad.name}</span>
                        <span class="glad-class ${actualGlad.class.toLowerCase()}">${actualGlad.class}</span>
                    </div>
                </div>
                <div class="news-text-content">
                    <p>${outcome.news.replace(/\$NAME/g, actualGlad.name)}</p>
                    <div class="news-outcome-mini-details">
                        ${this.generateOutcomeDetailHtml(outcome)}
                    </div>
                </div>
            </div>
        `;
        newsList.insertBefore(newsItem, newsList.firstChild);
    },

    generateOutcomeDetailHtml: function (outcome) {
        if (!outcome) return '';
        let html = '';

        // HP
        if (outcome.hp !== undefined && outcome.hp !== 0) {
            html += `<span class="outcome-detail-item ${outcome.hp > 0 ? 'positive' : 'negative'}">
                <span class="outcome-detail-icon">❤</span> ${outcome.hp > 0 ? '+' : ''}${outcome.hp} HP
            </span>`;
        }

        // Gold
        if (outcome.gold !== undefined && outcome.gold !== 0) {
            html += `<span class="outcome-detail-item ${outcome.gold > 0 ? 'gold' : 'negative'}">
                <span class="outcome-detail-icon">💰</span> ${outcome.gold > 0 ? '+' : ''}${outcome.gold} G
            </span>`;
        }

        // Stats
        if (outcome.stat) {
            Object.keys(outcome.stat).forEach(stat => {
                const val = outcome.stat[stat];
                if (val !== 0) {
                    html += `<span class="outcome-detail-item ${val > 0 ? 'positive' : 'negative'}">
                        <span class="outcome-detail-icon">📊</span> ${val > 0 ? '+' : ''}${val} ${stat.toUpperCase()}
                    </span>`;
                }
            });
        }

        // Special
        if (outcome.recruit) {
            html += `<span class="outcome-detail-item positive"><span class="outcome-detail-icon">👤</span> New Recruit</span>`;
        }
        if (outcome.remove) {
            html += `<span class="outcome-detail-item negative"><span class="outcome-detail-icon">🏃</span> Leaving</span>`;
        }

        return html;
    },

    displayOutcomeDetails: function (outcome) {
        const detailsContainer = document.getElementById('eventOutcomeDetails');
        if (!detailsContainer) return;
        detailsContainer.innerHTML = this.generateOutcomeDetailHtml(outcome);
    },

    addDetailItem: function (container, text, type, icon) {
        const item = document.createElement('div');
        item.className = `outcome-detail-item ${type}`;
        item.innerHTML = `<span class="outcome-detail-icon">${icon}</span> <span>${text}</span>`;
        container.appendChild(item);
    }
};
