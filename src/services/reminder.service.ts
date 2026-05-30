import cron from "node-cron";
import prisma from "@/lib/database.js";
import logger from "@/lib/logger.js";

export const initReminderCron = () => {
  // Run every day at 00:00
  cron.schedule("0 0 * * *", async () => {
    logger.info("Running borrowing reminder cron job...");
    try {
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

      // We look for borrowings that are due within the next 3 days, 
      // haven't been returned, and haven't had a reminder sent yet.
      const borrowings = await prisma.borrowings.findMany({
        where: {
          returned_at: null,
          reminderSent: false,
          dueDate: {
            lte: threeDaysFromNow,
            gte: new Date(),
          },
        },
        include: {
          borrower: { select: { email: true, name: true } },
          book: { select: { title: true } },
        },
      });

      for (const b of borrowings) {
        logger.info(
          `[REMINDER] Sending reminder to ${b.borrower.email} for book "${b.book.title}". Due date: ${b.dueDate}`,
        );
        // In a real app, you would call an email service here.
        
        await prisma.borrowings.update({
          where: { id: b.id },
          data: { reminderSent: true },
        });
      }

      logger.info(`Reminder cron job finished. Sent ${borrowings.length} reminders.`);
    } catch (error) {
      logger.error({ error: (error as any).message }, "Error in reminder cron job");
    }
  });
};
