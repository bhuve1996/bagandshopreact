import { OrderDetailAdmin } from "@/features/admin/order-detail-admin";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  return { title: `Admin — Order ${id}` };
}

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params;
  return <OrderDetailAdmin orderId={id} />;
}
