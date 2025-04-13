import { supabase } from "@/lib/supabase";
import { OpensourceLicence } from "@/types/licence";
import { db } from "@/types/postgres";
import { HttpResponse } from "@/types/response";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { zfd } from "zod-form-data";
// interface UploadRequest {
//     modelName: string,
//     description: string,
//     tags: string[],
//     license: OpensourceLicence,
//     modelFile: File
// };

const uploadSchema = zfd.formData({
    modelName: zfd.text(),
    description: zfd.text(),
    tags: zfd.json(z.array(z.string())),
    license: zfd.text(z.custom<OpensourceLicence>()),
    file: zfd.file(),
});

// type UploadRequest = z.infer<typeof uploadSchema>;

export async function POST(request: NextRequest) {
    const formData = await request.formData();

    //todo safety
    let user_id = request.headers.get("user_id");
    if (!user_id) {
        return NextResponse.json(HttpResponse(405, "invalid user info"));
    }

    let req = uploadSchema.safeParse(formData);
    if (!req.success) {
        return NextResponse.json(HttpResponse(405, "invalid parameters"));
    }
    console.log(req.data);

    // upload files
    let new_file_name = crypto.randomUUID();
    const storage_rsp = await supabase.storage
        .from("models")
        .update(new_file_name, req.data.file)
    if (storage_rsp.error) {
        console.log(storage_rsp.error);
        return NextResponse.json(HttpResponse(500, "upload file failed"));
    }

    // insert to model_files
    let mfreq = await supabase.from("model_files")
        .insert([{
            name: req.data.file.name,
            file_path: storage_rsp.data.fullPath,
            size: req.data.file.size,
            user_id,
        }])
        .select();
    console.log(mfreq);
    if (mfreq.status != 201 || !mfreq.data || mfreq.data.length < 1) {
        return NextResponse.json(HttpResponse(500, "upload file failed"));
    };

    // insert to models
    let mreq = await supabase.from("models")
        .insert([{
            name: req.data.modelName,
            description: req.data.description,
            license: req.data.license,
            user_id,
            model_file_id: mfreq.data.at(0).id
        }])
    if (mreq.status != 201) {
        return NextResponse.json(HttpResponse(500, "upload file failed"));
    };
    console.log("db result", mreq);

    return NextResponse.json(HttpResponse(200, formData));
}

export async function GET(request: NextResponse) {
    return new NextResponse("test");
}

