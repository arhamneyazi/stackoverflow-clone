import { tablesDB, users } from "@/models/server/config";
import { answerTable, db, voteTable, questionTable } from "@/models/name";
import { Models, Query } from "node-appwrite";
import React from "react";
import Link from "next/link";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import QuestionCard from "@/components/QuestionCard";
import { UserPrefs } from "@/store/Auth";
import Pagination from "@/components/Pagination";
import Search from "./Search";

type QuestionRow = Models.Row & {
  title: string;
  content: string;
  tags: string[];
  authorId: string;
};

const Page = async ({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; tag?: string; search?: string }>;
}) => {
  const { page = "1", tag, search } = await searchParams;

  const queries = [
    Query.orderDesc("$createdAt"),
    Query.offset((Number(page) - 1) * 25),
    Query.limit(25),
  ];

  if (tag) queries.push(Query.equal("tags", tag));
  if (search)
    queries.push(
      Query.or([
        Query.search("title", search),
        Query.search("content", search),
      ]),
    );

  const questions = await tablesDB.listRows<QuestionRow>({
    databaseId: db,
    tableId: questionTable,
    queries,
  });
  console.log("Questions", questions);

  const rows = await Promise.all(
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
    <div className="container mx-auto px-4 pb-20 pt-36">
      <div className="mb-10 flex items-center justify-between">
        <h1 className="text-3xl font-bold">All Questions</h1>
        <Link href="/questions/ask">
          <ShimmerButton className="shadow-2xl">
            <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white dark:from-white dark:to-slate-900/10 lg:text-lg">
              Ask a question
            </span>
          </ShimmerButton>
        </Link>
      </div>
      <div className="mb-4">
        <Search />
      </div>
      <div className="mb-4">
        <p>{questions.total} questions</p>
      </div>
      <div className="mb-4 max-w-3xl space-y-6">
        {rows.map((ques) => (
          <QuestionCard key={ques.$id} ques={ques} />
        ))}
      </div>
      <Pagination total={questions.total} limit={25} />
    </div>
  );
};

export default Page;
