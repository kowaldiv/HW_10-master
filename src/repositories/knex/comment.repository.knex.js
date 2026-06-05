import { db } from "../../db.js";

export function createKnexCommentRepository(userRepo) {
  return {
    async findAll({ postId, page = 1, limit = 20 } = {}) {
      let query = db("comments");
      if (postId) {
        query = query.where("post_id", postId);
      }

      const countResult = await query.clone().count("id as count").first();
      const total = parseInt(countResult.count, 10);

      const data = await query
        .clone()
        .orderBy("created_at", "desc")
        .limit(limit)
        .offset((page - 1) * limit)
        .select("*");

      const dataWithAuthors = await Promise.all(
        data.map(async (comment) => {
          const user = await userRepo.findById(comment.author_id);
          return {
            ...comment,
            authorName: user?.name ?? null,
          };
        }),
      );

      return { data: dataWithAuthors, total, page, limit };
    },

    async findById(id) {
      const comment = await db("comments").where("id", id).first();
      if (!comment) return null;

      const user = await userRepo.findById(comment.author_id);
      return { ...comment, authorName: user?.name ?? null };
    },

    async create({ postId, authorId, body }) {
      const now = new Date().toISOString();
      const [comment] = await db("comments")
        .insert({
          post_id: Number(postId),
          author_id: Number(authorId),
          body,
          created_at: now,
        })
        .returning("*");

      return { ...comment };
    },

    async remove(id) {
      const deletedCount = await db("comments").where("id", id).delete();
      return deletedCount > 0;
    },

    async countByPostId(postId) {
      const result = await db("comments")
        .where("post_id", postId)
        .count("id as count")
        .first();
      return parseInt(result.count, 10);
    },

    async findAllByPostId(postId) {
      const comments = await db("comments")
        .where("post_id", postId)
        .orderBy("created_at", "desc")
        .select("*");

      const commentsWithAuthors = await Promise.all(
        comments.map(async (comment) => {
          const user = await userRepo.findById(comment.author_id);
          return {
            ...comment,
            authorName: user?.name ?? null,
          };
        }),
      );

      return commentsWithAuthors;
    },
  };
}
