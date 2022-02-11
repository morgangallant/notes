import prisma from "../../lib/prisma";
import bcrypt from "bcrypt";

export default async function handler(req, res) {
  let { email, password } = req.body;
  email = email.toLowerCase();
  let user = await prisma.user.findUnique({
    where: { email },
  });
  if (!user) {
    return res.status(400).json({
      error: "Email not found",
    });
  }
  let match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(400).json({
      error: "Incorrect password",
    });
  }
  const token = await prisma.token.create({
    data: {
      User: {
        connect: {
          id: user.id,
        },
      },
    },
  });
  res.status(200).json({
    token: token.id,
  });
}
