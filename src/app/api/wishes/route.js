import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("wishes")
    .select("id, name, wish, is_attend, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const wishes = data.map((row) => ({
    id: row.id,
    name: row.name,
    wish: row.wish,
    isAttend: row.is_attend,
    createdAt: Math.floor(new Date(row.created_at).getTime() / 1000),
  }));

  return NextResponse.json(wishes);
}

export async function POST(request) {
  const body = await request.json();
  const { name, wish, isAttend } = body;

  if (!name || !wish || !isAttend) {
    return NextResponse.json(
      { error: "name, wish, and isAttend are required" },
      { status: 400 }
    );
  }

  if (!["yes", "no", "or"].includes(isAttend)) {
    return NextResponse.json(
      { error: "isAttend must be 'yes', 'no', or 'or'" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("wishes")
    .insert({ name, wish, is_attend: isAttend })
    .select("id, name, wish, is_attend, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    {
      id: data.id,
      name: data.name,
      wish: data.wish,
      isAttend: data.is_attend,
      createdAt: Math.floor(new Date(data.created_at).getTime() / 1000),
    },
    { status: 201 }
  );
}
