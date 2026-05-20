/**
 * COSMIC OPERATIONS PLAYER PROGRESSION & UPGRADE SHOP
 * core/player-progression.js
 * 
 * Manages tactical enclosure hardware upgrades, processes Science Intelligence 
 * to calculate player levels and attributes, and executes secure transactions.
 */

(function() {
    // 1. Core Shop Upgrades Matrix Definition
    const UPGRADE_MATRIX = {
        mauna_kea: {
            id: "atmospheric_filters",
            name: "Atmospheric Laser Filters",
            description: "Advanced gas filters reducing laser guide star refraction, increasing debris clearing power.",
            baseCost: 150,
            costMultiplier: 1.5,
            statMultiplier: 1.25, // +25% effectiveness per tier
            maxTier: 5
        },
        atacama: {
            id: "correlator_accelerators",
            name: "Correlator Accelerators",
            description: "High-density quantum processing nodes, accelerating antenna array data throughput.",
            baseCost: 200,
            costMultiplier: 1.6,
            statMultiplier: 1.30, // +30% science gain per tier
            maxTier: 5
        },
        bosscha: {
            id: "exoplanet_radar_range",
            name: "Exoplanet Radar Range",
            description: "Cryo-cooled sensor arrays expanding deep-space coordinate detection radiuses.",
            baseCost: 180,
            costMultiplier: 1.5,
            statMultiplier: 1.20, // +20% exoplanet detection speed per tier
            maxTier: 5
        }
    };

    const UPGRADES_STORAGE_KEY = 'cosmic_ops_enclosure_upgrades';
    
    // Active Upgrades Tiers State
    let activeUpgrades = {
        mauna_kea: 1, // Current Tier starts at 1
        atacama: 1,
        bosscha: 1
    };

    const PlayerProgression = {
        /**
         * Initialize Progression and Upgrades
         */
        init() {
            this.loadUpgrades();
            
            // Listen to state changes to auto-adjust Player IQ and level values
            window.addEventListener('cosmic-ops-state-updated', () => {
                this.recalculateCharacterStats();
            });
            this.recalculateCharacterStats();
        },

        /**
         * Loads current upgrades tiers from localStorage
         */
        loadUpgrades() {
            try {
                const serialized = localStorage.getItem(UPGRADES_STORAGE_KEY);
                if (serialized) {
                    activeUpgrades = { ...activeUpgrades, ...JSON.parse(serialized) };
                } else {
                    this.saveUpgrades();
                }
            } catch (err) {
                console.error("Failed to load active upgrades:", err);
            }
            return activeUpgrades;
        },

        /**
         * Saves current upgrades tiers to localStorage
         */
        saveUpgrades() {
            try {
                localStorage.setItem(UPGRADES_STORAGE_KEY, JSON.stringify(activeUpgrades));
                this.dispatchProgressionUpdate();
            } catch (err) {
                console.error("Failed to save active upgrades:", err);
            }
        },

        /**
         * Returns full upgrade metadata including current cost and tier
         */
        getUpgradeShopMatrix() {
            const matrix = {};
            for (const site in UPGRADE_MATRIX) {
                const meta = UPGRADE_MATRIX[site];
                const currentTier = activeUpgrades[site];
                const nextCost = currentTier >= meta.maxTier ? null : Math.floor(meta.baseCost * Math.pow(meta.costMultiplier, currentTier - 1));
                const currentMultiplier = Math.pow(meta.statMultiplier, currentTier - 1);
                
                matrix[site] = {
                    ...meta,
                    currentTier: currentTier,
                    nextCost: nextCost,
                    currentMultiplier: parseFloat(currentMultiplier.toFixed(2)),
                    isMaxed: currentTier >= meta.maxTier
                };
            }
            return matrix;
        },

        /**
         * Safely executes an upgrade transaction
         */
        purchaseUpgrade(site) {
            const upgradeMeta = this.getUpgradeShopMatrix()[site];
            if (!upgradeMeta) {
                console.error(`Enclosure site '${site}' is not registered in the upgrade matrix.`);
                return false;
            }

            if (upgradeMeta.isMaxed) {
                console.warn(`Enclosure upgrade for '${site}' is already at maximum tier (${upgradeMeta.maxTier}).`);
                return false;
            }

            const cost = upgradeMeta.nextCost;
            if (!window.GameState) {
                console.error("GameState engine unavailable. Transaction aborted.");
                return false;
            }

            // Attempt to deduct credits from GameState
            const transactionSuccess = window.GameState.deductCredits(cost);
            if (transactionSuccess) {
                // Increment active level tier
                activeUpgrades[site] += 1;
                this.saveUpgrades();

                // Dispatch notification event
                const purchaseEvent = new CustomEvent('cosmic-ops-upgrade-purchased', {
                    detail: {
                        site: site,
                        newTier: activeUpgrades[site],
                        costDeducted: cost,
                        multiplierApplied: Math.pow(upgradeMeta.statMultiplier, activeUpgrades[site] - 1)
                    }
                });
                window.dispatchEvent(purchaseEvent);
                return true;
            }

            return false; // Transaction failed due to insufficient credits
        },

        /**
         * Translates Science Intelligence points into character levels, IQ, and structural defense
         */
        recalculateCharacterStats() {
            if (!window.GameState) return;

            const scienceIntelligence = window.GameState.getScience();
            
            // Level formula: Level levels up every 100 Science intelligence points accumulated
            const currentLevel = Math.floor(scienceIntelligence / 100) + 1;
            
            // Structural Max Health & Defense calculations
            const maxHealth = 100 + (currentLevel - 1) * 15;
            const baseDefense = 10 + (currentLevel - 1) * 5;

            // Update Player IQ inside game state to match current level threshold
            const targetIQ = 100 + (currentLevel - 1) * 10;
            const currentIQ = window.GameState.getIQ();
            
            // Adjust IQ if it doesn't match the level calculation
            if (currentIQ !== targetIQ) {
                window.GameState.addIQ(targetIQ - currentIQ);
            }

            this.characterStats = {
                level: currentLevel,
                maxHealth: maxHealth,
                defense: baseDefense,
                iq: targetIQ,
                sciencePoints: scienceIntelligence
            };
        },

        /**
         * Retrieves calculated character progression parameters
         */
        getCharacterStats() {
            if (!this.characterStats) {
                this.recalculateCharacterStats();
            }
            return this.characterStats;
        },

        /**
         * Dispatches custom event notifying listeners that player levels or upgrades changed
         */
        dispatchProgressionUpdate() {
            const event = new CustomEvent('cosmic-ops-progression-updated', {
                detail: {
                    activeUpgrades: { ...activeUpgrades },
                    characterStats: this.getCharacterStats()
                }
            });
            window.dispatchEvent(event);
        }
    };

    // Auto-init and bind to global context for inclusion
    window.PlayerProgression = PlayerProgression;
    PlayerProgression.init();
})();
