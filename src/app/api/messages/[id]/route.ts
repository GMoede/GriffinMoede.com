import { NextRequest, NextResponse } from "next/server";
import { deleteMessage } from "../../../../server/messages";
import { isAdmin } from "../../../../server/adminAuth";

// The admin page deletes one message.
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  const { id } = await params;
  try {
    await deleteMessage(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Deleting message failed:", e);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
