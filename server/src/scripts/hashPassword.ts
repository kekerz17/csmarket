import bcrypt from 'bcryptjs';

const password = process.argv[2];

if (!password) {
  console.error('Использование: npm run hash-password -- "мойпароль"');
  process.exit(1);
}

console.log(bcrypt.hashSync(password, 10));
