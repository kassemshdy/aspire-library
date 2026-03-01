import { PrismaClient, BookStatus, LoanStatus } from "@prisma/client";

const prisma = new PrismaClient();

const BOOKS_DATA = [
  // Fiction
  { title: "The Midnight Library", author: "Matt Haig", category: "Fiction", year: 2020, description: "Between life and death there is a library, and within that library, the shelves go on forever. Every book provides a chance to try another life you could have lived." },
  { title: "Where the Crawdads Sing", author: "Delia Owens", category: "Fiction", year: 2018, description: "A coming-of-age story of a young girl raised by the marshlands of North Carolina." },
  { title: "The Silent Patient", author: "Alex Michaelides", category: "Fiction", year: 2019, description: "A woman's act of violence against her husband and her refusal to speak shocks the nation." },
  { title: "Educated", author: "Tara Westover", category: "Memoir", year: 2018, description: "A memoir about a young woman who leaves her survivalist family and goes on to earn a PhD from Cambridge." },
  { title: "Becoming", author: "Michelle Obama", category: "Memoir", year: 2018, description: "Former First Lady Michelle Obama's memoir about her life and experiences." },

  // Science Fiction
  { title: "Project Hail Mary", author: "Andy Weir", category: "Science Fiction", year: 2021, description: "A lone astronaut must save Earth from disaster in this gripping tale of survival." },
  { title: "Dune", author: "Frank Herbert", category: "Science Fiction", year: 1965, description: "The epic story of Paul Atreides and the desert planet Arrakis." },
  { title: "The Three-Body Problem", author: "Cixin Liu", category: "Science Fiction", year: 2008, description: "China's secret military project sends signals into space to establish contact with aliens." },
  { title: "Neuromancer", author: "William Gibson", category: "Science Fiction", year: 1984, description: "The groundbreaking cyberpunk novel that defined a genre." },
  { title: "Foundation", author: "Isaac Asimov", category: "Science Fiction", year: 1951, description: "The first book in Asimov's legendary Foundation series about the fall and rise of galactic civilizations." },

  // Fantasy
  { title: "The Name of the Wind", author: "Patrick Rothfuss", category: "Fantasy", year: 2007, description: "The tale of the magically gifted young man who grows to be the most notorious wizard his world has ever seen." },
  { title: "The Way of Kings", author: "Brandon Sanderson", category: "Fantasy", year: 2010, description: "The first book in the epic Stormlight Archive series." },
  { title: "The Fifth Season", author: "N.K. Jemisin", category: "Fantasy", year: 2015, description: "A woman searches for her daughter in a world constantly threatened by catastrophic seismic events." },
  { title: "The Priory of the Orange Tree", author: "Samantha Shannon", category: "Fantasy", year: 2019, description: "An epic standalone fantasy about a world divided by a thousand-year-old conflict." },
  { title: "Circe", author: "Madeline Miller", category: "Fantasy", year: 2018, description: "A stunning reimagining of the life of Circe, the sorceress from Greek mythology." },

  // Mystery/Thriller
  { title: "The Girl with the Dragon Tattoo", author: "Stieg Larsson", category: "Mystery", year: 2005, description: "A journalist and a hacker investigate a decades-old disappearance." },
  { title: "Gone Girl", author: "Gillian Flynn", category: "Thriller", year: 2012, description: "A wife's disappearance becomes a media sensation and her husband is the prime suspect." },
  { title: "The Da Vinci Code", author: "Dan Brown", category: "Thriller", year: 2003, description: "A murder in the Louvre leads to a trail of clues hidden in the works of Leonardo da Vinci." },
  { title: "Big Little Lies", author: "Liane Moriarty", category: "Mystery", year: 2014, description: "Three women's seemingly perfect lives unravel to the point of murder." },
  { title: "The Woman in the Window", author: "A.J. Finn", category: "Thriller", year: 2018, description: "An agoraphobic woman witnesses something she shouldn't have from her window." },

  // Non-Fiction
  { title: "Sapiens", author: "Yuval Noah Harari", category: "Non-Fiction", year: 2011, description: "A brief history of humankind from the Stone Age to the modern age." },
  { title: "Atomic Habits", author: "James Clear", category: "Self-Help", year: 2018, description: "An easy and proven way to build good habits and break bad ones." },
  { title: "Thinking, Fast and Slow", author: "Daniel Kahneman", category: "Psychology", year: 2011, description: "Explores the two systems that drive the way we think and make decisions." },
  { title: "The Immortal Life of Henrietta Lacks", author: "Rebecca Skloot", category: "Non-Fiction", year: 2010, description: "The story of Henrietta Lacks and the immortal cell line grown from her cancer cells." },
  { title: "Bad Blood", author: "John Carreyrou", category: "Non-Fiction", year: 2018, description: "The full inside story of the breathtaking rise and shocking collapse of Theranos." },

  // Classic Literature
  { title: "1984", author: "George Orwell", category: "Classic", year: 1949, description: "A dystopian social science fiction novel and cautionary tale about totalitarianism." },
  { title: "To Kill a Mockingbird", author: "Harper Lee", category: "Classic", year: 1960, description: "A novel about racial injustice and the loss of innocence in the American South." },
  { title: "Pride and Prejudice", author: "Jane Austen", category: "Classic", year: 1813, description: "A romantic novel of manners that critiques the British landed gentry." },
  { title: "The Great Gatsby", author: "F. Scott Fitzgerald", category: "Classic", year: 1925, description: "A story of the mysteriously wealthy Jay Gatsby and his love for Daisy Buchanan." },
  { title: "Brave New World", author: "Aldous Huxley", category: "Classic", year: 1932, description: "A dystopian novel set in a futuristic World State of genetically modified citizens." },

  // Historical Fiction
  { title: "All the Light We Cannot See", author: "Anthony Doerr", category: "Historical Fiction", year: 2014, description: "The lives of a blind French girl and a German boy collide during World War II." },
  { title: "The Book Thief", author: "Markus Zusak", category: "Historical Fiction", year: 2005, description: "Death narrates the story of a young girl living in Nazi Germany who steals books." },
  { title: "The Nightingale", author: "Kristin Hannah", category: "Historical Fiction", year: 2015, description: "Two sisters in France struggle to survive during World War II." },
  { title: "The Pillars of the Earth", author: "Ken Follett", category: "Historical Fiction", year: 1989, description: "An epic tale of the building of a cathedral in 12th century England." },
  { title: "Wolf Hall", author: "Hilary Mantel", category: "Historical Fiction", year: 2009, description: "Thomas Cromwell's rise to power in the court of Henry VIII." },

  // Biography
  { title: "Steve Jobs", author: "Walter Isaacson", category: "Biography", year: 2011, description: "The authorized biography of Apple co-founder Steve Jobs." },
  { title: "Leonardo da Vinci", author: "Walter Isaacson", category: "Biography", year: 2017, description: "A biography of the Renaissance genius who epitomized the era." },
  { title: "The Wright Brothers", author: "David McCullough", category: "Biography", year: 2015, description: "The dramatic story of the courageous brothers who taught the world how to fly." },
  { title: "Long Walk to Freedom", author: "Nelson Mandela", category: "Biography", year: 1994, description: "Nelson Mandela's autobiography chronicling his journey from childhood to president." },
  { title: "Unbroken", author: "Laura Hillenbrand", category: "Biography", year: 2010, description: "A World War II story of survival, resilience, and redemption." },

  // Science
  { title: "A Brief History of Time", author: "Stephen Hawking", category: "Science", year: 1988, description: "From the Big Bang to black holes, a landmark volume in science writing." },
  { title: "The Selfish Gene", author: "Richard Dawkins", category: "Science", year: 1976, description: "A gene-centered view of evolution that revolutionized biology." },
  { title: "Cosmos", author: "Carl Sagan", category: "Science", year: 1980, description: "A journey through space and time exploring the universe and our place in it." },
  { title: "The Gene", author: "Siddhartha Mukherjee", category: "Science", year: 2016, description: "An intimate history of genetics and its impact on our lives." },
  { title: "Astrophysics for People in a Hurry", author: "Neil deGrasse Tyson", category: "Science", year: 2017, description: "Essential concepts about the universe explained in clear and accessible language." },

  // Young Adult
  { title: "The Hunger Games", author: "Suzanne Collins", category: "Young Adult", year: 2008, description: "In a dystopian future, teens are forced to compete in a televised fight to the death." },
  { title: "The Fault in Our Stars", author: "John Green", category: "Young Adult", year: 2012, description: "Two teens meet in a cancer support group and fall in love." },
  { title: "Six of Crows", author: "Leigh Bardugo", category: "Young Adult", year: 2015, description: "Six dangerous outcasts attempt an impossible heist in this fantasy novel." },
  { title: "The Hate U Give", author: "Angie Thomas", category: "Young Adult", year: 2017, description: "A teen witnesses the fatal shooting of her childhood friend by a police officer." },
  { title: "Children of Blood and Bone", author: "Tomi Adeyemi", category: "Young Adult", year: 2018, description: "A young girl fights to restore magic to her divided land." },

  // Romance
  { title: "The Seven Husbands of Evelyn Hugo", author: "Taylor Jenkins Reid", category: "Romance", year: 2017, description: "A reclusive Hollywood icon tells her life story to an unknown magazine reporter." },
  { title: "Red, White & Royal Blue", author: "Casey McQuiston", category: "Romance", year: 2019, description: "The son of the US president falls in love with a British prince." },
  { title: "Beach Read", author: "Emily Henry", category: "Romance", year: 2020, description: "Two writers with different genres challenge each other to write in the other's style." },
  { title: "People We Meet on Vacation", author: "Emily Henry", category: "Romance", year: 2021, description: "Two best friends take one last vacation to repair their friendship." },
  { title: "The Hating Game", author: "Sally Thorne", category: "Romance", year: 2016, description: "Two executive assistants hate each other—or do they?" },

  // Horror
  { title: "The Shining", author: "Stephen King", category: "Horror", year: 1977, description: "A family's winter caretaking job at a haunted hotel turns deadly." },
  { title: "It", author: "Stephen King", category: "Horror", year: 1986, description: "Seven children face their worst nightmare—an evil entity that preys on fear." },
  { title: "Mexican Gothic", author: "Silvia Moreno-Garcia", category: "Horror", year: 2020, description: "A socialite visits her cousin's mysterious mansion in 1950s Mexico." },
  { title: "The Haunting of Hill House", author: "Shirley Jackson", category: "Horror", year: 1959, description: "Four seekers arrive at a notoriously unfriendly house to investigate paranormal activity." },
  { title: "Bird Box", author: "Josh Malerman", category: "Horror", year: 2014, description: "A woman and her children must navigate a river blindfolded to escape a mysterious force." },

  // Business
  { title: "The Lean Startup", author: "Eric Ries", category: "Business", year: 2011, description: "How today's entrepreneurs use continuous innovation to create radically successful businesses." },
  { title: "Zero to One", author: "Peter Thiel", category: "Business", year: 2014, description: "Notes on startups and how to build the future from the PayPal co-founder." },
  { title: "Good to Great", author: "Jim Collins", category: "Business", year: 2001, description: "Why some companies make the leap from good to great and others don't." },
  { title: "The Innovator's Dilemma", author: "Clayton Christensen", category: "Business", year: 1997, description: "Why new technologies cause great firms to fail." },
  { title: "Shoe Dog", author: "Phil Knight", category: "Business", year: 2016, description: "A memoir by the creator of Nike about the company's early days." },

  // Poetry
  { title: "Milk and Honey", author: "Rupi Kaur", category: "Poetry", year: 2014, description: "A collection of poetry and prose about survival, femininity, and love." },
  { title: "The Sun and Her Flowers", author: "Rupi Kaur", category: "Poetry", year: 2017, description: "A journey of wilting, falling, rooting, rising, and blooming." },
  { title: "Leaves of Grass", author: "Walt Whitman", category: "Poetry", year: 1855, description: "A poetry collection celebrating the human body and nature." },
  { title: "The Waste Land", author: "T.S. Eliot", category: "Poetry", year: 1922, description: "One of the most important poems of the 20th century." },
  { title: "Where the Sidewalk Ends", author: "Shel Silverstein", category: "Poetry", year: 1974, description: "A collection of poems and drawings for children of all ages." },
];

