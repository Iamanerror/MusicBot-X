const Discord = require('discord.js');
const { Client, Util} = require('discord.js');
const config = require("./config.json");
const YouTube = require('simple-youtube-api');
const ytdl = require('ytdl-core');
const client = new Client({ disableEveryone: true});

const youtube = new YouTube(config.GOOGLE_API_KEY);
const PREFIX = config.prefix;

const queue = new Map();

client.on('warn', console.warn);

client.on('error', console.error);

client.on('ready', () => console.log('I am ready!'));

client.on('disconnect', () => console.log('I disconnected!'));

client.on('reconnecting', () => console.log('I am disconnecting!'));

client.on('voiceStateUpdate', (oldMember, newMember) => {
  let newUserChannel = newMember.voiceChannel
  let oldUserChannel = oldMember.voiceChannel
  const serverQueue = queue.get(oldMember.guild.id);


  if(oldUserChannel === undefined && newUserChannel !== undefined) {
      // User joines a voice channel
  } else if(newUserChannel === undefined){

    // User leaves a voice channel
      if(oldMember.id === '514856260353392660'){
          return console.log("BOT");
      }
      else{
          if(client.guilds.get(oldMember.guild.id).voiceConnection != null){
              if(client.guilds.get(oldMember.guild.id).voiceConnection.channel.id === oldUserChannel.id){
                    if(oldUserChannel.members.size < 2){
                        serverQueue.songs = [];
                        serverQueue.connection.dispatcher.end('No members left in the channel!')
                    }    
              }else{
                  return console.log('not in the same voice channel');
              }
          }else{
              return undefined;
          }
      }
         

  }
})

client.on('message', async msg => { // eslint-disable-line
    if (msg.author.bot) return undefined;
    if (!msg.content.startsWith(PREFIX)) return undefined;
    const args = msg.content.split(' ');
    const searchString = args.slice(1).join(' ');
    const url = args[1];
    const serverQueue = queue.get(msg.guild.id);

    if(msg.content.startsWith(`${PREFIX}play`)){
     if (member.voiceChannel || guilds[message.guild.id].voiceChannel != null) {
      if (guilds[message.guild.id].queue.length > 0 || guilds[message.guild.id].isPlaying) {
        getID(args, function (id) {
          addToQueue(id, message);
          youtubeInfo(id, function (err, videoinfo) {
            if (err) {
              throw new Error(err);
            }

            guilds[message.guild.id].queueNames.push(videoinfo.title);
            message.channel.send('✅ The song: **' + videoinfo.title + '** has been added to the queue.');
          });
        });
      } else {
        guilds[message.guild.id].isPlaying = true;
        getID(args, function (id) {
          guilds[message.guild.id].queue.push(id);
          playMusic(id, message);
          youtubeInfo(id, function (err, videoinfo) {
            if (err) {
              throw new Error(err);
            }

            guilds[message.guild.id].queueNames.push(videoinfo.title);
            message.channel.send('🎶 The song: **' + videoinfo.title + '** is now playing!');
          });
        });
      }
    } else if (member.voiceChannel === false) {
      message.channel.send('🔈 You have to be in a voice channel to play music!');
    } else {
      message.channel.send('🔈 You have to be in a voice channel to play music!');
    }
  } else if (msg.startsWith(prefix + 'skip')) {
    if (guilds[message.guild.id].skippers.indexOf(message.author.id) === -1) {
      guilds[message.guild.id].skippers.push(message.author.id);
      guilds[message.guild.id].skipReq++;
      if (guilds[message.guild.id].skipReq >=
      Math.ceil((guilds[message.guild.id].voiceChannel.members.size - 1) / 2)) {
        skipMusic(message);
        message.channel.send('⏩ Your skip request has been accepted. The current song will be skipped!');
      } else {
        message.channel.send('⏭ Your skip request has been accepted. You need **' +
        (Math.ceil((guilds[message.guild.id].voiceChannel.members.size - 1) / 2) -
        guilds[message.guild.id].skipReq) + '** more skip request(s)!');
      }
    } else {
      message.channel.send('⏯ You already submitted a skip request.');
    }
  } else if (msg.startsWith(prefix + 'queue')) {
    var codeblock = '```';
    for (let i = 0; i < guilds[message.guild.id].queueNames.length; i++) {
      let temp = (i + 1) + '. ' + guilds[message.guild.id].queueNames[i] +
      (i === 0 ? ' **(Current Song)**' : '') + '\n';
      if ((codeblock + temp).length <= 2000 - 3) {
        codeblock += temp;
      } else {
        codeblock += '```';
        message.channel.send(codeblock);
        codeblock = '```';
      }
    }

    codeblock += '```';
    message.channel.send(codeblock);
  } else if (msg.startsWith(prefix + 'stop')) {
    if (guilds[message.guild.id].isPlaying === false) {
      message.channel.send('🔇 No music is playing!');
    }

    message.channel.send('🔇 Stopping the music...');

    guilds[message.guild.id].queue = [];
    guilds[message.guild.id].queueNames = [];
    guilds[message.guild.id].isPlaying = false;
    guilds[message.guild.id].dispatcher.end();
    guilds[message.guild.id].voiceChannel.leave();
  }
});

