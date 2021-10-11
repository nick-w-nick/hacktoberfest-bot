require('dotenv').config();
const { SlashCommandBuilder } = require('@discordjs/builders');
const Axios = require('axios').default;

const sendReport = async (provider, repository) => {
    try {
        const options = {
            headers: {
                'authorization': process.env.HACKTOBERFEST_TOKEN
            }
        }
        
        const response = await Axios.post('https://hackathon-tracker.digitalocean.com/events/3/excluded_repositories', {
            provider,
            name: repository
        }, options);
        return {
            status: 'success',
            data: response.data
        }
    } catch (error) {
        return {
            status: 'error',
            message: error.message,
            hacktoberfest_error: error.response?.data?.message
        }
    }
};

module.exports = {
	data: new SlashCommandBuilder()
		.setName('report')
		.setDescription('Reports a repository for not following Hacktoberfest guidelines and standards')
        .addStringOption(option =>
            option.setName('provider')
                .setDescription('The source control provider')
                .setRequired(true)
                .addChoice('GitHub', 'github')
                .addChoice('GitLab', 'gitlab')
        )
        .addStringOption(option =>
            option.setName('repository')
                .setDescription('The repository name')
                .setRequired(true)
        ),
	async execute(interaction) {
        const provider = interaction.options.getString('provider');
        const repository = interaction.options.getString('repository');
        const report = await sendReport(provider, repository);
        if (report.status === 'error') {
            return await interaction.reply(`Failed to report **${provider}/${repository}**.\n\`${report.hacktoberfest_error}\``);
        }
        return await interaction.reply(`Successfully reported **${report.data.name}**!\nThanks!`);
	},
};