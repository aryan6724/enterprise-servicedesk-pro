import { jwtVerify } from "jose";
import { cookies } from "next/headers";

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: "EMPLOYEE" | "AGENT" | "MANAGER" | "ADMIN";
};

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("servicedesk_token")?.value;

    if (!token) {
      return null;
    }

    const { payload } = await jwtVerify(token, secret);

    return {
      id: payload.id as string,
      name: payload.name as string,
      email: payload.email as string,
      role: payload.role as CurrentUser["role"],
    };
  } catch {
    return null;
  }
}