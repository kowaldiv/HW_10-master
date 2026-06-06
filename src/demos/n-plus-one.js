import "dotenv/config";
import { prisma } from "../prisma.js";

// Плохой вариант (N+1)
console.log("=== ПЛОХОЙ ВАРИАНТ ===");
const posts = await prisma.post.findMany();
for (const post of posts) {
  const user = await prisma.user.findUnique({ where: { id: post.userId } });
  console.log(`"${post.title}" by ${user.name}`);
}

// Хороший вариант (include)
console.log("\n=== ХОРОШИЙ ВАРИАНТ ===");
const posts2 = await prisma.post.findMany({
  include: { 
    users: {
      select: { name: true } 
    } 
  },
});
for (const post of posts2) {
  console.log(`"${post.title}" by ${post.users.name}`);
}

await prisma.$disconnect();

// Плохой вариант делает 11 запросов, а хороший всего 2

// === ПЛОХОЙ ВАРИАНТ ===
// prisma:query SELECT "public"."posts"."id", "public"."posts"."user_id", "public"."posts"."title", "public"."posts"."body", "public"."posts"."status", "public"."posts"."created_at", "public"."posts"."updated_at" FROM "public"."posts" WHERE 1=1 OFFSET $1
// prisma:query SELECT "public"."users"."id", "public"."users"."email", "public"."users"."name", "public"."users"."role", "public"."users"."created_at", "public"."users"."updated_at" FROM "public"."users" WHERE ("public"."users"."id" = $1 AND 1=1) LIMIT $2 OFFSET $3
// "Введение в JavaScript" by Алиса
// prisma:query SELECT "public"."users"."id", "public"."users"."email", "public"."users"."name", "public"."users"."role", "public"."users"."created_at", "public"."users"."updated_at" FROM "public"."users" WHERE ("public"."users"."id" = $1 AND 1=1) LIMIT $2 OFFSET $3
// "Продвинутый Node.js" by Алиса
// prisma:query SELECT "public"."users"."id", "public"."users"."email", "public"."users"."name", "public"."users"."role", "public"."users"."created_at", "public"."users"."updated_at" FROM "public"."users" WHERE ("public"."users"."id" = $1 AND 1=1) LIMIT $2 OFFSET $3
// "Оптимизация запросов PostgreSQL" by Боб
// prisma:query SELECT "public"."users"."id", "public"."users"."email", "public"."users"."name", "public"."users"."role", "public"."users"."created_at", "public"."users"."updated_at" FROM "public"."users" WHERE ("public"."users"."id" = $1 AND 1=1) LIMIT $2 OFFSET $3
// "React хуки для начинающих" by Боб
// prisma:query SELECT "public"."users"."id", "public"."users"."email", "public"."users"."name", "public"."users"."role", "public"."users"."created_at", "public"."users"."updated_at" FROM "public"."users" WHERE ("public"."users"."id" = $1 AND 1=1) LIMIT $2 OFFSET $3
// "Архитектура бэкенда" by Карол
// prisma:query SELECT "public"."users"."id", "public"."users"."email", "public"."users"."name", "public"."users"."role", "public"."users"."created_at", "public"."users"."updated_at" FROM "public"."users" WHERE ("public"."users"."id" = $1 AND 1=1) LIMIT $2 OFFSET $3
// "Асинхронность в JS" by Карол
// prisma:query SELECT "public"."users"."id", "public"."users"."email", "public"."users"."name", "public"."users"."role", "public"."users"."created_at", "public"."users"."updated_at" FROM "public"."users" WHERE ("public"."users"."id" = $1 AND 1=1) LIMIT $2 OFFSET $3
// "Работа с Knex.js" by Давид
// prisma:query SELECT "public"."users"."id", "public"."users"."email", "public"."users"."name", "public"."users"."role", "public"."users"."created_at", "public"."users"."updated_at" FROM "public"."users" WHERE ("public"."users"."id" = $1 AND 1=1) LIMIT $2 OFFSET $3
// "TypeScript в 2024" by Давид
// prisma:query SELECT "public"."users"."id", "public"."users"."email", "public"."users"."name", "public"."users"."role", "public"."users"."created_at", "public"."users"."updated_at" FROM "public"."users" WHERE ("public"."users"."id" = $1 AND 1=1) LIMIT $2 OFFSET $3
// "Docker для разработчиков" by Елена
// prisma:query SELECT "public"."users"."id", "public"."users"."email", "public"."users"."name", "public"."users"."role", "public"."users"."created_at", "public"."users"."updated_at" FROM "public"."users" WHERE ("public"."users"."id" = $1 AND 1=1) LIMIT $2 OFFSET $3
// "Тестирование в Node.js" by Елена

// === ХОРОШИЙ ВАРИАНТ ===
// prisma:query SELECT "public"."posts"."id", "public"."posts"."user_id", "public"."posts"."title", "public"."posts"."body", "public"."posts"."status", "public"."posts"."created_at", "public"."posts"."updated_at" FROM "public"."posts" WHERE 1=1 OFFSET $1
// prisma:query SELECT "public"."users"."id", "public"."users"."name" FROM "public"."users" WHERE "public"."users"."id" IN ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) OFFSET $11
// "Введение в JavaScript" by Алиса
// "Продвинутый Node.js" by Алиса
// "Оптимизация запросов PostgreSQL" by Боб
// "React хуки для начинающих" by Боб
// "Архитектура бэкенда" by Карол
// "Асинхронность в JS" by Карол
// "Работа с Knex.js" by Давид
// "TypeScript в 2024" by Давид
// "Docker для разработчиков" by Елена
// "Тестирование в Node.js" by Елена