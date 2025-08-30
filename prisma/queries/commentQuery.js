const prisma = require('./client');

// Create a single comment
exports.createComment = async (postId, name, email, content) => {
  const comment = await prisma.comment.create({
    data: {
      name,
      email,
      content,
      post: { connect: { id: postId } },
    },
  });

  return comment;
};
