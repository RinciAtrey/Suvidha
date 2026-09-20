import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.document.count();
  if (count === 0) {
    await prisma.document.createMany({
      data: [
        { 
            title: 'Indian Passport', 
            description: 'Apply for a new or renewed Indian Passport.', 
            steps: '1. Register on Passport Seva Online Portal\n2. Fill the application form\n3. Pay the fee and book appointment\n4. Visit the Passport Seva Kendra (PSK)' 
        },
        { 
            title: 'Aadhar Card', 
            description: 'Enroll for a new Aadhar card or update your existing details.', 
            steps: '1. Locate nearest Aadhar center\n2. Book an appointment online\n3. Provide biometric and demographic data at the center' 
        },
        { 
            title: 'PAN Card', 
            description: 'Apply for a Permanent Account Number for financial transactions.', 
            steps: '1. Fill Form 49A on NSDL/UTIITSL\n2. Upload digital documents\n3. Pay the processing fee online' 
        }
      ]
    });
    console.log("Seeded database with initial documents.");
  } else {
    console.log("Database already has documents.");
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
