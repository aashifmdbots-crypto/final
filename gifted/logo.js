const { gmd, gmdBuffer } = require("../gift");
const axios = require("axios");

const logoEndpoints = [

  {
    pattern: "metallic",
    aliases: ["metal", "metallictext"],
    description: "3D Metallic text logo",
    endpoint: "metallic",
  },
  {
    pattern: "ice",
    aliases: ["icetext"],
    description: "Ice text logo",
    endpoint: "ice",
  },
  {
    pattern: "snow",
    aliases: ["snowtext"],
    description: "Snow 3D text logo",
    endpoint: "snow",
  },
  {
    pattern: "impressive",
    aliases: ["paint3d", "colorpaint"],
    description: "Impressive colorful text logo",
    endpoint: "impressive",
  },
  {
    pattern: "matrix",
    aliases: ["matrixtext"],
    description: "Matrix text logo",
    endpoint: "matrix",
  },
  {
    pattern: "light",
    aliases: ["lighttext", "futuristiclight"],
    description: "Futuristic light text logo",
    endpoint: "light",
  },
  {
    pattern: "neon",
    aliases: ["neontext"],
    description: "Colorful neon text logo",
    endpoint: "neon",
  },
  {
    pattern: "devil",
    aliases: ["devilwings", "neondevil"],
    description: "Neon devil wings text logo",
    endpoint: "devil",
  },
  {
    pattern: "purple",
    aliases: ["purpletext"],
    description: "Purple text logo",
    endpoint: "purple",
  },
  {
    pattern: "thunder",
    aliases: ["thundertext"],
    description: "Thunder text logo",
    endpoint: "thunder",
  },
  {
    pattern: "leaves",
    aliases: ["greenbrush", "leaftext"],
    description: "Leaves typography text logo",
    endpoint: "leaves",
  },
  {
    pattern: "arena",
    aliases: ["aov", "arenaofvalor"],
    description: "Arena of Valor cover logo",
    endpoint: "arena",
  },
  {
    pattern: "hacker",
    aliases: ["anonymous", "hackeravatar"],
    description: "Anonymous hacker avatar logo",
    endpoint: "hacker",
  },
  {
    pattern: "fire",
    aliases: ["flame", "firetext"],
    description: "Fire text logo",
    endpoint: "fire",
  },
  {
    pattern: "glossysilver",
    aliases: ["glossy", "silverlogo"],
    description: "Glossy Silver logo",
    endpoint: "glossysilver",
  },
  {
    pattern: "writetext",
    aliases: ["textwrite", "baby", "writtentext"],
    description: "Write Text logo",
    endpoint: "writetext",
  },
  {
    pattern: "blackpinklogo",
    aliases: ["bplogo", "pinkblack"],
    description: "Black Pink Logo",
    endpoint: "blackpinklogo",
  },
  {
    pattern: "glitchtext",
    aliases: ["glitch", "textglitch"],
    description: "Glitch Text logo",
    endpoint: "glitchtext",
  },
  {
    pattern: "advancedglow",
    aliases: ["advglow", "glowadvanced"],
    description: "Advanced Glow logo",
    endpoint: "advancedglow",
  },
  {
    pattern: "typographytext",
    aliases: ["typography", "typo"],
    description: "Typography Text logo",
    endpoint: "typographytext",
  },
  {
    pattern: "pixelglitch",
    aliases: ["pixelg", "glitchpixel"],
    description: "Pixel Glitch logo",
    endpoint: "pixelglitch",
  },
  {
    pattern: "neonglitch",
    aliases: ["neong", "glitchneon"],
    description: "Neon Glitch logo",
    endpoint: "neonglitch",
  },
  {
    pattern: "nigerianflag",
    aliases: ["ngflag", "nigeria"],
    description: "Nigerian Flag logo",
    endpoint: "nigerianflag",
  },
  {
    pattern: "americanflag",
    aliases: ["usflag", "usaflag", "america"],
    description: "American Flag logo",
    endpoint: "americanflag",
  },
  {
    pattern: "deletingtext",
    aliases: ["deltext", "textdelete"],
    description: "Deleting Text logo",
    endpoint: "deletingtext",
  },
  {
    pattern: "blackpinkstyle",
    aliases: ["bpstyle", "pinkblackstyle"],
    description: "Blackpink Style logo",
    endpoint: "blackpinkstyle",
  },
  {
    pattern: "glowingtext",
    aliases: ["glowtxt", "textglow"],
    description: "Glowing Text logo",
    endpoint: "glowingtext",
  },
  {
    pattern: "underwater",
    aliases: ["underw", "waterlogo"],
    description: "Under Water logo",
    endpoint: "underwater",
  },
  {
    pattern: "logomaker",
    aliases: ["makelogo", "logomake"],
    description: "Logo Maker",
    endpoint: "logomaker",
  },
  {
    pattern: "cartoonstyle",
    aliases: ["cartoon", "toonlogo"],
    description: "Cartoon Style logo",
    endpoint: "cartoonstyle",
  },
  {
    pattern: "papercut",
    aliases: ["cutpaper", "papercutlogo"],
    description: "Paper Cut logo",
    endpoint: "papercut",
  },
  {
    pattern: "effectclouds",
    aliases: ["cloudeffect", "clouds"],
    description: "Effect Clouds logo",
    endpoint: "effectclouds",
  },
  {
    pattern: "gradienttext",
    aliases: ["gradient", "textgradient"],
    description: "Gradient Text logo",
    endpoint: "gradienttext",
  },
  {
    pattern: "summerbeach",
    aliases: ["beachsummer", "beach"],
    description: "Summer Beach logo",
    endpoint: "summerbeach",
  },
  {
    pattern: "sandsummer",
    aliases: ["summersand", "sand", "sandlogo"],
    description: "Sand Summer logo",
    endpoint: "sandsummer",
  },
  {
    pattern: "luxurygold",
    aliases: ["goldluxury", "luxgold"],
    description: "Luxury Gold logo",
    endpoint: "luxurygold",
  },
  {
    pattern: "galaxy",
    aliases: ["galaxylogo", "space"],
    description: "Galaxy logo",
    endpoint: "galaxy",
  },
  {
    pattern: "logo1917",
    aliases: ["1917", "1917logo"],
    description: "1917 Style logo",
    endpoint: "1917",
  },
  {
    pattern: "makingneon",
    aliases: ["neonmake", "neonlogo"],
    description: "Making Neon logo",
    endpoint: "makingneon",
  },
  {
    pattern: "texteffect",
    aliases: ["effecttext", "fxtext"],
    description: "Text Effect logo",
    endpoint: "texteffect",
  },
  {
    pattern: "galaxystyle",
    aliases: ["stylegalaxy", "galstyle"],
    description: "Galaxy Style logo",
    endpoint: "galaxystyle",
  },
  {
    pattern: "lighteffect",
    aliases: ["effectlight", "lightlogo"],
    description: "Light Effect logo",
    endpoint: "lighteffect",
  },
];

