// ============================================================================
// Discord Quest Automation Script
// ============================================================================

// Configuration Constants
const CONFIG = {
    VIDEO_QUEST: {
        MAX_FUTURE_SECONDS: 10,
        SPEED_MULTIPLIER: 7,
        INTERVAL_SECONDS: 1,
    },
    GAMING_QUEST: {
        PID_MIN: 1000,
        PID_MAX: 31000,
    },
    ACTIVITY_QUEST: {
        HEARTBEAT_INTERVAL_MS: 20000,
    },
    EXCLUDED_QUEST_ID: "1412491570820812933",
};

// ============================================================================
// Store Extraction
// ============================================================================

function extractStores() {
    let wpRequire = webpackChunkdiscord_app.push([[Symbol()], {}, r => r]);
    webpackChunkdiscord_app.pop();

    const stores = {
        applicationStreaming: Object.values(wpRequire.c).find(
            x => x?.exports?.Z?.__proto__?.getStreamerActiveStreamMetadata
        ).exports.Z,
        runningGame: Object.values(wpRequire.c).find(
            x => x?.exports?.ZP?.getRunningGames
        ).exports.ZP,
        quests: Object.values(wpRequire.c).find(
            x => x?.exports?.Z?.__proto__?.getQuest
        ).exports.Z,
        channel: Object.values(wpRequire.c).find(
            x => x?.exports?.Z?.__proto__?.getAllThreadsForParent
        ).exports.Z,
        guildChannel: Object.values(wpRequire.c).find(
            x => x?.exports?.ZP?.getSFWDefaultChannel
        ).exports.ZP,
        fluxDispatcher: Object.values(wpRequire.c).find(
            x => x?.exports?.Z?.__proto__?.flushWaitQueue
        ).exports.Z,
        api: Object.values(wpRequire.c).find(
            x => x?.exports?.tn?.get
        ).exports.tn,
    };

    return stores;
}

// ============================================================================
// Quest Management
// ============================================================================

class QuestManager {
    constructor(stores) {
        this.stores = stores;
        this.isDesktopApp = typeof DiscordNative !== "undefined";
    }

    getActiveQuests() {
        const now = Date.now();
        return [...this.stores.quests.quests.values()].filter(quest => {
            return (
                quest.id !== CONFIG.EXCLUDED_QUEST_ID &&
                quest.userStatus?.enrolledAt &&
                !quest.userStatus?.completedAt &&
                new Date(quest.config.expiresAt).getTime() > now
            );
        });
    }

    async processAllQuests() {
        const quests = this.getActiveQuests();

        if (quests.length === 0) {
            console.log("No active uncompleted quests found.");
            return;
        }

        console.log(`Found ${quests.length} active quest(s):\n`);
        quests.forEach((quest, index) => {
            console.log(`  ${index + 1}. ${quest.config.messages.questName} (ID: ${quest.id})`);
        });
        console.log("\n");

        for (let index = 0; index < quests.length; index++) {
            await this.processQuest(quests[index], index + 1, quests.length);
        }
    }

    async processQuest(quest, questNumber, totalQuests) {
        const questName = quest.config.messages.questName;
        const taskConfig = quest.config.taskConfig ?? quest.config.taskConfigV2;

        // Validate task configuration
        if (!taskConfig?.tasks) {
            console.log(`[Quest ${questNumber}/${totalQuests}] Skipped: ${questName}`);
            console.log(`  Reason: No valid task configuration found.\n`);
            return;
        }

        // Identify task type
        const taskName = this.getTaskType(taskConfig.tasks);
        if (!taskName) {
            console.log(`[Quest ${questNumber}/${totalQuests}] Skipped: ${questName}`);
            console.log(`  Reason: No supported task type found.\n`);
            return;
        }

        // Get target value
        const targetValue = taskConfig.tasks[taskName]?.target;
        if (targetValue === undefined) {
            console.log(`[Quest ${questNumber}/${totalQuests}] Skipped: ${questName}`);
            console.log(`  Reason: Task "${taskName}" has no target value.\n`);
            return;
        }

        const secondsNeeded = targetValue;
        const secondsDone = quest.userStatus?.progress?.[taskName]?.value ?? 0;

        console.log(`[Quest ${questNumber}/${totalQuests}] Processing: ${questName}`);
        console.log(`  Task Type: ${taskName}`);
        console.log(`  Progress: ${secondsDone}/${secondsNeeded} seconds\n`);

        await this.handleQuestByType(quest, taskName, secondsNeeded, secondsDone);
    }

