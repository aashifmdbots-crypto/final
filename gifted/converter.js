const { gmd, toAudio, toVideo, toPtt, stickerToImage, gmdFancy, gmdRandom, getSetting, runFFmpeg, getVideoDuration, gmdSticker } = require("../gift");
const AdmZip = require("adm-zip");
const path = require("path");
const fs = require("fs").promises;
const { StickerTypes } = require("wa-sticker-formatter");
const sharp = require("sharp");

gmd({
    pattern: "sticker",
    aliases: ["st"],
    category: "converter",
    react: "🔄️",
    description: "Convert image/video/sticker to sticker.",
}, async (from, Gifted, conText) => {
    const { q, mek, reply, react, quoted, packName, packAuthor } = conText;

    try {
        if (!quoted) {
            await react("❌");
            return reply("Please reply to/quote an image, video or sticker");
        }

        const quotedImg = quoted?.imageMessage || quoted?.message?.imageMessage;
        const quotedSticker = quoted?.stickerMessage || quoted?.message?.stickerMessage;
        const quotedVideo = quoted?.videoMessage || quoted?.message?.videoMessage;

        if (!quotedImg && !quotedSticker && !quotedVideo) {
            await react("❌");
            return reply("That quoted message is not an image, video or sticker");
        }

        let tempFilePath;
        try {
            if (quotedImg || quotedVideo) {
                tempFilePath = await Gifted.downloadAndSaveMediaMessage(
                    quotedImg || quotedVideo,
                    "temp_media"
                );

                let fileExt = quotedImg ? ".jpg" : ".mp4";
                let mediaFile = gmdRandom(fileExt);
                const data = await fs.readFile(tempFilePath);
                await fs.writeFile(mediaFile, data);

                // 🔥 If video → convert to webp
                if (quotedVideo) {
                    const compressedFile = gmdRandom(".webp");
                    let duration = 8; // default duration
                    
                    try {
                        duration = await getVideoDuration(mediaFile);
                        if (duration > 10) duration = 10; // trim to first 10 seconds
                    } catch (e) {
                        console.error("Using default duration due to error:", e);
                    }
                    
                    await runFFmpeg(mediaFile, compressedFile, 320, 15, duration);
                    await fs.unlink(mediaFile).catch(() => {});
                    mediaFile = compressedFile;
                }

                const stickerBuffer = await gmdSticker(mediaFile, {
                    pack: packName || "𝐀𝐓𝐀𝐒𝐒𝐀-𝐌𝐃", 
                    author: packAuthor || "GIFTED-TECH",
                    type: q.includes("--crop") || q.includes("-c") ? StickerTypes.CROPPED : StickerTypes.FULL,
                    categories: ["🤩", "🎉"],
                    id: "12345",
                    quality: 75,
                    background: "transparent"
                });

                await fs.unlink(mediaFile).catch(() => {});
                await react("✅");
                return Gifted.sendMessage(from, { sticker: stickerBuffer }, { quoted: mek });

            } else if (quotedSticker) {
                // Sticker → Sticker (recompress if too big)
                tempFilePath = await Gifted.downloadAndSaveMediaMessage(quotedSticker, "temp_media");
                const stickerData = await fs.readFile(tempFilePath);
                const stickerFile = gmdRandom(".webp");
                await fs.writeFile(stickerFile, stickerData);

                const newStickerBuffer = await gmdSticker(stickerFile, {
                    pack: packName || "𝐀𝐓𝐀𝐒𝐒𝐀-𝐌𝐃", 
                    author: packAuthor || "GIFTED-TECH",
                    type: q.includes("--crop") || q.includes("-c") ? StickerTypes.CROPPED : StickerTypes.FULL,
                    categories: ["🤩", "🎉"],
                    id: "12345",
                    quality: 75,
                    background: "transparent"
                });

                await fs.unlink(stickerFile).catch(() => {});
                await react("✅");
                return Gifted.sendMessage(from, { sticker: newStickerBuffer }, { quoted: mek });
            }
        } finally {
            if (tempFilePath) await fs.unlink(tempFilePath).catch(() => {});
        }
    } catch (e) {
        console.error("Error in sticker command:", e);
        await react("❌");
        await reply("Failed to convert to sticker");
    }
});

