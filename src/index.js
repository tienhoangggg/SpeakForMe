require("dotenv").config();
const token = process.env.TOKEN;
const clientId = process.env.CLIENT_ID;
const { Client, GatewayIntentBits , SlashCommandBuilder, Routes } = require('discord.js');
const voice = require('./data/voice');
const path = require('path');
const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { joinVoiceChannel , createAudioPlayer , createAudioResource , NoSubscriberBehavior} = require('@discordjs/voice');
const { threadId } = require("worker_threads");
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] });
client.login(token);
const commands = [
    new SlashCommandBuilder().setName('s').setDescription('speak your chat').addStringOption(option =>
		option.setName('message')
			.setDescription('message to speak')
			.setRequired(true)),
    new SlashCommandBuilder().setName('j').setDescription('join voice channel'),
    new SlashCommandBuilder().setName('l').setDescription('leave voice channel'),
]
.map(command => command.toJSON());
const rest = new REST({ version: '10' }).setToken(token);
var connection;
rest.put(
    Routes.applicationCommands(clientId),
    { body: commands }
    );
    client.on('interactionCreate', async interaction => {
            if (!interaction.isChatInputCommand()) return;
        const { commandName } = interaction;
        if (commandName === 'j') {
            if (!interaction.member.voice.channel) {
                interaction.reply('You must be in a voice channel to use this command.');
                return;
            }
            const { channel } = interaction.member.voice;
            connection = joinVoiceChannel({
                channelId: channel.id,
                guildId: channel.guild.id,
                adapterCreator: channel.guild.voiceAdapterCreator,
            });
            interaction.reply('Joined voice channel.');
        }
        if (commandName === 'l') {
            if (!connection) {
                interaction.reply('You are not in a voice channel.');
                return;
            }
            connection.disconnect();
            connection.destroy();
            interaction.reply('Left voice channel.');
        }
        if (commandName === 's') {
            if (!interaction.member.voice.channel) {
                interaction.reply('You must be in a voice channel to use this command.');
                return;
            }
            const player = createAudioPlayer({
                behaviors: {
                    noSubscriber: NoSubscriberBehavior.Pause,
                },
            });
            const message = interaction.options.data[0].value;
            const id = await voice.getVoice(message);
            let resource = createAudioResource('./src/data/'+id+'.mp3');
            connection.subscribe(player);
            player.play(resource);
            interaction.reply(message);
            setTimeout(() => {
            voice.deleteVoice('./src/data/'+id+'.mp3');
            }, 20000)
        }
        });
        
