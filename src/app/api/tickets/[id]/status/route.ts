import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ActivityType } from "@/generated/prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const statusSchema = z.object({
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "REOPENED"]),
});

type StatusRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: NextRequest, { params }: StatusRouteProps) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    if (user.role === "EMPLOYEE") {
      return NextResponse.json(
        { success: false, message: "Employees cannot update ticket status" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const parsedData = statusSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json(
        { success: false, message: "Invalid status value" },
        { status: 400 }
      );
    }

    const oldTicket = await prisma.ticket.findUnique({
      where: { id },
    });

    if (!oldTicket) {
      return NextResponse.json(
        { success: false, message: "Ticket not found" },
        { status: 404 }
      );
    }

    const newStatus = parsedData.data.status;

    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: {
        status: newStatus,
        resolvedAt: newStatus === "RESOLVED" ? new Date() : oldTicket.resolvedAt,
        closedAt: newStatus === "CLOSED" ? new Date() : oldTicket.closedAt,
      },
    });

    const activityType =
      newStatus === "RESOLVED"
        ? ActivityType.RESOLVED
        : newStatus === "CLOSED"
          ? ActivityType.CLOSED
          : newStatus === "REOPENED"
            ? ActivityType.REOPENED
            : ActivityType.STATUS_CHANGED;

    await prisma.ticketActivityLog.create({
      data: {
        type: activityType,
        message: `Status changed from ${oldTicket.status} to ${newStatus} by ${user.name}.`,
        ticketId: id,
        userId: user.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Ticket status updated successfully",
      ticket: updatedTicket,
    });
  } catch (error) {
    console.error("Update status error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Server failed while updating ticket status",
      },
      { status: 500 }
    );
  }
}