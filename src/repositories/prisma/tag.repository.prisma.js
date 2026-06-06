import { prisma } from "../../prisma.js";

export function createPrismaTagRepository(postRepo) {
  return {
    async findAll() {
      const tags = await prisma.tag.findMany({
        orderBy: { id: "asc" },
      });
      return tags;
    },

    async findById(id) {
      const tag = await prisma.tag.findUnique({
        where: { id: Number(id) },
      });
      return tag || null;
    },

    async findByName(name) {
      const tag = await prisma.tag.findUnique({
        where: { name },
      });
      return tag || null;
    },

    async create({ name }) {
      const existing = await this.findByName(name);
      if (existing) {
        const { ConflictError } = await import("../../errors/index.js");
        throw new ConflictError(`Tag "${name}" already exists`);
      }
      const tag = await prisma.tag.create({
        data: { name },
      });
      return tag;
    },

    async attachToPost(postId, tagId) {
      const post = await prisma.post.findUnique({
        where: { id: Number(tagId) },
      });
      if (!post) return null;
      const tag = await prisma.tag.findUnique({
        where: { id: Number(tagId) },
      });
      if (!tag) return null;

      await prisma.postTag.create({
        data: {
          posts: { connect: { id: Number(postId) } },
          tags: { connect: { id: Number(tagId) } },
        },
      });
      return true;
    },

    async detachFromPost(postId, tagId) {
      await prisma.postTag.delete({
        where: {
          postId_tagId: {
            postId: Number(postId),
            tagId: Number(tagId),
          },
        },
      });
      return true;
    },
  };
}
