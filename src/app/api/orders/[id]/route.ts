import {NextResponse} from "next/server";
import {db} from "../../../../../lib/db";

export async function DELETE(
  request: Request,
  {params}: {params: {id: string}}
) {
  try {
    await db.order.delete({
      where: {id: params.id},
    });

    return NextResponse.json({success: true});
  } catch (error) {
    return NextResponse.json({error: "Failed to delete order"}, {status: 500});
  }
}

export async function PUT(request: Request, {params}: {params: {id: string}}) {
  try {
    const body = await request.json();

    const order = await db.order.update({
      where: {id: params.id},
      data: body,
    });

    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({error: "Failed to update order"}, {status: 500});
  }
}
