import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// All 66 Bible books with chapters count
const BIBLE_BOOKS = [
  // OLD TESTAMENT
  { name: "Gênesis", abbreviation: "Gn", testament: "OLD", position: 1, totalChapters: 50 },
  { name: "Êxodo", abbreviation: "Êx", testament: "OLD", position: 2, totalChapters: 40 },
  { name: "Levítico", abbreviation: "Lv", testament: "OLD", position: 3, totalChapters: 27 },
  { name: "Números", abbreviation: "Nm", testament: "OLD", position: 4, totalChapters: 36 },
  { name: "Deuteronômio", abbreviation: "Dt", testament: "OLD", position: 5, totalChapters: 34 },
  { name: "Josué", abbreviation: "Js", testament: "OLD", position: 6, totalChapters: 24 },
  { name: "Juízes", abbreviation: "Jz", testament: "OLD", position: 7, totalChapters: 21 },
  { name: "Rute", abbreviation: "Rt", testament: "OLD", position: 8, totalChapters: 4 },
  { name: "1 Samuel", abbreviation: "1Sm", testament: "OLD", position: 9, totalChapters: 31 },
  { name: "2 Samuel", abbreviation: "2Sm", testament: "OLD", position: 10, totalChapters: 24 },
  { name: "1 Reis", abbreviation: "1Rs", testament: "OLD", position: 11, totalChapters: 22 },
  { name: "2 Reis", abbreviation: "2Rs", testament: "OLD", position: 12, totalChapters: 25 },
  { name: "1 Crônicas", abbreviation: "1Cr", testament: "OLD", position: 13, totalChapters: 29 },
  { name: "2 Crônicas", abbreviation: "2Cr", testament: "OLD", position: 14, totalChapters: 36 },
  { name: "Esdras", abbreviation: "Ed", testament: "OLD", position: 15, totalChapters: 10 },
  { name: "Neemias", abbreviation: "Ne", testament: "OLD", position: 16, totalChapters: 13 },
  { name: "Ester", abbreviation: "Et", testament: "OLD", position: 17, totalChapters: 10 },
  { name: "Jó", abbreviation: "Jó", testament: "OLD", position: 18, totalChapters: 42 },
  { name: "Salmos", abbreviation: "Sl", testament: "OLD", position: 19, totalChapters: 150 },
  { name: "Provérbios", abbreviation: "Pv", testament: "OLD", position: 20, totalChapters: 31 },
  { name: "Eclesiastes", abbreviation: "Ec", testament: "OLD", position: 21, totalChapters: 12 },
  { name: "Cântico dos Cânticos", abbreviation: "Ct", testament: "OLD", position: 22, totalChapters: 8 },
  { name: "Isaías", abbreviation: "Is", testament: "OLD", position: 23, totalChapters: 66 },
  { name: "Jeremias", abbreviation: "Jr", testament: "OLD", position: 24, totalChapters: 52 },
  { name: "Lamentações", abbreviation: "Lm", testament: "OLD", position: 25, totalChapters: 5 },
  { name: "Ezequiel", abbreviation: "Ez", testament: "OLD", position: 26, totalChapters: 48 },
  { name: "Daniel", abbreviation: "Dn", testament: "OLD", position: 27, totalChapters: 12 },
  { name: "Oséias", abbreviation: "Os", testament: "OLD", position: 28, totalChapters: 14 },
  { name: "Joel", abbreviation: "Jl", testament: "OLD", position: 29, totalChapters: 3 },
  { name: "Amós", abbreviation: "Am", testament: "OLD", position: 30, totalChapters: 9 },
  { name: "Obadias", abbreviation: "Ob", testament: "OLD", position: 31, totalChapters: 1 },
  { name: "Jonas", abbreviation: "Jn", testament: "OLD", position: 32, totalChapters: 4 },
  { name: "Miquéias", abbreviation: "Mq", testament: "OLD", position: 33, totalChapters: 7 },
  { name: "Naum", abbreviation: "Na", testament: "OLD", position: 34, totalChapters: 3 },
  { name: "Habacuque", abbreviation: "Hc", testament: "OLD", position: 35, totalChapters: 3 },
  { name: "Sofonias", abbreviation: "Sf", testament: "OLD", position: 36, totalChapters: 3 },
  { name: "Ageu", abbreviation: "Ag", testament: "OLD", position: 37, totalChapters: 2 },
  { name: "Zacarias", abbreviation: "Zc", testament: "OLD", position: 38, totalChapters: 14 },
  { name: "Malaquias", abbreviation: "Ml", testament: "OLD", position: 39, totalChapters: 4 },
  // NEW TESTAMENT
  { name: "Mateus", abbreviation: "Mt", testament: "NEW", position: 40, totalChapters: 28 },
  { name: "Marcos", abbreviation: "Mc", testament: "NEW", position: 41, totalChapters: 16 },
  { name: "Lucas", abbreviation: "Lc", testament: "NEW", position: 42, totalChapters: 24 },
  { name: "João", abbreviation: "Jo", testament: "NEW", position: 43, totalChapters: 21 },
  { name: "Atos", abbreviation: "At", testament: "NEW", position: 44, totalChapters: 28 },
  { name: "Romanos", abbreviation: "Rm", testament: "NEW", position: 45, totalChapters: 16 },
  { name: "1 Coríntios", abbreviation: "1Co", testament: "NEW", position: 46, totalChapters: 16 },
  { name: "2 Coríntios", abbreviation: "2Co", testament: "NEW", position: 47, totalChapters: 13 },
  { name: "Gálatas", abbreviation: "Gl", testament: "NEW", position: 48, totalChapters: 6 },
  { name: "Efésios", abbreviation: "Ef", testament: "NEW", position: 49, totalChapters: 6 },
  { name: "Filipenses", abbreviation: "Fp", testament: "NEW", position: 50, totalChapters: 4 },
  { name: "Colossenses", abbreviation: "Cl", testament: "NEW", position: 51, totalChapters: 4 },
  { name: "1 Tessalonicenses", abbreviation: "1Ts", testament: "NEW", position: 52, totalChapters: 5 },
  { name: "2 Tessalonicenses", abbreviation: "2Ts", testament: "NEW", position: 53, totalChapters: 3 },
  { name: "1 Timóteo", abbreviation: "1Tm", testament: "NEW", position: 54, totalChapters: 6 },
  { name: "2 Timóteo", abbreviation: "2Tm", testament: "NEW", position: 55, totalChapters: 4 },
  { name: "Tito", abbreviation: "Tt", testament: "NEW", position: 56, totalChapters: 3 },
  { name: "Filemom", abbreviation: "Fm", testament: "NEW", position: 57, totalChapters: 1 },
  { name: "Hebreus", abbreviation: "Hb", testament: "NEW", position: 58, totalChapters: 13 },
  { name: "Tiago", abbreviation: "Tg", testament: "NEW", position: 59, totalChapters: 5 },
  { name: "1 Pedro", abbreviation: "1Pe", testament: "NEW", position: 60, totalChapters: 5 },
  { name: "2 Pedro", abbreviation: "2Pe", testament: "NEW", position: 61, totalChapters: 3 },
  { name: "1 João", abbreviation: "1Jo", testament: "NEW", position: 62, totalChapters: 5 },
  { name: "2 João", abbreviation: "2Jo", testament: "NEW", position: 63, totalChapters: 1 },
  { name: "3 João", abbreviation: "3Jo", testament: "NEW", position: 64, totalChapters: 1 },
  { name: "Judas", abbreviation: "Jd", testament: "NEW", position: 65, totalChapters: 1 },
  { name: "Apocalipse", abbreviation: "Ap", testament: "NEW", position: 66, totalChapters: 22 },
] as const;

