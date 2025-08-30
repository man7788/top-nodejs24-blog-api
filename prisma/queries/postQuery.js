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

// Read a single post
exports.readPost = async (postId) => {
  const post = await prisma.post.findFirst({
    where: { id: postId },
  });
  return post;
};

// Update a single post
exports.updatePost = async (postId, title, content, published) => {
  const updated = await prisma.post.update({
    where: { id: postId },
    data: {
      title,
      content,
      published,
    },
  });

  return updated;
};
