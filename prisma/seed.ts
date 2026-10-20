import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import bcrypt from 'bcryptjs'

process.env.DATABASE_URL = process.env.DATABASE_URL || 'file:./dev.db'

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Seeding database...')

  // Clear existing data
  await prisma.activityLog.deleteMany()
  await prisma.leadNote.deleteMany()
  await prisma.lead.deleteMany()
  await prisma.user.deleteMany()

  const adminPasswordHash = await bcrypt.hash('Admin@12345', 10)
  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@digitalheroes.demo',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
    },
  })

  const memberPasswordHash = await bcrypt.hash('Member@12345', 10)
  const member = await prisma.user.create({
    data: {
      name: 'Zara Sheikh',
      email: 'member@digitalheroes.demo',
      passwordHash: memberPasswordHash,
      role: 'MEMBER',
    },
  })

  const leads = [
    { name: 'Siddharth Menon', email: 'siddharth@example.com', phone: '98765-43210', company: 'Acme Corp', status: 'NEW', value: 10000, source: 'Website Form' },
    { name: 'Anika Chatterjee', email: 'anika@example.com', company: 'Tech Solutions', status: 'CONTACTED', value: 25000, assignedToId: member.id, source: 'LinkedIn' },
    { name: 'Devrat Singhania', email: 'devrat@example.com', phone: '91234-56789', status: 'QUALIFIED', value: 50000, assignedToId: admin.id, source: 'Referral' },
    { name: 'Ishani Mukherjee', email: 'ishani@example.com', company: 'Startup Inc', status: 'PROPOSAL_SENT', value: 15000, assignedToId: member.id, source: 'Conference' },
    { name: 'Kabir Ahuja', email: 'kabir@example.com', status: 'WON', value: 120000, assignedToId: admin.id, source: 'Website Form' },
    { name: 'Meera Nambiar', email: 'meera@example.com', company: 'Enterprise LLC', status: 'LOST', value: 85000, source: 'Cold Call' },
    { name: 'Vivaan Choudhury', email: 'vivaan@example.com', phone: '99887-76655', status: 'NEW', value: null, source: 'Website Form' },
    { name: 'Tanya Bhatia', email: 'tanya@example.com', company: 'Design Studio', status: 'CONTACTED', value: 8000, assignedToId: member.id, source: 'Direct Email' },
    { name: 'Yashwardhan Raichand', email: 'yash@example.com', status: 'QUALIFIED', value: 45000, assignedToId: admin.id, source: 'Referral' },
    { name: 'Naina Mathur', email: 'naina@example.com', company: 'Eco Friendly', status: 'PROPOSAL_SENT', value: 32000, assignedToId: member.id, source: 'LinkedIn' },
    { name: 'Dhruv Shekhawat', email: 'dhruv@example.com', phone: '98765-12345', status: 'NEW', value: 15000, source: 'Website Form' },
  ]

  for (const leadData of leads) {
    const lead = await prisma.lead.create({
      data: leadData,
    })

    await prisma.activityLog.create({
      data: {
        leadId: lead.id,
        action: 'CREATED',
        details: 'Lead created via seeder',
      }
    })

    if (leadData.assignedToId) {
       await prisma.activityLog.create({
        data: {
          leadId: lead.id,
          actorId: leadData.assignedToId,
          action: 'ASSIGNED',
          details: `Assigned to ${leadData.assignedToId === admin.id ? 'Admin' : 'Member'}`,
        }
      })
    }
  }

  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
