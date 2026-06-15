import "dotenv/config";
import { hash } from "bcryptjs";
import {
  PrismaClient,
  Role,
  TicketPriority,
  TicketStatus,
  ActivityType,
} from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const itDepartment = await prisma.department.upsert({
    where: { name: "IT Department" },
    update: {},
    create: { name: "IT Department" },
  });

  const hrDepartment = await prisma.department.upsert({
    where: { name: "HR Department" },
    update: {},
    create: { name: "HR Department" },
  });

  const adminDepartment = await prisma.department.upsert({
    where: { name: "Admin Department" },
    update: {},
    create: { name: "Admin Department" },
  });

  const hardwareCategory = await prisma.category.upsert({
    where: { name: "Hardware Issue" },
    update: {},
    create: { name: "Hardware Issue" },
  });

  const softwareCategory = await prisma.category.upsert({
    where: { name: "Software Issue" },
    update: {},
    create: { name: "Software Issue" },
  });

  const networkCategory = await prisma.category.upsert({
    where: { name: "Network Issue" },
    update: {},
    create: { name: "Network Issue" },
  });

  const accessCategory = await prisma.category.upsert({
    where: { name: "Access Request" },
    update: {},
    create: { name: "Access Request" },
  });

  const password = await hash("Password@123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@servicedesk.com" },
    update: {},
    create: {
      name: "System Admin",
      email: "admin@servicedesk.com",
      password,
      role: Role.ADMIN,
      departmentId: adminDepartment.id,
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: "manager@servicedesk.com" },
    update: {},
    create: {
      name: "IT Manager",
      email: "manager@servicedesk.com",
      password,
      role: Role.MANAGER,
      departmentId: itDepartment.id,
    },
  });

  const agent = await prisma.user.upsert({
    where: { email: "agent@servicedesk.com" },
    update: {},
    create: {
      name: "Support Agent",
      email: "agent@servicedesk.com",
      password,
      role: Role.AGENT,
      departmentId: itDepartment.id,
    },
  });

  const employee = await prisma.user.upsert({
    where: { email: "employee@servicedesk.com" },
    update: {},
    create: {
      name: "John Employee",
      email: "employee@servicedesk.com",
      password,
      role: Role.EMPLOYEE,
      departmentId: hrDepartment.id,
    },
  });

  const existingTicket = await prisma.ticket.findFirst({
    where: {
      title: "Laptop is not starting",
      createdById: employee.id,
    },
  });

  if (!existingTicket) {
    const ticket = await prisma.ticket.create({
      data: {
        title: "Laptop is not starting",
        description:
          "My office laptop is not turning on after the latest system update.",
        status: TicketStatus.OPEN,
        priority: TicketPriority.HIGH,
        createdById: employee.id,
        assignedToId: agent.id,
        categoryId: hardwareCategory.id,
        departmentId: itDepartment.id,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      },
    });

    await prisma.ticketComment.create({
      data: {
        message: "Please check this issue as soon as possible.",
        ticketId: ticket.id,
        userId: employee.id,
      },
    });

    await prisma.ticketActivityLog.createMany({
      data: [
        {
          type: ActivityType.CREATED,
          message: "Ticket created by employee.",
          ticketId: ticket.id,
          userId: employee.id,
        },
        {
          type: ActivityType.ASSIGNED,
          message: "Ticket assigned to support agent.",
          ticketId: ticket.id,
          userId: admin.id,
        },
      ],
    });

    await prisma.notification.create({
      data: {
        title: "New Ticket Assigned",
        message: "A new high priority ticket has been assigned to you.",
        userId: agent.id,
      },
    });
  }

  console.log("Seed data created successfully.");
}

main()
  .catch((error) => {
    console.error("Seed failed full error:");
    console.dir(error, { depth: null });
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });