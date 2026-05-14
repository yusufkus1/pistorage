const bcrypt = require('bcryptjs');
const readline = require('readline');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.question('Şifrenizi girin: ', async (password) => {
  const hash = await bcrypt.hash(password, 12);
  console.log('\n.env dosyasına şunu ekleyin:');
  console.log(`PASSWORD_HASH=${hash}`);
  rl.close();
});
