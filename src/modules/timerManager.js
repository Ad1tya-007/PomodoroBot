const logger = require('../utils/logger');
const config = require('../../config.json');

class TimerManager {
  constructor() {
    this.timers = new Map(); // Store active timers for each guild
    this.sessions = new Map(); // Store session info for each guild
    this.startTimes = new Map(); // Store start times for each guild
  }

  async startSession(message, duration, repeat) {
    try {
      const guildId = message.guild.id;

      // Check if there's already an active session
      if (this.timers.has(guildId)) {
        throw new Error('A study session is already in progress!');
      }

      // Convert duration to milliseconds
      const durationMs = duration * 60 * 1000;
      const breakMs = config.studyBreakDuration * 60 * 1000;

      // Store session info
      this.sessions.set(guildId, {
        duration,
        repeat,
        remainingCycles: repeat,
        isBreak: false,
        durationMs,
        breakMs,
      });

      // Store start time
      this.startTimes.set(guildId, Date.now());

      // Start the first study period
      await this.startStudyPeriod(message, durationMs);
    } catch (error) {
      logger.error('Failed to start study session', error);
      throw error;
    }
  }

  async startStudyPeriod(message, durationMs) {
    const guildId = message.guild.id;
    const session = this.sessions.get(guildId);

    // Update start time
    this.startTimes.set(guildId, Date.now());

    // Send study session start notification
    await message.channel.send(
      `🎯 Study session started! Focus for ${session.duration} minutes.`
    );

    // Create timer for study period
    const timer = setTimeout(async () => {
      try {
        // Send study session end notification
        await message.channel.send('⏰ Study session ended! Time for a break.');

        // Start break period
        await this.startBreakPeriod(message);
      } catch (error) {
        logger.error('Error in study period timer', error);
      }
    }, durationMs);

    // Store the timer
    this.timers.set(guildId, timer);
  }

  async startBreakPeriod(message) {
    const guildId = message.guild.id;
    const session = this.sessions.get(guildId);
    const breakMs = config.studyBreakDuration * 60 * 1000;

    // Update start time
    this.startTimes.set(guildId, Date.now());

    // Update session state
    session.isBreak = true;

    // Send break start notification
    await message.channel.send(
      `☕ Break time! Take ${config.studyBreakDuration} minutes to rest.`
    );

    // Create timer for break period
    const timer = setTimeout(async () => {
      try {
        // Decrease remaining cycles
        session.remainingCycles--;

        // Send break end notification
        await message.channel.send(
          '⏰ Break ended! Time to get back to studying.'
        );

        // Check if there are more cycles
        if (session.remainingCycles > 0) {
          // Start next study period
          await this.startStudyPeriod(message, session.durationMs);
        } else {
          // End the session
          await this.endSession(message);
        }
      } catch (error) {
        logger.error('Error in break period timer', error);
      }
    }, breakMs);

    // Store the timer
    this.timers.set(guildId, timer);
  }

  async endSession(message) {
    const guildId = message.guild.id;

    // Clear timer if it exists
    if (this.timers.has(guildId)) {
      clearTimeout(this.timers.get(guildId));
      this.timers.delete(guildId);
    }

    // Clear session data
    this.sessions.delete(guildId);
    this.startTimes.delete(guildId);

    // Send completion notification
    await message.channel.send(
      "🎉 Congratulations! You've completed all study sessions!"
    );
  }

  async stopSession(message) {
    const guildId = message.guild.id;

    // Clear timer if it exists
    if (this.timers.has(guildId)) {
      clearTimeout(this.timers.get(guildId));
      this.timers.delete(guildId);
    }

    // Clear session data
    this.sessions.delete(guildId);
    this.startTimes.delete(guildId);

    // Send cancellation notification
    await message.channel.send('❌ Study session stopped.');
  }

  getSessionStatus(guildId) {
    const session = this.sessions.get(guildId);
    if (!session) return null;

    const startTime = this.startTimes.get(guildId);
    if (!startTime) return null;

    const currentTime = Date.now();
    const elapsedTime = currentTime - startTime;
    const totalDuration = session.isBreak
      ? session.breakMs
      : session.durationMs;
    const remainingTime = Math.max(0, totalDuration - elapsedTime);

    // Calculate minutes and seconds without rounding up
    const remainingMinutes = Math.floor(remainingTime / (60 * 1000));
    const remainingSeconds = Math.floor((remainingTime % (60 * 1000)) / 1000);

    return {
      duration: session.duration,
      remainingCycles: session.remainingCycles,
      isBreak: session.isBreak,
      remainingTime: `${remainingMinutes}m ${remainingSeconds}s`,
    };
  }
}

module.exports = new TimerManager();
