import { db } from "../../db.js";

export function createKnexPostRepository(userRepo, commentRepo, tagRepo) {
  return {
    async findAll({ status, userId, tagId, page = 1, limit = 20 } = {}) {
      let query = db("posts");

      if (status) query.where("status", status);
      if (userId) query.where("user_id", userId);

      let postIds = null;
      if (tagId) {
        const postTags = await db("post_tags")
          .where("tag_id", tagId)
          .select("post_id");
        postIds = postTags.map((pt) => pt.post_id);
        if (postIds.length === 0) {
          return { data: [], total: 0, page, limit };
        }
        query = query.whereIn("id", postIds);
      }

      const countResult = await query.clone().count("id as count").first();
      const total = parseInt(countResult.count, 10);

      const posts = await query
        .clone()
        .orderBy("created_at")
        .limit(limit)
        .offset((page - 1) * limit)
        .select("*");

      const data = await Promise.all(
        posts.map(async (p) => {
          const user = userRepo.findByIdSync
            ? await userRepo.findById(p.user_id)
            : null;
          const commentsCount = await commentRepo.countByPostId(p.id);

          return {
            ...p,
            authorName: user?.name ?? "Unknown",
            commentsCount,
          };
        }),
      );

      return { data, total, page, limit };
    },

    async findById(id) {
      const post = await db("posts").where("id", id).first();
      if (!post) return null;

      const user = await userRepo.findById(post.user_id);

      const comments = await commentRepo.findAllByPostId(post.id);

      const postTags = await db("post_tags")
        .where("post_id", id)
        .select("tag_id");

      const tags = [];
      for (const pt of postTags) {
        const tag = await tagRepo.findById(pt.tag_id);
        if (tag) tags.push(tag);
      }

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
      const now = new Date().toISOString();
      const [post] = await db("posts")
        .insert({
          user_id: userId,
          title,
          body,
          status,
          createdAt: now,
          updatedAt: now,
        })
        .returning("*");
      return post;
    },

    async createWithTags({
      userId,
      title,
      body = null,
      status = "draft",
      tagIds = [],
    }) {
      const result = await db.transaction(async (trx) => {
        const now = new Date().toISOString();

        const [post] = await trx("posts")
          .insert({
            user_id: userId,
            title,
            body,
            status,
            created_at: now,
            updated_at: now,
          })
          .returning("*");

        if (tagIds && tagIds.length > 0) {
          const postTags = tagIds.map((tagId) => ({
            post_id: post.id,
            tag_id: tagId,
          }));
          await trx("post_tags").insert(postTags);
        }

        return post;
      });
      return this.findById(result.id);
    },

    async update(id, data) {
      const [updatedPost] = await db("posts")
        .where("id", id)
        .update({
          title: data.title,
          body: data.body,
          status: data.status,
          updated_at: new Date().toISOString(),
        })
        .returning("*");

      if (!updatedPost) return null;

      const updated = {
        ...updatedPost,
        ...data,
        updatedAt: new Date().toISOString(),
      };
      return { ...updated };
    },

    async remove(id) {
      const deletedCount = await db("posts").where("id", id).delete();
      return deletedCount > 0;
    },
  };
}
