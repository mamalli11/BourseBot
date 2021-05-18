const { Telegraf, Markup } = require("telegraf");
const express = require("express");
const dotEnv = require("dotenv");
const debug = require("debug")("bot");
const morgan = require("morgan");

const path = require("path");

const Users = require("./models/Users");
const connectDB = require("./config/db");
const Groups = require("./models/Groups");
const winston = require("./config/winston");
const Companies = require("./models/Companies");
const { createData } = require("./Utils/CreateData");
const { symbolButtonList, categorizedButtonList, searchButtonList } = require("./Utils/Transformer");
const { startMessage, symbolDetail, compSymbols, groupDetail } = require("./MessageHandler");

const { setHeaders } = require("./middlewares/headers");
const { errorHandler } = require("./middlewares/errors");

let symbolList, categorizedList;
let pelan;
let isComparison = false, isSearch = false;
let CompSymbol = [];

//* Load Config
dotEnv.config({ path: "./config/config.env" });

connectDB();
debug("Connected To Database");

const app = express();

//* Logging
if (process.env.NODE_ENV === "development") {
    debug("Morgan Enabled");
    morgan("combined", { stream: winston.stream });
}

createData();

(async () => {
    symbolList = await Companies.find();
    categorizedList = await Groups.find();
})();

//* Static Folder
app.use("/public", express.static(path.join(__dirname, "public")));

//* View Engine
app.set("view engine", "ejs");
app.set("views", "views");

//* BodyPaser
app.use(setHeaders);

//* Routes
app.use("/", require("./routes/index"));
app.use("/api", require("./routes/payment"));

//* 404 Page
app.use(require("./controllers/errorController").get404);

//* Error Handler Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () =>
    debug(`Server running in ${process.env.PORT} mode on port ${PORT}`)
);

const bot = new Telegraf(process.env.botToken);

bot.use(async (ctx, next) => {
    try {
        let getData;
        if (ctx.myChatMember != undefined) {
            getData = ctx.myChatMember.from;
        } else if (ctx.update.callback_query != undefined) {
            getData = ctx.update.callback_query.from;
        } else if (ctx.update.message != undefined) {
            getData = ctx.update.message.from;
        }

        const user = await Users.findOne({ userID: getData.id });
        const userCount = await Users.find().countDocuments();

        if (!user) {
            if (userCount === 0) {
                await Users.create({
                    userID: getData.id,
                    first_name: getData.first_name,
                    username: getData.username,
                    is_bot: getData.is_bot,
                    isAdmin: true,
                });
            } else {
                await Users.create({
                    userID: getData.id,
                    first_name: getData.first_name,
                    username: getData.username,
                    is_bot: getData.is_bot,
                });
            }
            ctx.reply("سلام کاربر جدید پلان فعلی شما برنزی است !!!");
        } else {
            pelan = user.pelan;
        }
        next();
    } catch (error) {
        console.log(error);
        next();
    }
});

bot.start((ctx) => {
    (isComparison = false), (isSearch = false);
    ctx.reply(startMessage(pelan), {
        reply_markup: {
            keyboard: [
                [
                    {
                        text: "🔍 جستجو",
                        callback_data: "null",
                    },
                    {
                        text: "🏢 شرکت ها",
                        callback_data: "null",
                    },
                    {
                        text: "🗂 دسته بندی",
                        callback_data: "categorized_",
                    },
                ],
            ],
        },
    });
});

bot.command("symbol_list", async (ctx) => {
    ctx.reply(
        "لیست سهام توی دکمه ها وجود داره میتونی هرکدومشون رو کلیک کنی تا جزییاتشو ببینی",
        {
            reply_markup: {
                keyboard: await symbolButtonList(symbolList),
            },
        }
    );
});

bot.command("groups_list", async (ctx) => {
    ctx.reply("لیست دسته بندی", {
        reply_markup: {
            keyboard: await categorizedButtonList(categorizedList),
        },
    });
});

bot.on("text", async (ctx) => {
    const text = ctx.message.text;
    if (isComparison == false && isSearch == false) {
        if (text.includes(":")) {
            const symbol1 = await Companies.findOne({ symbol: text.split(":")[0] });
            const symbol2 = await Companies.findOne({ symbol: text.split(":")[1] });
            if (symbol2 && symbol1) {
                const message = compSymbols(symbol1, symbol2);
                ctx.reply(message, {
                    reply_markup: {
                        keyboard: undefined,
                    },
                });
            }
        } else if (text == "🔙 بازگشت") {
            ctx.reply("یکی از گزینه های زیرا انتخاب کنید", {
                reply_markup: {
                    keyboard: [
                        [
                            {
                                text: "🔍 جستجو",
                                callback_data: "null",
                            },
                            {
                                text: "🏢 شرکت ها",
                                callback_data: "null",
                            },
                            {
                                text: "🗂 دسته بندی",
                                callback_data: "categorized_",
                            },
                        ],
                    ],
                },
            });
        } else if (text.length <= 6) {
            const symbol = await Companies.findOne({ symbol: text });
            if (symbol)
                ctx.reply(symbolDetail(symbol), {
                    reply_markup: {
                        inline_keyboard: [
                            [
                                {
                                    text: "نمودار سهام",
                                    callback_data: "chart_" + text,
                                },
                                {
                                    text: "مقایسه سهام",
                                    callback_data: "question_" + text,
                                },
                            ],
                        ],
                    },
                });
        } else if (text === "🏢 شرکت ها") {
            ctx.reply(
                "لیست سهام توی دکمه ها وجود داره میتونی هرکدومشون رو کلیک کنی تا جزییاتشو ببینی",
                {
                    reply_markup: {
                        keyboard: await symbolButtonList(symbolList),
                    },
                }
            );
        } else if (text === "🗂 دسته بندی") {
            ctx.reply("برای نمایش جزئیات دسته بندی ", {
                reply_markup: {
                    keyboard: await categorizedButtonList(categorizedList),
                },
            });
        } else if (text === "🔍 جستجو") {
            isSearch = true;
            ctx.reply("برای جستجو لطفا اسم شرکت را ارسال کنید");
        } else {
            const cat = await Groups.findOne({ GroupName: text });
            if (!cat) {
                ctx.reply("چی چی میگی 😶");
            } else {
                const companie = await Companies.find({ GroupID: cat._id });
                const list = [];
                companie.map((item, index) => {
                    list.push({ index, item: item.symbol });
                });

                ctx.reply(groupDetail(cat, list));
            }
        }
    } else if (isComparison) {
        const symbol = await Companies.findOne({ symbol: text });

        if (CompSymbol.length == 1) {
            CompSymbol.push(symbol);
            ctx.reply(compSymbols(CompSymbol[0], CompSymbol[1]));
            isComparison = false;
        }
    } else if (isSearch) {
        const res = await Companies.find({ symbol: { $regex: text } });
        if (res) {
            isSearch = false;
            ctx.reply("شرکت های یافت شده...", {
                reply_markup: {
                    keyboard: await searchButtonList(res),
                },
            });
        } else {
            ctx.reply("چیزی یافت نشد 🤦🏻‍♂️😑");
        }
    }
});

