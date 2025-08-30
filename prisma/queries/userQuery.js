const prisma = require('./client');

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

  if (!user) {
    return null;
  }

  return user;
};
