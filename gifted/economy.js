const { gmd, standardizeJid } = require('../gift');
const { getOrCreateUser, findUser, getRichestUsers } = require('../gift/database/economyUser');

const commands = ['balance', 'bal', 'daily', 'weekly', 'work', 'deposit', 'withdraw', 'transfer', 'rob', 'slots', 'flip', 'rich', 'leaderboard'];
const registeredCommands = [...commands, 'levelup'];

const COIN = '🪙';
const DAILY_REWARD = 500;
const WEEKLY_REWARD = 2500;
const DAILY_COOLDOWN = 24 * 60 * 60 * 1000;
const WEEKLY_COOLDOWN = 7 * 24 * 60 * 60 * 1000;
const WORK_COOLDOWN = 60 * 60 * 1000;
const ROB_COOLDOWN = 2 * 60 * 60 * 1000;
const SLOT_REELS = ['🍎', '🍊', '🍋', '🍇', '💎', '7️⃣'];
const WORK_JOBS = [
    'programmer',
    'chef',
    'driver',
    'designer',
    'doctor',
    'teacher',
    'mechanic',
    'streamer',
    'security guard',
    'shopkeeper',
];

const LEVELS = [
    { min: 0, name: 'Naya Khiladi' },
    { min: 1_000, name: 'Mehnati Banda' },
    { min: 5_000, name: 'Coin Collector' },
    { min: 15_000, name: 'Rich Dost' },
    { min: 50_000, name: 'Business Tycoon' },
    { min: 100_000, name: 'Millionaire Mindset' },
    { min: 500_000, name: 'Economy King' },
    { min: 1_000_000, name: 'Legend Malik' },
];