gmd({
    pattern: "circle",
    category: "converter",
    react: "🔄️",
    description: "Make a circular sticker from a replied image or sticker.",
}, async (from, Gifted, conText) => {
    const { mek, reply, react, quoted, quotedMsg, packName, packAuthor } = conText;

    if (!quotedMsg) {
        await react("❌");
        return reply("Please reply to/quote an image or sticker");
    }

    const quotedImg = quoted?.imageMessage || quoted?.message?.imageMessage;
    const quotedSticker = quoted?.stickerMessage || quoted?.message?.stickerMessage;

    if (!quotedImg && !quotedSticker) {
        await react("❌");
        return reply("That quoted message is not an image or sticker");
    }

    let tempFilePath;
    let circleFilePath;

    try {
        tempFilePath = await Gifted.downloadAndSaveMediaMessage(
            quotedImg || quotedSticker,
            "temp_media"
        );

        const sourceBuffer = await fs.readFile(tempFilePath);
        const imageInput = quotedSticker ? await stickerToImage(sourceBuffer) : sourceBuffer;

        const metadata = await sharp(imageInput).metadata();
        const size = Math.min(metadata.width || 512, metadata.height || 512, 512);

        const svgMask = `<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="white"/></svg>`;

        circleFilePath = gmdRandom(".png");

        await sharp(imageInput)
            .resize(size, size, { fit: "cover" })
            .composite([{ input: Buffer.from(svgMask), blend: "dest-in" }])
            .png()
            .toFile(circleFilePath);

        const stickerBuffer = await gmdSticker(circleFilePath, {
            pack: packName || "𝐀𝐓𝐀𝐒𝐒𝐀-𝐌𝐃",
            author: packAuthor || "GIFTED-TECH",
            type: StickerTypes.FULL,
            categories: ["🤩", "🎉"],
            id: "12345",
            quality: 75,
            background: "transparent"
        });

        await Gifted.sendMessage(from, { sticker: stickerBuffer }, { quoted: mek });
        await react("✅");
    } catch (e) {
        console.error("Error in circle command:", e);
        await react("❌");
        await reply("Failed to create circular sticker");
    } finally {
        if (tempFilePath) await fs.unlink(tempFilePath).catch(() => {});
        if (circleFilePath) await fs.unlink(circleFilePath).catch(() => {});
    }
});


gmd({
    pattern: "take",
    category: "converter",
    react: "🔄️",
    description: "Change replied sticker pack and author metadata.",
}, async (from, Gifted, conText) => {
    const { mek, reply, react, quoted, q } = conText;

    const quotedSticker = quoted?.stickerMessage || quoted?.message?.stickerMessage;
    if (!quotedSticker) {
        await react("❌");
        return reply("Please reply to/quote a sticker");
    }

    let tempFilePath;
    let stickerFilePath;
    try {
        tempFilePath = await Gifted.downloadAndSaveMediaMessage(quotedSticker, "temp_media");
        const stickerData = await fs.readFile(tempFilePath);
        stickerFilePath = gmdRandom(".webp");
        await fs.writeFile(stickerFilePath, stickerData);

        const [customPack, customAuthor] = (q || "").split("|").map((v) => v.trim());

        const updatedStickerBuffer = await gmdSticker(stickerFilePath, {
            pack: customPack || "𝗔𝗔𝗦𝗛𝗜𝗙-𝗠𝗗",
            author: customAuthor || "𝐁𝐘 𝐀𝐀𝐒𝐇𝐈𝐅 𝐒𝐄𝐑 ♥️",
            type: StickerTypes.FULL,
            categories: ["🤩", "🎉"],
            id: "12345",
            quality: 75,
            background: "transparent"
        });

        await Gifted.sendMessage(from, { sticker: updatedStickerBuffer }, { quoted: mek });
        await react("✅");
    } catch (e) {
        console.error("Error in take command:", e);
        await react("❌");
        await reply("Failed to update sticker metadata");
    } finally {
        if (tempFilePath) await fs.unlink(tempFilePath).catch(() => {});
        if (stickerFilePath) await fs.unlink(stickerFilePath).catch(() => {});
    }
});


