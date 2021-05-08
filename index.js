const { Telegraf } = require("telegraf");
const dotEnv = require("dotenv");
const debug = require("debug")("bot");
const morgan = require("morgan");
const axios = require('axios');

let symbolList;
const Companies = require("./models/Companies");
const connectDB = require("./config/db");
const winston = require("./config/winston");
const { createData } = require("./Utils/CreateData");
const { symbolButtonList } = require("./Utils/Transformer");
const { startMessage, symbolDetail, compSymbols } = require("./MessageHandler");

//* Load Config
dotEnv.config({ path: "./config/config.env" });

connectDB();
debug("Connected To Database");

//* Logging
if (process.env.NODE_ENV === "development") {
    debug("Morgan Enabled");
    morgan("combined", { stream: winston.stream });
}

var config = {
    method: 'get',
    url: process.env.GET_COMPANIES_URI,
    headers: {}
};

// axios(config)
//     .then(function (response) {
//         symbolList = response.data
//         console.log("**********"+symbolList.length);
//         // console.log(JSON.stringify(response.data));
//     })
//     .catch(function (error) {
//         console.log(error);
//     });


createData();

(async () => {
    symbolList = await Companies.find();
})()


const bot = new Telegraf(process.env.botToken);

bot.start(ctx => ctx.reply(startMessage()));

bot.command("symbol_list", async (ctx) => {
    ctx.reply("لیست سهام توی دکمه ها وجود داره میتونی هرکدومشون رو کلیک کنی تا جزییاتشو ببینی",
        {
            reply_markup: {
                keyboard: await symbolButtonList(symbolList)
            }
        })
});

bot.on("text", async (ctx) => {
    const text = ctx.message.text;
    if (text.includes(":")) {
        const symbol1 = symbolList[text.split(":")[0]];
        // console.log(symbol1);
        const symbol2 = symbolList[text.split(":")[1]];
        // console.log(symbol2);
        if (symbol2 && symbol1) {
            const message = compSymbols(symbol1, symbol2);
            ctx.reply(message, {
                reply_markup: {
                    keyboard: undefined
                }
            });
        }
    }
    else if (text.length <= 6) {
        const symbol = await Companies.findOne({ symbol: text })
        if (symbol)
            ctx.reply(symbolDetail(symbol), {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: "نمودار سهام",
                                callback_data: "chart_" + text
                            },
                            {
                                text: "این سهام خوبه آیا؟",
                                callback_data: "question_" + text
                            }
                        ]
                    ]
                }
            });
    }
    else {
        ctx.reply("چی چی میگی 😶")
    }

});

bot.on("voice", ctx => ctx.reply("😐 عزیزمن اخه مگه من میتونم ویس گوش بدم \nکه ویس می فرستی"));
bot.on("photo", ctx => ctx.reply("😐 عزیزمن اخه مگه من میتونم عکس ببینم \nکه عکس می فرستی"));
bot.on("video", ctx => ctx.reply("😐 عزیزمن اخه مگه من میتونم فیلم ببینم \nکه فیلم می فرستی"));
bot.on("document", ctx => ctx.reply("این فایلی که فرستادی به چه درد من میخوره 🙄"));
bot.on("location", ctx => ctx.reply("اخه من لوکیشن میخوام چیکار 🤦🏻‍♂️"));
bot.on("animation", ctx => ctx.reply("خداا شما اخر منو میکشید 😑 \n این چی چیه اخه برا من فرستادی"));
bot.on("sticker", ctx => ctx.reply("خداا شما اخر منو میکشید 😑 \n استیکر برا چی میفرستی"));
bot.on("edited_message", ctx => ctx.reply("من زرنگ ترم قبل اینکه ویرایش کنی پیامت را خواندم 😎"));
bot.on("message_auto_delete_timer_changed",
    ctx => ctx.reply("حالا میزاشتی پیام باشه چرا میخوای به پاکی\n انقدر به من بی اعتمادی 😒")
);


bot.mention("Mamalli7", ctx => ctx.reply("شما یه کاربر را منشن کردید!!!"));

bot.hashtag("تبلیغ", async ctx => {
    await ctx.deleteMessage(ctx.message.message_id);
    const tempMessage = await ctx.reply(`کاربر عزیز ${ctx.message.from.first_name}
    ارسال هشتک در این گروه ممنوع است.
    ارسال مجدد = حذف از گروه`);
    setTimeout(() => {
        ctx.deleteMessage(tempMessage.message_id);
    }, 1500)
});

bot.use((ctx, next) => {
    ctx.reply("I sent this message!!!");
    next();
});


bot.action(/^chart_/, ctx => {
    const text = ctx.match.input.split("_")[1];
    ctx.replyWithPhoto({
        source: "./img/chart.jpg"
    }, {
        caption: "نمودار سهام " + text
    })

});

bot.launch()
    .then(() => {
        debug("Connected To Telegram");
    }).catch((err) => {
        debug("Con't Connected To Telegram");
        if (err.code === "ETIMEDOUT") {
            console.log("Check your internet connection");
        }
        else {
            console.log(err);
        }
    });