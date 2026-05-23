/**
 * COSMIC OPERATIONS COMMAND HUB // GLOBAL SAVE SYSTEM
 * core/game-state.js
 * 
 * Synchronizes and persists player currencies, attributes, and safety ratings
 * across relative page transitions using the browser's localStorage system.
 */

(function() {
    const UPGRADE_BASE = {
        laser_width: 8,
        alignment_margin: 1.4,
        log_speed: 85
    };

    function getDefaultUpgrades() {
        return {
            laser_width: { level: 1, max: 3, cost: 150, modifierStep: 4 },
            alignment_margin: { level: 1, max: 3, cost: 200, modifierStep: 0.3 },
            log_speed: { level: 1, max: 3, cost: 175, modifierStep: 15 }
        };
    }

    function cloneDefaultUpgrades() {
        return JSON.parse(JSON.stringify(getDefaultUpgrades()));
    }

    function mergeUpgrades(savedUpgrades) {
        const defaults = getDefaultUpgrades();
        const merged = {};
        Object.keys(defaults).forEach((key) => {
            const base = defaults[key];
            const saved = savedUpgrades && savedUpgrades[key] ? savedUpgrades[key] : {};
            merged[key] = { ...base, ...saved };
            if (merged[key].modifierStep === undefined && merged[key].modifier !== undefined) {
                merged[key].modifierStep = base.modifierStep;
                delete merged[key].modifier;
            }
            merged[key].level = Math.max(1, Math.min(merged[key].level, merged[key].max));
        });
        return merged;
    }

    function syncPlayerIQ() {
        const finished = currentState.totalObjectivesFinished || 0;
        currentState.playerIQ = 100 + (finished * 3);
    }

    function countMaxedUpgrades(upgrades) {
        if (!upgrades) return 0;
        return Object.keys(upgrades).filter((key) => {
            const u = upgrades[key];
            return u && u.level >= u.max;
        }).length;
    }

    // 1. Core Default Configuration
    const DEFAULT_STATE = {
        credits: 500,
        scienceIntelligence: 0,
        playerIQ: 100,
        safetyRating: 100,
        campaignStage: 1,
        totalObjectivesFinished: 0,
        upgrades: cloneDefaultUpgrades()
    };

    const LOCAL_STORAGE_KEY = 'cosmic_ops_game_state';

    // 2. Active State Cache
    let currentState = { ...DEFAULT_STATE };

    // 3. State Management Object
    const GameState = {
        init() {
            this.load();
            this.dispatchUpdate();

            window.addEventListener('storage', (e) => {
                if (e.key === LOCAL_STORAGE_KEY) {
                    this.load();
                    this.dispatchUpdate();
                }
            });
        },

        load() {
            try {
                const serialized = localStorage.getItem(LOCAL_STORAGE_KEY);
                if (serialized) {
                    const parsed = JSON.parse(serialized);
                    currentState = {
                        ...DEFAULT_STATE,
                        ...parsed,
                        upgrades: mergeUpgrades(parsed.upgrades)
                    };
                    if (typeof currentState.campaignStage !== 'number') currentState.campaignStage = 1;
                    if (typeof currentState.totalObjectivesFinished !== 'number') currentState.totalObjectivesFinished = 0;
                    syncPlayerIQ();
                } else {
                    currentState = {
                        ...DEFAULT_STATE,
                        upgrades: cloneDefaultUpgrades()
                    };
                    this.save();
                }
            } catch (err) {
                console.error("Failed to load game state from localStorage:", err);
                currentState = {
                    ...DEFAULT_STATE,
                    upgrades: cloneDefaultUpgrades()
                };
            }
            return currentState;
        },

        save() {
            try {
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(currentState));
                this.dispatchUpdate();
            } catch (err) {
                console.error("Failed to save game state to localStorage:", err);
            }
        },

        reset() {
            currentState = {
                ...DEFAULT_STATE,
                upgrades: cloneDefaultUpgrades()
            };
            this.save();
        },

        // --- Meta-Progression Upgrades ---
        getUpgrades() {
            if (!currentState.upgrades) {
                return cloneDefaultUpgrades();
            }
            return JSON.parse(JSON.stringify(currentState.upgrades));
        },

        getUpgradeLevel(upgradeId) {
            const upgrade = currentState.upgrades && currentState.upgrades[upgradeId];
            return upgrade ? upgrade.level : 1;
        },

        /**
         * Active gameplay modifier derived from level * modifierStep (+ station baselines).
         */
        getUpgradeModifier(upgradeId) {
            const upgrades = currentState.upgrades;
            if (!upgrades || !upgrades[upgradeId]) {
                return null;
            }
            const upgrade = upgrades[upgradeId];
            const level = upgrade.level || 1;
            const step = upgrade.modifierStep || 0;

            switch (upgradeId) {
                case 'laser_width':
                    return UPGRADE_BASE.laser_width + (level * step);
                case 'alignment_margin':
                    return UPGRADE_BASE.alignment_margin + (level * step);
                case 'log_speed':
                    return Math.max(40, UPGRADE_BASE.log_speed - (level * step));
                default:
                    return level * step;
            }
        },

        dispatchUpgradesUpdated(detail) {
            const event = new CustomEvent('cosmic-ops-upgrades-updated', { detail });
            window.dispatchEvent(event);
        },

        purchaseUpgrade(upgradeId) {
            const upgrades = currentState.upgrades;
            if (!upgrades || !upgrades[upgradeId]) {
                return { success: false, reason: 'invalid_upgrade' };
            }

            const upgrade = upgrades[upgradeId];
            const isMaxed = upgrade.level >= upgrade.max;
            if (isMaxed) {
                return { success: false, reason: 'max_level', isMaxed: true };
            }
            if (currentState.credits < upgrade.cost) {
                return { success: false, reason: 'insufficient_credits', isMaxed: false };
            }

            currentState.credits -= upgrade.cost;
            upgrade.level += 1;
            upgrade.cost = Math.round(upgrade.cost * 1.5);
            const nowMaxed = upgrade.level >= upgrade.max;

            this.save();
            this.dispatchUpgradesUpdated({
                upgradeId,
                level: upgrade.level,
                cost: upgrade.cost,
                modifier: this.getUpgradeModifier(upgradeId),
                credits: currentState.credits,
                isMaxed: nowMaxed,
                upgrades: this.getUpgrades()
            });

            return {
                success: true,
                upgradeId,
                level: upgrade.level,
                modifier: this.getUpgradeModifier(upgradeId),
                isMaxed: nowMaxed
            };
        },

        getCampaignStage() {
            return currentState.campaignStage || 1;
        },

        getTotalObjectivesFinished() {
            return currentState.totalObjectivesFinished || 0;
        },

        getMaxedUpgradeCount() {
            return countMaxedUpgrades(currentState.upgrades);
        },

        recordObjectiveMilestone() {
            currentState.totalObjectivesFinished = (currentState.totalObjectivesFinished || 0) + 1;
            syncPlayerIQ();
            this.save();
            return currentState.totalObjectivesFinished;
        },

        // --- Credits Operations ---
        getCredits() {
            return currentState.credits;
        },

        addCredits(amount) {
            const val = parseInt(amount, 10);
            if (!isNaN(val) && val > 0) {
                currentState.credits += val;
                this.save();
            }
        },

        deductCredits(amount) {
            const val = parseInt(amount, 10);
            if (!isNaN(val) && val > 0) {
                if (currentState.credits >= val) {
                    currentState.credits -= val;
                    this.save();
                    return true;
                }
            }
            return false;
        },

        // --- Science Intelligence Operations ---
        getScience() {
            return currentState.scienceIntelligence;
        },

        addScience(amount) {
            const val = parseInt(amount, 10);
            if (!isNaN(val) && val > 0) {
                currentState.scienceIntelligence += val;
                this.save();
            }
        },

        deductScience(amount) {
            const val = parseInt(amount, 10);
            if (!isNaN(val) && val > 0) {
                if (currentState.scienceIntelligence >= val) {
                    currentState.scienceIntelligence -= val;
                    this.save();
                    return true;
                }
            }
            return false;
        },

        // --- Player IQ Operations ---
        getIQ() {
            syncPlayerIQ();
            return currentState.playerIQ;
        },

        addIQ(amount) {
            const val = parseInt(amount, 10);
            if (!isNaN(val) && val > 0) {
                currentState.playerIQ += val;
                this.save();
            }
        },

        // --- Orbital Threat Safety Rating Operations ---
        getSafetyRating() {
            return currentState.safetyRating;
        },

        setSafetyRating(percentage) {
            const val = parseFloat(percentage);
            if (!isNaN(val)) {
                currentState.safetyRating = Math.max(0, Math.min(100, val));
                this.save();
            }
        },

        adjustSafetyRating(amount) {
            const val = parseFloat(amount);
            if (!isNaN(val)) {
                this.setSafetyRating(currentState.safetyRating + val);
            }
        },

        // --- Staged Transaction Pattern Hooks ---
        claimMilestone(objectiveId) {
            try {
                const payloadKey = 'active_mission_payload';
                const serialized = localStorage.getItem(payloadKey);
                if (!serialized) {
                    console.warn("No active mission payload staged in storage for milestone claim.");
                    return false;
                }

                const payload = JSON.parse(serialized);
                if (!payload.objectives || !Array.isArray(payload.objectives)) {
                    console.warn("Active mission payload has no valid objectives array.");
                    return false;
                }

                const obj = payload.objectives.find(o => o.id === objectiveId);
                if (!obj) {
                    console.warn(`Objective ID ${objectiveId} not found in active mission payload.`);
                    return false;
                }

                if (obj.isCompleted) {
                    console.warn(`Objective ID ${objectiveId} is already completed.`);
                    return false;
                }

                obj.isCompleted = true;
                localStorage.setItem(payloadKey, JSON.stringify(payload));

                const share = obj.payoutShare || 0;
                const creditPayout = Math.floor((payload.creditReward || 0) * share);
                const intelPayout = Math.floor((payload.intelReward || 0) * share);

                if (creditPayout > 0) {
                    currentState.credits += creditPayout;
                }
                if (intelPayout > 0) {
                    currentState.scienceIntelligence += intelPayout;
                }

                this.recordObjectiveMilestone();

                const milestoneEvent = new CustomEvent('cosmic-ops-milestone-claimed', {
                    detail: {
                        objectiveId: objectiveId,
                        objectiveText: obj.text,
                        creditPayout: creditPayout,
                        intelPayout: intelPayout,
                        payload: payload
                    }
                });
                window.dispatchEvent(milestoneEvent);

                return true;
            } catch (err) {
                console.error("Failed to claim milestone:", err);
                return false;
            }
        },

        completeActiveMission() {
            try {
                const payloadKey = 'active_mission_payload';
                const serialized = localStorage.getItem(payloadKey);
                if (!serialized) {
                    console.warn("No active mission payload staged in storage.");
                    return false;
                }

                const payload = JSON.parse(serialized);

                if (payload.objectives && Array.isArray(payload.objectives)) {
                    const allDone = payload.objectives.every(o => o.isCompleted);
                    if (!allDone) {
                        console.warn("Cannot complete active mission: some objectives are still outstanding.");
                        return false;
                    }
                }

                if (payload.safetyReward && payload.safetyReward > 0) {
                    this.adjustSafetyRating(payload.safetyReward);
                }

                try {
                    const compKey = 'cosmic_ops_completed_missions';
                    const existing = localStorage.getItem(compKey);
                    let list = existing ? JSON.parse(existing) : [];
                    if (!list.includes(payload.missionId)) {
                        list.push(payload.missionId);
                        localStorage.setItem(compKey, JSON.stringify(list));
                    }
                } catch (e) {
                    console.error("Failed to append completed mission ID:", e);
                }

                const isExodusPayload = payload.contractType === 'exodus' ||
                    /project\s+exodus/i.test(payload.objectiveText || '');
                if (isExodusPayload) {
                    currentState.campaignStage = 2;
                }

                localStorage.removeItem(payloadKey);
                this.save();

                const completionEvent = new CustomEvent('cosmic-ops-staged-mission-completed', {
                    detail: { ...payload }
                });
                window.dispatchEvent(completionEvent);

                return true;
            } catch (err) {
                console.error("Failed to complete staged active mission:", err);
                return false;
            }
        },

        dispatchUpdate() {
            const event = new CustomEvent('cosmic-ops-state-updated', {
                detail: { ...currentState }
            });
            window.dispatchEvent(event);
        }
    };

    window.GameState = GameState;
    GameState.init();
})();
