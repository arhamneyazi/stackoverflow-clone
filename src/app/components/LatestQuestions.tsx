import QuestionCard from "@/components/QuestionCard";
import { answerTable, db, questionTable, voteTable } from "@/models/name";
import { tablesDB, users } from "@/models/server/config";
import { UserPrefs } from "@/store/Auth";
import { Models, Query } from "node-appwrite";
import React from "react";

type QuestionRow = Models.Row & {
  title: string;
  tags: string[];
  authorId: string;
};

const LatestQuestions = async () => {
  const questions = await tablesDB.listRows<QuestionRow>(db, questionTable, [
    Query.limit(5),
    Query.orderDesc("$createdAt"),
  ]);

  const rows = await Promise.all(
    questions.rows.map(async (ques) => {
      const [author, answers, votes] = await Promise.all([
        users.get<UserPrefs>(ques.authorId),
        tablesDB.listRows(db, answerTable, [
          Query.equal("questionId", ques.$id),
          Query.limit(1), // for optimization
        ]),
        tablesDB.listRows(db, voteTable, [
          Query.equal("type", "question"),
          Query.equal("typeId", ques.$id),
          Query.limit(1), // for optimization
        ]),
      ]);

      return {
        ...ques,
        totalAnswers: answers.total,
        totalVotes: votes.total,
        author: {
          $id: author.$id,
          reputation: author.prefs.reputation,
          name: author.name,
        },
      };
    }),
  );

  return (
    <div className="space-y-6">
      {rows.map((question) => (
        <QuestionCard key={question.$id} ques={question} />
      ))}
    </div>
  );
};

export default LatestQuestions;