const ACHIEVEMENTS = [
  { name: "Primeira Leitura", description: "Concluiu seu primeiro capítulo", icon: "🌱", condition: "FIRST_READ", threshold: 1 },
  { name: "3 dias seguidos", description: "Leu por 3 dias consecutivos", icon: "🔥", condition: "STREAK_DAYS", threshold: 3 },
  { name: "7 dias seguidos", description: "Uma semana de leitura constante", icon: "⚡", condition: "STREAK_DAYS", threshold: 7 },
  { name: "30 dias de leitura", description: "Um mês inteiro de leitura diária", icon: "🏆", condition: "STREAK_DAYS", threshold: 30 },
  { name: "Primeiro livro", description: "Concluiu seu primeiro livro bíblico", icon: "📗", condition: "BOOKS_COMPLETED", threshold: 1 },
  { name: "50 capítulos", description: "Chegou a 50 capítulos lidos", icon: "📖", condition: "CHAPTERS_READ", threshold: 50 },
  { name: "100 capítulos", description: "100 capítulos concluídos", icon: "💯", condition: "CHAPTERS_READ", threshold: 100 },
  { name: "500 capítulos", description: "Meio milhar de capítulos lidos", icon: "🎖️", condition: "CHAPTERS_READ", threshold: 500 },
  { name: "Primeira anotação", description: "Criou sua primeira reflexão", icon: "✍️", condition: "NOTES_CREATED", threshold: 1 },
  { name: "10 favoritos", description: "Salvou 10 versículos favoritos", icon: "⭐", condition: "FAVORITES_SAVED", threshold: 10 },
  { name: "Evangelhos concluídos", description: "Leu os quatro evangelhos", icon: "✝️", condition: "BOOKS_COMPLETED", threshold: 4 },
  { name: "Bíblia Completa", description: "Leu toda a Bíblia — conquista máxima!", icon: "👑", condition: "BIBLE_COMPLETED", threshold: 1 },
] as const;

