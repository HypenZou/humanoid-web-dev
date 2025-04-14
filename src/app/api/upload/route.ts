'use server';

import { logger } from "@/lib/pino";
import { supabase } from "@/lib/supabaseServer";
import { OpensourceLicence } from "@/types/licence";
import { UploadRequest } from "@/types/models";
import { db } from "@/types/postgres";
import { HttpResponse } from "@/types/response";
import { NextRequest, NextResponse } from "next/server";

// interface UploadRequest {
//     modelName: string,
//     description: string,
//     tags: string[],
//     license: OpensourceLicence,
//     modelFile: File
// };

export async function POST(request: NextRequest) {

    // todo: use chain middelware
    const token = request.headers.get('authorization');
    if (!token) {
        return NextResponse.json(HttpResponse(401, "Unauthorized"));
    }
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    if (userError || !user) {
        return NextResponse.json(HttpResponse(401, "Unauthorized"));
    }

    const reqData: UploadRequest = await request.json();
    // insert to models
    let { data: modelsResp, error: modelsError } = await supabase.from("models").insert([{
        name: reqData.name,
        description: reqData.description,
        license: reqData.license,
        user_id: user.id,
        tags: reqData.tags.join(","),
        model_folder_path: reqData.folder_path
    }]).select<"id">("id");

    const model_id = modelsResp?.at(0)?.id;
    if (modelsError || !model_id) {
        logger.error("insert to models table failed, err: %o, req: %o", modelsError, reqData);
        return NextResponse.json(HttpResponse(500, "create model failed"));
    }

    // insert to models_info
    let { error: modelRepoError } = await supabase.from("model_repo_info").insert([{
        model_id
    }]);
    if (modelRepoError) {
        logger.error("insert to model repo info table failed, err: %o, req: %o", modelsError, reqData);
        return NextResponse.json(HttpResponse(500, "create model failed"));
    }

    console.log(model_id);

    return NextResponse.json(HttpResponse(200, "sucess"));
}

export async function GET(request: NextResponse) {
    return new NextResponse("test");
}

