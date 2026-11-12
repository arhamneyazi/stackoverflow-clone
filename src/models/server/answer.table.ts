import { Permission, Role } from "node-appwrite";
import { db, answerTable } from "../name";
import { tablesDB } from "./config";

export default async function createAnswerTable() {
  // Create Table
  await tablesDB.createTable({
    databaseId: db,
    tableId: answerTable,
    name: answerTable,
    permissions: [
      Permission.read(Role.any()),
      Permission.create(Role.users()),
      Permission.update(Role.users()),
      Permission.delete(Role.users()),
    ],
  });
  console.log("Answer table is created");

  // Create columns
  await Promise.all([
    tablesDB.createVarcharColumn({
      databaseId: db,
      tableId: answerTable,
      key: "content",
      size: 10000,
      required: true,
    }),
    tablesDB.createVarcharColumn({
      databaseId: db,
      tableId: answerTable,
      key: "questionId",
      size: 50,
      required: true,
    }),
    tablesDB.createVarcharColumn({
      databaseId: db,
      tableId: answerTable,
      key: "authorId",
      size: 50,
      required: true,
    }),
  ]);
  console.log("Answer columns created");
}
