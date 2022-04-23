const { Telegraf } = require("telegraf");
const schedule = require("node-schedule");
const storage = require("node-persist");
require("dotenv").config();

const SATURDAY_SHIFTS = ["Vessa + kylppäri", "Keittiö", "Olohuone + imurointi"];
const WEDNESDAY_SHIFTS = ["Keittiö", "Imurointi (eteinen + keittiö)"];

const bot = new Telegraf(process.env.BOT_TOKEN);
bot.launch();

const getCurrentRotationAndRotate = async () => {
    await storage.init();

    let currRotation = (await storage.getItem("rotation")) || [
        "PÄLE",
        "HANKI",
        "IIKKA",
    ];
    const newRotation = currRotation.unshift(currRotation.pop());

    console.log(`Got current rotation: ${currRotation}`);
    console.log(`Saving new rotation: ${newRotation}`);

    await storage.setItem("rotation", newRotation);
    return currRotation;
};

const job = async () => {
    const weekday = new Date().getDay();
    const shifts = weekday === 3 ? WEDNESDAY_SHIFTS : SATURDAY_SHIFTS;
    console.log(`Using ${weekday === 3 ? "wednesday" : "saturday"} shifts`);

    const rotation = await getCurrentRotationAndRotate();

    let msg = "<b><u>SIIVOUSVUOROT</u></b>\n";
    for (let i = 0; i < shifts.length; i++) {
        msg += `\n${rotation[i]}: ${shifts[i]}`;
    }

    await bot.telegram
        .sendMessage(process.env.GROUP_ID, msg, { reply_markup: "HTML" })
        .catch((err) => {
            console.log("Sending msg to group failed");
            console.log(err);
        });
};

schedule.scheduleJob(
    {
        hour: 10,
        minute: 0,
        dayOfWeek: [3, 6],
    },
    async () => {
        console.log("Running scheduled job");
        await job();
    }
);

bot.hears("/now", job);

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
