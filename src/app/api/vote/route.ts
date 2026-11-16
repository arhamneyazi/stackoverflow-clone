import { answerTable, db, questionTable, voteTable } from "@/models/name";
import { tablesDB, users } from "@/models/server/config";
import { UserPrefs } from "@/store/Auth";
import { NextRequest, NextResponse } from "next/server";
import { ID, Query } from "node-appwrite";

export async function POST(request: NextRequest) {
  try {
    // Grab the data
    const { voteStatus, votedById, type, typeId } = await request.json();

    // List row (document)
    const response = await tablesDB.listRows({
      databaseId: db,
      tableId: voteTable,
      queries: [
        Query.equal("votedById", votedById),
        Query.equal("type", type),
        Query.equal("typeId", typeId),
      ],
    });

    if (response.rows.length > 0) {
      await tablesDB.deleteRow({
        databaseId: db,
        tableId: voteTable,
        rowId: response.rows[0].$id,
      });

      // Increase/decrease the reputation
      const QuestionOrAnswer = await tablesDB.getRow({
        databaseId: db,
        tableId: type === "question" ? questionTable : answerTable,
        rowId: typeId,
      });

      const authorPrefs = await users.getPrefs<UserPrefs>({
        userId: QuestionOrAnswer.authorId,
      });

      await users.updatePrefs<UserPrefs>({
        userId: QuestionOrAnswer.authorId,
        prefs: {
          reputation:
            response.rows[0].voteStatus === "upvoted"
              ? Number(authorPrefs.reputation) - 1
              : Number(authorPrefs.reputation) + 1,
        },
      });
    }

    // If there was no vote given earlier or if the previous voteStatus is not the same as what is being given now, eg., previously a downvote was given but now user is upvoting it
    if (response.rows[0]?.voteStatus !== voteStatus) {
      const row = await tablesDB.createRow({
        databaseId: db,
        tableId: voteTable,
        rowId: ID.unique(),
        data: { type, typeId, voteStatus, votedById },
      });

      // Increase/decrease the reputation
      const QuestionOrAnswer = await tablesDB.getRow({
        databaseId: db,
        tableId: type === "question" ? questionTable : answerTable,
        rowId: typeId,
      });

      const authorPrefs = await users.getPrefs<UserPrefs>({
        userId: QuestionOrAnswer.authorId,
      });

      // If vote was already present
      if (response.rows[0]) {
        await users.updatePrefs<UserPrefs>({
          userId: QuestionOrAnswer.authorId,
          prefs: {
            reputation:
              response.rows[0].voteStatus === "upvoted"
                ? Number(authorPrefs.reputation) - 1
                : Number(authorPrefs.reputation) + 1,
          },
        });
      } else {
        await users.updatePrefs<UserPrefs>({
          userId: QuestionOrAnswer.authorId,
          prefs: {
            reputation:
              voteStatus === "upvoted"
                ? Number(authorPrefs.reputation) + 1
                : Number(authorPrefs.reputation) - 1,
          },
        });
      }
    }

    const [upvotes, downvotes] = await Promise.all([
      tablesDB.listRows({
        databaseId: db,
        tableId: voteTable,
        queries: [
          Query.equal("voteStatus", "upvoted"),
          Query.equal("votedById", votedById),
          Query.equal("type", type),
          Query.equal("typeId", typeId),
          Query.limit(1),
        ],
      }),
      tablesDB.listRows({
        databaseId: db,
        tableId: voteTable,
        queries: [
          Query.equal("voteStatus", "downvoted"),
          Query.equal("votedById", votedById),
          Query.equal("type", type),
          Query.equal("typeId", typeId),
          Query.limit(1),
        ],
      }),
    ]);

    return NextResponse.json(
      {
        data: { row: null, voteResult: upvotes.total - downvotes.total },
        message: "Vote count displayed",
      },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Error in voting" },
      { status: error?.status || error?.code || 500 },
    );
  }
}