gmd({
    pattern: "toimg",
    aliases: ["s2img"],
    category: "converter",
    react: "🔄️",
    description: "Convert Sticker to Image.",
}, async (from, Gifted, conText) => {
    const { mek, reply, sender, botName, react, quoted, botFooter, quotedMsg, newsletterJid } = conText;

    try {
        if (!quotedMsg) {
            await react("❌");
            return reply("Please reply to/quote a sticker");
        }
        
        const quotedSticker = quoted?.stickerMessage || quoted?.message?.stickerMessage;
        if (!quotedSticker) {
            await react("❌");
            return reply("That quoted message is not a sticker");
        }
        
        let tempFilePath;
        try {
            tempFilePath = await Gifted.downloadAndSaveMediaMessage(quotedSticker, 'temp_media');
            const stickerBuffer = await fs.readFile(tempFilePath);
            const imageBuffer = await stickerToImage(stickerBuffer);  
        await Gifted.sendMessage(
        from,
        {
          image: imageBuffer,
          caption: `*Here is your image*\n\n> *${botFooter}*`,
          contextInfo: {
            mentionedJid: [sender],
            forwardingScore: 5,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: newsletterJid,
              newsletterName: botName,
              serverMessageId: 143
            },
          },
        },
        { quoted: mek }
      );
            await react("✅");
        } finally {
            if (tempFilePath) await fs.unlink(tempFilePath).catch(console.error);
        }
    } catch (e) {
        console.error("Error in toimg command:", e);
        await react("❌");
        await reply("Failed to convert sticker to image");
    }
});

