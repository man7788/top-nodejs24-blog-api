const prisma = require('./client');

// Create a single post
exports.createPost = async (author, title, content, published) => {
  const created = await prisma.post.create({
    data: {
      author: { connect: { id: author } },
      title,
      content,
      published,
    },
  });

  return created;
};