    getTaskType(tasks) {
        const supportedTypes = [
            "WATCH_VIDEO",
            "PLAY_ON_DESKTOP",
            "STREAM_ON_DESKTOP",
            "PLAY_ACTIVITY",
            "WATCH_VIDEO_ON_MOBILE",
        ];
        return supportedTypes.find(type => tasks[type] != null);
    }

    async handleQuestByType(quest, taskName, secondsNeeded, secondsDone) {
        switch (taskName) {
            case "WATCH_VIDEO":
            case "WATCH_VIDEO_ON_MOBILE":
                await this.handleVideoQuest(quest, taskName, secondsNeeded, secondsDone);
                break;

            case "PLAY_ON_DESKTOP":
                if (!this.isDesktopApp) {
                    console.log(
                        `  Warning: Desktop app required. Please use Discord Desktop app to complete "${quest.config.messages.questName}".\n`
                    );
                } else {
                    await this.handlePlayOnDesktopQuest(quest, taskName, secondsNeeded, secondsDone);
                }
                break;

            case "STREAM_ON_DESKTOP":
                if (!this.isDesktopApp) {
                    console.log(
                        `  Warning: Desktop app required. Please use Discord Desktop app to complete "${quest.config.messages.questName}".\n`
                    );
                } else {
                    await this.handleStreamOnDesktopQuest(quest, taskName, secondsNeeded, secondsDone);
                }
                break;

            case "PLAY_ACTIVITY":
                await this.handlePlayActivityQuest(quest, taskName, secondsNeeded, secondsDone);
                break;

            default:
                console.log(`  Error: Unknown quest type "${taskName}".\n`);
        }
    }

    sleep(milliseconds) {
        return new Promise(resolve => setTimeout(resolve, milliseconds));
    }
}

// ============================================================================
// Video Quest Handler
// ============================================================================

class VideoQuestHandler {
    constructor(questManager) {
        this.questManager = questManager;
        this.stores = questManager.stores;
        this.config = CONFIG.VIDEO_QUEST;
    }

    async handle(quest, taskName, secondsNeeded, secondsDone) {
        const enrolledAt = new Date(quest.userStatus.enrolledAt).getTime();
        let currentProgress = secondsDone;
        let isCompleted = false;

        try {
            while (currentProgress < secondsNeeded) {
                const maxAllowed = Math.floor((Date.now() - enrolledAt) / 1000) + this.config.MAX_FUTURE_SECONDS;
                const diff = maxAllowed - currentProgress;

                if (diff >= this.config.SPEED_MULTIPLIER) {
                    const newProgress = currentProgress + this.config.SPEED_MULTIPLIER;
                    const timestamp = Math.min(secondsNeeded, newProgress + Math.random());

                    try {
                        const response = await this.stores.api.post({
                            url: `/quests/${quest.id}/video-progress`,
                            body: { timestamp },
                        });

                        isCompleted = response.body.completed_at != null;
                        currentProgress = Math.min(secondsNeeded, newProgress);
                    } catch (error) {
                        console.log(`  Error: API error for "${quest.config.messages.questName}": ${error.message}\n`);
                        return;
                    }
                }

                await this.questManager.sleep(this.config.INTERVAL_SECONDS * 1000);
            }

            // Final completion call if not already completed
            if (!isCompleted) {
                try {
                    await this.stores.api.post({
                        url: `/quests/${quest.id}/video-progress`,
                        body: { timestamp: secondsNeeded },
                    });
                } catch (error) {
                    console.log(`  Error: Failed to complete "${quest.config.messages.questName}": ${error.message}\n`);
                    return;
                }
            }

            console.log(`  Status: Quest "${quest.config.messages.questName}" completed successfully.`);
            const estimatedTime = Math.ceil((secondsNeeded - secondsDone) / this.config.SPEED_MULTIPLIER);
            console.log(`  Info: Estimated processing time: ${estimatedTime} seconds.\n`);
        } catch (error) {
            console.log(`  Error: Unexpected error during video quest: ${error.message}\n`);
        }
    }
}

// ============================================================================
// Desktop Gaming Quest Handler
// ============================================================================

class DesktopGamingQuestHandler {
    constructor(questManager) {
        this.questManager = questManager;
        this.stores = questManager.stores;
        this.config = CONFIG.GAMING_QUEST;
    }

