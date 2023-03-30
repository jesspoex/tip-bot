const Discord = require('discord.js');
const Web3 = require('@solana/web3.js');

const client = new Discord.Client();
const web3 = new Web3('https://api.mainnet-beta.solana.com');

const BOT_PREFIX = '!';

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', async (msg) => {
  if (msg.content.startsWith(BOT_PREFIX)) {
    const args = msg.content.slice(BOT_PREFIX.length).trim().split(' ');
    const command = args.shift().toLowerCase();

    if (command === 'createwallet') {
      const wallet = web3.Account.generate();
      await msg.reply(`Your Solana wallet address is: ${wallet.publicKey.toString()}`);
      await msg.reply(`Your Solana wallet private key is: ${wallet.secretKey.toString('hex')}`);
    }

    if (command === 'tip') {
      if (args.length !== 2) {
        await msg.reply('Usage: !tip <amount> <recipient_address>');
        return;
      }

      const sender = web3.Keypair.fromSecretKey(Buffer.from(process.env.SENDER_PRIVATE_KEY, 'hex'));
      const recipientAddress = args[1];
      const amount = web3.LAMPORTS_PER_SOL * parseFloat(args[0]);

      const transaction = new web3.Transaction().add(
        web3.SystemProgram.transfer({
          fromPubkey: sender.publicKey,
          toPubkey: recipientAddress,
          lamports: amount,
        })
      );

      const blockhash = await web3.getConnection().getRecentBlockhash();
      transaction.recentBlockhash = blockhash.blockhash;

      const signature = await web3.sendAndConfirmTransaction(transaction, [sender]);

      await msg.reply(`Sent ${args[0]} SOL to ${recipientAddress}. Transaction ID: ${signature}`);
    }

    if (command === 'balance') {
      if (args.length !== 1) {
        await msg.reply('Usage: !balance <address>');
        return;
      }

      const address = new web3.PublicKey(args[0]);
      const balance = await web3.getConnection().getBalance(address);

      await msg.reply(`Balance of ${args[0]} is ${balance / web3.LAMPORTS_PER_SOL} SOL`);
    }
  }
});

client.login(process.env.BOT_TOKEN);
