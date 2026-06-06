import { PrismaClient } from "../src/generated/prisma/client.ts";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.postTag.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.user.deleteMany();

  // 1. Пользователи (5 штук)
  const users = await prisma.user.createMany({
    data: [
      { email: "alice@example.com", name: "Алиса", role: "admin" },
      { email: "bob@example.com", name: "Боб", role: "user" },
      { email: "carol@example.com", name: "Карол", role: "user" },
      { email: "david@example.com", name: "Давид", role: "user" },
      { email: "elena@example.com", name: "Елена", role: "user" },
    ],
  });

  // Получаем созданных пользователей для использования ID
  const createdUsers = await prisma.user.findMany({
    orderBy: { id: "asc" },
  });

  // 2. Теги (5 штук)
  await prisma.tag.createMany({
    data: [
      { name: "javascript" },
      { name: "nodejs" },
      { name: "postgresql" },
      { name: "react" },
      { name: "backend" },
    ],
  });

  const tags = await prisma.tag.findMany({
    orderBy: { id: "asc" },
  });

  // 3. Посты (10 штук, по 2 на пользователя)
  await prisma.post.createMany({
    data: [
      // Пользователь 1 (Алиса)
      {
        userId: createdUsers[0].id,
        title: "Введение в JavaScript",
        body: "Текст про JavaScript...",
        status: "published",
      },
      {
        userId: createdUsers[0].id,
        title: "Продвинутый Node.js",
        body: "Текст про Node.js...",
        status: "published",
      },
      // Пользователь 2 (Боб)
      {
        userId: createdUsers[1].id,
        title: "Оптимизация запросов PostgreSQL",
        body: "Текст про SQL...",
        status: "published",
      },
      {
        userId: createdUsers[1].id,
        title: "React хуки для начинающих",
        body: "Текст про React...",
        status: "draft",
      },
      // Пользователь 3 (Карол)
      {
        userId: createdUsers[2].id,
        title: "Архитектура бэкенда",
        body: "Текст про бэкенд...",
        status: "published",
      },
      {
        userId: createdUsers[2].id,
        title: "Асинхронность в JS",
        body: "Текст про async/await...",
        status: "published",
      },
      // Пользователь 4 (Давид)
      {
        userId: createdUsers[3].id,
        title: "Работа с Knex.js",
        body: "Текст про Knex...",
        status: "published",
      },
      {
        userId: createdUsers[3].id,
        title: "TypeScript в 2024",
        body: "Текст про TS...",
        status: "draft",
      },
      // Пользователь 5 (Елена)
      {
        userId: createdUsers[4].id,
        title: "Docker для разработчиков",
        body: "Текст про Docker...",
        status: "published",
      },
      {
        userId: createdUsers[4].id,
        title: "Тестирование в Node.js",
        body: "Текст про тесты...",
        status: "draft",
      },
    ],
  });

  const posts = await prisma.post.findMany({
    orderBy: { id: "asc" },
  });

  // 4. Комментарии (20 штук)
  await prisma.comment.createMany({
    data: [
      {
        postId: posts[0].id,
        authorId: createdUsers[0].id,
        body: "Отличная статья! Спасибо!",
      },
      {
        postId: posts[0].id,
        authorId: createdUsers[0].id,
        body: "Очень полезно, добавил в закладки",
      },
      {
        postId: posts[1].id,
        authorId: null,
        body: "Спасибо за разъяснение 🙏",
      },
      {
        postId: posts[1].id,
        authorId: createdUsers[1].id,
        body: "Лучшее объяснение, которое я видел",
      },
      {
        postId: posts[2].id,
        authorId: null,
        body: "А можно подробнее про этот момент?",
      },
      {
        postId: posts[2].id,
        authorId: createdUsers[1].id,
        body: "Согласен с автором",
      },
      {
        postId: posts[3].id,
        authorId: createdUsers[2].id,
        body: "Интересный подход, не думал об этом",
      },
      {
        postId: posts[3].id,
        authorId: createdUsers[2].id,
        body: "У меня работает, спасибо!",
      },
      {
        postId: posts[4].id,
        authorId: createdUsers[3].id,
        body: "Наконец-то понял эту тему",
      },
      {
        postId: posts[4].id,
        authorId: createdUsers[3].id,
        body: "Жду продолжения!",
      },
      {
        postId: posts[5].id,
        authorId: createdUsers[4].id,
        body: "Отличный пример кода",
      },
      {
        postId: posts[5].id,
        authorId: createdUsers[4].id,
        body: "Спасибо за статью!",
      },
      {
        postId: posts[6].id,
        authorId: createdUsers[0].id,
        body: "Очень актуально",
      },
      {
        postId: posts[6].id,
        authorId: createdUsers[0].id,
        body: "Полезно для начинающих",
      },
      {
        postId: posts[7].id,
        authorId: createdUsers[1].id,
        body: "Спасибо автору за труд",
      },
      {
        postId: posts[7].id,
        authorId: createdUsers[1].id,
        body: "Буду применять на практике",
      },
      {
        postId: posts[8].id,
        authorId: createdUsers[2].id,
        body: "Класс! Сразу стало понятно",
      },
      {
        postId: posts[8].id,
        authorId: createdUsers[3].id,
        body: "Лучший туториал по теме",
      },
      {
        postId: posts[9].id,
        authorId: createdUsers[4].id,
        body: "А есть ли альтернативы?",
      },
      {
        postId: posts[9].id,
        authorId: null,
        body: "Спасибо, очень помогло!",
      },
    ],
  });

  // 5. Связи post_tags (каждый пост получает 1-2 тега)
  await prisma.postTag.createMany({
    data: [
      // Пост 1: JavaScript
      { postId: posts[0].id, tagId: tags[0].id },
      { postId: posts[0].id, tagId: tags[1].id },
      // Пост 2: Node.js
      { postId: posts[1].id, tagId: tags[1].id },
      { postId: posts[1].id, tagId: tags[4].id },
      // Пост 3: PostgreSQL
      { postId: posts[2].id, tagId: tags[2].id },
      // Пост 4: React
      { postId: posts[3].id, tagId: tags[3].id },
      { postId: posts[3].id, tagId: tags[0].id },
      // Пост 5: Архитектура
      { postId: posts[4].id, tagId: tags[4].id },
      { postId: posts[4].id, tagId: tags[1].id },
      // Пост 6: Асинхронность
      { postId: posts[5].id, tagId: tags[0].id },
      // Пост 7: Knex
      { postId: posts[6].id, tagId: tags[1].id },
      { postId: posts[6].id, tagId: tags[2].id },
      // Пост 8: TypeScript
      { postId: posts[7].id, tagId: tags[0].id },
      { postId: posts[7].id, tagId: tags[4].id },
      // Пост 9: Docker
      { postId: posts[8].id, tagId: tags[4].id },
      // Пост 10: Тестирование
      { postId: posts[9].id, tagId: tags[1].id },
    ],
  });
}

main();
