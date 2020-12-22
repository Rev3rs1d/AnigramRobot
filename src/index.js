require('dotenv').config()

const TelegramBot = require("node-telegram-bot-api");
const bot = new TelegramBot((process.env.TOKEN,{polling: true})

const animes = require("./utils/animes")
const model = require("./schema/index");
const text = require("./utils/Texts");
const call = require("./callbacks/Callbacks");
const start = require("./utils/start")

bot.onText(/\/start (.*)/, start(bot))

bot.on("callback_query",async(ctx)=>{
  const data = ctx.data;
  const queries = new call(bot,data.split(' '))
  if(data.includes('list ')){
    queries.listAnime(ctx)
  }
  
  else if (data.includes(`watch `)){
    queries.watchAnime(ctx)
  }

  else if(data.includes("view ") || ctx.data.includes("continue ") || data.includes("back ")){
    queries.viewAnime(ctx)
  }

  else if(data.includes("menu ")){
    queries.menuAnime(ctx)
  }

})


bot.on('inline_query', async (ctx) => {
  const searchResult = await animes.searchAnime(ctx.query);
  const result = searchResult ? searchResult.map((anime, id)=>({
    id: id,
    title: anime.name,
    type: "article",
    description: anime.description,
    thumb_url: anime.image,
    input_message_content: {
      message_text: text.createText(anime),
      parse_mode: "HTML"
    },reply_markup:{
      inline_keyboard: [
        [{
          text: "Ver anime",
          url: "https://t.me/Amadeus_Project_Bot?start="+anime._id
        }]
      ]
    }
  })) : [];
  bot.answerInlineQuery(ctx.id,result)
})

bot.on("polling_error",err=>console.log(err))