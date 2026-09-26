require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN);
const ADMIN_ID = process.env.ADMIN_ID;
const CHANNEL_1 = process.env.CHANNEL_1;
const CHANNEL_2 = process.env.CHANNEL_2;
const INTERVAL = parseInt(process.env.PUSH_INTERVAL || '30'); // menit

let autoPush = false;
let timer = null;

const mainMenu = () => Markup.inlineKeyboard([
  [Markup.button.callback('『 ✦ 』PUSH CH-1', 'push1')],
  [Markup.button.callback('『 ✦ 』PUSH CH-2', 'push2')],
  [Markup.button.callback(autoPush ? '⏸️ STOP AUTO' : '▶️ START AUTO', 'toggleauto')],
  [Markup.button.callback(`⏱️ INTERVAL: ${INTERVAL}m`, 'noop')],
  [Markup.button.callback('📊 STATUS', 'status')]
]);

bot.start((ctx) => {
  if(ctx.from.id.toString() !== ADMIN_ID) return ctx.reply('⛔ Akses ditolak');
  ctx.replyWithHTML(
    `✨ <b>𝐏𝐑𝐄𝐌𝐈𝐔𝐌 𝐏𝐔𝐒𝐇</b> ✨\n\nʜᴀʟᴏ <b>${ctx.from.first_name}</b>\nᴀᴜᴛᴏ-ᴘᴜsʜ: <b>${autoPush ? 'ON 🟢' : 'OFF 🔴'}</b>`,
    mainMenu()
  );
});

async function pushTo(channel){
  try{
    const link = await bot.telegram.exportChatInviteLink(channel);
    const msg = `🔥 <b>JOIN SEKARANG!</b> 🔥\n\n` +
      `✦ 𝙿𝚛𝚎𝚖𝚒𝚞𝚖 𝙲𝚑𝚊𝚗𝚎𝚕 ✦\n` +
      `📢 ${channel}\n\n` +
      `👇 Klik tombol di bawah 👇`;
    await bot.telegram.sendMessage(channel, msg, {
      parse_mode:'HTML',
      ...Markup.inlineKeyboard([[Markup.button.url('🚀 JOIN PREMIUM', link)]])
    });
    console.log(`Pushed to ${channel}`);
  }catch(e){ console.log('Gagal push:', e.message); }
}

bot.action('push1', async(ctx)=>{ await ctx.answerCbQuery(); pushTo(CHANNEL_1); });
bot.action('push2', async(ctx)=>{ await ctx.answerCbQuery(); pushTo(CHANNEL_2); });

bot.action('toggleauto', async(ctx)=>{
  autoPush = !autoPush;
  if(autoPush){
    timer = setInterval(()=>{
      pushTo(CHANNEL_1);
      pushTo(CHANNEL_2);
    }, INTERVAL * 60 * 1000);
    await ctx.answerCbQuery(`🟢 Auto-push ON tiap ${INTERVAL} menit`);
  }else{
    clearInterval(timer);
    await ctx.answerCbQuery('🔴 Auto-push OFF');
  }
  await ctx.editMessageReplyMarkup(mainMenu().reply_markup);
});

bot.action('noop', (ctx)=>ctx.answerCbQuery());
bot.action('status', (ctx)=>ctx.answerCbQuery(`🟢 Online | Auto: ${autoPush?'ON':'OFF'} | ${INTERVAL}m | 2CH`));

bot.launch().then(()=>console.log('Bot premium + autopush jalan'));
