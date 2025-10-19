import { botManager } from '../src/bot/bot-manager';

async function checkBotManager() {
  try {
    console.log('🤖 Bot Manager Status:');
    console.log(`- Active bots: ${botManager.getBotCount()}`);
    console.log(`- Active tokens: ${botManager.getActiveTokens().length}`);
    
    const tokens = botManager.getActiveTokens();
    if (tokens.length > 0) {
      tokens.forEach((token, index) => {
        console.log(`  ${index + 1}. Token: ${token.slice(0, 10)}...`);
      });
    } else {
      console.log('  No active bots found');
    }
    
  } catch (error) {
    console.error('❌ Error checking bot manager:', error);
  }
}

checkBotManager();
