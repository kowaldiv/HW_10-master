import { db } from "../../db.js";

export function createKnexTagRepository() {
  return {
    async findAll() {
      const tags = await db("tags").select("*");
      return tags;
    },

    async findById(id) {
      const tag = await db("tags").where("id", id).first();
      return tag || null;
    },

    async findByName(name) {
      const tag = await db("tags").where("name", name).first();
      return tag || null;
    },

    async create({ name }) {
      const existing = await db("tags").where("name", name).first();
      if (existing) {
        const { ConflictError } = await import("../../errors/index.js");
        throw new ConflictError(`Tag "${name}" already exists`);
      }
      const [tag] = await db("tags").insert({ name }).returning("*");
      return tag;
    },

    async attachToPost(postId, tagId) {
      const post = await db("posts").where("id", postId).first();
      if (!post) return null;
      const tag = await db("tags").where("id", tagId).first();
      if (!tag) return null;

      await db("post_tags").insert({post_id: postId, tag_id: tagId});

      return true;
    },

    async detachFromPost(postId, tagId) {
      const deletedCount = await db("post_tags")
        .where("post_id", postId)
        .where("tag_id", tagId)
        .delete();
      return deletedCount > 0;
    },
  };
}
