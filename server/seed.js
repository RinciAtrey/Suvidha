const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

const demoAccounts = [
  { name: 'Super Admin', email: 'superadmin@suvidha.gov.in', password: 'super1234', role: 'superadmin', isAvailable: true },
  { name: 'Admin One', email: 'admin1@suvidha.gov.in', password: 'admin1234', role: 'admin', isAvailable: true },
  { name: 'Admin Two', email: 'admin2@suvidha.gov.in', password: 'admin1234', role: 'admin', isAvailable: false },
];

const documents = [
  {
      title: 'Aadhaar Card',
      description: 'A 12-digit unique identity number issued by UIDAI. Required for almost all government subsidies and bank accounts.',
      steps: '1. Locate an Enrolment Center near you\n2. Book an appointment online\n3. Visit the center with supporting documents\n4. Provide biometric and demographic data\n5. Collect acknowledgement slip',
      updateSteps: '1. Visit an Aadhaar Seva Kendra or the UIDAI Self-Service Update Portal (SSUP)\n2. Select the field to update (address, mobile number, DOB, photo, etc.)\n3. Upload supporting documents for the change\n4. Pay the nominal update fee where applicable\n5. Track your update using the Update Request Number (URN)',
      requiredDocs: 'Proof of Identity (POI), Proof of Address (POA), Date of Birth (DOB) proof.',
      officialLink: 'https://uidai.gov.in/',
      sources: 'UIDAI Official Portal|https://uidai.gov.in/\nAadhaar Self-Service Update Portal|https://ssup.uidai.gov.in/',
      guides: 'UIDAI FAQs & Help Center|https://uidai.gov.in/en/contact-support/have-any-question.html\nBook Aadhaar Center Appointment|https://appointments.uidai.gov.in/'
  },
  {
      title: 'PAN Card',
      description: 'Permanent Account Number used for financial transactions and income tax filing.',
      steps: '1. Visit NSDL/UTIITSL portal\n2. Fill Form 49A (for Indian citizens)\n3. Upload digital copies of photo and signature\n4. Pay processing fee online\n5. Track dispatch status',
      updateSteps: "1. Visit the NSDL or UTIITSL portal and select 'Changes or Correction in PAN Data'\n2. Fill the correction form with the updated details\n3. Upload proof for the field being changed (name, DOB, address, photo, signature)\n4. Pay the correction fee online\n5. Track dispatch of the updated PAN card",
      requiredDocs: 'Aadhaar Card, Passport size photos, Address proof.',
      officialLink: 'https://www.onlineservices.nsdl.com/paam/endUserRegisterContact.html',
      sources: 'NSDL e-Gov PAN Services|https://www.onlineservices.nsdl.com/paam/endUserRegisterContact.html\nUTIITSL PAN Services|https://www.pan.utiitsl.com/',
      guides: 'Income Tax e-Filing Portal|https://www.incometax.gov.in/\nLink PAN with Aadhaar|https://www.incometax.gov.in/'
  },
  {
      title: 'Passport',
      description: 'Official travel document issued by the Ministry of External Affairs for international travel.',
      steps: '1. Register on Passport Seva portal\n2. Fill the application form\n3. Pay fee and schedule appointment\n4. Visit Passport Seva Kendra (PSK) with original docs\n5. Complete Police Verification',
      updateSteps: "1. Log in to the Passport Seva portal and select 'Reissue of Passport'\n2. Fill the reissue form for changes (address, name, expiry renewal)\n3. Pay the fee and schedule an appointment at the PSK\n4. Submit original passport and supporting documents for the change\n5. Complete police verification if required",
      requiredDocs: 'Aadhaar Card (or other Address Proof), Date of Birth proof, Non-ECR proof (10th marksheet if applicable).',
      officialLink: 'https://www.passportindia.gov.in/',
      sources: 'Passport Seva Official Portal|https://www.passportindia.gov.in/\nMinistry of External Affairs|https://www.mea.gov.in/',
      guides: 'Passport Seva Help & FAQs|https://www.passportindia.gov.in/\nTrack Passport Application Status|https://www.passportindia.gov.in/'
  },
  {
      title: 'Voter ID',
      description: 'Election Photo Identity Card (EPIC) used to cast votes in Indian elections.',
      steps: '1. Register on NVSP portal or Voter Helpline app\n2. Fill Form 6 for new registration\n3. Upload photograph and age/address proof\n4. Application verified by Booth Level Officer (BLO)',
      updateSteps: '1. Visit the National Voters Service Portal (NVSP)\n2. Fill Form 8 for correction of entries or change of address\n3. Upload proof supporting the requested change\n4. Application verified by the Booth Level Officer (BLO)\n5. Download the updated e-EPIC once approved',
      requiredDocs: 'Age proof (Birth cert/10th marksheet), Address proof (Aadhaar/Ration card).',
      officialLink: 'https://voters.eci.gov.in/',
      sources: 'National Voters Service Portal (NVSP)|https://voters.eci.gov.in/\nElection Commission of India|https://eci.gov.in/',
      guides: 'Voter Helpline App|https://voters.eci.gov.in/\nTrack Voter ID Application Status|https://voters.eci.gov.in/'
  },
  {
      title: 'Driving License',
      description: 'Official authorization required to drive a motor vehicle on public roads.',
      steps: '1. Apply for Learner\'s License (LL) on Parivahan portal\n2. Pass the online LL test\n3. After 30 days, apply for Permanent DL\n4. Book driving test slot\n5. Pass the physical driving test at RTO',
      updateSteps: '1. Visit the Parivahan Sarathi portal\n2. Select DL change of address, or renewal (from 1 year before to 5 years after expiry)\n3. Upload supporting documents and medical certificate if required\n4. Pay the applicable fee online\n5. Collect the updated/renewed DL at the RTO or via post',
      requiredDocs: 'Learner\'s License (for permanent DL), Aadhaar card, Medical Certificate (Form 1A if required).',
      officialLink: 'https://parivahan.gov.in/parivahan/',
      sources: 'Parivahan Sarathi Portal|https://sarathi.parivahan.gov.in/\nMinistry of Road Transport & Highways|https://morth.nic.in/',
      guides: 'mParivahan App|https://parivahan.gov.in/parivahan/\nDL Renewal FAQs|https://sarathi.parivahan.gov.in/'
  },
  {
      title: 'Ration Card',
      description: 'Official document for purchasing subsidized food grain and serving as identity proof.',
      steps: '1. Visit state specific food and civil supplies portal\n2. Fill application form\n3. Upload family details and income proof\n4. Verification by local authorities',
      updateSteps: '1. Visit your state Food & Civil Supplies e-District portal\n2. Select modification (add/remove family member, address change)\n3. Upload supporting documents (birth/death certificate, address proof)\n4. Verification by the local Food Inspector\n5. Collect the updated ration card or e-card',
      requiredDocs: 'Income Certificate, Aadhaar cards of all family members, Residence proof.',
      officialLink: 'https://nfsa.gov.in/',
      sources: 'National Food Security Portal|https://nfsa.gov.in/\nDepartment of Food & Public Distribution|https://dfpd.gov.in/',
      guides: 'One Nation One Ration Card|https://nfsa.gov.in/\nState Ration Card Portal Directory|https://nfsa.gov.in/'
  },
  {
      title: 'Birth Certificate',
      description: 'Vital record that documents the birth of a person. Essential for school admissions and passports.',
      steps: '1. Register birth within 21 days at local hospital/municipality\n2. If delayed, apply through CRS portal or local registrar\n3. Provide parents\' ID and hospital discharge slip\n4. Collect from municipal office',
      updateSteps: '1. Visit the CRS (Civil Registration System) portal or local municipal office\n2. Apply for correction with proof of the error (hospital records, affidavit)\n3. Submit supporting documents and pay the correction fee\n4. Verification by the local registrar\n5. Collect the corrected certificate',
      requiredDocs: 'Hospital discharge slip, Parents\' Aadhaar cards, Marriage certificate of parents (optional).',
      officialLink: 'https://crsorgi.gov.in/',
      sources: 'Civil Registration System (CRS) Portal|https://crsorgi.gov.in/\nOffice of the Registrar General of India|https://censusindia.gov.in/',
      guides: 'Birth Certificate FAQs (CRS)|https://crsorgi.gov.in/\nIndia.gov.in Certificate Services|https://india.gov.in/topics/certificates'
  },
  {
      title: 'Bank Account KYC',
      description: 'Know Your Customer process required to keep bank accounts active and compliant.',
      steps: '1. Fill KYC form at branch or via net banking/video KYC\n2. Submit updated ID and address proof\n3. Provide recent photograph\n4. Sign declaration',
      updateSteps: '1. Download the KYC update form from your bank or net banking portal\n2. Fill updated ID/address/mobile details\n3. Submit via branch visit, video KYC, or registered post\n4. Bank verifies and updates records\n5. Confirmation via SMS/email once complete',
      requiredDocs: 'Aadhaar Card, PAN Card, Recent photograph.',
      officialLink: 'https://www.rbi.org.in/',
      sources: 'Reserve Bank of India|https://www.rbi.org.in/\nYour bank\'s official net-banking portal|https://www.rbi.org.in/Scripts/BS_ViewBankDetails.aspx',
      guides: 'RBI KYC Guidelines & FAQs|https://www.rbi.org.in/\nVideo KYC Process Overview|https://www.rbi.org.in/'
  },
  {
      title: 'Domicile/Residence Certificate',
      description: 'Proof of continuous residence in a specific state, used for educational quotas and local jobs.',
      steps: '1. Apply on State e-District portal\n2. Fill application with duration of stay\n3. Upload land records, electricity bills, or school certificates\n4. Verified by Talati/Tehsildar',
      updateSteps: '1. Apply for correction/renewal on the State e-District portal\n2. Update the duration of stay or address details\n3. Upload revised proof documents\n4. Verification by Talati/Tehsildar\n5. Download the updated certificate',
      requiredDocs: 'Aadhaar Card, Last 10 years proof of residence (electricity bills, school leaving cert), Ration Card.',
      officialLink: 'https://india.gov.in/topics/certificates',
      sources: 'State e-District Portal Directory|https://edistrict.gov.in/\nIndia.gov.in Certificate Services|https://india.gov.in/topics/certificates',
      guides: 'Digital India Portal|https://www.digitalindia.gov.in/\nDomicile Certificate Eligibility & Process|https://india.gov.in/topics/certificates'
  },
  {
      title: 'Caste Certificate',
      description: 'Proof of belonging to a particular caste (SC/ST/OBC) for reservations and schemes.',
      steps: '1. Apply on State e-District portal\n2. Provide family tree and ancestral proof\n3. Upload father\'s/grandfather\'s caste proof\n4. Field verification by revenue officer',
      updateSteps: '1. Apply for correction on the State e-District portal\n2. Provide updated family/ancestral proof if details changed\n3. Upload revised affidavit and supporting documents\n4. Field verification by the revenue officer\n5. Download the corrected certificate',
      requiredDocs: 'Family member\'s caste certificate, School leaving certificate showing caste, Affidavit.',
      officialLink: 'https://india.gov.in/topics/certificates',
      sources: 'State e-District Portal Directory|https://edistrict.gov.in/\nMinistry of Social Justice and Empowerment|https://socialjustice.gov.in/',
      guides: 'Caste Certificate Process & Eligibility|https://india.gov.in/topics/certificates\nSC/ST/OBC Certificate FAQs|https://socialjustice.gov.in/'
  },
  {
      title: 'Income Certificate',
      description: 'Official statement of annual income, required for scholarships, EWS quota, and subsidies.',
      steps: '1. Apply via e-District portal or local Tehsil\n2. Submit salary slips or ITR\n3. For non-salaried, submit affidavit of income\n4. Verification by Patwari/Revenue Inspector',
      updateSteps: '1. Apply for renewal on the e-District portal or local Tehsil office (usually valid 6-12 months)\n2. Submit latest salary slips/ITR or an income affidavit\n3. Upload updated supporting documents\n4. Verification by Patwari/Revenue Inspector\n5. Download the renewed certificate',
      requiredDocs: 'Salary slips, ITR, Aadhaar card, Ration card.',
      officialLink: 'https://india.gov.in/topics/certificates',
      sources: 'State e-District Portal Directory|https://edistrict.gov.in/\nIncome Tax e-Filing Portal|https://www.incometax.gov.in/',
      guides: 'Income Certificate Renewal Guide|https://india.gov.in/topics/certificates\nEWS/Scholarship Income Limit Info|https://edistrict.gov.in/'
  },
  {
      title: 'Marriage Certificate',
      description: 'Legal proof of registration of marriage.',
      steps: '1. Register online on state portal\n2. Upload wedding photos and invitation card\n3. Book appointment with Sub-Registrar\n4. Visit with spouse and 3 witnesses',
      updateSteps: '1. For name/address correction, apply at the same Sub-Registrar office\n2. Submit the original certificate and proof of the required change\n3. Pay the correction fee\n4. Verification by the registrar\n5. Collect the corrected certificate',
      requiredDocs: 'Age proof of both, Address proof, Wedding card, Joint photo, Witnesses\' IDs.',
      officialLink: 'https://india.gov.in/topics/certificates',
      sources: 'State e-District Portal Directory|https://edistrict.gov.in/\nIndia.gov.in Certificate Services|https://india.gov.in/topics/certificates',
      guides: 'Marriage Registration Process Guide|https://india.gov.in/topics/certificates\nDocuments Required Checklist|https://edistrict.gov.in/'
  },
  {
      title: 'Property/Land Documents',
      description: 'Records of rights (RoR), Khatauni, or property tax receipts proving ownership.',
      steps: '1. Visit state land record portal (e.g., Bhoomi, Bhulekh)\n2. Search by survey number or owner name\n3. Pay nominal fee for digitally signed copy\n4. Download RoR',
      updateSteps: '1. Apply for mutation (name transfer) on the state land record portal after sale/inheritance\n2. Submit sale deed/inheritance proof and identity documents\n3. Pay the mutation fee\n4. Verification by the local Patwari/Revenue official\n5. Download the updated Record of Rights (RoR)',
      requiredDocs: 'Survey number, Owner name, Aadhaar card.',
      officialLink: 'https://dilrmp.gov.in/',
      sources: 'Digital India Land Records Modernisation Programme|https://dilrmp.gov.in/\nBhoomi (Karnataka Land Records)|https://landrecords.karnataka.gov.in/',
      guides: 'Property Mutation Process Guide|https://dilrmp.gov.in/\nHow to Check Land Records Online|https://dilrmp.gov.in/'
  },
  {
      title: 'Employee ID / EPF (UAN)',
      description: 'Universal Account Number for managing Provident Fund across multiple employers.',
      steps: '1. Ask employer for UAN\n2. Visit EPFO Member e-Sewa portal\n3. Activate UAN using Aadhaar OTP\n4. Complete e-KYC (link Aadhaar, PAN, Bank account)',
      updateSteps: '1. Log in to the EPFO Member e-Sewa portal\n2. Go to Manage > Modify Basic Details for corrections\n3. Upload supporting Aadhaar/PAN documents\n4. Employer approves the correction request\n5. Verified details reflect in your UAN profile',
      requiredDocs: 'Aadhaar Card (linked with mobile number), PAN Card, Bank Account details.',
      officialLink: 'https://unifiedportal-mem.epfindia.gov.in/memberinterface/',
      sources: 'EPFO Member e-Sewa Portal|https://unifiedportal-mem.epfindia.gov.in/memberinterface/\nEmployees\' Provident Fund Organisation|https://www.epfindia.gov.in/',
      guides: 'UMANG App (EPFO Services)|https://web.umang.gov.in/\nUAN Activation & e-KYC Guide|https://www.epfindia.gov.in/'
  },
  {
      title: 'Vehicle RC (Registration Certificate)',
      description: 'Proof of registration of a motor vehicle with the RTO.',
      steps: '1. Dealer applies for temporary registration on purchase\n2. RTO issues permanent RC after tax payment\n3. Download digital copy from DigiLocker or mParivahan app',
      updateSteps: '1. Visit the Vahan Parivahan portal for change of address/ownership transfer\n2. Upload sale deed/NOC and updated address proof\n3. Pay the applicable RTO fee online\n4. RTO verifies and updates the RC\n5. Download the updated RC via DigiLocker or mParivahan',
      requiredDocs: 'Dealer invoice, Insurance policy, PAN Card, Aadhaar Card.',
      officialLink: 'https://vahan.parivahan.gov.in/',
      sources: 'Vahan Parivahan Portal|https://vahan.parivahan.gov.in/\nMinistry of Road Transport & Highways|https://morth.nic.in/',
      guides: 'DigiLocker (Digital Document Wallet)|https://www.digilocker.gov.in/\nmParivahan App|https://parivahan.gov.in/parivahan/'
  }
];

