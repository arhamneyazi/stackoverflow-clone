import { Permission, Role, TablesDBIndexType } from "node-appwrite";
import { db, questionTable } from "../name";
import { tablesDB } from "./config";

// Poll until the column is ready (Appwrite provisions columns asynchronously)
async function waitForColumn(tableId: string, key: string) {
  for (let attempt = 0; attempt < 60; attempt++) {
    const column = await tablesDB.getColumn({ databaseId: db, tableId, key });
    if (column.status === "available") return;
    if (column.status === "failed") {
      throw new Error(`Column ${key} failed to provision`);
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Column ${key} did not become available in time`);
}

export default async function createQuestionTable() {
  // Create Table
  await tablesDB.createTable({
    databaseId: db,
    tableId: questionTable,
    name: questionTable,
    permissions: [
      Permission.read(Role.any()),
      Permission.create(Role.users()),
      Permission.update(Role.users()),
      Permission.delete(Role.users()),
    ],
  });
  console.log("Question table is created");

  // Create columns
  await Promise.all([
    tablesDB.createVarcharColumn({
      databaseId: db,
      tableId: questionTable,
      key: "title",
      size: 100,
      required: true,
    }),
    tablesDB.createVarcharColumn({
      databaseId: db,
      tableId: questionTable,
      key: "content",
      size: 10000,
      required: true,
    }),
    tablesDB.createVarcharColumn({
      databaseId: db,
      tableId: questionTable,
      key: "authorId",
      size: 50,
      required: true,
    }),
    tablesDB.createVarcharColumn({
      databaseId: db,
      tableId: questionTable,
      key: "tags",
      size: 50,
      required: true,
      xdefault: undefined,
      array: true,
    }),
    tablesDB.createVarcharColumn({
      databaseId: db,
      tableId: questionTable,
      key: "attachmentId",
      size: 50,
      required: false,
    }),
  ]);
  console.log("Question columns created");

  // Indexed columns must be available before we can create indexes on them
  await Promise.all([
    waitForColumn(questionTable, "title"),
    waitForColumn(questionTable, "content"),
  ]);

  // Create indexes
  await Promise.all([
    tablesDB.createIndex({
      databaseId: db,
      tableId: questionTable,
      key: "title",
      type: TablesDBIndexType.Fulltext,
      columns: ["title"],
    }),
    tablesDB.createIndex({
      databaseId: db,
      tableId: questionTable,
      key: "content",
      type: TablesDBIndexType.Fulltext,
      columns: ["content"],
    }),
  ]);
  console.log("Question indexes created");
}
