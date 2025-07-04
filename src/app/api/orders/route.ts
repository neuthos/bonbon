import {NextResponse} from "next/server";
import {db} from "../../../../lib/db";

export async function GET(request: Request) {
  const {searchParams} = new URL(request.url);
  const fromDate = searchParams.get("fromDate");
  const toDate = searchParams.get("toDate");

  const orders = await db.order.findMany({
    where: {
      date: {
        gte: fromDate ? new Date(fromDate) : undefined,
        lte: toDate ? new Date(toDate) : undefined,
      },
    },
    include: {
      product: true,
    },
  });

  return NextResponse.json(orders);
}

export async function POST(request: Request) {
  const {date, productCode, quantity, discount, admin, status} =
    await request.json();

  const order = await db.order.create({
    data: {
      date: new Date(date),
      productCode,
      quantity,
      discount,
      admin,
      status,
    },
  });

  return NextResponse.json(order);
}