async function createLogoCommand(config) {
  gmd(
    {
      pattern: config.pattern,
      aliases: config.aliases,
      category: "logo",
      react: "🎨",
      description: `Create ${config.description}`,
    },
    async (from, Gifted, conText) => {
      const {
        q,
        mek,
        reply,
        react,
        GiftedTechApi,
        GiftedApiKey,
        pushname,
        botCaption,
      } = conText;

      if (!q) {
        await react("❌");
        return reply(
          `Please provide text for the logo.\n\nUsage: .${config.pattern} <text>\nExample: .${config.pattern} ${pushname || "Gifted Tech"}`,
        );
      }

      try {
        await react("⏳");

        const apiUrl = `${GiftedTechApi}/api/ephoto360/${config.endpoint}?apikey=${GiftedApiKey}&text=${encodeURIComponent(q)}`;
        const res = await axios.get(apiUrl, { timeout: 60000 });

        if (!res.data || !res.data.success || !res.data.result?.image_url) {
          await react("❌");
          return reply("Failed to generate logo. Please try again.");
        }

        const imageUrl = res.data.result.image_url;
        const imageBuffer = await gmdBuffer(imageUrl);

        if (!imageBuffer || !Buffer.isBuffer(imageBuffer)) {
          await react("❌");
          return reply("Failed to download the generated logo.");
        }

        await Gifted.sendMessage(
          from,
          {
            image: imageBuffer,
            caption: `✨ *${config.description}*\n\n📝 *Text:* ${q}\n\n> ${botCaption}`,
          },
          { quoted: mek },
        );

        await react("✅");
      } catch (e) {
        console.error(`Error in ${config.pattern} command:`, e.message);
        await react("❌");
        await reply("Failed to generate logo. Please try again later.");
      }
    },
  );
}

logoEndpoints.forEach((config) => createLogoCommand(config));

gmd(
  {
    pattern: "logolist",
    aliases: ["logos", "logo", "logohelp", "logomenu"],
    category: "logo",
    react: "📜",
    description: "Show all available logo commands",
  },
  async (from, Gifted, conText) => {
    const { mek, reply, react, botCaption, botName, botPrefix } = conText;

    const logoList = logoEndpoints
      .map((l, i) => `${i + 1}. *.${l.pattern}* - ${l.description}`)
      .join("\n");

    await reply(
      `🎨 *${botName} LOGO MAKER*\n\n${logoList}\n\n📝 *Usage:* ${botPrefix}commandname <your text>\n📌 *Example:* ${botPrefix}glossysilver Gifted Tech\n\n> ${botCaption}`,
    );
    await react("✅");
  },
);
