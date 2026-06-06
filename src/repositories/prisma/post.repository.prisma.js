import { prisma } from "../../prisma.js";

export function createPrismaPostRepository(userRepo, commentRepo, tagRepo) {
  return {
    async findAll({ status, userId, tagId, page = 1, limit = 20 } = {}) {
      const where = {};

      if (status) where.status = status;
      if (userId) where.status = status;
      if (tagId) where.postTags = { some: { tagId: Number(tagId) } };

      const [posts, total] = await Promise.all([
        prisma.post.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.post.count({ where }),
      ]);

      const data = await Promise.all(
        posts.map(async (p) => {
          const user = await userRepo.findById(p.userId);
          const commentsCount = await commentRepo.countByPostId(p.id);
          return {
            ...p,
            authorName: user?.name ?? "Unkwown",
            commentsCount,
          };
        }),
      );

      return { data, total, page, limit };
    },

    async findById(id) {
      const post = await prisma.post.findUnique({
        where: { id: Number(id) },
      });
      if (!post) return null;

      const user = await userRepo.findById(post.userId);
      const comments = await commentRepo.findAllByPostId(post.id);

      const postTags = await prisma.postTag.findMany({
        where: { postId: Number(id) },
        include: { tags: true },
      });
      const tags = postTags.map((pt) => pt.tag);

      return {
        ...post,
        author: user
          ? { id: user.id, name: user.name, email: user.email }
          : null,
        comments,
        tags,
      };
    },

    async create({ userId, title, body = null, status = "draft" }) {
      const post = await prisma.post.create({
        data: {
          userId: Number(userId),
          title,
          body,
          status,
        },
      });
      return post;
    },

    async createWithTags({
      userId,
      title,
      body = null,
      status = "draft",
      tagIds = [],
    }) {
      const post = await this.create({ userId, title, body, status });

      for (const tagId of tagIds) {
        await prisma.postTag.create({
          data: {
            postId: post.id,
            tagId: Number(tagId),
          },
        });
      }

      return this.findById(post.id);
    },

    async update(id, data) {
      const post = await prisma.post.update({
        where: { id: Number(id) },
        data: {
          title: data.title,
          body: data.body,
          status: data.status,
          updatedAt: new Date(),
        },
      });
      return post;
    },

    async remove(id) {
      await prisma.post.delete({ where: { id: Number(id) } });
      return true;
    },
  };
}
