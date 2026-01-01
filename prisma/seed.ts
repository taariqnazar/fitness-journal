import { prisma } from '@/lib/db';
import { Prisma } from '@/app/generated/prisma/client'

async function main() {
  console.log('--- Seeding Process Started ---')

  const user: Prisma.UserCreateInput = {
    firstName: 'Taariq',
    lastName: 'Nazar',
    email: 'tariq.nazar13@gmail.com'
  }

  const createdUser = await prisma.user.create({
    data: user,
  })

  console.log('Created User:', user)
  console.log('--- Seeding Process Finished ---')
}

main()
