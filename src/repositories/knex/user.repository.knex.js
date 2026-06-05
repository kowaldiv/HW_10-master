import { db } from "../../db.js";

export function createKnexUserRepository() {
  return {
    async findAll({ page = 1, limit = 20, role } = {}) {
      let query = db("users");

      if (role) {
        query = query.where("role", role);
      }

      const users = await query
        .limit(limit)
        .offset((page - 1) * limit)
        .select("*");

      const countQuery = db("users");
      if (role) {
        countQuery.where("role", role);
      }
      const total = await countQuery.count("id as count").first();

      return {
        data: users,
        total: parseInt(total.count),
        page,
        limit,
      };
    },
    async findById(id) {
      const user = await db("users").where("id", id).first();
      return user || null;
    },
    async create(data) {
      const [user] = await db("users").insert(data).returning("*");
      return user;
    },
    async update(id, data) {
      const [updatedUser] = await db("users")
        .where("id", id)
        .update(data)
        .returning("*");
      return updatedUser;
    },
    async remove(id) {
      const deletedCount = await db("users").where("id", id).delete();
      return deletedCount > 0;
    },
  };
}
