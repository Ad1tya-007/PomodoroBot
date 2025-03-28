require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('../config.json');
const logger = require('./utils/logger');

// Create a new client instance with necessary intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

// Create a collection to store commands
client.commands = new Collection();

// Load commands from the commands directory
const loadCommands = () => {
  const commandsPath = path.join(__dirname, 'commands');
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith('.js'));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    // Set a new item in the Collection with the key as the command name and the value as the exported module
    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
      logger.info(`Loaded command: ${command.data.name}`);
    } else {
      logger.warn(
        `The command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }
};

// Event handler for when the client is ready
client.once('ready', () => {
  logger.info(`Logged in as ${client.user.tag}!`);
  loadCommands();
});

// Event handler for message interactions
client.on('messageCreate', async (message) => {
  // Ignore messages from bots
  if (message.author.bot) return;

  // Check if the message starts with the configured prefix
  if (!message.content.startsWith(config.prefix)) return;

  // Split the message into command and arguments
  const args = message.content.slice(config.prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  // Check if the command exists
  const command = client.commands.get(commandName);
  if (!command) return;

  try {
    // Execute the command
    await command.execute(message, args);
  } catch (error) {
    logger.error('Error executing command', error);
    await message.reply('There was an error executing that command.');
  }
});

// Error handling
client.on('error', (error) => {
  logger.error('Discord client error:', error);
});

// Handle process termination
process.on('SIGINT', () => {
  logger.info('Received SIGINT. Cleaning up...');
  client.destroy();
  process.exit(0);
});

// Login to Discord with your client's token
client.login(process.env.DISCORD_TOKEN).catch((error) => {
  logger.error('Failed to login to Discord:', error);
  process.exit(1);
});
