exports.seed = async function (knex) {
  // Очищаем таблицы
  await knex('post_tags').del();
  await knex('comments').del();
  await knex('posts').del();
  await knex('tags').del();
  await knex('users').del();

  // 1. Пользователи (5 штук)
  const users = await knex('users').insert([
    { email: 'alice@example.com', name: 'Алиса', role: 'admin' },
    { email: 'bob@example.com', name: 'Боб', role: 'user' },
    { email: 'carol@example.com', name: 'Карол', role: 'user' },
    { email: 'david@example.com', name: 'Давид', role: 'user' },
    { email: 'elena@example.com', name: 'Елена', role: 'user' }
  ]).returning("*");

  // 2. Теги (5 штук)
  const tags = await knex('tags').insert([
    { name: 'javascript' },
    { name: 'nodejs' },
    { name: 'postgresql' },
    { name: 'react' },
    { name: 'backend' }
  ]).returning("*");

  // 3. Посты (10 штук, по 2 на пользователя)
  const posts = await knex('posts').insert([
    // Пользователь 1 (Алиса)
    { user_id: users[0].id, title: 'Введение в JavaScript', body: 'Текст про JavaScript...', status: 'published' },
    { user_id: users[0].id, title: 'Продвинутый Node.js', body: 'Текст про Node.js...', status: 'published' },
    // Пользователь 2 (Боб)
    { user_id: users[1].id, title: 'Оптимизация запросов PostgreSQL', body: 'Текст про SQL...', status: 'published' },
    { user_id: users[1].id, title: 'React хуки для начинающих', body: 'Текст про React...', status: 'draft' },
    // Пользователь 3 (Карол)
    { user_id: users[2].id, title: 'Архитектура бэкенда', body: 'Текст про бэкенд...', status: 'published' },
    { user_id: users[2].id, title: 'Асинхронность в JS', body: 'Текст про async/await...', status: 'published' },
    // Пользователь 4 (Давид)
    { user_id: users[3].id, title: 'Работа с Knex.js', body: 'Текст про Knex...', status: 'published' },
    { user_id: users[3].id, title: 'TypeScript в 2024', body: 'Текст про TS...', status: 'draft' },
    // Пользователь 5 (Елена)
    { user_id: users[4].id, title: 'Docker для разработчиков', body: 'Текст про Docker...', status: 'published' },
    { user_id: users[4].id, title: 'Тестирование в Node.js', body: 'Текст про тесты...', status: 'draft' }
  ]).returning("*");

  // 4. Комментарии (20 штук)
  const comments = await knex('comments').insert([
    { post_id: posts[0].id, author_id: users[0].id, body: 'Отличная статья! Спасибо!' },
    { post_id: posts[0].id, author_id: users[0].id, body: 'Очень полезно, добавил в закладки' },
    { post_id: posts[1].id, author_id: null, body: 'Спасибо за разъяснение 🙏' },
    { post_id: posts[1].id, author_id: users[1].id, body: 'Лучшее объяснение, которое я видел' },
    { post_id: posts[2].id, author_id: null, body: 'А можно подробнее про этот момент?' },
    { post_id: posts[2].id, author_id: users[1].id, body: 'Согласен с автором' },
    { post_id: posts[3].id, author_id: users[2].id, body: 'Интересный подход, не думал об этом' },
    { post_id: posts[3].id, author_id: users[2].id, body: 'У меня работает, спасибо!' },
    { post_id: posts[4].id, author_id: users[3].id, body: 'Наконец-то понял эту тему' },
    { post_id: posts[4].id, author_id: users[3].id, body: 'Жду продолжения!' },
    { post_id: posts[5].id, author_id: users[4].id, body: 'Отличный пример кода' },
    { post_id: posts[5].id, author_id: users[4].id, body: 'Спасибо за статью!' },
    { post_id: posts[6].id, author_id: users[0].id, body: 'Очень актуально' },
    { post_id: posts[6].id, author_id: users[0].id, body: 'Полезно для начинающих' },
    { post_id: posts[7].id, author_id: users[1].id, body: 'Спасибо автору за труд' },
    { post_id: posts[7].id, author_id: users[1].id, body: 'Буду применять на практике' },
    { post_id: posts[8].id, author_id: users[2].id, body: 'Класс! Сразу стало понятно' },
    { post_id: posts[8].id, author_id: users[3].id, body: 'Лучший туториал по теме' },
    { post_id: posts[9].id, author_id: users[4].id, body: 'А есть ли альтернативы?' },
    { post_id: posts[9].id, author_id: null, body: 'Спасибо, очень помогло!' }
  ]);

  // 5. Связи post_tags (каждый пост получает 1-2 тега)
  const postTags = await knex('post_tags').insert([
    // Пост 1: JavaScript
    { post_id: posts[0].id, tag_id: tags[0].id },
    { post_id: posts[0].id, tag_id: tags[1].id },
    // Пост 2: Node.js
    { post_id: posts[1].id, tag_id: tags[1].id },
    { post_id: posts[1].id, tag_id: tags[4].id },
    // Пост 3: PostgreSQL
    { post_id: posts[2].id, tag_id: tags[2].id },
    // Пост 4: React
    { post_id: posts[3].id, tag_id: tags[3].id },
    { post_id: posts[3].id, tag_id: tags[0].id },
    // Пост 5: Архитектура
    { post_id: posts[4].id, tag_id: tags[4].id },
    { post_id: posts[4].id, tag_id: tags[1].id },
    // Пост 6: Асинхронность
    { post_id: posts[5].id, tag_id: tags[0].id },
    // Пост 7: Knex
    { post_id: posts[6].id, tag_id: tags[1].id },
    { post_id: posts[6].id, tag_id: tags[2].id },
    // Пост 8: TypeScript
    { post_id: posts[7].id, tag_id: tags[0].id },
    { post_id: posts[7].id, tag_id: tags[4].id },
    // Пост 9: Docker
    { post_id: posts[8].id, tag_id: tags[4].id },
    // Пост 10: Тестирование
    { post_id: posts[9].id, tag_id: tags[1].id }
  ]);
};
