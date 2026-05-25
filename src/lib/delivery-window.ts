export function formatCountdown(remainingMs: number): string {
  const totalSeconds = Math.max(0, Math.floor(remainingMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds]
    .map((n) => String(n).padStart(2, "0"))
    .join(":");
}

export function formatDeliveryDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${date.getFullYear()}`;
}

export type DeliveryWindowState = {
  remainingMs: number;
  orderDayLabel: "today" | "tomorrow";
  deliveryFrom: Date;
  deliveryTo: Date;
};

export function getDeliveryWindowState(
  cutoffHour: number,
  cutoffMinute: number,
  minDays: number,
  maxDays: number,
  now = new Date()
): DeliveryWindowState {
  const todayCutoff = new Date(now);
  todayCutoff.setHours(cutoffHour, cutoffMinute, 0, 0);

  const orderToday = now < todayCutoff;
  const target = orderToday
    ? todayCutoff
    : (() => {
        const next = new Date(todayCutoff);
        next.setDate(next.getDate() + 1);
        return next;
      })();

  const shipBase = new Date(now);
  shipBase.setHours(0, 0, 0, 0);
  if (!orderToday) {
    shipBase.setDate(shipBase.getDate() + 1);
  }

  const deliveryFrom = new Date(shipBase);
  deliveryFrom.setDate(deliveryFrom.getDate() + minDays);
  const deliveryTo = new Date(shipBase);
  deliveryTo.setDate(deliveryTo.getDate() + maxDays);

  return {
    remainingMs: Math.max(0, target.getTime() - now.getTime()),
    orderDayLabel: orderToday ? "today" : "tomorrow",
    deliveryFrom,
    deliveryTo,
  };
}
