const { Client, GatewayIntentBits, PermissionsBitField } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

async function getMutedRole(guild) {
  let role = guild.roles.cache.find(r => r.name === "Muted");
  if (!role) {
    role = await guild.roles.create({ name: "Muted", permissions: [] });
    guild.channels.cache.forEach(channel => {
      channel.permissionOverwrites.edit(role, {
        SendMessages: false,
        Speak: false,
        AddReactions: false
      }).catch(() => {});
    });
  }
  return role;
}

client.on("messageCreate", async message => {
  if (!message.guild || message.author.bot) return;
  if (!message.content.startsWith("!")) return;

  const args = message.content.split(" ");
  const cmd = args[0];

  if (cmd === "!mute") {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers))
      return message.reply("No permission");

    const member = message.mentions.members.first();
    if (!member) return message.reply("Mention a user");

    const muted = await getMutedRole(message.guild);
    await member.roles.add(muted);
    message.reply(`${member.user.tag} muted indefinitely`);
  }

  if (cmd === "!unmute") {
    const member = message.mentions.members.first();
    if (!member) return;

    const muted = message.guild.roles.cache.find(r => r.name === "Muted");
    if (muted) await member.roles.remove(muted);
    message.reply(`${member.user.tag} unmuted`);
  }
});

client.login(process.env.TOKEN);