const schemes = [
  {
    name: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
    description: 'Income support of ₹6,000 per year, paid in three installments, directly to the bank accounts of eligible farmer families.',
    category: 'Agriculture',
    benefits: '₹6,000/year direct benefit transfer in 3 installments of ₹2,000 each.',
    minAge: 18,
    occupation: 'farmer',
    officialLink: 'https://pmkisan.gov.in/'
  },
  {
    name: 'Ayushman Bharat (PM-JAY)',
    description: "World's largest health assurance scheme providing free treatment coverage for economically vulnerable families.",
    category: 'Health',
    benefits: 'Health cover of ₹5 lakh per family per year for secondary and tertiary hospitalization.',
    maxIncome: 250000,
    officialLink: 'https://pmjay.gov.in/'
  },
  {
    name: 'PM Ujjwala Yojana',
    description: 'Provides free LPG gas connections to women from below-poverty-line households to promote clean cooking fuel.',
    category: 'Women & Child',
    benefits: 'Free LPG connection with financial support for the first refill and stove.',
    minAge: 18,
    gender: 'female',
    maxIncome: 200000,
    officialLink: 'https://pmuy.gov.in/'
  },
  {
    name: 'Pradhan Mantri Awas Yojana (Urban)',
    description: 'Affordable housing scheme for the urban poor and middle-income groups (EWS/LIG/MIG).',
    category: 'Housing',
    benefits: 'Interest subsidy on home loans and financial assistance for house construction/purchase.',
    minAge: 18,
    maxIncome: 1800000,
    officialLink: 'https://pmaymis.gov.in/'
  },
  {
    name: 'Pradhan Mantri Awas Yojana (Gramin)',
    description: 'Provides pucca houses with basic amenities to houseless and inadequately housed rural families.',
    category: 'Housing',
    benefits: 'Financial assistance of up to ₹1.3 lakh for constructing a pucca house.',
    minAge: 18,
    maxIncome: 100000,
    officialLink: 'https://pmayg.nic.in/'
  },
  {
    name: 'Atal Pension Yojana',
    description: 'A guaranteed pension scheme for workers in the unorganised sector, encouraging retirement savings.',
    category: 'Financial Inclusion',
    benefits: 'Guaranteed monthly pension of ₹1,000 to ₹5,000 after age 60, based on contribution.',
    minAge: 18,
    maxAge: 40,
    officialLink: 'https://www.pfrda.org.in/'
  },
  {
    name: 'National Scholarship Portal Schemes',
    description: 'A one-stop platform for various central and state government scholarships for students from pre-matric to post-graduate levels.',
    category: 'Education',
    benefits: 'Tuition fee reimbursement, maintenance allowance, and other financial assistance for education.',
    maxIncome: 800000,
    isStudent: true,
    officialLink: 'https://scholarships.gov.in/'
  },
  {
    name: 'Sukanya Samriddhi Yojana',
    description: 'A small savings scheme for the girl child, encouraging parents to build a fund for her education and marriage.',
    category: 'Women & Child',
    benefits: 'High interest rate savings account with tax benefits, maturing when the girl turns 21.',
    gender: 'female',
    maxAge: 10,
    officialLink: 'https://www.nsiindia.gov.in/'
  },
  {
    name: 'Stand-Up India',
    description: 'Facilitates bank loans for setting up greenfield enterprises, aimed at women and SC/ST entrepreneurs.',
    category: 'Employment',
    benefits: 'Bank loans between ₹10 lakh and ₹1 crore for greenfield enterprises.',
    minAge: 18,
    socialCategory: 'SC,ST',
    officialLink: 'https://www.standupmitra.in/'
  },
  {
    name: 'Pradhan Mantri Mudra Yojana',
    description: 'Provides loans to non-corporate, non-farm small and micro enterprises for income-generating activities.',
    category: 'Employment',
    benefits: 'Collateral-free loans up to ₹10 lakh under Shishu, Kishor, and Tarun categories.',
    minAge: 18,
    occupation: 'business,self-employed',
    officialLink: 'https://www.mudra.org.in/'
  },
  {
    name: 'PM Fasal Bima Yojana',
    description: 'Crop insurance scheme providing financial support to farmers in case of crop failure due to natural calamities.',
    category: 'Agriculture',
    benefits: 'Insurance coverage and financial support for crop loss/damage.',
    minAge: 18,
    occupation: 'farmer',
    officialLink: 'https://pmfby.gov.in/'
  },
  {
    name: 'National Social Assistance Programme (Old Age Pension)',
    description: 'Provides a monthly pension to elderly citizens from households living below the poverty line.',
    category: 'Senior Citizens',
    benefits: 'Monthly pension assistance (amount varies by state, co-funded by centre and state).',
    minAge: 60,
    maxIncome: 100000,
    officialLink: 'https://nsap.nic.in/'
  },
  {
    name: 'Beti Bachao Beti Padhao',
    description: 'A campaign to generate awareness and improve the efficiency of welfare services for the girl child, focused on survival, protection, and education.',
    category: 'Women & Child',
    benefits: 'Access to educational incentives, awareness camps, and community support programs.',
    gender: 'female',
    maxAge: 18,
    officialLink: 'https://wcd.nic.in/'
  },
  {
    name: 'Pradhan Mantri Vaya Vandana Yojana',
    description: 'A pension scheme for senior citizens, administered by LIC, offering an assured return on investment.',
    category: 'Senior Citizens',
    benefits: 'Assured pension payouts (monthly/quarterly/annual) on a lump sum investment.',
    minAge: 60,
    officialLink: 'https://licindia.in/'
  }
];

async function main() {
  console.log("Deleting old documents to prevent duplicates...");
  await prisma.message.deleteMany({});
  await prisma.question.deleteMany({});
  await prisma.document.deleteMany({});

  console.log("Inserting 15 comprehensive documents...");
  await prisma.document.createMany({
    data: documents
  });

  console.log("Deleting old schemes to prevent duplicates...");
  await prisma.scheme.deleteMany({});
  console.log("Inserting 14 government schemes...");
  await prisma.scheme.createMany({
    data: schemes
  });

  console.log("Seeding demo Admin/SuperAdmin accounts...");
  for (const acc of demoAccounts) {
    const hashedPassword = await bcrypt.hash(acc.password, 10);
    await prisma.user.upsert({
      where: { email: acc.email },
      update: { role: acc.role, isAvailable: acc.isAvailable },
      create: { name: acc.name, email: acc.email, password: hashedPassword, role: acc.role, isAvailable: acc.isAvailable },
    });
  }

  console.log("Successfully seeded database!");
  console.log("Demo logins: superadmin@suvidha.gov.in / super1234, admin1@suvidha.gov.in / admin1234 (available), admin2@suvidha.gov.in / admin1234 (offline)");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