bot.on("voice", (ctx) => ctx.reply("😐 عزیزمن اخه مگه من میتونم ویس گوش بدم \nکه ویس می فرستی"));
bot.on("photo", (ctx) => ctx.reply("😐 عزیزمن اخه مگه من میتونم عکس ببینم \nکه عکس می فرستی"));
bot.on("video", (ctx) =>  ctx.reply("😐 عزیزمن اخه مگه من میتونم فیلم ببینم \nکه فیلم می فرستی"));
bot.on("document", (ctx) => ctx.reply("این فایلی که فرستادی به چه درد من میخوره 🙄"));
bot.on("location", (ctx) => ctx.reply("اخه من لوکیشن میخوام چیکار 🤦🏻‍♂️"));
bot.on("animation", (ctx) =>  ctx.reply("خداا شما اخر منو میکشید 😑 \n این چی چیه اخه برا من فرستادی"));
bot.on("sticker", (ctx) =>  ctx.reply("خداا شما اخر منو میکشید 😑 \n استیکر برا چی میفرستی"));
bot.on("edited_message", (ctx) => ctx.reply("من زرنگ ترم قبل اینکه ویرایش کنی پیامت را خواندم 😎"));
bot.on("message_auto_delete_timer_changed", (ctx) => ctx.reply("حالا میزاشتی پیام باشه چرا میخوای به پاکی\n انقدر به من بی اعتمادی 😒"));
bot.on("contact", async (ctx) => {
    const user = await Users.findOne({ userID: ctx.message.from.id });
    user.phone = ctx.message.contact.phone_number;
    await user.save();
    ctx.reply("شماره شما ذخیره شد 👌");
});

bot.action(/^buyPanel_/, async (ctx) => {
    const user = await Users.findOne({
        userID: ctx.update.callback_query.from.id,
    });
    const keyboard = Markup.inlineKeyboard([
        Markup.button.url("کلیک کن", `http://127.0.0.1:3000/:${user.id}`),
    ]);
    if (ctx.update.callback_query.message.chat.type == "group") {
        ctx.reply("کاربر گرامی برای ارتقای پنل از طریق Pv اقدام کنید.");
    } else {
        if (!user.phone) {
            ctx.reply("لطفا شماره تلفن همراه خود را وارد کنید", {
                reply_markup: {
                    keyboard: [
                        [
                            { text: "📲 ارسال شماره تلفن همراه", request_contact: true },
                            { text: "🔙 بازگشت", callback_query: null },
                        ],
                    ],
                },
            });
        } else {
            ctx.reply("بزن بریم بخریم ...", keyboard);
        }
    }
});

bot.action(/^chart_/, (ctx) => {
    const text = ctx.match.input.split("_")[1];
    ctx.replyWithPhoto(
        {
            source: "./public/img/chart.jpg",
        },
        {
            caption: "نمودار سهام " + text,
        }
    );
});

bot.action(/^question_/, async (ctx) => {
    isComparison = true;
    const text = ctx.match.input.split("_")[1];
    const symbol = await Companies.findOne({ symbol: text });

    if (pelan == "Bronze") {
        isComparison = false;
        ctx.reply(
            "شما از پلن برنزی استفاده میکنید برای استفاده از این قابلیت باید اشتراک تهیه کنید.",
            {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: "ارتقای پنل",
                                callback_data: "buyPanel_",
                            },
                        ],
                    ],
                },
            }
        );
    } else {
        if (CompSymbol.length == 0) {
            CompSymbol.push(symbol);
            ctx.reply("سهامی دوم را که میخواهید مقایسه کنید را وارد کنید");
        } else if (CompSymbol.length > 2) {
            CompSymbol = [];
            isComparison = false;
        }
    }
});

bot.launch()
    .then(() => {
        debug("Connected To Telegram");
    })
    .catch((err) => {
        debug("Con't Connected To Telegram");
        if (err.code === "ETIMEDOUT") {
            console.log("Check your internet connection");
        } else {
            console.log(err);
        }
    });

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
