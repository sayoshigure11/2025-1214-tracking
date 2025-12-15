import { NextRequest, NextResponse } from "next/server";
import { v4 as uuid } from "uuid";
export default function proxy(req: NextRequest) {
    const res = NextResponse.next()

    // =====================================
    // 1. ユーザーID管理
    // =====================================
    const raw = req.cookies.get("uid")?.value
    if (!raw) {
        console.log("クッキーにuidが設定されていません")
        const userId = uuid()
        res.cookies.set({
            name: "uid",
            value: userId,
            path: "/",
            httpOnly: true, //XSS対策
            secure: process.env.NODE_ENV === "production", // HTTPS必須
            sameSite: "lax", //CSRF対策
            maxAge: 60 * 60 * 24 * 365
        })
    }

    // =====================================
    // 2. A/Bテスト振り分け
    // =====================================
    let abVariant = req.cookies.get("ab_variant")?.value

    if (!abVariant) {
        // ランダムに振り分け
        abVariant = Math.random() < 0.5 ? "A" : "B"

        res.cookies.set({
            name: "ab_variant",
            value: abVariant,
            path: "/",
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 30
        })
    }

    // // =====================================
    // // 3. セッション管理
    // // =====================================
    // let sessionId = req.cookies.get("sid")?.value

    // if (!sessionId) {
    //     sessionId = uuid()

    //     res.cookies.set({
    //         name: "sid",
    //         value: sessionId,
    //         path: "/",
    //         httpOnly: true,
    //         secure: process.env.NODE_ENV === "production",
    //         sameSite: "lax",
    //         maxAge: 60 * 30 // 30分（セッションタイムアウト）
    //     })
    // }

    return res
}

export const config = {
    matcher: [
        /*
        * Match all request paths except:
        * - api/internal (内部API)
        * - _next/static (static files)
        * - _next/image (image optimization files)
        * - favicon.ico (favicon file)
        */
        "/((?!api/internal|_next/static|_next/image|favicon.ico).*)",
    ]
}