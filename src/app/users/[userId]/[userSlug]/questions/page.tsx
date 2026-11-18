import Pagination from "@/components/Pagination";
import QuestionCard from "@/components/QuestionCard";
import { answerTable, db, questionTable, voteTable } from "@/models/name";
import { tablesDB, users } from "@/models/server/config";
import { UserPrefs } from "@/store/Auth";
import { Query } from "node-appwrite";
import React from "react";
import { QuestionRow } from "@/components/QuestionForm";

const Page = async ({
  params,
  searchParams,
}: {
  params: { userId: string; userSlug: string };
  searchParams: { page?: string };
}) => {
  searchParams.page ||= "1";

  const queries = [
    Query.equal("authorId", params.userId),
    Query.orderDesc("$createdAt"),
    Query.offset((+searchParams.page - 1) * 25),
    Query.limit(25),
  ];

  const questions = await tablesDB.listRows<QuestionRow>({
    databaseId: db,
    tableId: questionTable,
    queries,
  });

  const questionsWithDetails = await Promise.all(
    questions.rows.map(async (ques) => {
      const [author, answers, votes] = await Promise.all([
        users.get<UserPrefs>({ userId: ques.authorId }),
        tablesDB.listRows({
          databaseId: db,
          tableId: answerTable,
          queries: [
            Query.equal("questionId", ques.$id),
            Query.limit(1), // for optimization
          ],
        }),
        tablesDB.listRows({
          databaseId: db,
          tableId: voteTable,
          queries: [
            Query.equal("type", "question"),
            Query.equal("typeId", ques.$id),
            Query.limit(1), // for optimization
          ],
        }),
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
    <div className="px-4">
      <div className="mb-4">
        <p>{questions.total} questions</p>
      </div>
      <div className="mb-4 max-w-3xl space-y-6">
        {questionsWithDetails.map((ques) => (
          <QuestionCard key={ques.$id} ques={ques} />
        ))}
      </div>
      <Pagination total={questions.total} limit={25} />
    </div>
  );
};

export default Page;
