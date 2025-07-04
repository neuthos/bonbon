import {NextResponse} from "next/server";
import {db} from "../../../../../lib/db";

export async function DELETE(
  request: Request,
  {params}: {params: {id: string}}
) {
  try {
    const orderCount = await db.order.count({
      where: {productCode: params.id},
    });

    if (orderCount > 0) {
      return NextResponse.json(
        {error: "Cannot delete product with existing orders"},
        {status: 400}
      );
    }

    await db.product.delete({
      where: {code: params.id},
    });

    return NextResponse.json({success: true});
  } catch (error) {
    return NextResponse.json(
      {error: "Failed to delete product"},
      {status: 500}
    );
  }
}
