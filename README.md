# Discord Pomodoro Bot

A Discord bot that helps you maintain a productive study schedule using the Pomodoro Technique. This bot allows you to create study sessions with customizable durations and break periods.

## Features

- Start study sessions with customizable duration and repeat cycles
- Automatic break periods between study sessions
- Check current session status
- Stop active sessions at any time

## Commands

### Start a Study Session

```
!pomo start <duration> <repeat>
```

- `duration`: Length of each study session in minutes
- `repeat`: Number of study cycles to complete

Example:

```
!pomo start 25 4
```

This will start a Pomodoro session with:

- 25-minute study periods
- 4 complete cycles

### Check Session Status

```
!pomo status
```

Shows information about the current study session, including:

- Current duration
- Remaining cycles
- Current phase (Study or Break)
- Time remaining

### Stop Current Session

```
!pomo stop
```

Ends the current study session immediately.

## Usage Examples

1. Start a standard Pomodoro session (25 minutes × 4 cycles):

```
!pomo start 25 4
```

2. Start a custom session (45 minutes × 2 cycles):

```
!pomo start 45 2
```

3. Check your current session status:

```
!pomo status
```

4. Stop your current session:

```
!pomo stop
```

## Future

I might add more features.

Happy studying! 🎓
