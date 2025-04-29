import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// GET handler
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get resource type from URL
    const { searchParams } = new URL(request.url);
    const resource = searchParams.get("resource");

    if (resource === "companies") {
      const { data, error } = await supabase.from("companies").select("*");

      if (error) throw error;
      return NextResponse.json({ data });
    }

    if (resource === "shifts") {
      const { data, error } = await supabase.from("shifts").select("*");

      if (error) throw error;
      return NextResponse.json({ data });
    }

    return NextResponse.json(
      { error: "Invalid resource type" },
      { status: 400 }
    );
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST handler
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { resource, data } = body;

    if (resource === "companies") {
      const { data: responseData, error } = await supabase
        .from("companies")
        .insert([data])
        .select();

      if (error) throw error;
      return NextResponse.json({ data: responseData });
    }

    if (resource === "shifts") {
      const { data: responseData, error } = await supabase
        .from("shifts")
        .insert([data])
        .select();

      if (error) throw error;
      return NextResponse.json({ data: responseData });
    }

    return NextResponse.json(
      { error: "Invalid resource type" },
      { status: 400 }
    );
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT handler
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { resource, id, data } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    if (resource === "companies") {
      const { data: responseData, error } = await supabase
        .from("companies")
        .update(data)
        .eq("id", id)
        .select();

      if (error) throw error;
      return NextResponse.json({ data: responseData });
    }

    if (resource === "shifts") {
      const { data: responseData, error } = await supabase
        .from("shifts")
        .update(data)
        .eq("id", id)
        .select();

      if (error) throw error;
      return NextResponse.json({ data: responseData });
    }

    return NextResponse.json(
      { error: "Invalid resource type" },
      { status: 400 }
    );
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE handler
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const resource = searchParams.get("resource");
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    if (resource === "companies") {
      const { error } = await supabase.from("companies").delete().eq("id", id);

      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (resource === "shifts") {
      const { error } = await supabase.from("shifts").delete().eq("id", id);

      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: "Invalid resource type" },
      { status: 400 }
    );
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
