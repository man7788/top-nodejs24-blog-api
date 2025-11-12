const prisma = require('../../config/prisma/client');

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

// Read all posts (client)
exports.readAllPosts = async () => {
  const posts = await prisma.post.findMany({
    where: { published: true },
    omit: { published: true },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return posts;
};

// Read all posts (admin)
exports.readAllPostsAdmin = async () => {
  const posts = await prisma.post.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });

  return posts;
};

// Read a single post
exports.readPost = async (postId) => {
  const post = await prisma.post.findFirst({
    where: { id: postId },
    include: {
      comments: {
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
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

// Deleete a single post
exports.deletePost = async (postId) => {
  const deleted = await prisma.post.delete({
    where: { id: postId },
  });

  return deleted;
};
