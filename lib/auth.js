import prisma from "./prisma";

// Authorizes an incoming API request.
export async function authorizeAPIRequest(req) {
  let token = req.headers.authorization;
  if (!token) {
    return null;
  }
  let tobj = await prisma.token.findUnique({
    where: {
      id: token,
    },
  });
  if (!tobj) {
    return null;
  }
  return await prisma.user.findUnique({
    where: {
      id: tobj.userId,
    },
  });
}

// Authorizes an incoming web request.
export async function authorizeWebRequest(req) {
  let token = req.cookies["token"];
  if (!token) {
    return null;
  }
  let tobj = await prisma.token.findUnique({
    where: {
      id: token,
    },
  });
  if (!tobj) {
    return null;
  }
  return await prisma.user.findUnique({
    where: {
      id: tobj.userId,
    },
  });
}
