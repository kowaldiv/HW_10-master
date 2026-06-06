import { prisma } from "../../prisma.js";

export function createPrismabUserRepository() {
  return {
    async findAll({ page = 1, limit = 20, role } = {}) {
      const where = {};
      if (role) where.role = role;

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.user.count({ where }),
      ]);

      return { data: users, total, page, limit };
    },

    async findById(id) {
      const user = await prisma.user.findUnique({
        where: { id: Number(id) },
      });
      return user || null;
    },

    async create({ email, name, role = "user" }) {
      const user = await prisma.user.create({
        data: {
          email,
          name,
          role,
        },
      });
      return user;
    },

    async update(id, data) {
      const user = await prisma.user.update({
        where: { id: Number(id) },
        data: {
          ...data,
          updatedAt: new Date().toISOString(),
        },
      });

      return user;
    },

    async remove(id) {
      return await prisma.user.delete({
        where: { id: Number(id) },
      });
    },
  };
}
