import prisma from '../database/config.database.js';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

async function main() {
  console.log('Starting seeding...');

  // Delete in reverse dependency order
  await prisma.borrowings.deleteMany();
  await prisma.users.deleteMany();
  await prisma.books.deleteMany();
  await prisma.categories.deleteMany();

  // 1. Categories (independent)
  await prisma.categories.createMany({
    data: [
      { name: 'Fiction' },
      { name: 'Non-Fiction' },
      { name: 'Science' },
      { name: 'History' },
      { name: 'Biography' },
    ],
  });
  const allCategories = await prisma.categories.findMany();
  const catMap = Object.fromEntries(allCategories.map((c) => [c.name, c.id]));

  const userPassword = bcrypt.hash(
    'password',
    parseInt(process.env.BCRYPT_SALT_ROUNDS),
  );

  // 2. Users (independent)
  await prisma.users.createMany({
    data: [
      {
        name: 'Super Admin',
        email: 'admin@gmail.com',
        password: userPassword,
        role: prisma.users.roles.ADMIN,
      },
      {
        name: 'Staff Perpus',
        email: 'staff@gmail.com',
        password: userPassword,
        role: prisma.users.roles.ADMIN,
      },
      {
        name: 'Budi Santoso',
        email: 'budi@gmail.com',
        password: userPassword,
        role: prisma.users.roles.USER,
      },
      {
        name: 'Siti Aminah',
        email: 'siti@gmail.com',
        password: userPassword,
        role: prisma.users.roles.USER,
      },
      {
        name: 'Andi Wijaya',
        email: 'andi@gmail.com',
        password: userPassword,
        role: prisma.users.roles.USER,
      },
    ],
  });
  const allUsers = await prisma.users.findMany({
    where: { role: prisma.users.roles.USER },
  });

  // 3. Books (independent)
  const booksData = [
    {
      title: 'Laskar Pelangi',
      author: 'Andrea Hirata',
      year: 2005,
      categoryId: catMap['Fiction'],
    },
    {
      title: 'Bumi Manusia',
      author: 'Pramoedya Ananta Toer',
      year: 1980,
      categoryId: catMap['History'],
    },
    {
      title: 'Negeri 5 Menara',
      author: 'Ahmad Fuadi',
      year: 2009,
      categoryId: catMap['Fiction'],
    },
    {
      title: 'Filosofi Kopi',
      author: 'Dee Lestari',
      year: 2006,
      categoryId: catMap['Fiction'],
    },
    {
      title: 'Laut Bercerita',
      author: 'Leila S. Chudori',
      year: 2017,
      categoryId: catMap['Fiction'],
    },
    {
      title: 'Cantik Itu Luka',
      author: 'Eka Kurniawan',
      year: 2002,
      categoryId: catMap['Fiction'],
    },
    {
      title: 'Pulang',
      author: 'Leila S. Chudori',
      year: 2012,
      categoryId: catMap['Fiction'],
    },
    {
      title: 'Perahu Kertas',
      author: 'Dee Lestari',
      year: 2009,
      categoryId: catMap['Fiction'],
    },
    {
      title: 'Hujan',
      author: 'Tere Liye',
      year: 2016,
      categoryId: catMap['Fiction'],
    },
    {
      title: 'Ronggeng Dukuh Paruk',
      author: 'Ahmad Tohari',
      year: 1982,
      categoryId: catMap['History'],
    },
    {
      title: 'Sang Pemimpi',
      author: 'Andrea Hirata',
      year: 2006,
      categoryId: catMap['Fiction'],
    },
    {
      title: 'Supernova',
      author: 'Dee Lestari',
      year: 2001,
      categoryId: catMap['Science'],
    },
    {
      title: 'Gadis Kretek',
      author: 'Ratih Kumala',
      year: 2012,
      categoryId: catMap['History'],
    },
    {
      title: 'Aroma Karsa',
      author: 'Dee Lestari',
      year: 2018,
      categoryId: catMap['Fiction'],
    },
    {
      title: 'Entrok',
      author: 'Okky Madasari',
      year: 2010,
      categoryId: catMap['History'],
    },
    {
      title: 'Selamat Tinggal',
      author: 'Tere Liye',
      year: 2020,
      categoryId: catMap['Fiction'],
    },
    {
      title: 'Dunia Sophie',
      author: 'Jostein Gaarder',
      year: 1991,
      categoryId: catMap['Non-Fiction'],
    },
    {
      title: 'Saman',
      author: 'Ayu Utami',
      year: 1998,
      categoryId: catMap['Fiction'],
    },
    {
      title: 'Anak Semua Bangsa',
      author: 'Pramoedya Ananta Toer',
      year: 1980,
      categoryId: catMap['History'],
    },
    {
      title: 'Dikta dan Hukum',
      author: 'Dhian Farah',
      year: 2021,
      categoryId: catMap['Fiction'],
    },
  ];

  await prisma.books.createMany({ data: booksData });
  const allBooks = await prisma.books.findMany();

  // 4. Borrowings (depends on users + books)
  await prisma.borrowings.createMany({
    data: [
      {
        userId: allUsers[0].id,
        bookId: allBooks[0].id,
      },
      {
        userId: allUsers[1].id,
        bookId: allBooks[1].id,
        returned_at: new Date(),
      },
      {
        userId: allUsers[2].id,
        bookId: allBooks[2].id,
      },
    ],
  });

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(`Error during seeding: ${e}`);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
