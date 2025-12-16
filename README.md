# Discord Quest Automation

Automated Discord Quest completion script. Paste into browser console to automatically process active quests.

## Features

- Supports multiple quest types:
  - Video watching quests
  - Desktop gaming quests
  - Desktop streaming quests
  - Activity/voice channel quests
- Automatic progress tracking and completion
- Error handling and recovery
- Desktop app detection for app-only quests
- Configuration-driven approach

## Installation

1. Clone or download this repository
2. Open Discord in your browser (https://discord.com/app)
3. Open DevTools: Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
4. Navigate to the **Console** tab
5. Copy and paste the contents of `script.js` into the console
6. Press Enter to execute

## Usage

The script runs automatically on execution. It will:

1. Scan for all active, incomplete quests
2. Display found quests in the console
3. Process each quest according to its type
4. Report progress and completion status

### Supported Quest Types

| Quest Type | Description | Requirements |
|-----------|-----------|--------------|
| `WATCH_VIDEO` | Watch video content | None |
| `WATCH_VIDEO_ON_MOBILE` | Mobile video watching | None |
| `PLAY_ON_DESKTOP` | Play games on desktop | Desktop app required |
| `STREAM_ON_DESKTOP` | Stream gameplay | Desktop app + 1 other user in VC |
| `PLAY_ACTIVITY` | Participate in voice activities | Voice channel required |

## Console Output

The script provides detailed progress information:

```
Discord Quest Automation

============================================================

Found 2 active quest(s):

  1. Quest Name One (ID: xxx)
  2. Quest Name Two (ID: yyy)

[Quest 1/2] Processing: Quest Name One
  Task Type: WATCH_VIDEO
  Progress: 0/3600 seconds

  Status: Quest "Quest Name One" completed successfully.
  Info: Estimated processing time: 514 seconds.

============================================================
Execution completed.
```

## Configuration

Edit the `CONFIG` object in `script.js` to adjust timings:

```javascript
const CONFIG = {
    VIDEO_QUEST: {
        MAX_FUTURE_SECONDS: 10,      // Max time ahead allowed
        SPEED_MULTIPLIER: 7,          // Seconds per update
        INTERVAL_SECONDS: 1,          // Wait between updates
    },
    ACTIVITY_QUEST: {
        HEARTBEAT_INTERVAL_MS: 20000, // Heartbeat frequency (ms)
    },
};
```

## Requirements

- Discord web app or desktop app
- Browser with DevTools access
- Active Discord Nitro or qualifying guild for quests

## Important Notes

- Desktop app is required for gaming and streaming quests
- Activity quests require at least one other user in the voice channel
- The script automatically detects and skips unsupported quest types
- Keep DevTools console open during execution for quests that require it
- Do not close the browser tab or DevTools while quests are processing

## Troubleshooting

### "No active uncompleted quests found"
- Ensure you have active quests available in Discord
- Quests may have expired or already been completed

### "Desktop app required" warning
- Use Discord Desktop app instead of browser for gaming/streaming quests
- Browser cannot report game activity or streaming status

### "No voice channel found" error
- Activity quests require at least one voice channel in your account
- Join or create a private voice channel if needed

### API errors
- Check your internet connection
- Wait and try again later
- Restart Discord if issues persist

## Disclaimer

This is an automation script for Discord Quests. Use at your own risk. Discord's Terms of Service may be updated at any time. Ensure compliance with current platform policies.

## License

MIT

## Contributing

Improvements and bug fixes welcome. Please test thoroughly before submitting changes.
