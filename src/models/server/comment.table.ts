import { Permission, Role } from "node-appwrite";
import { db, commentTable } from "../name";
import { tablesDB } from "./config";

export default async function createCommentTable() {
  // Create Table
  await tablesDB.createTable({
    databaseId: db,
    tableId: commentTable,
    name: commentTable,
    permissions: [
      Permission.read(Role.any()),
      Permission.create(Role.users()),
      Permission.update(Role.users()),
      Permission.delete(Role.users()),
    ],
  });
  console.log("Comment table is created");

  // Create columns
  await Promise.all([
    tablesDB.createVarcharColumn({
      databaseId: db,
      tableId: commentTable,
      key: "content",
      size: 10000,
      required: true,
    }),
    tablesDB.createEnumColumn({
      databaseId: db,
      tableId: commentTable,
      key: "type",
      elements: ["answer", "question"],
      required: true,
    }),
    tablesDB.createVarcharColumn({
      databaseId: db,
      tableId: commentTable,
      key: "typeId",
      size: 50,
      required: true,
    }),
    tablesDB.createVarcharColumn({
      databaseId: db,
      tableId: commentTable,
      key: "authorId",
      size: 50,
      required: true,
    }),
  ]);
  console.log("Comment columns created");
}
