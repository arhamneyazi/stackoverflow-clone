import { db } from "../name";
import createAnswerTable from "./answer.table";
import createQuestionTable from "./question.table";
import createCommentTable from "./comment.table";
import createVoteTable from "./vote.table";
import { tablesDB } from "./config";

export default async function getOrCreateDB() {
  try {
    await tablesDB.get({ databaseId: db });
    console.log("Database connected");
  } catch (error) {
    try {
      await tablesDB.create({ databaseId: db, name: db });
      console.log("Database created");

      // Create tables
      await Promise.all([
        createAnswerTable(),
        createQuestionTable(),
        createCommentTable(),
        createVoteTable(),
      ]);
      console.log("Tables created");
      console.log("Database connected");
    } catch (error) {
      console.error("Error creating database or tables", error);
    }
  }

  return tablesDB;
}
