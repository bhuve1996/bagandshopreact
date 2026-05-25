import type { PrismaClient } from "@/generated/prisma/client";

export type ProductFaqInput = { question: string; answer: string };

type FaqDb = Pick<PrismaClient, "productFaq">;

export async function syncProductFaqs(
  prisma: FaqDb,
  productId: string,
  faqs: ProductFaqInput[]
) {
  await prisma.productFaq.deleteMany({ where: { productId } });
  if (faqs.length === 0) return;
  await prisma.productFaq.createMany({
    data: faqs.map((f, i) => ({
      productId,
      question: f.question.trim(),
      answer: f.answer.trim(),
      sortOrder: i,
    })),
  });
}

export async function seedProductFaqsFromMap(
  prisma: FaqDb & Pick<PrismaClient, "product">,
  faqsBySlug: Record<string, ProductFaqInput[]>
) {
  let count = 0;
  for (const [slug, faqs] of Object.entries(faqsBySlug)) {
    if (!faqs.length) continue;
    const product = await prisma.product.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!product) {
      console.warn(`  Skip FAQs: product "${slug}" not found`);
      continue;
    }
    await syncProductFaqs(prisma, product.id, faqs);
    count += faqs.length;
  }
  return count;
}
