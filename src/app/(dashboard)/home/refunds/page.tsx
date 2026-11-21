"use client";

import React, { useState } from "react";
import { RotateCcw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RefundableOrder {
  id: number;
  serviceName: string;
  link: string;
  quantity: number;
  charge: number;
  remains: number;
  status: "partial" | "cancelled";
  createdAt: string;
}

const refundableOrders: RefundableOrder[] = [];

export default function RefundsPage() {
  const [requestingId, setRequestingId] = useState<number | null>(null);
  const [refundedIds, setRefundedIds] = useState<Set<number>>(new Set());

  const handleRefund = async (orderId: number) => {
    setRequestingId(orderId);
    await new Promise((r) => setTimeout(r, 1200));
    setRefundedIds((prev) => new Set(prev).add(orderId));
    setRequestingId(null);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2.5 text-white">
          <RotateCcw className="size-6 text-gray-400" />
          تعويضات الطلبات (Refunds)
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          طلب تعويض أو استرداد للمبالغ المتبقية للطلبات الجزئية أو الملغاة
        </p>
      </div>

      {/* Info Banner */}
      <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex gap-3.5 shadow-md">
        <AlertCircle className="size-5 text-gray-400 shrink-0 mt-0.5" />
        <div className="text-sm text-gray-400 leading-relaxed">
          <p className="font-bold text-white mb-1">سياسة التعويض</p>
          <p>
            التعويضات متاحة فقط للطلبات التي حالتها <strong>مكتمل جزئياً (Partial)</strong> أو{" "}
            <strong>ملغي (Cancelled)</strong>. يتم احتساب مبلغ التعويض وفقاً للكمية المتبقية غير المنفذة وإرجاع الرصيد لحسابك.
          </p>
        </div>
      </div>

      {refundableOrders.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border border-zinc-800 bg-zinc-900/60 shadow-xl">
          <RotateCcw className="size-12 mx-auto text-gray-600 mb-4" />
          <h3 className="text-lg font-bold text-gray-300">
            لا توجد طلبات مؤهلة للتعويض حالياً
          </h3>
          <p className="text-sm text-gray-500 mt-1.5">
            عند وجود طلب ملغي أو غير مكتمل ستتمكن من طلب استرداد رصيدك مباشرة من هنا
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {refundableOrders.map((order) => {
            const isRefunded = refundedIds.has(order.id);
            const isRequesting = requestingId === order.id;
            const refundAmount =
              (order.remains / order.quantity) * order.charge;

            return (
              <div
                key={order.id}
                className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-gray-500">
                      #{order.id}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-lg text-xs font-medium border ${
                        order.status === "partial"
                          ? "bg-orange-950/40 text-orange-400 border-orange-800/40"
                          : "bg-red-950/40 text-red-400 border-red-800/40"
                      }`}
                    >
                      {order.status === "partial" ? "جزئي" : "ملغي"}
                    </span>
                  </div>
                  <p className="font-semibold text-white text-sm">{order.serviceName}</p>
                  <p className="text-xs text-gray-400">
                    المتبقي: {order.remains.toLocaleString()} / {order.quantity.toLocaleString()} •
                    مبلغ التعويض: <span className="text-white font-bold font-mono">${refundAmount.toFixed(4)}</span>
                  </p>
                </div>

                <div>
                  {isRefunded ? (
                    <span className="px-4 py-2 rounded-xl bg-zinc-800 text-gray-200 text-sm font-medium border border-zinc-700">
                      ✅ تم تقديم الطلب
                    </span>
                  ) : (
                    <Button
                      onClick={() => handleRefund(order.id)}
                      disabled={isRequesting}
                      className="bg-white hover:bg-gray-200 text-black font-bold rounded-xl cursor-pointer"
                    >
                      {isRequesting ? (
                        <span className="flex items-center gap-2">
                          <span className="size-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                          جاري المعالجة...
                        </span>
                      ) : (
                        "طلب التعويض"
                      )}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
