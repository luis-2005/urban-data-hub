import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { connectDatabase } from './config/database';
import { User } from './models/User';

const ADMIN_NAME = 'Administrador';
const ADMIN_EMAIL = 'admin@urbandatahub.com';
const ADMIN_PASSWORD = 'admin123';

async function createAdmin(): Promise<void> {
  await connectDatabase();

  const existing = await User.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    if (!existing.isAdmin) {
      await User.updateOne({ email: ADMIN_EMAIL }, { isAdmin: true });
      console.log(`✓ Usuário existente promovido a admin: ${ADMIN_EMAIL}`);
    } else {
      console.log(`✓ Admin já existe: ${ADMIN_EMAIL}`);
    }
    process.exit(0);
  }

  const hashed = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await User.create({ name: ADMIN_NAME, email: ADMIN_EMAIL, password: hashed, isAdmin: true });

  console.log('✓ Conta admin criada com sucesso!');
  console.log(`  E-mail:  ${ADMIN_EMAIL}`);
  console.log(`  Senha:   ${ADMIN_PASSWORD}`);
  console.log('  ⚠ Altere a senha após o primeiro login.');
  process.exit(0);
}

createAdmin().catch((err) => {
  console.error('Erro ao criar admin:', err);
  process.exit(1);
});
