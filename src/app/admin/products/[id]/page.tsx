import { ProductFormAdmin } from "@/features/admin/product-form-admin";

type Props = { params: Promise<{ id: string }> };

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  return <ProductFormAdmin productId={id} />;
}
