const { Client, GatewayIntentBits, PermissionsBitField } = require('discord.js');
const mysql = require('mysql');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '<password>',
  database: '<database_name>',
});

const client = new Client({ intents : [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]})

client.on("ready", () => {
  console.log('Logged In');
});

client.on("messageCreate", (message) => {
  console.log(message.author.username);
  console.log(message.content);
});

client.on("messageCreate", async (message) => {
  if (message.content === "submit-proof") {
    db.query('SELECT trust_level FROM amplify WHERE discord_uname = ?', [message.author.username], async (err, results) => {
      if (err) {
        console.error(err);
        message.reply("An error occurred while fetching your trust level.");
        return;
      }

      if (results.length > 0) {
        console.log("success");
        const trustLevel = results[0].trust_level;
        message.reply(`Congratulations, you have already submitted your proof!`);
        message.reply(`Trust level: ${trustLevel}!`);

        const guild = client.guilds.cache.get('<channel-id>');
        const channel = guild.channels.cache.find((c) => c.name === `trust-level-${trustLevel}`);

        const permissions = [
          {
            id: message.author.id,
            allow: [PermissionsBitField.Flags.ViewChannel],
          },
        ];

        try {
          await channel.permissionOverwrites.set(permissions);
          message.reply(`You have been granted access to ${channel.name}`);
        } catch (error) {
          console.error(error);
          message.reply('An error occurred while granting access.');
        }
      } else {
        message.reply("http://localhost:3001/");
      }
    });
  }
});

client.login('<discord-private-id>')
