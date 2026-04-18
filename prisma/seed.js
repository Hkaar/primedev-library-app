import { faker } from "@faker-js/faker";
import prisma from "../lib/database.js";
import { hashPassword } from "../lib/hash.js";

const isDev = process.argv.includes("--dev");

async function resetTables() {
  if (!isDev) {
    console.info("Skipping hard reset, due to not being in dev mode!");
    return;
  }

  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE "Borrowings" RESTART IDENTITY CASCADE`,
  );
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE "Profiles"   RESTART IDENTITY CASCADE`,
  );
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE "Books"      RESTART IDENTITY CASCADE`,
  );
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE "Users"      RESTART IDENTITY CASCADE`,
  );
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE "Categories" RESTART IDENTITY CASCADE`,
  );
  console.log("Tables cleared, sequences reset");
}

async function main() {
  await resetTables();

  // ── Categories (10) ──────────────────────────────────────────
  const categoryNames = [
    "Fiction",
    "Non-Fiction",
    "Science",
    "History",
    "Technology",
    "Biography",
    "Philosophy",
    "Mystery",
    "Fantasy",
    "Self-Help",
  ];

  const categories = await prisma.categories.createManyAndReturn({
    data: categoryNames.map((name) => ({ name })),
  });
  console.log(`Seeded ${categories.length} categories`);

  // ── Users (15) ───────────────────────────────────────────────
  const hashedPassword = await hashPassword("12345678");

  const users = [];

  // 1 fixed admin
  const admin = await prisma.users.create({
    data: {
      name: "Admin User",
      email: "admin@library.com",
      password: hashedPassword,
      role: "ADMIN",
      profiles: {
        create: {
          address: faker.location.streetAddress(),
          phone: faker.phone.number({ style: "national" }),
        },
      },
    },
  });
  users.push(admin);

  // 14 random users
  const usedEmails = new Set([admin.email]);
  for (let i = 0; i < 14; i++) {
    let email;
    do {
      email = faker.internet.email().toLowerCase();
    } while (usedEmails.has(email));
    usedEmails.add(email);

    const user = await prisma.users.create({
      data: {
        name: faker.person.fullName(),
        email,
        password: hashedPassword,
        role: "USER",
        profiles: {
          create: {
            address: faker.location.streetAddress(),
            phone: faker.phone.number({ style: "national" }),
          },
        },
      },
    });
    users.push(user);
  }
  console.log(`Seeded ${users.length} users`);

  // ── Books (25) ───────────────────────────────────────────────
  // 10 fixed classics + 15 faker-generated
  const fixedBooks = [
    {
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      year: 1925,
      catIdx: 0,
    },
    { title: "1984", author: "George Orwell", year: 1949, catIdx: 0 },
    { title: "Sapiens", author: "Yuval Noah Harari", year: 2011, catIdx: 1 },
    {
      title: "A Brief History of Time",
      author: "Stephen Hawking",
      year: 1988,
      catIdx: 2,
    },
    {
      title: "Guns, Germs, and Steel",
      author: "Jared Diamond",
      year: 1997,
      catIdx: 3,
    },
    { title: "Clean Code", author: "Robert C. Martin", year: 2008, catIdx: 4 },
    { title: "Steve Jobs", author: "Walter Isaacson", year: 2011, catIdx: 5 },
    { title: "Meditations", author: "Marcus Aurelius", year: 180, catIdx: 6 },
    { title: "Gone Girl", author: "Gillian Flynn", year: 2012, catIdx: 7 },
    { title: "Atomic Habits", author: "James Clear", year: 2018, catIdx: 9 },
  ];

  const allBookData = [
    ...fixedBooks.map((b) => ({
      title: b.title,
      author: b.author,
      year: b.year,
      available: faker.datatype.boolean({ probability: 0.7 }),
      categoryId: categories[b.catIdx].id,
    })),
    ...Array.from({ length: 15 }, () => ({
      title: faker.lorem
        .words({ min: 2, max: 5 })
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" "),
      author: faker.person.fullName(),
      year: faker.number.int({ min: 1950, max: 2024 }),
      available: faker.datatype.boolean({ probability: 0.7 }),
      categoryId: faker.helpers.arrayElement(categories).id,
    })),
  ];

  const books = await prisma.books.createManyAndReturn({
    data: allBookData,
  });
  console.log(`Seeded ${books.length} books`);

  // ── Borrowings (20) ──────────────────────────────────────────
  // pick unavailable books for active borrows, any book for returned
  const unavailableBooks = books.filter((b) => !b.available);
  const regularUsers = users.slice(1); // exclude admin

  const borrowings = [];

  // active borrows — one per unavailable book (up to 10)
  const activeBorrowBooks = faker.helpers.arrayElements(
    unavailableBooks,
    Math.min(10, unavailableBooks.length),
  );
  for (const book of activeBorrowBooks) {
    borrowings.push({
      userId: faker.helpers.arrayElement(regularUsers).id,
      bookId: book.id,
      borrow_date: faker.date.between({ from: "2025-01-01", to: "2025-04-01" }),
      returned_at: null,
    });
  }

  // returned borrows — pad up to 20 total
  const returnedCount = 20 - borrowings.length;
  for (let i = 0; i < returnedCount; i++) {
    const borrowDate = faker.date.between({
      from: "2024-06-01",
      to: "2025-03-01",
    });
    borrowings.push({
      userId: faker.helpers.arrayElement(regularUsers).id,
      bookId: faker.helpers.arrayElement(books).id,
      borrow_date: borrowDate,
      returned_at: faker.date.between({ from: borrowDate, to: new Date() }),
    });
  }

  const seededBorrowings = await prisma.borrowings.createManyAndReturn({
    data: borrowings,
  });
  console.log(`Seeded ${seededBorrowings.length} borrowings`);

  console.log("Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
