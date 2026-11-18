import { db, questionTable } from "@/models/name";
import { tablesDB } from "@/models/server/config";
import React from "react";
import EditQues from "./EditQues";
import { QuestionRow } from "@/components/QuestionForm";

const Page = async ({
  params,
}: {
  params: Promise<{ quesId: string; quesName: string }>;
}) => {
  const { quesId } = await params;

  const question = await tablesDB.getRow<QuestionRow>({
    databaseId: db,
    tableId: questionTable,
    rowId: quesId,
  });

  return <EditQues question={question} />;
};

export default Page;
