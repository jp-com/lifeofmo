import type { Metadata } from "next";
import OrderStatus from "./status";

export const metadata: Metadata = { title: "Your pre-order — Life of Mo", robots: { index: false, follow: false } };
export default function CompletePage() { return <OrderStatus />; }
