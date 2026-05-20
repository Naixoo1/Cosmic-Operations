/**
 * COSMIC OPERATIONS COMMAND HUB // GLOBAL SAVE SYSTEM
 * core/game-state.js
 * 
 * Synchronizes and persists player currencies, attributes, and safety ratings
 * across relative page transitions using the browser's localStorage system.
 */

(function() {
    // 1. Core Default Configuration
    const DEFAULT_STATE = {
        credits: 500,
        scienceIntelligence: 0,
        playerIQ: 100,
        safetyRating: 100 // Out of 100%
    };

    const LOCAL_STORAGE_KEY = 'cosmic_ops_game_state';

    // 2. Active State Cache
    let currentState = { ...DEFAULT_STATE };

    // 3. State Management Object
    const GameState = {
        /**
         * Initialize the game state from localStorage or defaults
         */
        init() {
            this.load();
            this.dispatchUpdate();
            
            // Listen to storage events from other pages to keep terminals synced
            window.addEventListener('storage', (e) => {
                if (e.key === LOCAL_STORAGE_KEY) {
                    this.load();
                    this.dispatchUpdate();
                }
            });
        },

        /**
         * Loads state from localStorage
         */
        load() {
            try {
                const serialized = localStorage.getItem(LOCAL_STORAGE_KEY);
                if (serialized) {
                    const parsed = JSON.parse(serialized);
                    // Ensure all keys are present
                    currentState = { ...DEFAULT_STATE, ...parsed };
                } else {
                    currentState = { ...DEFAULT_STATE };
                    this.save();
                }
            } catch (err) {
                console.error("Failed to load game state from localStorage:", err);
                currentState = { ...DEFAULT_STATE };
            }
            return currentState;
        },

        /**
         * Saves state to localStorage
         */
        save() {
            try {
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(currentState));
                this.dispatchUpdate();
            } catch (err) {
                console.error("Failed to save game state to localStorage:", err);
            }
        },

        /**
         * Resets state to default configurations
         */
        reset() {
            currentState = { ...DEFAULT_STATE };
            this.save();
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
                    return true; // Deduction successful
                }
            }
            return false; // Insufficient credits or invalid value
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
                // Clamp between 0% and 100%
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
        /**
         * Validates and completes the active staged mission, transferring credits and science,
         * then clears the active payload to enforce complete-to-earn integrity.
         */
        completeActiveMission() {
            try {
                const payloadKey = 'active_mission_payload';
                const serialized = localStorage.getItem(payloadKey);
                if (!serialized) {
                    console.warn("No active mission payload staged in storage.");
                    return false;
                }

                const payload = JSON.parse(serialized);
                
                // 1. Distribute rewards safely
                if (payload.creditReward && payload.creditReward > 0) {
                    this.addCredits(payload.creditReward);
                }
                if (payload.intelReward && payload.intelReward > 0) {
                    this.addScience(payload.intelReward);
                }
                if (payload.safetyReward && payload.safetyReward > 0) {
                    this.adjustSafetyRating(payload.safetyReward);
                }

                // Append the mission ID to the completed missions list for the mission engine to pick up
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

                // 2. Clear out the payload to prevent double-spending exploits
                localStorage.removeItem(payloadKey);
                
                // 3. Persist state and dispatch updates
                this.save();
                
                // Dispatch specific completion event
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

        // --- Utility Helper Operations ---
        /**
         * Dispatches custom event to notify active UI elements of updates
         */
        dispatchUpdate() {
            const event = new CustomEvent('cosmic-ops-state-updated', {
                detail: { ...currentState }
            });
            window.dispatchEvent(event);
        }
    };

    // Auto-init and bind to global context for simple, robust script inclusion
    window.GameState = GameState;
    GameState.init();
})();
