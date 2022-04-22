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

    const currRotation = (await storage.getItem("rotation")) || [
        "PÄLE",
        "HANKI",
        "IIKKA",
    ];
    const newRotation = currRotation.unshift(currRotation.pop());

    await storage.setItem("rotation", newRotation);
    return currRotation;
};

schedule.scheduleJob(
    {
        hour: 12,
        minute: 0,
        dayOfWeek: [3, 6],
    },
    async () => {
        const weekday = new Date().getDay();
        const shifts = weekday === 3 ? WEDNESDAY_SHIFTS : SATURDAY_SHIFTS;
        const rotation = await getCurrentRotationAndRotate();

        let msg = "<b><u>SIIVOUSVUOROT</u></b>\n";
        for (let i = 0; i < shifts.length; i++) {
            msg += `\n${rotation[i]}: ${shifts[i]}`;
        }

        await ctx.telegram.sendMessage(process.env.GROUP_ID, msg);
    }
);

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
