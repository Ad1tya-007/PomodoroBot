const timerManager = require('../modules/timerManager');
const logger = require('../utils/logger');

module.exports = {
  data: {
    name: 'pomo',
    description: 'Pomodoro study session commands',
    subcommands: ['start', 'stop', 'status'],
  },
  async execute(message, args) {
    try {
      const subcommand = args[0]?.toLowerCase();
      if (!subcommand) {
        await message.reply(
          'Please specify a subcommand: start, stop, or status'
        );
        return;
      }

      switch (subcommand) {
        case 'start':
          if (args.length < 3) {
            await message.reply(
              'Usage: !pomo start <duration> <repeat>\nExample: !pomo start 25 4'
            );
            return;
          }

          const duration = parseInt(args[1]);
          const repeat = parseInt(args[2]);

          // Validate inputs
          if (isNaN(duration) || duration <= 0) {
            await message.reply('Please provide a valid duration in minutes');
            return;
          }
          if (isNaN(repeat) || repeat <= 0) {
            await message.reply(
              'Please provide a valid number of repeat cycles'
            );
            return;
          }

          await timerManager.startSession(message, duration, repeat);
          break;

        case 'stop':
          await timerManager.stopSession(message);
          break;

        case 'status':
          const status = timerManager.getSessionStatus(message.guild.id);
          if (!status) {
            await message.reply('No active study session');
            return;
          }

          const statusMessage =
            `Current Study Session:\n` +
            `Duration: ${status.duration} minutes\n` +
            `Remaining Cycles: ${status.remainingCycles}\n` +
            `Current Phase: ${status.isBreak ? 'Break' : 'Study'}\n` +
            `Time Remaining: ${status.remainingTime}`;

          await message.reply(statusMessage);
          break;

        default:
          await message.reply(
            'Invalid subcommand. Use: start, stop, or status'
          );
      }
    } catch (error) {
      logger.error('Error in pomodoro command', error);
      await message.reply(`Error: ${error.message}`);
    }
  },
};