async function main() {
  // Check if database already has data
  const existingBooks = await prisma.book.count();

  // Allow force seeding via environment variable
  const forceSeed = process.env.FORCE_SEED === "true";

  if (existingBooks > 0 && !forceSeed) {
    console.log("📚 Database already has data. Skipping seed.");
    console.log(`   Found ${existingBooks} existing books.`);
    console.log("\n💡 To force seed, set FORCE_SEED=true environment variable");
    console.log("💡 Or manually delete data first: npx prisma migrate reset");
    return;
  }

  if (existingBooks > 0 && forceSeed) {
    console.log("🗑️  FORCE_SEED=true - Clearing existing data...");

    // Delete in correct order due to foreign key constraints
    await prisma.auditLog.deleteMany();
    await prisma.loan.deleteMany();
    await prisma.book.deleteMany();
    await prisma.session.deleteMany();
    await prisma.account.deleteMany();
    await prisma.user.deleteMany();

    console.log("✅ Database cleared!");
  } else {
    console.log("🌱 Database is empty. Starting seed...");
  }

  console.log("\n📚 Creating library data...\n");

  // Create users
  console.log("👥 Creating users...");
  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@library.com",
      role: "ADMIN",
    },
  });

  const librarian1 = await prisma.user.create({
    data: {
      name: "Sarah Johnson",
      email: "librarian@library.com",
      role: "LIBRARIAN",
    },
  });

  const librarian2 = await prisma.user.create({
    data: {
      name: "Michael Chen",
      email: "michael.chen@library.com",
      role: "LIBRARIAN",
    },
  });

  const member1 = await prisma.user.create({
    data: {
      name: "Emily Davis",
      email: "emily.davis@example.com",
      role: "MEMBER",
    },
  });

  const member2 = await prisma.user.create({
    data: {
      name: "James Wilson",
      email: "james.wilson@example.com",
      role: "MEMBER",
    },
  });

  const member3 = await prisma.user.create({
    data: {
      name: "Sofia Rodriguez",
      email: "sofia.rodriguez@example.com",
      role: "MEMBER",
    },
  });

  const member4 = await prisma.user.create({
    data: {
      name: "David Kim",
      email: "david.kim@example.com",
      role: "MEMBER",
    },
  });

  console.log(`✅ Created ${await prisma.user.count()} users`);

  // Create books
  console.log("\n📖 Creating books...");
  const createdBooks = [];

  for (const bookData of BOOKS_DATA) {
    const book = await prisma.book.create({
      data: {
        title: bookData.title,
        author: bookData.author,
        category: bookData.category,
        publishedYear: bookData.year,
        description: bookData.description,
        status: BookStatus.AVAILABLE,
      },
    });
    createdBooks.push(book);

    // Create audit log for book creation
    await prisma.auditLog.create({
      data: {
        action: "BOOK_CREATE",
        entityType: "Book",
        entityId: book.id,
        userId: Math.random() > 0.5 ? librarian1.id : librarian2.id,
        metadata: book,
      },
    });
  }

  console.log(`✅ Created ${createdBooks.length} books`);

  // Create some loans (checkout some books)
  console.log("\n🔄 Creating loan records...");
  const members = [member1, member2, member3, member4];
  const now = new Date();
  let loanCount = 0;

  // Check out 15 books to various members
  for (let i = 0; i < 15; i++) {
    const book = createdBooks[i];
    const member = members[i % members.length];
    const daysAgo = Math.floor(Math.random() * 10);
    const checkedOutDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    const dueDate = new Date(checkedOutDate.getTime() + 14 * 24 * 60 * 60 * 1000);

    // Update book status
    await prisma.book.update({
      where: { id: book.id },
      data: { status: BookStatus.CHECKED_OUT },
    });

    // Create loan
    const loan = await prisma.loan.create({
      data: {
        bookId: book.id,
        userId: member.id,
        checkedOutAt: checkedOutDate,
        dueAt: dueDate,
        status: LoanStatus.CHECKED_OUT,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: "LOAN_CHECKOUT",
        entityType: "Loan",
        entityId: loan.id,
        userId: member.id,
        metadata: loan,
      },
    });

    loanCount++;
  }

  // Create some completed loans (returned books)
  for (let i = 15; i < 30; i++) {
    const book = createdBooks[i];
    const member = members[i % members.length];
    const daysAgo = Math.floor(Math.random() * 30) + 14;
    const checkedOutDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    const dueDate = new Date(checkedOutDate.getTime() + 14 * 24 * 60 * 60 * 1000);
    const returnedDate = new Date(checkedOutDate.getTime() + Math.floor(Math.random() * 14) * 24 * 60 * 60 * 1000);

    const loan = await prisma.loan.create({
      data: {
        bookId: book.id,
        userId: member.id,
        checkedOutAt: checkedOutDate,
        dueAt: dueDate,
        returnedAt: returnedDate,
        status: LoanStatus.RETURNED,
      },
    });

    // Create audit logs for checkout and return
    await prisma.auditLog.create({
      data: {
        action: "LOAN_CHECKOUT",
        entityType: "Loan",
        entityId: loan.id,
        userId: member.id,
        metadata: loan,
        createdAt: checkedOutDate,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "LOAN_RETURN",
        entityType: "Loan",
        entityId: loan.id,
        userId: member.id,
        metadata: loan,
        createdAt: returnedDate,
      },
    });

    loanCount++;
  }

  console.log(`✅ Created ${loanCount} loan records`);

  // Final statistics
  console.log("\n📊 Database Statistics:");
  console.log("========================");
  console.log(`👥 Users: ${await prisma.user.count()}`);
  console.log(`   - Admins: ${await prisma.user.count({ where: { role: "ADMIN" } })}`);
  console.log(`   - Librarians: ${await prisma.user.count({ where: { role: "LIBRARIAN" } })}`);
  console.log(`   - Members: ${await prisma.user.count({ where: { role: "MEMBER" } })}`);
  console.log(`\n📚 Books: ${await prisma.book.count()}`);
  console.log(`   - Available: ${await prisma.book.count({ where: { status: BookStatus.AVAILABLE } })}`);
  console.log(`   - Checked Out: ${await prisma.book.count({ where: { status: BookStatus.CHECKED_OUT } })}`);
  console.log(`\n🔄 Loans: ${await prisma.loan.count()}`);
  console.log(`   - Active: ${await prisma.loan.count({ where: { status: LoanStatus.CHECKED_OUT } })}`);
  console.log(`   - Returned: ${await prisma.loan.count({ where: { status: LoanStatus.RETURNED } })}`);
  console.log(`\n📋 Audit Logs: ${await prisma.auditLog.count()}`);
  console.log("\n✨ Seed completed successfully!");
  console.log("\n🔑 Test Users:");
  console.log("   - admin@library.com (ADMIN)");
  console.log("   - librarian@library.com (LIBRARIAN)");
  console.log("   - emily.davis@example.com (MEMBER)");
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
