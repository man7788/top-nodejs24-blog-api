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

// Read all posts
exports.readAllPosts = async () => {
  const posts = await prisma.post.findMany({});
  return posts;
};