    async handle(quest, taskName, secondsNeeded, secondsDone) {
        const pid = Math.floor(Math.random() * (this.config.PID_MAX - this.config.PID_MIN)) + this.config.PID_MIN;
        const applicationId = quest.config.application.id;
        const applicationName = quest.config.application.name;

        try {
            const response = await this.stores.api.get({
                url: `/applications/public?application_ids=${applicationId}`,
            });

            const appData = response.body[0];
            const exeName = appData.executables.find(x => x.os === "win32").name.replace(">", "");

            const fakeGame = this.createFakeGameObject(appData, applicationId, exeName, pid);
            this.injectFakeGame(fakeGame);

            const progressCallback = (data) => this.handleProgressUpdate(data, quest, taskName, secondsNeeded, fakeGame);
            this.stores.fluxDispatcher.subscribe("QUESTS_SEND_HEARTBEAT_SUCCESS", progressCallback);

            console.log(`  Status: Spoofed game started: ${applicationName}.`);
            const estimatedTime = Math.ceil((secondsNeeded - secondsDone) / 60);
            console.log(`  Info: Estimated wait time: ${estimatedTime} minutes.\n`);
        } catch (error) {
            console.log(`  Error: Could not fetch application data for ${applicationName}\n`);
        }
    }

    createFakeGameObject(appData, applicationId, exeName, pid) {
        return {
            cmdLine: `C:\\Program Files\\${appData.name}\\${exeName}`,
            exeName,
            exePath: `c:/program files/${appData.name.toLowerCase()}/${exeName}`,
            hidden: false,
            isLauncher: false,
            id: applicationId,
            name: appData.name,
            pid,
            pidPath: [pid],
            processName: appData.name,
            start: Date.now(),
        };
    }

    injectFakeGame(fakeGame) {
        const realGames = this.stores.runningGame.getRunningGames();
        const fakeGames = [fakeGame];

        this.stores.runningGame._realGetRunningGames = this.stores.runningGame.getRunningGames;
        this.stores.runningGame._realGetGameForPID = this.stores.runningGame.getGameForPID;

        this.stores.runningGame.getRunningGames = () => fakeGames;
        this.stores.runningGame.getGameForPID = (pid) => fakeGames.find(x => x.pid === pid);

        this.stores.fluxDispatcher.dispatch({
            type: "RUNNING_GAMES_CHANGE",
            removed: realGames,
            added: [fakeGame],
            games: fakeGames,
        });
    }

    handleProgressUpdate(data, quest, taskName, secondsNeeded, fakeGame) {
        const progress = quest.config.configVersion === 1
            ? data.userStatus.streamProgressSeconds
            : Math.floor(data.userStatus.progress.PLAY_ON_DESKTOP.value);

        console.log(`  Progress: ${progress}/${secondsNeeded} seconds`);

        if (progress >= secondsNeeded) {
            console.log(`  Status: Quest "${quest.config.messages.questName}" completed successfully.\n`);

            this.stores.runningGame.getRunningGames = this.stores.runningGame._realGetRunningGames;
            this.stores.runningGame.getGameForPID = this.stores.runningGame._realGetGameForPID;

            this.stores.fluxDispatcher.dispatch({
                type: "RUNNING_GAMES_CHANGE",
                removed: [fakeGame],
                added: [],
                games: [],
            });

            this.stores.fluxDispatcher.unsubscribe("QUESTS_SEND_HEARTBEAT_SUCCESS", arguments.callee);
        }
    }
}

// ============================================================================
// Desktop Streaming Quest Handler
// ============================================================================

class DesktopStreamingQuestHandler {
    constructor(questManager) {
        this.questManager = questManager;
        this.stores = questManager.stores;
    }

    async handle(quest, taskName, secondsNeeded, secondsDone) {
        const applicationId = quest.config.application.id;
        const applicationName = quest.config.application.name;
        const pid = Math.floor(Math.random() * 30000) + 1000;

        const realFunc = this.stores.applicationStreaming.getStreamerActiveStreamMetadata;

        this.stores.applicationStreaming.getStreamerActiveStreamMetadata = () => ({
            id: applicationId,
            pid,
            sourceName: null,
        });

        const progressCallback = (data) =>
            this.handleProgressUpdate(data, quest, taskName, secondsNeeded, realFunc, progressCallback);

        this.stores.fluxDispatcher.subscribe("QUESTS_SEND_HEARTBEAT_SUCCESS", progressCallback);

        console.log(`  Status: Spoofed stream started: ${applicationName}.`);
        const estimatedTime = Math.ceil((secondsNeeded - secondsDone) / 60);
        console.log(`  Info: Estimated wait time: ${estimatedTime} minutes.`);
        console.log(`  Info: Stream any window in voice channel. Requires at least 1 other user.\n`);
    }

