import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting database seed...')

  // Create admin account
  const hashedAdminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.admin.upsert({
    where: { adminId: 'ADMIN001' },
    update: {},
    create: {
      adminId: 'ADMIN001',
      name: 'System Administrator',
      email: 'admin@college.edu',
      password: hashedAdminPassword,
    },
  })
  console.log('Created admin:', admin.adminId)

  // Create sample students
  const hashedStudentPassword = await bcrypt.hash('student123', 10)

  const student1 = await prisma.student.upsert({
    where: { rollNumber: 'STU001' },
    update: {},
    create: {
      rollNumber: 'STU001',
      name: 'John Doe',
      email: 'john.doe@college.edu',
      department: 'Computer Science',
      password: hashedStudentPassword,
    },
  })
  console.log('Created student:', student1.rollNumber)

  const student2 = await prisma.student.upsert({
    where: { rollNumber: 'STU002' },
    update: {},
    create: {
      rollNumber: 'STU002',
      name: 'Jane Smith',
      email: 'jane.smith@college.edu',
      department: 'Electrical Engineering',
      password: hashedStudentPassword,
    },
  })
  console.log('Created student:', student2.rollNumber)

  // Create sample books
  const book1 = await prisma.book.upsert({
    where: { bookId: 'BOOK001' },
    update: {},
    create: {
      bookId: 'BOOK001',
      title: 'Introduction to Algorithms',
      author: 'Thomas H. Cormen',
      isbn: '978-0262033848',
      status: 'AVAILABLE',
    },
  })
  console.log('Created book:', book1.bookId)

  const book2 = await prisma.book.upsert({
    where: { bookId: 'BOOK002' },
    update: {},
    create: {
      bookId: 'BOOK002',
      title: 'Clean Code',
      author: 'Robert C. Martin',
      isbn: '978-0132350884',
      status: 'AVAILABLE',
    },
  })
  console.log('Created book:', book2.bookId)

  const book3 = await prisma.book.upsert({
    where: { bookId: 'BOOK003' },
    update: {},
    create: {
      bookId: 'BOOK003',
      title: 'Design Patterns',
      author: 'Erich Gamma',
      isbn: '978-0201633610',
      status: 'AVAILABLE',
    },
  })
  console.log('Created book:', book3.bookId)

  const book4 = await prisma.book.upsert({
    where: { bookId: 'BOOK004' },
    update: {},
    create: {
      bookId: 'BOOK004',
      title: 'The Pragmatic Programmer',
      author: 'Andrew Hunt',
      isbn: '978-0135957059',
      status: 'AVAILABLE',
    },
  })
  console.log('Created book:', book4.bookId)

  const book5 = await prisma.book.upsert({
    where: { bookId: 'BOOK005' },
    update: {},
    create: {
      bookId: 'BOOK005',
      title: 'Refactoring',
      author: 'Martin Fowler',
      isbn: '978-0201485677',
      status: 'AVAILABLE',
    },
  })
  console.log('Created book:', book5.bookId)

  console.log('Database seed completed successfully!')
  console.log('---')
  console.log('Admin credentials:')
  console.log('  ID: ADMIN001')
  console.log('  Password: admin123')
  console.log('---')
  console.log('Student credentials:')
  console.log('  Roll Number: STU001 or STU002')
  console.log('  Password: student123')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