const MOTIVATIONAL_MESSAGES = [
  "Cada capítulo lido é um passo mais próximo de Deus.",
  "A Palavra de Deus é viva e eficaz. Continue lendo!",
  "A fidelidade na leitura diária transforma o coração.",
  "Você está construindo algo eterno. Continue!",
  "A Bíblia é a carta de amor de Deus para você.",
  "Hoje é o melhor dia para ler a Palavra.",
  "Cada versículo é uma semente de fé no seu coração.",
  "Não desanime. A constância é mais valiosa que a velocidade.",
  "Sua jornada bíblica começa com um capítulo por vez.",
  "A leitura da Bíblia renova a mente e fortalece o espírito.",
] as const;

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...\n");

  // 1. Criar admin padrão
  const adminEmail = "admin@jornadabiblica.app";
  const adminExists = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!adminExists) {
    await prisma.user.create({
      data: {
        name: "Administrador",
        email: adminEmail,
        password: await bcrypt.hash("Admin@123456", 12),
        role: "ADMIN",
        profile: { create: { onboardingCompleted: true } },
      },
    });
    console.log("✅ Admin criado: admin@jornadabiblica.app / Admin@123456");
  } else {
    console.log("⏭️  Admin já existe");
  }

  // 2. Criar livros bíblicos e capítulos
  console.log("\n📚 Criando livros bíblicos...");
  let booksCreated = 0;

  for (const bookData of BIBLE_BOOKS) {
    const existing = await prisma.bibleBook.findFirst({
      where: { position: bookData.position },
    });

    if (existing) continue;

    const book = await prisma.bibleBook.create({
      data: {
        name: bookData.name,
        abbreviation: bookData.abbreviation,
        testament: bookData.testament,
        position: bookData.position,
        totalChapters: bookData.totalChapters,
      },
    });

    // Create chapters for this book
    const chapters = Array.from({ length: bookData.totalChapters }, (_, i) => ({
      bookId: book.id,
      number: i + 1,
      totalVerses: 0, // Will be updated when verses are added
    }));

    await prisma.bibleChapter.createMany({ data: chapters });
    booksCreated++;
    process.stdout.write(`  ✓ ${bookData.name} (${bookData.totalChapters} cap.)\n`);
  }

  if (booksCreated === 0) {
    console.log("  ⏭️  Livros já existem");
  } else {
    console.log(`\n  Total: ${booksCreated} livros criados`);
  }

  // 3. Criar planos de leitura
  console.log("\n📖 Criando planos de leitura...");

  const existingPlans = await prisma.readingPlan.count();
  if (existingPlans === 0) {
    // Get all books and chapters ordered
    const books = await prisma.bibleBook.findMany({
      orderBy: { position: "asc" },
      include: { chapters: { orderBy: { number: "asc" } } },
    });

    const allChapters = books.flatMap((b) => b.chapters);

    // Plan 1: Bíblia em 1 Ano (ordem bíblica)
    const plan1Year = await prisma.readingPlan.create({
      data: {
        name: "Bíblia em 1 Ano",
        description: "Leia toda a Bíblia em 365 dias, seguindo a ordem dos livros de Gênesis a Apocalipse.",
        type: "BIBLICAL_ORDER",
        durationDays: 365,
        isDefault: true,
        isActive: true,
      },
    });

    // ~3.26 chapters per day
    const chaptersPerDay = Math.ceil(allChapters.length / 365);
    const planItems: { planId: string; dayNumber: number; order: number; bookId: string; chapterId: string }[] = [];

    for (let day = 0; day < 365; day++) {
      const start = day * chaptersPerDay;
      const dayChapters = allChapters.slice(start, start + chaptersPerDay);
      dayChapters.forEach((ch, order) => {
        planItems.push({ planId: plan1Year.id, dayNumber: day + 1, order, bookId: ch.bookId, chapterId: ch.id });
      });
    }

    await prisma.readingPlanItem.createMany({ data: planItems });
    console.log(`  ✓ Bíblia em 1 Ano (${planItems.length} itens)`);

    // Plan 2: Bíblia em 6 meses
    const plan6Months = await prisma.readingPlan.create({
      data: {
        name: "Bíblia em 6 Meses",
        description: "Um ritmo intensivo para quem quer concluir a leitura da Bíblia em 180 dias.",
        type: "BIBLICAL_ORDER",
        durationDays: 180,
        isActive: true,
      },
    });

    const chapPerDay6m = Math.ceil(allChapters.length / 180);
    const items6m: { planId: string; dayNumber: number; order: number; bookId: string; chapterId: string }[] = [];
    for (let day = 0; day < 180; day++) {
      const start = day * chapPerDay6m;
      allChapters.slice(start, start + chapPerDay6m).forEach((ch, o) => {
        items6m.push({ planId: plan6Months.id, dayNumber: day + 1, order: o, bookId: ch.bookId, chapterId: ch.id });
      });
    }
    await prisma.readingPlanItem.createMany({ data: items6m });
    console.log(`  ✓ Bíblia em 6 Meses (${items6m.length} itens)`);

    // Plan 3: Evangelhos (for new readers)
    const planEvangelhos = await prisma.readingPlan.create({
      data: {
        name: "Os Evangelhos",
        description: "Comece pelo coração do Novo Testamento: a vida de Jesus nos quatro evangelhos.",
        type: "BY_STORY",
        durationDays: 89,
        isActive: true,
      },
    });

    const gospelBooks = books.filter((b) => ["Mateus", "Marcos", "Lucas", "João"].includes(b.name));
    const gospelChapters = gospelBooks.flatMap((b) => b.chapters);
    const gospelItems: { planId: string; dayNumber: number; order: number; bookId: string; chapterId: string }[] = [];

    gospelChapters.forEach((ch, i) => {
      gospelItems.push({ planId: planEvangelhos.id, dayNumber: i + 1, order: 0, bookId: ch.bookId, chapterId: ch.id });
    });
    await prisma.readingPlanItem.createMany({ data: gospelItems });
    console.log(`  ✓ Os Evangelhos (${gospelItems.length} itens)`);

    // Plan 4: Novo Testamento em 90 dias
    const planNT = await prisma.readingPlan.create({
      data: {
        name: "Novo Testamento em 90 Dias",
        description: "Leia todo o Novo Testamento em 3 meses, conhecendo a vida de Jesus e a Igreja primitiva.",
        type: "BIBLICAL_ORDER",
        durationDays: 90,
        isActive: true,
      },
    });

    const ntChapters = books.filter((b) => b.testament === "NEW").flatMap((b) => b.chapters);
    const ntChapPerDay = Math.ceil(ntChapters.length / 90);
    const ntItems: { planId: string; dayNumber: number; order: number; bookId: string; chapterId: string }[] = [];
    for (let day = 0; day < 90; day++) {
      ntChapters.slice(day * ntChapPerDay, (day + 1) * ntChapPerDay).forEach((ch, o) => {
        ntItems.push({ planId: planNT.id, dayNumber: day + 1, order: o, bookId: ch.bookId, chapterId: ch.id });
      });
    }
    await prisma.readingPlanItem.createMany({ data: ntItems });
    console.log(`  ✓ Novo Testamento em 90 Dias (${ntItems.length} itens)`);

    // Plan 5: Salmos e Provérbios (30 dias)
    const planSalmos = await prisma.readingPlan.create({
      data: {
        name: "Sabedoria: Salmos e Provérbios",
        description: "Um mês meditando na poesia e sabedoria de Deus através dos Salmos e Provérbios.",
        type: "BY_THEME",
        durationDays: 30,
        isActive: true,
      },
    });

    const wisdomBooks = books.filter((b) => ["Salmos", "Provérbios"].includes(b.name));
    const wisdomChapters = wisdomBooks.flatMap((b) => b.chapters).slice(0, 30);
    const wisdomItems = wisdomChapters.map((ch, i) => ({
      planId: planSalmos.id, dayNumber: i + 1, order: 0, bookId: ch.bookId, chapterId: ch.id,
    }));
    await prisma.readingPlanItem.createMany({ data: wisdomItems });
    console.log(`  ✓ Sabedoria: Salmos e Provérbios (${wisdomItems.length} itens)`);

  } else {
    console.log("  ⏭️  Planos já existem");
  }

  // 4. Conquistas
  console.log("\n🏆 Criando conquistas...");
  const existingAchievements = await prisma.achievement.count();

  if (existingAchievements === 0) {
    await prisma.achievement.createMany({ data: ACHIEVEMENTS as never });
    console.log(`  ✓ ${ACHIEVEMENTS.length} conquistas criadas`);
  } else {
    console.log("  ⏭️  Conquistas já existem");
  }

  // 5. Mensagens motivacionais
  console.log("\n💬 Criando mensagens motivacionais...");
  const existingMessages = await prisma.motivationalMessage.count();

  if (existingMessages === 0) {
    await prisma.motivationalMessage.createMany({
      data: MOTIVATIONAL_MESSAGES.map((text) => ({ text, isActive: true })),
    });
    console.log(`  ✓ ${MOTIVATIONAL_MESSAGES.length} mensagens criadas`);
  } else {
    console.log("  ⏭️  Mensagens já existem");
  }

  console.log("\n✅ Seed concluído com sucesso!\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🔑 Acesso admin: admin@jornadabiblica.app");
  console.log("🔑 Senha: Admin@123456");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
