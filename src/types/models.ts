import { z } from "zod";
import { OpensourceLicence } from "./licence";


export const uploadSchema = z.object({
    name: z.string().max(128, "max name size is 128").nonempty(),
    description: z.string().max(4096, "max description size is 4096"),
    tags: z.array(z.string()),
    license: z.custom<OpensourceLicence>().default("MIT"),
    folder_path: z.string().nonempty(),
});

export type UploadRequest = z.infer<typeof uploadSchema>;