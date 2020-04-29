var Discord = require('discord.io')
var moment = require('moment')

var bot = new Discord.Client({
   token: process.env['auth'],
   autorun: true
})

var times = {
    open: moment('1pm', 'ha'),
    close: moment('8pm','ha'),
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
}

bot.on('ready', function (evt) {
    console.log('Connected')
    console.log('Logged in as: ')
    console.log(bot.username + ' - (' + bot.id + ')')
    nightwatchToggle()
})

function nightwatchToggle(){
    var now = moment()
    console.log(now.isBefore(times.close), now.isBefore(times.open), now.format('ddd'), times[now.isBefore(times.open) ? 'open' : 'close'].format('ha'), now.isBefore(times.close) ? `${now.format('ddd')}${times[now.isBefore(times.open) ? 'open' : 'close'].format('ha')}` : `${times.days[times.days.indexOf(now.format('ddd'))+1]}${times.open.format('ha')}`)
    //Make this respond with the correct timezones
    var nextEvent = moment(now.isBefore(times.close) ? `${now.format('ddd')}${times[now.isBefore(times.open) ? 'open' : 'close'].format('ha')}` : `${times.days[times.days.indexOf(now.format('ddd'))+1]}${times.open.format('ha')}`, 'dddha')
    console.log(nextEvent.format('MM DD ddd hh:mm a'))
    if(nextEvent.diff(now, 'minutes') <= 5){
        for(var user of bot.users){
            bot[`${now.isAfter(times.close) ? 'removeFrom' : 'addTo'}Role`]({
                serverID: '701961268944306298',
                userID: user.id,
                roleID: '704899305181544548'
            })
        }
    }
    bot.sendMessage({
        to: '702013233212686406',
        message: `${now.isAfter(times.close) ? 'Disabling' : 'Enabling'} Nightwatch next at ${nextEvent.format('ddd - hh:mma')}`
    })
    // setTimeout(nightwatchToggle, nextEvent.diff(now, 'miliseconds'))
}

bot.on('message', function (user, userID, channelID, message, evt) {
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`
    if(message.includes('!set')){
        var command = message.split(' ')
        if(times[command[1]]){
            if(['open','close'].includes(command[1]) && moment(command[2], 'ha', true).isValid()){
                times[command[1]] = command[2]
                bot.sendMessage({
                    to: channelID,
                    message: `Setting ${command[1]} time to ${command[2]}`
                })
            }else if(command[1] == 'days' && !command.slice(2).reduce((a)=>!moment(a,'ddd',true).isValid()).length){
                times.days = command[2]
                bot.sendMessage({
                    to: channelID,
                    message: `Setting days to ${command[2]}`
                })
            }else{
                bot.sendMessage({
                    to: channelID,
                    message: command[1] == 'days' ?
                    `Weekdays should be formatted like Moment.js ddd, and be separated by a space (Example: Mon Fri)` :
                    `Cannot set ${command[1]} time to ${command[2]}, time must follow moment.js format ha. (Example: 1pm)`
                })
            }
        }else{
            bot.sendMessage({
                to: channelID,
                message: `Cannot set ${command[1]}, must be "open" or "close"`
            })
        }
    }
})