gmd({
    pattern: "circle",
    category: "converter",
    react: "🔄️",
    description: "Convert replied image/sticker into a circular sticker.",
}, async (from, Gifted, conText) => {
    const { mek, reply, react, quoted, quotedMsg, packName, packAuthor } = conText;
    const { exec } = require("child_process");

    if (!quotedMsg) {
        await react("❌");
        return reply("Please reply to/quote an image or sticker");
    }

    const quotedImg = quoted?.imageMessage || quoted?.message?.imageMessage;
    const quotedSticker = quoted?.stickerMessage || quoted?.message?.stickerMessage;

    if (!quotedImg && !quotedSticker) {
        await react("❌");
        return reply("That quoted message is not an image or sticker");
    }

    let inputPath;
    let normalizedPath;
    let circlePath;
    try {
        inputPath = await Gifted.downloadAndSaveMediaMessage(quotedImg || quotedSticker, "temp_media");
        normalizedPath = gmdRandom(".png");
        circlePath = gmdRandom(".png");

        await new Promise((resolve, reject) => {
            exec(`ffmpeg -y -i "${inputPath}" -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000" "${normalizedPath}"`, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });

        await new Promise((resolve, reject) => {
            const vf = "format=rgba,geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='if(lte(pow(X-W/2,2)+pow(Y-H/2,2),pow(min(W,H)/2,2)),255,0)'";
            exec(`ffmpeg -y -i "${normalizedPath}" -vf "${vf}" "${circlePath}"`, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });

        const stickerBuffer = await gmdSticker(circlePath, {
            pack: packName || "𝐀𝐓𝐀𝐒𝐒𝐀-𝐌𝐃",
            author: packAuthor || "GIFTED-TECH",
            type: StickerTypes.FULL,
            categories: ["🤩", "🎉"],
            id: "12345",
            quality: 75,
            background: "transparent",
        });

        await Gifted.sendMessage(from, { sticker: stickerBuffer }, { quoted: mek });
        await react("✅");
    } catch (e) {
        console.error("Error in circle command:", e);
        await react("❌");
        await reply("Failed to make circular sticker");
    } finally {
        if (inputPath) await fs.unlink(inputPath).catch(() => {});
        if (normalizedPath) await fs.unlink(normalizedPath).catch(() => {});
        if (circlePath) await fs.unlink(circlePath).catch(() => {});
    }
});


gmd({
    pattern: "toaudio",
    aliases: ['tomp3'],
    category: "converter",
    react: "🔄️",
    description: "Convert video to audio"
  },
  async (from, Gifted, conText) => {
    const { mek, reply, react, botPic, quoted, quotedMsg, newsletterUrl } = conText;

    if (!quotedMsg) {
      await react("❌");
      return reply("Please reply to a video message");
    }

    const quotedVideo = quoted?.videoMessage || quoted?.message?.videoMessage || quoted?.pvtMessage || quoted?.message?.pvtMessage;
    
    if (!quotedVideo) {
      await react("❌");
      return reply("The quoted message doesn't contain any video");
    }

    let tempFilePath;
    try {
      tempFilePath = await Gifted.downloadAndSaveMediaMessage(quotedVideo, 'temp_media');
      const buffer = await fs.readFile(tempFilePath);
      const convertedBuffer = await toAudio(buffer);
      
      await Gifted.sendMessage(from, {
        audio: convertedBuffer,
        mimetype: "audio/mpeg",
        externalAdReply: {
          title: 'Converted Audio',
          body: 'Video to Audio',
          mediaType: 1,
          thumbnailUrl: botPic,
          sourceUrl: newsletterUrl,
          renderLargerThumbnail: false,
          showAdAttribution: true,
        }
      }, { quoted: mek });
      
      await react("✅");
    } catch (e) {
      console.error("Error in toaudio command:", e);
      await react("❌");
      const errMsg = e.message || String(e);
      if (errMsg.includes('no audio')) {
        await reply("This video has no audio track to extract.");
      } else {
        await reply("Failed to convert video to audio");
      }
    } finally {
      if (tempFilePath) await fs.unlink(tempFilePath).catch(console.error);
    }
  }
);


gmd({
    pattern: "toptt",
    aliases: ['tovoice', 'tovn', 'tovoicenote'],
    category: "converter",
    react: "🎙️",
    description: "Convert audio to WhatsApp voice note"
  },
  async (from, Gifted, conText) => {
    const { mek, reply, react, botPic, quoted, quotedMsg } = conText;

    if (!quotedMsg) {
      await react("❌");
      return reply("Please reply to an audio message");
    }

    const quotedAudio = quoted?.audioMessage || quoted?.message?.audioMessage;
    
    if (!quotedAudio) {
      await react("❌");
      return reply("The quoted message doesn't contain any audio");
    }

    let tempFilePath;
    try {
      tempFilePath = await Gifted.downloadAndSaveMediaMessage(quotedAudio, 'temp_media');
      const buffer = await fs.readFile(tempFilePath);
      const convertedBuffer = await toPtt(buffer);
      
      await Gifted.sendMessage(from, {
        audio: convertedBuffer,
        mimetype: "audio/ogg; codecs=opus",
        ptt: true,
      }, { quoted: mek });
      
      await react("✅");
    } catch (e) {
      console.error("Error in toptt command:", e);
      await react("❌");
      await reply("Failed to convert to voice note");
    } finally {
      if (tempFilePath) await fs.unlink(tempFilePath).catch(console.error);
    }
  }
);




gmd({
    pattern: "ptv",
    category: "owner",
    react: "🎬",
    description: "Reply to a video and convert it to a video note (owner only)",
  },
  async (from, Gifted, conText) => {
    const { mek, reply, react, quoted, quotedMsg, isSuperUser } = conText;

    if (!isSuperUser) return reply("❌ Owner Only Command!");

    if (!quotedMsg) {
      await react("❌");
      return reply("Please reply to a video message");
    }

    const quotedVideo = quoted?.videoMessage || quoted?.message?.videoMessage;

    if (!quotedVideo) {
      await react("❌");
      return reply("The quoted message doesn't contain any video");
    }

    let tempFilePath;
    try {
      tempFilePath = await Gifted.downloadAndSaveMediaMessage(quotedVideo, "temp_media");
      const videoBuffer = await fs.readFile(tempFilePath);

      await Gifted.sendMessage(
        from,
        {
          video: videoBuffer,
          mimetype: "video/mp4",
          ptv: true,
        },
        { quoted: mek },
      );

      await react("✅");
    } catch (e) {
      console.error("Error in ptv command:", e);
      await react("❌");
      await reply("Failed to convert video to video note");
    } finally {
      if (tempFilePath) await fs.unlink(tempFilePath).catch(console.error);
    }
  }
);

gmd({
    pattern: "tovideo",
    aliases: ['tomp4', 'tovid', 'toblackscreen', 'blackscreen'],
    category: "converter",
    react: "🎥",
    description: "Convert audio to video with black screen"
  },
  async (from, Gifted, conText) => {
    const { mek, reply, react, botPic, quoted, quotedMsg } = conText;

    if (!quotedMsg) {
      await react("❌");
      return reply("Please reply to an audio message");
    }

    const quotedAudio = quoted?.audioMessage || quoted?.message?.audioMessage;
    
    if (!quotedAudio) {
      await react("❌");
      return reply("The quoted message doesn't contain any audio");
    }

    let tempFilePath;
    try {
      tempFilePath = await Gifted.downloadAndSaveMediaMessage(quotedAudio, 'temp_media');
      const buffer = await fs.readFile(tempFilePath);
      const convertedBuffer = await toVideo(buffer);
      
      await Gifted.sendMessage(from, {
        video: convertedBuffer,
        mimetype: "video/mp4",
        caption: 'Converted Video',
      }, { quoted: mek });
      
      await react("✅");
    } catch (e) {
      console.error("Error in tovideo command:", e);
      await react("❌");
      await reply("Failed to convert audio to video");
    } finally {
      if (tempFilePath) await fs.unlink(tempFilePath).catch(console.error);
    }
  }
);




gmd({
    pattern: "extract",
    aliases: ["unzip"],
    category: "converter",
    react: "📦",
    description: "Extract a replied ZIP file",
}, async (from, Gifted, conText) => {
    const { mek, reply, react, quoted, quotedMsg } = conText;

    const quotedDoc =
        quoted?.documentMessage ||
        quoted?.message?.documentMessage ||
        quotedMsg?.documentMessage ||
        quotedMsg?.documentWithCaptionMessage?.message?.documentMessage;

    const mime = (quotedDoc?.mimetype || "").toLowerCase();
    const fileName = (quotedDoc?.fileName || "").toLowerCase();
    const isZip =
        mime.includes("zip") ||
        mime.includes("compressed") ||
        fileName.endsWith(".zip");

    if (!quotedMsg || !quotedDoc || !isZip) {
        await react("❌");
        return reply("Please reply to a ZIP document.");
    }

    let zipPath;
    try {
        zipPath = await Gifted.downloadAndSaveMediaMessage(quotedDoc, "temp_zip");
        const zip = new AdmZip(zipPath);
        const entries = zip.getEntries().filter((e) => !e.isDirectory);

        if (!entries.length) {
            await react("⚠️");
            return reply("ZIP file is empty.");
        }

        const imageExt = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp"]);
        const videoExt = new Set([".mp4", ".mov", ".mkv", ".webm", ".avi"]);
        const audioExt = new Set([".mp3", ".wav", ".ogg", ".m4a", ".aac", ".flac"]);

        for (const entry of entries) {
            const data = entry.getData();
            const safeName = path.basename(entry.entryName) || "file";
            const ext = path.extname(safeName).toLowerCase();

            if (imageExt.has(ext)) {
                await Gifted.sendMessage(from, {
                    image: data,
                    caption: safeName,
                }, { quoted: mek });
                continue;
            }

            if (videoExt.has(ext)) {
                await Gifted.sendMessage(from, {
                    video: data,
                    caption: safeName,
                    fileName: safeName,
                }, { quoted: mek });
                continue;
            }

            if (audioExt.has(ext)) {
                await Gifted.sendMessage(from, {
                    audio: data,
                    mimetype: quotedDoc.mimetype || "audio/mpeg",
                    fileName: safeName,
                    ptt: false,
                }, { quoted: mek });
                continue;
            }

            await Gifted.sendMessage(from, {
                document: data,
                fileName: safeName,
            }, { quoted: mek });
        }

        await reply(`✅ Extracted and sent ${entries.length} file(s) from ZIP.`);
        await react("✅");
    } catch (e) {
        console.error("Error in extract command:", e);
        await react("❌");
        await reply("Failed to extract ZIP file.");
    } finally {
        if (zipPath) await fs.unlink(zipPath).catch(() => {});
    }
});
