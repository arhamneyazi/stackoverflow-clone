import { Permission, Role } from "node-appwrite";
import { db, voteTable } from "../name";
import { tablesDB } from "./config";

export default async function createVoteTable() {
  // Create Table
  await tablesDB.createTable({
    databaseId: db,
    tableId: voteTable,
    name: voteTable,
    permissions: [
      Permission.read(Role.any()),
      Permission.create(Role.users()),
      Permission.update(Role.users()),
      Permission.delete(Role.users()),
    ],
  });
  console.log("Vote table is created");

  // Create columns
  await Promise.all([
    tablesDB.createEnumColumn({
      databaseId: db,
      tableId: voteTable,
      key: "type",
      elements: ["question", "answer"],
      required: true,
    }),
    tablesDB.createVarcharColumn({
      databaseId: db,
      tableId: voteTable,
      key: "typeId",
      size: 50,
      required: true,
    }),
    tablesDB.createEnumColumn({
      databaseId: db,
      tableId: voteTable,
      key: "voteStatus",
      elements: ["upvoted", "downvoted"],
      required: true,
    }),
    tablesDB.createVarcharColumn({
      databaseId: db,
      tableId: voteTable,
      key: "votedById",
      size: 50,
      required: true,
    }),
  ]);
  console.log("Vote columns created");
}
