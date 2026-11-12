import { Permission, Role, TablesDBIndexType } from "node-appwrite";
import { db, questionTable } from "../name";
import { tablesDB } from "./config";

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
}
