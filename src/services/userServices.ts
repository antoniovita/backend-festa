const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createUser = async (data) => {
  const user = await prisma.user.create({
    data,
  });
  return user;
};

// Busca um usuário pelo ID
exports.getUserById = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
  });
  return user;
};

// Atualiza os dados de um usuário
exports.updateUser = async (id, data) => {
  try {
    const updatedUser = await prisma.user.update({
      where: { id },
      data,
    });
    return updatedUser;
  } catch (error) {
    console.error('Erro no serviço ao atualizar usuário:', error);
    throw error;
  }
};

// Exclui um usuário do banco de dados
exports.deleteUser = async (id) => {
  try {
    const deletedUser = await prisma.user.delete({
      where: { id },
    });
    return deletedUser;
  } catch (error) {
    console.error('Erro no serviço ao excluir usuário:', error);
    throw error;
  }
};
