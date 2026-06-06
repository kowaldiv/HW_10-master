import { prisma } from '../prisma.js';

const ITERATIONS = 100;

async function benchmark() {
  const start = Date.now();
  for (let i = 0; i < ITERATIONS; i++) {
    await prisma.post.findMany();
  }
  console.log(`Prisma: ${Date.now() - start}ms for ${ITERATIONS} queries`);
  
  await prisma.$disconnect();
}

benchmark();