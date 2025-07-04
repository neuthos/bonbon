import {NextResponse} from "next/server";
import {db} from "../../../../lib/db";

export async function GET() {
  try {
    const products = await db.product.findMany();
    const orders = await db.order.findMany({
      include: {
        product: true,
      },
    });

    const backup = {
      timestamp: new Date().toISOString(),
      data: {
        products,
        orders,
      },
    };

    return NextResponse.json(backup);
  } catch (error) {
    return NextResponse.json({error: "Failed to create backup"}, {status: 500});
  }
}
