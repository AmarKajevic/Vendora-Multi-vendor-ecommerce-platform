import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@ecommerce.com';
  const adminPassword = 'Koliko1234.';

  const existingAdmin = await prisma.users.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    await prisma.users.create({
      data: {
        name: 'Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        // druga polja po potrebi
      },
    });
    console.log('Admin kreiran');
  } else {
    console.log('Admin već postoji');
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());