import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { beamsClient } from "@/app/libs/beam";

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  const session = await getServerSession(request, response, authOptions);

  if (!session?.user?.email) {
    return response.status(401);
  }

  const beamsToken = beamsClient.generateToken(session?.user?.email);

  response.send(beamsToken);
}
