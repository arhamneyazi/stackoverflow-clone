import { Permission, Role } from "node-appwrite";
import { questionAttachmentBucket } from "../name";
import { storage } from "./config";

export default async function getOrCreateStorage() {
  try {
    await storage.getBucket({ bucketId: questionAttachmentBucket });
    console.log("Storage bucket connected");
  } catch (error) {
    try {
      await storage.createBucket({
        bucketId: questionAttachmentBucket,
        name: questionAttachmentBucket,
        permissions: [
          Permission.read(Role.any()),
          Permission.create(Role.users()),
          Permission.update(Role.users()),
          Permission.delete(Role.users()),
        ],
        fileSecurity: false,
        allowedFileExtensions: ["jpg", "png", "gif", "jpeg", "webp", "heic"],
      });

      console.log("Storage bucket created");
      console.log("Storage bucket connected");
    } catch (error) {
      console.error("Error creating storage bucket", error);
    }
  }
}
