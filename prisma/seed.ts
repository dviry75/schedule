import bcrypt from 'bcryptjs';
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@system.com';
  const password = 'Admin!23456';

  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const passwordHash = await bcrypt.hash(password, 12);
    user = await prisma.user.create({
      data: {
        email,
        passwordHash
      }
    });
  }

  let org = await prisma.organization.findFirst({ where: { name: 'System Organization' } });
  if (!org) {
    org = await prisma.organization.create({
      data: { name: 'System Organization' }
    });
  }

  await prisma.organizationMember.upsert({
    where: {
      organizationId_userId: {
        organizationId: org.id,
        userId: user.id
      }
    },
    update: {
      role: Role.OWNER
    },
    create: {
      organizationId: org.id,
      userId: user.id,
      role: Role.OWNER
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
