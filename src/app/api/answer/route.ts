import { answerTable, db } from "@/models/name";
import { tablesDB, users } from "@/models/server/config";
import { NextRequest, NextResponse } from "next/server";
import { ID } from "node-appwrite";
import type { UserPrefs } from "@/store/Auth";

export async function POST(request: NextRequest) {
  try {
    const { questionId, answer, authorId } = await request.json();

    const response = await tablesDB.createRow({
      databaseId: db,
      tableId: answerTable,
      rowId: ID.unique(),
      data: { content: answer, authorId, questionId },
    });

    // Increase author reputation
    const prefs = await users.getPrefs<UserPrefs>({ userId: authorId });
    await users.updatePrefs({
      userId: authorId,
      prefs: { reputation: Number(prefs.reputation) + 1 },
    });

    return NextResponse.json({ data: response }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Error creating answer" },
      { status: error?.status || error?.code || 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { answerId } = await request.json();

    const answer = await tablesDB.getRow({
      databaseId: db,
      tableId: answerTable,
      rowId: answerId,
    });

    if (!answer) {
      throw new Error("Answer does not exist");
    }

    const response = await tablesDB.deleteRow({
      databaseId: db,
      tableId: answerTable,
      rowId: answerId,
    });

    // Decrease the reputation
    const prefs = await users.getPrefs<UserPrefs>({
      userId: answer.authorId,
    });
    await users.updatePrefs({
      userId: answer.authorId,
      prefs: { reputation: Number(prefs.reputation) - 1 },
    });

    return NextResponse.json({ data: response }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Error deleting answer" },
      { status: error?.status || error?.code || 500 },
    );
  }
}
