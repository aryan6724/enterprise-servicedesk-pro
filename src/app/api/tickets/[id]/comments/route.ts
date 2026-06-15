import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ActivityType } from "@/generated/prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const commentSchema = z.object({
  message: z.string().min(2, "Comment must be at least 2 characters"),
});

type CommentRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: NextRequest, { params }: CommentRouteProps) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const parsedData = commentSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json(
        {
          success: false,
          message:
            parsedData.error.issues[0]?.message || "Invalid comment data",
        },
        { status: 400 }
      );
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      return NextResponse.json(
        { success: false, message: "Ticket not found" },
        { status: 404 }
      );
    }

    const comment = await prisma.ticketComment.create({
      data: {
        message: parsedData.data.message,
        ticketId: id,
        userId: user.id,
      },
    });

    await prisma.ticketActivityLog.create({
      data: {
        type: ActivityType.COMMENT_ADDED,
        message: `Comment added by ${user.name}.`,
        ticketId: id,
        userId: user.id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Comment added successfully",
        comment,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Add comment error:", error);

    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    );
  }
}