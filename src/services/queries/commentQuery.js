const prisma = require('../../config/prisma/client');

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

// Read a single comment
exports.readComment = async (postId, commentId) => {
  const post = await prisma.comment.findUnique({
    where: { postId_id: { postId, id: commentId } },
  });

  return post;
};

// Update a single comment
exports.updateComment = async (postId, commentId, content) => {
  const updated = await prisma.comment.update({
    where: { postId_id: { postId, id: commentId } },
    data: {
      content,
    },
  });

  return updated;
};

// Delete a single comment
exports.deleteComment = async (postId, commentId) => {
  const deleted = await prisma.comment.delete({
    where: { postId_id: { postId, id: commentId } },
  });

  return deleted;
};
