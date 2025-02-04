// frontend/lib/getRoleDetails.ts
import prisma from "@/prisma/prisma";

export async function getRoleDetails(roles: string[]) {
  const roleDetails = await prisma.role.findMany({
    where: {
      name: {
        in: roles,
      },
    },
  });

  return roleDetails;
}
