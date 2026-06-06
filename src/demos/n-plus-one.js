import { prisma } from "../prisma.js";

const posts = await prisma.post.findMany();
for (const post of posts) {
  const user = await prisma.user.findUnique({ where: { id: post.userId } });
  console.log(`"${post.title}" by ${user.name}`);
}
// N+1 запросов!
