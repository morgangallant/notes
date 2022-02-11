import prisma from "../../lib/prisma";
import { createDocumentSetForUser } from "../../lib/operand";
import bcrypt from "bcrypt";

export default async function handler(req, res) {
  let { email, password } = req.body;
  email = email.toLowerCase();
  let existing = await prisma.user.findUnique({
    where: { email },
  });
  if (existing) {
    return res.status(400).json({
      error: "Email already in use",
    });
  }
  let set = await createDocumentSetForUser(email);
  let hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      password: hashed,
      operandSet: set.id,
    },
  });
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
