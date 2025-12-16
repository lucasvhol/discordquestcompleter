# Quick Start Guide

## 30-Second Setup

1. **Open Discord** → https://discord.com/app
2. **Open DevTools** → Press `F12`
3. **Go to Console** → Click "Console" tab
4. **Copy & Paste** → Copy all code from `script.js` and paste into console
5. **Run** → Press Enter

Done! The script will automatically find and complete your active quests.

## What Happens Next?

The console will show:
- Number of active quests found
- Quest names and types
- Real-time progress updates
- Completion status for each quest

Example output:
```
Discord Quest Automation

============================================================

Found 2 active quest(s):

  1. Watch Some Videos (ID: 123456)
  2. Play A Game (ID: 789012)

[Quest 1/2] Processing: Watch Some Videos
  Task Type: WATCH_VIDEO
  Progress: 0/3600 seconds

  Status: Quest "Watch Some Videos" completed successfully.
  Info: Estimated processing time: 514 seconds.

[Quest 2/2] Processing: Play A Game
  Task Type: PLAY_ON_DESKTOP
  Warning: Desktop app required. Please use Discord Desktop app...

============================================================
Execution completed.
```

## Notes

- Keep the console window open while quests complete
- Don't close the Discord tab during processing
- Some quests require the Discord Desktop app
- Activity quests need at least 1 other person in voice channel

## Troubleshooting

**Console shows errors?** 
- Make sure you're using latest Discord version
- Try refreshing the page (F5) and pasting again

**Quests not starting?**
- Ensure you have active quests in Discord
- Go to Quests tab and confirm they're there

**Desktop app quests skipped?**
- Download Discord Desktop app: https://discord.com/download
- Use it instead of browser for gaming/streaming quests

Need more help? See [README.md](README.md)
