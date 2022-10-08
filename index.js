const Discord = require("discord.js");
const config = require("./config.json");

const client = new Discord.Client({
    intents: [
        Discord.GatewayIntentBits.Guilds,
        Discord.GatewayIntentBits.GuildMessages,
        Discord.GatewayIntentBits.GuildMembers,
        Discord.GatewayIntentBits.GuildBans,
    ],
    partials: ['GUILD_MEMBER']
});

const fs = require("fs");

let url = `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`;

    fetch(url, {
        method: "POST",
    })
        .then((res) => res.json())
        .then((json) => {
            console.log(json);
        });

client.on("ready", () => {
    client.application.commands.create({
        name: 'send-embed',
        description: 'Send an embed containing buttons to verify, create a ticket, and open a link!'
    })
    console.log(`Logged in as ${client.user.tag}!`);
})

client.on("interactionCreate", async (interaction) => {
    if(interaction.type === Discord.InteractionType.ApplicationCommand){
        if(interaction.commandName === 'send-embed') {
            console.log("interaction: send-embed cmd")
            const embed = new Discord.EmbedBuilder()
                .setTitle("Welcome to the server!")
                .setDescription("Please verify your account to gain access to the server!")
                .setColor("#0099ff")
                .setTimestamp()

            const row = new Discord.ActionRowBuilder()
                .addComponents(
                    new Discord.ButtonBuilder()
                        .setCustomId('verify')
                        .setLabel('Verify')
                        .setStyle(Discord.ButtonStyle.Success),
                    new Discord.ButtonBuilder()
                        .setCustomId('create-ticket')
                        .setLabel('Create Ticket')
                        .setStyle(Discord.ButtonStyle.Primary),
                    new Discord.ButtonBuilder()
                        .setLabel('Open Link')
                        .setStyle(Discord.ButtonStyle.Link)
                        .setURL('https://www.google.com'),
                );

            let channel = interaction.guild.channels.cache.get(config.embedChannelId)
            channel.send({embeds: [embed], components: [row]});
            interaction.reply({
                content: "Embed sent!",
                ephemeral: true
            });
        }
    }

    if(interaction.isButton()){
        if(interaction.customId === "verify"){
            interaction.member.roles.add(config.verifiedRoleId).then(() => {
                interaction.reply({content: "You have been verified!", ephemeral: true})
            })
        }

        if(interaction.customId === "create-ticket"){
            interaction.guild.channels.create({
                name: `ticket-${interaction.user.username}`,
                type: Discord.ChannelType.GuildText,
                parent: config.ticketCategoryId,
                permissionOverwrites: [
                    {
                        id: interaction.guild.id,
                        deny: [Discord.PermissionsBitField.Flags.ViewChannel],
                    },
                    {
                        id: interaction.user.id,
                        allow: [Discord.PermissionsBitField.Flags.ViewChannel, Discord.PermissionsBitField.Flags.SendMessages],
                    },
                ],
            })

            interaction.reply({content: "Ticket created!", ephemeral: true})
        }
    }
})


client.login(config.token)