function isYoutube(str) {
  return str.toLowerCase().indexOf('youtube.com') > -1;
}
function searchVideo(query, callback) {
  request('https://www.googleapis.com/youtube/v3/search?part=id&type=video&q=' +
  encodeURIComponent(query) + '&key=' + youtubeAPIKey,
  function (error, response, body) {
    var json = JSON.parse(body);
    if (!json.items[0]) {
      callback('5FjWe31S_0g');
    } else {
      callback(json.items[0].id.videoId);
    }
  });
}

function getID(str, callback) {
  if (isYoutube(str)) {
    callback(getYoutubeID(str));
  } else {
    searchVideo(str, function (id) {
      callback(id);
    });
  }
}

function addToQueue(strID, message) {
  if (isYoutube(strID)) {
    guilds[message.guild.id].queue.push(getYoutubeID(strID));
  } else {
    guilds[message.guild.id].queue.push(strID);
  }
}

function playMusic(id, message) {
  guilds[message.guild.id].voiceChannel = message.member.voiceChannel;

  guilds[message.guild.id].voiceChannel.join().then(function (connection) {
   const stream = ytdl('https://www.youtube.com/watch?v=' + id, {
      filter: 'audioonly',
    });
    guilds[message.guild.id].skipReq = 0;
    guilds[message.guild.id].skippers = [];

    guilds[message.guild.id].dispatcher = connection.playStream(stream);
    guilds[message.guild.id].dispatcher.on('end', function () {
      guilds[message.guild.id].skipReq = 0;
      guilds[message.guild.id].skippers = [];
      guilds[message.guild.id].queue.shift();
      guilds[message.guild.id].queueNames.shift();
      if (guilds[message.guild.id].queue.length === 0) {
        guilds[message.guild.id].queue = [];
        guilds[message.guild.id].queueNames = [];
        guilds[message.guild.id].isPlaying = false;
      } else {
        setTimeout(function () {
          playMusic(guilds[message.guild.id].queue[0], message);
        }, 500);
      }
    });
  });
}

function skipMusic(message) {
  guilds[message.guild.id].dispatcher.end();
}

client.on('message', async msg => { // eslint-disable-line
    if (msg.author.bot) return undefined;
    if (!msg.content.startsWith(prefix)) return undefined;
    const args = msg.content.split(' ');
     
    if(msg.content.startsWith(`${prefix}helpmusic`)){
        var embedhelp = new Discord.RichEmbed()
            .setTitle(`Cryo Music Commands`)
            .addField(">play [YouTube Link/Playlist]", "Usage: `>play` Description: To play See The YouTube Linke And playlist.", false)
            .addField(">play [Suchbegriff(e)]", "Usage: `>play`<song name> Description: To play Music.", false)
            .addField(">skip", "Usage: `>skip` Description: To skip music.", false)
            .addField(">stop", "Usage: `>stop` Description: To Bot disconnected.", false)
            .addField(">queue", "Usage: `>queue` Description: To Check The Queue List.", false)
            .addField(">pause", "Usage: `>pause` Description: To pause The Current Playing Song.", false)
            .addField(">resume", "Usage: `>resume` Description: To Resume The Paused Song.", false)
            .setColor([226, 50, 41])
            .setThumbnail(client.user.avatarURL)
            return msg.channel.sendEmbed(embedhelp);
    }
    return undefined;
});


client.login(process.env.BOT_TOKEN);
