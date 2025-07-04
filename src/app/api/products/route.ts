import {NextResponse} from "next/server";
import {db} from "../../../../lib/db";

export async function GET() {
  const products = await db.product.findMany();
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  const {name, color, priceModal, priceJual, link} = await request.json();

  const code = `${name}_${color}`.toLowerCase().replace(/\s+/g, "_");

  const product = await db.product.create({
    data: {
      code,
      name,
      color,
      priceModal,
      priceJual,
      link,
    },
  });

  return NextResponse.json(product);
}
