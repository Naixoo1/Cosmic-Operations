/**
 * COSMIC OPERATIONS MISSION & THREAT ENGINE
 * core/mission-engine.js
 * 
 * Simulates space debris decay and threat vectors, manages active tactical 
 * missions across observatory sites, and processes rewards upon completion.
 */

(function() {
    // 1. Mission Templates Library
    const MISSION_TEMPLATES = {
        mauna_kea: [
            {
                title: "Clear Orbital Debris Wave",
                description: "Cleanse low-orbit space-junk cluttering the observatory's line of sight.",
                rewardCredits: 120,
                rewardScience: 25,
                rewardSafety: 15
            },
            {
                title: "Calibrate Adaptive Optics Laser",
                description: "Perform coordinate alignments to tune the laser guide star beam.",
                rewardCredits: 80,
                rewardScience: 40,
                rewardSafety: 8
            },
            {
                title: "Atmospheric Aerosol Scan",
                description: "Measure cloud particulate density profiles to adjust laser wavefronts.",
                rewardCredits: 95,
                rewardScience: 30,
                rewardSafety: 10
            }
        ],
        atacama: [
            {
                title: "Filter Correlator Noise",
                description: "Identify and filter multi-path wave interferences in the sub-millimeter array.",
                rewardCredits: 150,
                rewardScience: 35,
                rewardSafety: 12
            },
            {
                title: "Sync Receiver Array Phase",
                description: "Run phase adjustments across all 64 antennas to correct correlator lag.",
                rewardCredits: 110,
                rewardScience: 45,
                rewardSafety: 15
            },
            {
                title: "Capture Radio Burst Pulse",
                description: "Tune receivers to capture a fast radio transient emitting from an unknown galaxy.",
                rewardCredits: 200,
                rewardScience: 60,
                rewardSafety: 5
            }
        ],
        bosscha: [
            {
                title: "Map Exoplanet Coordinates",
                description: "Perform precise transit analysis of Alpha Centauri AB to identify habitable zones.",
                rewardCredits: 180,
                rewardScience: 75,
                rewardSafety: 5
            },
            {
                title: "Track Near-Earth Asteroid",
                description: "Refine orbit parameters for space-rock transit calculations to prevent orbital threats.",
                rewardCredits: 130,
                rewardScience: 50,
                rewardSafety: 18
            },
            {
                title: "Filter Lembang Light Pollution",
                description: "Re-calibrate the 60cm Zeiss refractor software filters to account for urban sky-glow.",
                rewardCredits: 90,
                rewardScience: 30,
                rewardSafety: 10
            }
        ]
    };

    const LOCAL_STORAGE_KEY = 'cosmic_ops_active_missions';
    let activeMissions = [];
    let decayIntervalId = null;

    const MissionEngine = {
        /**
         * Initialize the Mission and Threat Engine
         */
        init() {
            this.loadMissions();
            this.startDecayTimer();

            // Listen to staged completions if they happen within the same page context
            window.addEventListener('cosmic-ops-staged-mission-completed', (e) => {
                const payload = e.detail;
                if (payload && payload.missionId) {
                    this.completeMission(payload.missionId);
                }
            });
        },

        /**
         * Loads active missions from storage, or generates initial ones if empty
         */
        loadMissions() {
            try {
                const serialized = localStorage.getItem(LOCAL_STORAGE_KEY);
                if (serialized) {
                    activeMissions = JSON.parse(serialized);

                    // Check if there are completed missions from the viewport/other pages
                    const compKey = 'cosmic_ops_completed_missions';
                    const storedCompleted = localStorage.getItem(compKey);
                    if (storedCompleted) {
                        const completedList = JSON.parse(storedCompleted);
                        if (completedList && completedList.length > 0) {
                            let updated = false;
                            completedList.forEach(mId => {
                                const idx = activeMissions.findIndex(m => m.id === mId);
                                if (idx !== -1) {
                                    const mission = activeMissions[idx];
                                    const replacement = this.createMissionForSite(mission.site);
                                    if (replacement) {
                                        activeMissions[idx] = replacement;
                                    } else {
                                        activeMissions.splice(idx, 1);
                                    }
                                    updated = true;
                                }
                            });
                            if (updated) {
                                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(activeMissions));
                            }
                            localStorage.removeItem(compKey); // Clear completed list once processed
                        }
                    }
                } else {
                    this.generateInitialMissions();
                }
            } catch (err) {
                console.error("Failed to load active missions:", err);
                this.generateInitialMissions();
            }
            return activeMissions;
        },

        /**
         * Saves active missions to storage
         */
        saveMissions() {
            try {
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(activeMissions));
                this.dispatchMissionsUpdate();
            } catch (err) {
                console.error("Failed to save active missions:", err);
            }
        },

        /**
         * Generates an initial active mission pool (1 per site)
         */
        generateInitialMissions() {
            activeMissions = [
                this.createMissionForSite('mauna_kea'),
                this.createMissionForSite('atacama'),
                this.createMissionForSite('bosscha')
            ];
            this.saveMissions();
        },

        /**
         * Utility to construct a unique mission state from templates
         */
        createMissionForSite(site) {
            const templates = MISSION_TEMPLATES[site];
            if (!templates || templates.length === 0) return null;

            // Pick a random template
            const template = templates[Math.floor(Math.random() * templates.length)];
            
            // Tiered narrative difficulties based on template rewards
            const tier = (template.rewardCredits >= 120) ? 'critical' : 'standard';

            // Generate exactly 2 distinct (Standard) or exactly 3 (Critical) concurrent objectives tailored to that station
            const objectives = [];
            if (site === 'mauna_kea') {
                if (tier === 'critical') {
                    objectives.push(
                        { id: 'obj_troposphere', text: 'Purify Troposphere Layer', isCompleted: false, payoutShare: 0.33 },
                        { id: 'obj_stratosphere', text: 'Purify Stratosphere Layer', isCompleted: false, payoutShare: 0.33 },
                        { id: 'obj_leo', text: 'Purify LEO Layer', isCompleted: false, payoutShare: 0.34 }
                    );
                } else {
                    objectives.push(
                        { id: 'obj_troposphere', text: 'Purify Troposphere Layer', isCompleted: false, payoutShare: 0.50 },
                        { id: 'obj_stratosphere', text: 'Purify Stratosphere Layer', isCompleted: false, payoutShare: 0.50 }
                    );
                }
            } else if (site === 'atacama') {
                if (tier === 'critical') {
                    objectives.push(
                        { id: 'at_amplitude', text: 'Match Target Amplitude', isCompleted: false, payoutShare: 0.33 },
                        { id: 'at_frequency', text: 'Match Target Frequency', isCompleted: false, payoutShare: 0.33 },
                        { id: 'at_noise', text: 'Match Noise Filtering', isCompleted: false, payoutShare: 0.34 }
                    );
                } else {
                    objectives.push(
                        { id: 'at_amplitude', text: 'Match Target Amplitude', isCompleted: false, payoutShare: 0.50 },
                        { id: 'at_frequency', text: 'Match Target Frequency', isCompleted: false, payoutShare: 0.50 }
                    );
                }
            } else if (site === 'bosscha') {
                if (tier === 'critical') {
                    objectives.push(
                        { id: 'bs_lock', text: 'Lock Target Coordinates', isCompleted: false, payoutShare: 0.33 },
                        { id: 'bs_calibrate', text: 'Calibrate Photometer Sensor', isCompleted: false, payoutShare: 0.33 },
                        { id: 'bs_transit', text: 'Capture Transit Minima', isCompleted: false, payoutShare: 0.34 }
                    );
                } else {
                    objectives.push(
                        { id: 'bs_lock', text: 'Lock Target Coordinates', isCompleted: false, payoutShare: 0.50 },
                        { id: 'bs_transit', text: 'Capture Transit Minima', isCompleted: false, payoutShare: 0.50 }
                    );
                }
            }

            return {
                id: `mission-${site}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                site: site,
                title: template.title,
                description: template.description,
                rewardCredits: template.rewardCredits,
                rewardScience: template.rewardScience,
                rewardSafety: template.rewardSafety,
                status: 'active',
                tier: tier,
                objectives: objectives
            };
        },

        /**
         * Returns current active missions
         */
        getMissions() {
            return activeMissions;
        },

        /**
         * Stages a mission to active_mission_payload in localStorage for the viewport to claim
         * (acts as the generateMissionPayload routine where the active mission payload is saved)
         */
        stageMission(missionId) {
            const mission = activeMissions.find(m => m.id === missionId && m.status === 'active');
            if (!mission) {
                console.warn(`Mission ID ${missionId} not found or not active.`);
                return null;
            }

            // Explicitly purge any old active_mission_payload key in system memory before writing new parameters
            localStorage.removeItem('active_mission_payload');

            const payload = {
                missionId: mission.id,
                stationId: mission.site,
                objectiveText: mission.title,
                creditReward: mission.rewardCredits,
                totalCreditReward: mission.rewardCredits,
                intelReward: mission.rewardScience,
                totalIntelReward: mission.rewardScience,
                scienceReward: mission.rewardScience,
                safetyReward: mission.rewardSafety,
                tier: mission.tier || 'standard',
                // Explicitly map objective items to ensure their isCompleted attributes are strictly set to false upon object construction
                objectives: (mission.objectives || []).map((obj, idx) => ({
                    id: obj.id || `obj-${idx}-${Date.now()}`,
                    text: obj.text || `Objective ${idx + 1}`,
                    isCompleted: false,
                    payoutShare: typeof obj.payoutShare === 'number' ? obj.payoutShare : 0.50
                }))
            };

            localStorage.setItem('active_mission_payload', JSON.stringify(payload));
            this.dispatchMissionsUpdate();
            return payload;
        },

        /**
         * Completes a mission and replaces it with a new one (rewards are handled by GameState)
         */
        completeMission(missionId) {
            const index = activeMissions.findIndex(m => m.id === missionId && m.status === 'active');
            if (index === -1) {
                console.warn(`Mission ID ${missionId} not found or already completed.`);
                return false;
            }

            const mission = activeMissions[index];

            // 1. Mark completed and generate replacement mission for same site
            const replacement = this.createMissionForSite(mission.site);
            if (replacement) {
                activeMissions[index] = replacement;
            } else {
                activeMissions.splice(index, 1);
            }

            // 2. Persist and dispatch update event
            this.saveMissions();
            
            // Dispatch a specific completion event for rich UI notifications
            const completionEvent = new CustomEvent('cosmic-ops-mission-completed', {
                detail: { completedMission: mission, replacementMission: replacement }
            });
            window.dispatchEvent(completionEvent);

            return true;
        },

        /**
         * Starts the background orbital threat decay timer
         */
        startDecayTimer() {
            if (decayIntervalId) return;

            // Decays safety rating slightly (0.5%) every 12 seconds
            decayIntervalId = setInterval(() => {
                if (window.GameState) {
                    const currentRating = window.GameState.getSafetyRating();
                    
                    // Slightly adjust rating downwards (safety rating decay)
                    // If rating falls below 80%, threat waves overwhelm the sector
                    if (currentRating > 0) {
                        // Decay faster if safety rating is already low, modeling an escalating threat
                        const decayFactor = currentRating < 80 ? -0.75 : -0.4;
                        window.GameState.adjustSafetyRating(decayFactor);
                    }
                }
            }, 12000);
        },

        /**
         * Pauses or stops background decay calculations
         */
        stopDecayTimer() {
            if (decayIntervalId) {
                clearInterval(decayIntervalId);
                decayIntervalId = null;
            }
        },

        /**
         * Dispatches custom event notifying the UI that the mission board changed
         */
        dispatchMissionsUpdate() {
            const event = new CustomEvent('cosmic-ops-missions-updated', {
                detail: { activeMissions: [...activeMissions] }
            });
            window.dispatchEvent(event);
        }
    };

    // Auto-init and bind to global context for inclusion
    window.MissionEngine = MissionEngine;
    MissionEngine.init();
})();
