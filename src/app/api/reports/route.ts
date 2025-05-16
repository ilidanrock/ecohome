import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({ message: "Reports API endpoint" })
}

export async function POST() {
  return NextResponse.json({ message: "Reports creation endpoint" })
}
