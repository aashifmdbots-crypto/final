const { DATABASE } = require('./database');
const { DataTypes } = require('sequelize');

const UserDB = DATABASE.define('EconomyUser', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    jid: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    wallet: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    bank: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    lastDaily: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    lastWeekly: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    lastWork: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    lastRob: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    inventory: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: '[]',
        get() {
            const rawValue = this.getDataValue('inventory');
            try {
                return JSON.parse(rawValue || '[]');
            } catch (_error) {
                return [];
            }
        },
        set(value) {
            this.setDataValue('inventory', JSON.stringify(Array.isArray(value) ? value : []));
        },
    },
}, {
    tableName: 'economy_users',
    timestamps: true,
});

let economyDbInitialized = false;

async function initEconomyDB() {
    if (economyDbInitialized) return;
    try {
        await UserDB.sync();
        economyDbInitialized = true;
    } catch (error) {
        console.error('EconomyUser sync error:', error.message);
        throw error;
    }
}

async function getOrCreateUser(jid) {
    await initEconomyDB();
    const [user] = await UserDB.findOrCreate({
        where: { jid },
        defaults: {
            jid,
            wallet: 0,
            bank: 0,
            lastDaily: null,
            lastWeekly: null,
            lastWork: null,
            lastRob: null,
            inventory: [],
        },
    });
    return user;
}

async function findUser(jid) {
    await initEconomyDB();
    return await UserDB.findOne({ where: { jid } });
}

async function getRichestUsers(limit = 10) {
    await initEconomyDB();
    const users = await UserDB.findAll();
    return users
        .sort((a, b) => ((b.wallet || 0) + (b.bank || 0)) - ((a.wallet || 0) + (a.bank || 0)))
        .slice(0, limit);
}

module.exports = {
    UserDB,
    initEconomyDB,
    getOrCreateUser,
    findUser,
    getRichestUsers,
};
