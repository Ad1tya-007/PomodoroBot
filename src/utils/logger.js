const fs = require('fs');
const path = require('path');

class Logger {
  constructor() {
    // Create logs directory if it doesn't exist
    const logsDir = path.join(__dirname, '../../logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir);
    }

    // Create log file with current date
    const date = new Date().toISOString().split('T')[0];
    this.logFile = path.join(logsDir, `${date}.log`);
  }

  formatMessage(level, message, error = null) {
    const timestamp = new Date().toISOString();
    let logMessage = `[${timestamp}] ${level}: ${message}`;

    if (error) {
      logMessage += `\nError: ${error.message}`;
      if (error.stack) {
        logMessage += `\nStack: ${error.stack}`;
      }
    }

    return logMessage;
  }

  async log(level, message, error = null) {
    const logMessage = this.formatMessage(level, message, error);

    // Write to console
    console.log(logMessage);

    // Write to file
    try {
      await fs.promises.appendFile(this.logFile, logMessage + '\n');
    } catch (err) {
      console.error('Failed to write to log file:', err);
    }
  }

  info(message) {
    this.log('INFO', message);
  }

  error(message, error = null) {
    this.log('ERROR', message, error);
  }

  warn(message) {
    this.log('WARN', message);
  }

  debug(message) {
    this.log('DEBUG', message);
  }
}

module.exports = new Logger();