function formatCoins(amount) {
    return Number(amount || 0).toLocaleString('en-US');
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getLevel(total) {
    return LEVELS.reduce((current, level) => (total >= level.min ? level : current), LEVELS[0]).name;
}

function formatDuration(ms) {
    const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const parts = [];
    if (days) parts.push(`${days}d`);
    if (hours) parts.push(`${hours}h`);
    if (minutes) parts.push(`${minutes}m`);
    if (seconds || parts.length === 0) parts.push(`${seconds}s`);
    return parts.join(' ');
}

function parsePositiveInteger(value) {
    if (!value || !/^\d+$/.test(String(value))) return null;
    const amount = Number(value);
    if (!Number.isSafeInteger(amount) || amount <= 0) return null;
    return amount;
}

function parseAmount(value, maxAmount = null) {
    if (String(value || '').toLowerCase() === 'all') return maxAmount && maxAmount > 0 ? maxAmount : null;
    return parsePositiveInteger(value);
}

function jidName(jid) {
    const number = String(jid || '').split('@')[0];
    return number ? `@${number}` : 'Unknown User';
}

function resolveTarget(conText, argIndex = 0) {
    const { mentionedJid = [], quotedUser = '', args = [] } = conText;
    if (mentionedJid.length > 0) return standardizeJid(mentionedJid[0]);
    if (quotedUser) return standardizeJid(quotedUser);

    const raw = args[argIndex];
    if (!raw) return '';
    const number = raw.replace(/[^0-9]/g, '');
    if (number.length < 5) return '';
    return standardizeJid(`${number}@s.whatsapp.net`);
}

function getActorJid(conText) {
    return standardizeJid(conText.sender);
}

function getAmountArgAfterTarget(args) {
    if (!args.length) return undefined;
    if (args[0]?.includes('@') || /^\d{5,}$/.test(args[0]?.replace(/[^0-9]/g, '') || '')) return args[1];
    return args[0];
}

async function sendEconomyMessage(Gifted, from, conText, text, mentions = []) {
    const { m } = conText;
    return await Gifted.sendMessage(from, { text, mentions }, { quoted: m });
}

async function balanceHandler(from, Gifted, conText) {
    const targetJid = resolveTarget(conText) || getActorJid(conText);
    const user = await getOrCreateUser(targetJid);
    const total = (user.wallet || 0) + (user.bank || 0);
    const mentions = targetJid ? [targetJid] : [];

    return await sendEconomyMessage(Gifted, from, conText,
        `${COIN} *Balance*\n\n` +
        `👤 User: ${jidName(targetJid)}\n` +
        `💰 Wallet: *${formatCoins(user.wallet)} coins*\n` +
        `🏦 Bank: *${formatCoins(user.bank)} coins*\n` +
        `📊 Total: *${formatCoins(total)} coins*\n` +
        `🏷️ Level: *${getLevel(total)}*`,
        mentions,
    );
}

async function claimReward(from, Gifted, conText, field, cooldown, reward, title) {
    const user = await getOrCreateUser(getActorJid(conText));
    const lastClaim = user[field] ? new Date(user[field]).getTime() : 0;
    const now = Date.now();
    const remaining = cooldown - (now - lastClaim);

    if (remaining > 0) {
        return await sendEconomyMessage(Gifted, from, conText,
            `${COIN} *${title} Cooldown*\n\n⏳ Try again in *${formatDuration(remaining)}*.`,
        );
    }

    user.wallet += reward;
    user[field] = new Date(now);
    await user.save();

    return await sendEconomyMessage(Gifted, from, conText,
        `${COIN} *${title} Claimed!*\n\n` +
        `✅ You received *${formatCoins(reward)} coins*.\n` +
        `💰 Wallet: *${formatCoins(user.wallet)} coins*`,
    );
}

async function workHandler(from, Gifted, conText) {
    const user = await getOrCreateUser(getActorJid(conText));
    const lastWork = user.lastWork ? new Date(user.lastWork).getTime() : 0;
    const remaining = WORK_COOLDOWN - (Date.now() - lastWork);

    if (remaining > 0) {
        return await sendEconomyMessage(Gifted, from, conText,
            `${COIN} *Work Cooldown*\n\n⏳ Try again in *${formatDuration(remaining)}*.`,
        );
    }

    const earned = randomInt(100, 400);
    const job = WORK_JOBS[randomInt(0, WORK_JOBS.length - 1)];
    user.wallet += earned;
    user.lastWork = new Date();
    await user.save();

    return await sendEconomyMessage(Gifted, from, conText,
        `${COIN} *Work Complete*\n\n` +
        `You worked as a *${job}* and earned *${formatCoins(earned)} coins*.\n` +
        `💰 Wallet: *${formatCoins(user.wallet)} coins*`,
    );
}

async function depositHandler(from, Gifted, conText) {
    const user = await getOrCreateUser(getActorJid(conText));
    const amount = parseAmount(conText.args[0], user.wallet);

    if (!amount) return await sendEconomyMessage(Gifted, from, conText, `${COIN} Usage: *.deposit <amount/all>*`);
    if (amount > user.wallet) return await sendEconomyMessage(Gifted, from, conText, `${COIN} *Insufficient Funds*\n\nYou only have *${formatCoins(user.wallet)} coins* in your wallet.`);

    user.wallet -= amount;
    user.bank += amount;
    await user.save();

    return await sendEconomyMessage(Gifted, from, conText,
        `${COIN} *Deposit Successful*\n\n` +
        `🏦 Deposited *${formatCoins(amount)} coins* into your bank.\n` +
        `💰 Wallet: *${formatCoins(user.wallet)}*\n` +
        `🏦 Bank: *${formatCoins(user.bank)}*`,
    );
}

async function withdrawHandler(from, Gifted, conText) {
    const user = await getOrCreateUser(getActorJid(conText));
    const amount = parseAmount(conText.args[0], user.bank);

    if (!amount) return await sendEconomyMessage(Gifted, from, conText, `${COIN} Usage: *.withdraw <amount/all>*`);
    if (amount > user.bank) return await sendEconomyMessage(Gifted, from, conText, `${COIN} *Insufficient Funds*\n\nYou only have *${formatCoins(user.bank)} coins* in your bank.`);

    user.bank -= amount;
    user.wallet += amount;
    await user.save();

    return await sendEconomyMessage(Gifted, from, conText,
        `${COIN} *Withdraw Successful*\n\n` +
        `💰 Withdrew *${formatCoins(amount)} coins* from your bank.\n` +
        `💰 Wallet: *${formatCoins(user.wallet)}*\n` +
        `🏦 Bank: *${formatCoins(user.bank)}*`,
    );
}

async function transferHandler(from, Gifted, conText) {
    const targetJid = resolveTarget(conText);
    const amount = parsePositiveInteger(getAmountArgAfterTarget(conText.args));

    if (!targetJid) return await sendEconomyMessage(Gifted, from, conText, `${COIN} Usage: *.transfer @user <amount>*`);
    if (targetJid === getActorJid(conText)) return await sendEconomyMessage(Gifted, from, conText, `${COIN} You cannot transfer coins to yourself.`);
    if (!amount) return await sendEconomyMessage(Gifted, from, conText, `${COIN} Please enter a valid positive integer amount.`);
    if (amount < 10) return await sendEconomyMessage(Gifted, from, conText, `${COIN} Minimum transfer amount is *10 coins*.`);

    const senderUser = await getOrCreateUser(getActorJid(conText));
    const targetUser = await getOrCreateUser(targetJid);

    if (amount > senderUser.wallet) return await sendEconomyMessage(Gifted, from, conText, `${COIN} *Insufficient Funds*\n\nYou only have *${formatCoins(senderUser.wallet)} coins* in your wallet.`);

    senderUser.wallet -= amount;
    targetUser.wallet += amount;
    await senderUser.save();
    await targetUser.save();

    return await sendEconomyMessage(Gifted, from, conText,
        `${COIN} *Transfer Successful*\n\n` +
        `Sent *${formatCoins(amount)} coins* to ${jidName(targetJid)}.\n` +
        `💰 Your Wallet: *${formatCoins(senderUser.wallet)} coins*`,
        [targetJid],
    );
}

async function robHandler(from, Gifted, conText) {
    const targetJid = resolveTarget(conText);
    if (!targetJid) return await sendEconomyMessage(Gifted, from, conText, `${COIN} Usage: *.rob @user*`);
    if (targetJid === getActorJid(conText)) return await sendEconomyMessage(Gifted, from, conText, `${COIN} You cannot rob yourself.`);

    const robber = await getOrCreateUser(getActorJid(conText));
    const target = await findUser(targetJid);
    if (!target) return await sendEconomyMessage(Gifted, from, conText, `${COIN} User not found in economy. They need to use an economy command first.`);

    const lastRob = robber.lastRob ? new Date(robber.lastRob).getTime() : 0;
    const remaining = ROB_COOLDOWN - (Date.now() - lastRob);
    const fine = 100;
    if (remaining > 0) return await sendEconomyMessage(Gifted, from, conText, `${COIN} *Rob Cooldown*\n\n⏳ Try again in *${formatDuration(remaining)}*.`);
    if (robber.wallet < fine) return await sendEconomyMessage(Gifted, from, conText, `${COIN} You need at least *${formatCoins(fine)} coins* in wallet to risk a robbery fine.`);
    if (target.wallet < 10) return await sendEconomyMessage(Gifted, from, conText, `${COIN} Target does not have enough wallet coins to rob.`);

    robber.lastRob = new Date();
    const success = Math.random() < 0.4;

    if (success) {
        const percent = randomInt(10, 30) / 100;
        const stolen = Math.max(1, Math.floor(target.wallet * percent));
        target.wallet -= stolen;
        robber.wallet += stolen;
        await target.save();
        await robber.save();

        return await sendEconomyMessage(Gifted, from, conText,
            `${COIN} *Rob Successful!*\n\n` +
            `You stole *${formatCoins(stolen)} coins* from ${jidName(targetJid)}.\n` +
            `💰 Wallet: *${formatCoins(robber.wallet)} coins*`,
            [targetJid],
        );
    }

    robber.wallet -= fine;
    await robber.save();

    return await sendEconomyMessage(Gifted, from, conText,
        `${COIN} *Rob Failed!*\n\n` +
        `🚔 You were caught and lost *${formatCoins(fine)} coins*.\n` +
        `💰 Wallet: *${formatCoins(robber.wallet)} coins*`,
    );
}

async function slotsHandler(from, Gifted, conText) {
    const bet = parsePositiveInteger(conText.args[0]);
    if (!bet) return await sendEconomyMessage(Gifted, from, conText, `${COIN} Usage: *.slots <amount>*`);

    const user = await getOrCreateUser(getActorJid(conText));
    if (bet > user.wallet) return await sendEconomyMessage(Gifted, from, conText, `${COIN} *Insufficient Funds*\n\nYou only have *${formatCoins(user.wallet)} coins* in your wallet.`);

    const reels = [0, 1, 2].map(() => SLOT_REELS[randomInt(0, SLOT_REELS.length - 1)]);
    const counts = reels.reduce((acc, reel) => ({ ...acc, [reel]: (acc[reel] || 0) + 1 }), {});
    const maxMatch = Math.max(...Object.values(counts));
    let multiplier = 0;
    if (reels.every((reel) => reel === '💎')) multiplier = 10;
    else if (maxMatch === 3) multiplier = 3;
    else if (maxMatch === 2) multiplier = 1.5;

    user.wallet -= bet;
    const winnings = Math.floor(bet * multiplier);
    user.wallet += winnings;
    await user.save();

    const profit = winnings - bet;
    return await sendEconomyMessage(Gifted, from, conText,
        `${COIN} *Slots*\n\n` +
        `🎰 ${reels.join(' | ')}\n\n` +
        (multiplier > 0
            ? `✅ You won *${formatCoins(winnings)} coins* (${multiplier}x)!\n📈 Profit: *${formatCoins(profit)} coins*`
            : `❌ You lost *${formatCoins(bet)} coins*.`) +
        `\n💰 Wallet: *${formatCoins(user.wallet)} coins*`,
    );
}

async function flipHandler(from, Gifted, conText) {
    const choice = String(conText.args[0] || '').toLowerCase();
    const bet = parsePositiveInteger(conText.args[1]);
    if (!['heads', 'tails'].includes(choice) || !bet) return await sendEconomyMessage(Gifted, from, conText, `${COIN} Usage: *.flip <heads/tails> <amount>*`);

    const user = await getOrCreateUser(getActorJid(conText));
    if (bet > user.wallet) return await sendEconomyMessage(Gifted, from, conText, `${COIN} *Insufficient Funds*\n\nYou only have *${formatCoins(user.wallet)} coins* in your wallet.`);

    const result = Math.random() < 0.5 ? 'heads' : 'tails';
    const won = choice === result;
    user.wallet += won ? bet : -bet;
    await user.save();

    return await sendEconomyMessage(Gifted, from, conText,
        `${COIN} *Coin Flip*\n\n` +
        `🪙 Result: *${result.toUpperCase()}*\n` +
        (won ? `✅ You won *${formatCoins(bet * 2)} coins* payout!` : `❌ You lost *${formatCoins(bet)} coins*.`) +
        `\n💰 Wallet: *${formatCoins(user.wallet)} coins*`,
    );
}

async function leaderboardHandler(from, Gifted, conText) {
    const users = await getRichestUsers(10);
    if (!users.length) return await sendEconomyMessage(Gifted, from, conText, `${COIN} No economy users found yet.`);

    const mentions = users.map((user) => user.jid);
    const rows = users.map((user, index) => {
        const total = (user.wallet || 0) + (user.bank || 0);
        return `${index + 1}. ${jidName(user.jid)} — *${formatCoins(total)} coins* (${getLevel(total)})`;
    }).join('\n');

    return await sendEconomyMessage(Gifted, from, conText, `${COIN} *Richest Users*\n\n${rows}`, mentions);
}

async function levelupHandler(from, Gifted, conText) {
    const ownerJid = standardizeJid(String(conText.ownerNumber || '').replace(/\D/g, ''));
    if (getActorJid(conText) !== ownerJid) {
        return await sendEconomyMessage(Gifted, from, conText, `${COIN} Only the bot owner can use *.levelup*.`);
    }

    const amount = parsePositiveInteger(conText.args[0]);
    if (!amount) return await sendEconomyMessage(Gifted, from, conText, `${COIN} Usage: *.levelup <amount>*`);

    const user = await getOrCreateUser(getActorJid(conText));
    user.wallet += amount;
    await user.save();

    const total = user.wallet + user.bank;
    return await sendEconomyMessage(Gifted, from, conText,
        `${COIN} *Owner Level Up*\n\n` +
        `✅ Added *${formatCoins(amount)} coins* to your wallet.\n` +
        `💰 Wallet: *${formatCoins(user.wallet)} coins*\n` +
        `🏷️ Level: *${getLevel(total)}*`,
    );
}

async function handler(from, Gifted, conText) {
    switch (conText.command) {
        case 'balance':
        case 'bal':
            return await balanceHandler(from, Gifted, conText);
        case 'daily':
            return await claimReward(from, Gifted, conText, 'lastDaily', DAILY_COOLDOWN, DAILY_REWARD, 'Daily Reward');
        case 'weekly':
            return await claimReward(from, Gifted, conText, 'lastWeekly', WEEKLY_COOLDOWN, WEEKLY_REWARD, 'Weekly Reward');
        case 'work':
            return await workHandler(from, Gifted, conText);
        case 'deposit':
            return await depositHandler(from, Gifted, conText);
        case 'withdraw':
            return await withdrawHandler(from, Gifted, conText);
        case 'transfer':
            return await transferHandler(from, Gifted, conText);
        case 'rob':
            return await robHandler(from, Gifted, conText);
        case 'slots':
            return await slotsHandler(from, Gifted, conText);
        case 'flip':
            return await flipHandler(from, Gifted, conText);
        case 'rich':
        case 'leaderboard':
            return await leaderboardHandler(from, Gifted, conText);
        case 'levelup':
            return await levelupHandler(from, Gifted, conText);
        default:
            return null;
    }
}

const metadata = {
    balance: { aliases: ['bal'], description: 'Show wallet and bank balance' },
    daily: { aliases: [], description: 'Claim daily economy reward' },
    weekly: { aliases: [], description: 'Claim weekly economy reward' },
    work: { aliases: [], description: 'Work for random coins' },
    deposit: { aliases: ['dep'], description: 'Deposit wallet coins into bank' },
    withdraw: { aliases: ['with'], description: 'Withdraw bank coins to wallet' },
    transfer: { aliases: ['pay', 'sendcoins'], description: 'Transfer wallet coins to a user' },
    rob: { aliases: [], description: 'Rob another user wallet' },
    slots: { aliases: ['slot'], description: 'Play slot machine' },
    flip: { aliases: ['coinflip'], description: 'Bet on a coin flip' },
    rich: { aliases: ['leaderboard'], description: 'Show richest economy users' },
    levelup: { aliases: [], description: 'Owner-only coin top-up' },
};

for (const commandName of ['balance', 'daily', 'weekly', 'work', 'deposit', 'withdraw', 'transfer', 'rob', 'slots', 'flip', 'rich', 'levelup']) {
    gmd({
        pattern: commandName,
        aliases: metadata[commandName].aliases,
        react: COIN,
        category: 'economy',
        description: metadata[commandName].description,
    }, handler);
}

module.exports = handler;
module.exports.default = handler;
module.exports.commands = commands;
module.exports.registeredCommands = registeredCommands;
