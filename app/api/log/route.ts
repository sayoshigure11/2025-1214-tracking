import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest) {
    // 受信したログを標準出力に出すだけ
    // const body = await req.json()
    const body = await req.text()
    console.log("body", body)
    // const { events, timestamp }:{events:{type:string, data:Record<string, unknown>}[], timestamp:string} = body
    // events.forEach((e) => {
    //     console.log("type", e.type)
    //     console.log("data",e.data)
    // })
    // console.log("timestamp",timestamp)
    console.log('Beacon log received:', body);

    // 実務ではここで
    // - S3
    // - BigQuery
    // - Kafka
    // などへ送る

    return NextResponse.json({ok: true}, {status:200})
}