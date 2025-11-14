const prisma = require('../../config/prisma/client');

// Read user by email
exports.readUserByEmail = async (email) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  return user;
};

// Read user by ID
exports.readUserById = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
    omit: {
      password: true,
    },
  });

  return user;
};

// Read user password by ID
exports.readUserPasswordById = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { password: true },
  });

  return user.password;
};

// Update user by ID
exports.updateUserById = async (id, name) => {
  const updated = await prisma.user.update({
    where: { id },
    data: { name },
    omit: { password: true },
  });

  return updated;
};

// Update user password by ID
exports.updateUserPasswordById = async (id, password) => {
  const updated = await prisma.user.update({
    where: { id },
    data: { password },
    omit: { password: true },
  });

  return updated;
};
