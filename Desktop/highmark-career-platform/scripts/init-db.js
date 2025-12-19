const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('开始初始化数据库...')

  // 创建示例用户（教练）
  const coachEmail = 'coach@highmark.com.cn'
  const coachPassword = await bcrypt.hash('password123', 10)
  
  const coach = await prisma.user.upsert({
    where: { email: coachEmail },
    update: {},
    create: {
      email: coachEmail,
      password: coachPassword,
      name: '示例教练',
      role: 'COACH',
    },
  })

  console.log('✅ 创建教练用户:', coach.email)

  // 创建示例用户（BD）
  const bdEmail = 'bd@highmark.com.cn'
  const bdPassword = await bcrypt.hash('password123', 10)
  
  const bd = await prisma.user.upsert({
    where: { email: bdEmail },
    update: {},
    create: {
      email: bdEmail,
      password: bdPassword,
      name: '示例BD',
      role: 'BD',
    },
  })

  console.log('✅ 创建BD用户:', bd.email)

  console.log('\n数据库初始化完成！')
  console.log('\n默认登录账号：')
  console.log('教练端: coach@highmark.com.cn / password123')
  console.log('BD端: bd@highmark.com.cn / password123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

