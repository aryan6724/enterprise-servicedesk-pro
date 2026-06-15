import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ActivityType, TicketPriority } from "@/generated/prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createTicketSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  categoryId: z.string().min(1, "Category is required"),
  departmentId: z.string().optional(),
  assignedToId: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  dueDate: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Not authenticated",
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsedData = createTicketSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid ticket data",
        },
        { status: 400 }
      );
    }

    const {
      title,
      description,
      categoryId,
      departmentId,
      assignedToId,
      priority,
      dueDate,
    } = parsedData.data;

    const ticket = await prisma.ticket.create({
      data: {
        title,
        description,
        categoryId,
        departmentId: departmentId || null,
        assignedToId: assignedToId || null,
        priority: priority as TicketPriority,
        dueDate: dueDate ? new Date(dueDate) : null,
        createdById: user.id,
      },
    });

    await prisma.ticketActivityLog.create({
      data: {
        type: ActivityType.CREATED,
        message: `Ticket created by ${user.name}.`,
        ticketId: ticket.id,
        userId: user.id,
      },
    });

    if (assignedToId) {
      await prisma.ticketActivityLog.create({
        data: {
          type: ActivityType.ASSIGNED,
          message: `Ticket assigned to support agent.`,
          ticketId: ticket.id,
          userId: user.id,
        },
      });

      await prisma.notification.create({
        data: {
          title: "New Ticket Assigned",
          message: `A new ticket "${title}" has been assigned to you.`,
          userId: assignedToId,
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Ticket created successfully",
        ticket,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create ticket error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 }
    );
  }
}