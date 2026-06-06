import { prisma } from "../../prisma.js";

export function createPrismaCommentRepository(userRepo) {
  return {
    async findAll({ postId, page = 1, limit = 20 } = {}) {
      const where = {};
      if (postId) where.postId = Number(postId);

      const [comments, total] = await Promise.all([
        prisma.comment.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.comment.count({ where }),
      ]);

      const data = await Promise.all(
        comments.map(async (comment) => {
          const user = await userRepo.findById(comment.authorId);
          return {
            ...comment,
            authorName: user?.name ?? null,
          };
        }),
      );

      return { data, total, page, limit };
    },

    async findById(id) {
      const comment = await prisma.comment.findUnique({
        where: { id: Number(id) },
      });
      if (!comment) return null;
      const user = await userRepo.findById(comment.authorId);
      return { ...comment, authorName: user?.name ?? null };
    },

    async create({ postId, authorId, body }) {
      const comment = await prisma.comment.create({
        data: {
          postId: Number(postId),
          authorId: Number(authorId),
          body,
        },
      });
      return { ...comment };
    },

    async remove(id) {
      await prisma.comment.delete({ where: { id: Number(id) } });
      return true;
    },

    // ---- helpers for stub cross-references (sync) ----
    async countByPostId(postId) {
      return prisma.comment.count({
        where: { postId: Number(postId) },
      });
    },

    async findAllByPostId(postId) {
      return prisma.comment.findMany({
        where: { postId: Number(postId) },
      });
    },
  };
}