    handleProgressUpdate(data, quest, taskName, secondsNeeded, realFunc, callback) {
        const progress = quest.config.configVersion === 1
            ? data.userStatus.streamProgressSeconds
            : Math.floor(data.userStatus.progress.STREAM_ON_DESKTOP.value);

        console.log(`  Progress: ${progress}/${secondsNeeded} seconds`);

        if (progress >= secondsNeeded) {
            console.log(`  Status: Quest "${quest.config.messages.questName}" completed successfully.\n`);

            this.stores.applicationStreaming.getStreamerActiveStreamMetadata = realFunc;
            this.stores.fluxDispatcher.unsubscribe("QUESTS_SEND_HEARTBEAT_SUCCESS", callback);
        }
    }
}

// ============================================================================
// Activity Quest Handler
// ============================================================================

class ActivityQuestHandler {
    constructor(questManager) {
        this.questManager = questManager;
        this.stores = questManager.stores;
        this.config = CONFIG.ACTIVITY_QUEST;
    }

    async handle(quest, taskName, secondsNeeded, secondsDone) {
        const channelId = this.getChannelId();

        if (!channelId) {
            console.log(`  Error: No voice channel found. Cannot proceed with activity quest.\n`);
            return;
        }

        const streamKey = `call:${channelId}:1`;

        console.log(`  Status: Activity quest started.\n`);

        try {
            while (true) {
                const response = await this.stores.api.post({
                    url: `/quests/${quest.id}/heartbeat`,
                    body: { stream_key: streamKey, terminal: false },
                });

                const progress = response.body.progress.PLAY_ACTIVITY.value;
                console.log(`  Progress: ${progress}/${secondsNeeded} seconds`);

                if (progress >= secondsNeeded) {
                    await this.stores.api.post({
                        url: `/quests/${quest.id}/heartbeat`,
                        body: { stream_key: streamKey, terminal: true },
                    });
                    break;
                }

                await this.questManager.sleep(this.config.HEARTBEAT_INTERVAL_MS);
            }

            console.log(`  Status: Quest "${quest.config.messages.questName}" completed successfully.\n`);
        } catch (error) {
            console.log(`  Error: API error for "${quest.config.messages.questName}": ${error.message}\n`);
        }
    }

    getChannelId() {
        const privateChannels = this.stores.channel.getSortedPrivateChannels();
        if (privateChannels.length > 0) {
            return privateChannels[0].id;
        }

        const guilds = Object.values(this.stores.guildChannel.getAllGuilds()).filter(x => x?.VOCAL?.length > 0);
        if (guilds.length > 0) {
            return guilds[0].VOCAL[0].channel.id;
        }

        return null;
    }
}

// ============================================================================
// Main Execution
// ============================================================================

async function main() {
    console.log("Discord Quest Automation\n");
    console.log("=".repeat(60) + "\n");

    const stores = extractStores();
    const questManager = new QuestManager(stores);

    await questManager.processAllQuests();

    console.log("=".repeat(60));
    console.log("Execution completed.\n");
}

// Inject handler methods into QuestManager
QuestManager.prototype.handleVideoQuest = async function (quest, taskName, secondsNeeded, secondsDone) {
    const handler = new VideoQuestHandler(this);
    await handler.handle(quest, taskName, secondsNeeded, secondsDone);
};

QuestManager.prototype.handlePlayOnDesktopQuest = async function (quest, taskName, secondsNeeded, secondsDone) {
    const handler = new DesktopGamingQuestHandler(this);
    await handler.handle(quest, taskName, secondsNeeded, secondsDone);
};

QuestManager.prototype.handleStreamOnDesktopQuest = async function (quest, taskName, secondsNeeded, secondsDone) {
    const handler = new DesktopStreamingQuestHandler(this);
    await handler.handle(quest, taskName, secondsNeeded, secondsDone);
};

QuestManager.prototype.handlePlayActivityQuest = async function (quest, taskName, secondsNeeded, secondsDone) {
    const handler = new ActivityQuestHandler(this);
    await handler.handle(quest, taskName, secondsNeeded, secondsDone);
};

// Execute
main();
