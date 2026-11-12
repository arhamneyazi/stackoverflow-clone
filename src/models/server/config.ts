import env from "@/app/env";
import { Client, Avatars, TablesDB, Storage, Users } from "node-appwrite";

const client = new Client()
  .setEndpoint(env.appwrite.endpoint)
  .setProject(env.appwrite.projectId)
  .setKey(env.appwrite.apikey);

const users = new Users(client);
const tablesDB = new TablesDB(client);
const avatars = new Avatars(client);
const storage = new Storage(client);

export { client, users, tablesDB, avatars, storage };
