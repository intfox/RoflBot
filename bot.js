const express = require('express')
const bodyParser = require('body-parser')
const VkBot = require('node-vk-bot-api')
const rofl = require('./rofl')
const analyse = require('./analyse')

const secretConfig = require('./secrets.json')
const config = require('./config.json')

const app = express()
const bot = new VkBot({
    token: secretConfig.bot.token,
    confirmation: secretConfig.bot.confirmation,
})

bot.event('message_new', (ctx) => {
    if(ctx.message.text.length > 0) {
        rofl.roflMessage(ctx.message.text).then(
            requestMessage => {
                console.log(ctx.message.text, " => ", new Set(requestMessage))
                if(requestMessage != null) {
                    for(let reqMes of new Set(requestMessage)) {
                        if(Math.random() < config.random_rate) {
                            ctx.reply(reqMes)
                            return
                        }
                    }
                }
            }, reason => console.error("rofl catch", reason))
        if(ctx.message.text.toLowerCase().split(' ').includes('бот')) {
            analyse.sentiments(ctx.message.text).then( score => {
                console.log("score:", score, " text:", ctx.message.text)
                if(score < 0.5) ctx.reply('...', 'photo-190470534_457239018')
            }, err => console.log("error sentiments", err))
        }
        if(ctx.message.text.trim().toLowerCase() == "да" || ctx.message.text.trim().toLowerCase() == "да." ) {
            if(Math.random() < 0.05) ctx.reply("Пизда")
        }
        if(ctx.message.text.trim().toLowerCase() == "нет" || ctx.message.text.trim().toLowerCase() == "нет.") {
            if(Math.random() < 0.05) ctx.reply("Пидора ответ")
        }
    }
    if(ctx.message.action && ctx.message.action.type == "chat_invite_user") {
        bot.execute('users.get', {
            user_ids: ctx.message.from_id,
            fields: 'domain'
        }).then( response => ctx.reply( "@" + response[0].domain, 'doc-190470534_531281679'), error => console.error("error user.get:", error.message))
    }
})

app.use(bodyParser.json())

app.post('/', bot.webhookCallback)

let botServer = app.listen(80)

botServer.on('error', (error) => {
    bot.sendMessage(125160186, 'Смерть.' + error.message)
    bot.sendMessage(2000000002, 'Я упал', 'photo-190470534_457239017')
})

botServer.on('close', () => {
    console.log("close")
    bot.execute('groups.disableOnline', {group_id: config.group_id}).then( () => process.exit(), () => process.exit())
})

botServer.on('listening', () => {
    console.log("open")
    bot.execute('groups.enableOnline', {group_id: config.group_id}).catch( (err) => console.error("error set online", err) )
})

process.on('SIGINT', () => {
    console.log("SIGINT")
    botServer.close()
})