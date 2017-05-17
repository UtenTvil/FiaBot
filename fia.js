// Ooh, a startup!

var discord_Main = require("discord.js");
var client = new discord_Main.Client({autoReconnect:true});
var fs = require("fs");

// Variable variables. The best type of variable.

var discord_Token = fs.readFileSync("./no_upload/token.txt").toString();
var currentGame = "games wit'chu.";
var botName = "FiaBot";
var prefix = "?";

var HelpColour = 0x7400E8;
var InfoColour = 0x00BB29;
var MsgColour = 0xFF670F;
var ErrorColour = 0x8b0000;

var startTime = Date.now();

console.log("Joining...")

// Begin!

client.login(discord_Token);
console.log("Logged in successfully.");

client.on("ready", () => {
	client.user.setGame(currentGame);
});

function pairs(arr) {
	var wins = {};
    for(var i in arr){
        for(var j in arr){
			var TeamOneScore = RolesNameStandings[arr[i]]; // 8
			var TeamTwoScore = RolesNameStandings[arr[j]]; // 6
			var ProbOneWin = (TeamOneScore/(TeamOneScore+TeamTwoScore)); // 8/14 (0.57)
			if (Math.random()<=ProbOneWin){
				if (wins[arr[i]]){
					wins[arr[i]] = wins[arr[i]]+1;
				} else {
					wins[arr[i]] = 1;
				}
			} else {
				if (wins[arr[j]]){
					wins[arr[j]] = wins[arr[j]]+1;
				} else {
					wins[arr[j]] = 1;
				}
			}
		}
	}
    return wins;
}

var RolesList = [];
var RolesListStandings = {};
var RolesNameStandings = {};

var command_List = {
	"battle": {
		description: "Battle the roles!",
		process: function(client,msg,aftercommand){
			var GuildRoles = msg.guild.roles.map(function(x){ return x.id });
			for (var i in GuildRoles){
				RolesList.push(GuildRoles[i]);
				var CurrentRoleArray = msg.guild.members.filter(function(membToCh){
					if(membToCh.roles.has(RolesList[i])){
						if (RolesListStandings[RolesList[i]]){
							RolesListStandings[RolesList[i]] = RolesListStandings[RolesList[i]]+1;
						} else {
							RolesListStandings[RolesList[i]] = 0;
						}
						return true;
					}
				})
				RolesNameStandings[msg.guild.roles.get(GuildRoles[i]).name] = CurrentRoleArray.map(function(x){ return x.displayName }).length;
			};
			delete RolesNameStandings["@everyone"];
		//	RolesNameStandings["Chief Whip"] returns '1' cause theres just the one sanic
			var ResultsOfBattle = pairs(Object.getOwnPropertyNames(RolesNameStandings));
			var SortedNames = Object.keys(ResultsOfBattle).sort(function(a, b) {return -(ResultsOfBattle[a] - ResultsOfBattle[b])});
			var Lines = "";
			for (var i in SortedNames){
				var Line = "**"+SortedNames[i]+"**: "+ResultsOfBattle[SortedNames[i]];
				Lines += "\n"+Line;
			}
			embedMessage(client,msg,InfoColour,"Calculating...","https://www.reddit.com/","Calculating results...","wait a sec!",true);
			setTimeout(function() {
				embedMessage(client,msg,MsgColour," ","https://www.reddit.com/",Lines,":)");
			}, 3000);
		}
	}
}

client.on("message", msg => {
	var msgContent = msg.content;
	if (msg.author.id!=client.user.id && msg.content[0]==prefix){
		console.log(msg.author+": "+msg.content);
		var command = msgContent.split(" ")[0].substring(prefix.length).toLowerCase(); // take the first word and get everything after the first letter.
		var aftercommand = msgContent.substring(command.length+2); // take the second word and onwards
		var isCommand = command_List[command];
		if (command=="help"){
			var batch = "**List of commands:**\n";
			var sortedCommands = Object.keys(command_List).sort();
			for(var i in sortedCommands) {
				var cmd = sortedCommands[i];
				var info = "**"+prefix+cmd+"**";
				var usage = command_List[cmd].usage;
				if(usage){
						info += " " + usage;
				}
				var description = command_List[cmd].description;
				if(description instanceof Function){
					description = description();
				}
				if(description){
					info += "\n\t" + description;
				}
				var admin = command_List[cmd].admin;
				if(admin instanceof Function){
					admin = admin();
				}
				if(admin){
					info += "\n\t**Admin:** " + admin;
				}
				var newBatch = batch + "\n\n" + info;
				if(newBatch.length > (1024 - 8)){ //limit message length
					embedMessage(client,msg,HelpColour,"**Help**",TitleLink,batch,"<3");
					batch = info;
				} else {
					batch = newBatch
				}
			}
			if(batch.length > 0){
				embedMessage(client,msg,HelpColour,"**Help**",TitleLink,batch,"<3");
			}
		}
		else if (isCommand) {
			var CommandEntry = command_List[command]
			if (CommandEntry.admin==true&&msg.member.roles.has(AdminRole) || CommandEntry.admin!=true){
				CommandEntry.process(client,msg,aftercommand)
			} else {
				embedMessage(client,msg,ErrorColour,"**Info**",TitleLink,"you cant use that fucking command pal simmer down","come back when you mean something",true)
			}
		}
	}
})

function embedMessage(client,msg,colour,title,url,description,footer,del,member){
	if (member){
		var channelX=member.guild.channels.get(WelcomeChannelID)
	} else {
		var channelX=msg.channel
	}
	channelX.sendEmbed({
	    color: colour,
	    author: {
	    	name: client.user.username,
	      	icon_url: client.user.avatarURL
	    },
	    title: title,
	    url: url,
	    description: description,
	    timestamp: new Date(),
	    footer: {
	      	icon_url: "https://www.emojibase.com/resources/img/emojis/hangouts/1f1ee-1f1ea.png",
	      	text: footer
    }}).then(output => {
		if (del==true){
			setTimeout(function() {
				if (output){
					output.delete();
				}
			}, 3000);
		}
	}).catch(err => {
		console.error("err:"+err.toString());
	})
}

