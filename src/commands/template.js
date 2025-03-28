module.exports = {
  data: {
    name: 'template',
    description: 'Template command structure',
  },
  async execute(message, args) {
    try {
      // Command logic goes here
      await message.reply('This is a template command!');
    } catch (error) {
      console.error('Error in template command:', error);
      await message.reply('There was an error executing this command.');
    }
  },
};
