import { createClient } from "@/utils/supabase/client";
import { type Shift } from "@/types";
import { PostgrestError } from "@supabase/supabase-js";

// Define proper return types for service functions
type ServiceResponse<T> = {
  data: T | null;
  error: PostgrestError | Error | null;
};

/**
 * Service for managing shifts in the database
 */
export const shiftService = {
  /**
   * Fetch all shifts for a user
   */
  async getUserShifts(userId: string): Promise<ServiceResponse<Shift[]>> {
    try {
      const supabase = await createClient();

      const { data, error } = await supabase
        .from("shifts")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("Error fetching shifts:", error);
      return { data: null, error: error as PostgrestError | Error };
    }
  },

  /**
   * Add a new shift
   */
  async addShift(shift: Omit<Shift, "id" | "created_at">): Promise<ServiceResponse<Shift>> {
    try {
      const supabase = await createClient();

      const { data, error } = await supabase
        .from("shifts")
        .insert([shift])
        .select();

      if (error) throw error;
      // The insert operation returns an array, but we only inserted one shift
      // so we need to return the first item in the array
      return { data: data?.[0] || null, error: null };
    } catch (error) {
      console.error("Error adding shift:", error);
      return { data: null, error: error as PostgrestError | Error };
    }
  },

  /**
   * Update an existing shift
   */
  async updateShift(id: string, shiftData: Partial<Shift>): Promise<ServiceResponse<Shift>> {
    try {
      const supabase = await createClient();

      const { data, error } = await supabase
        .from("shifts")
        .update(shiftData)
        .eq("id", id)
        .select();

      if (error) throw error;
      // The update operation returns an array, but we only updated one shift
      // so we need to return the first item in the array
      return { data: data?.[0] || null, error: null };
    } catch (error) {
      console.error("Error updating shift:", error);
      return { data: null, error: error as PostgrestError | Error };
    }
  },

  /**
   * Delete a shift
   */
  async deleteShift(id: string): Promise<{ error: PostgrestError | Error | null }> {
    try {
      const supabase = await createClient();

      const { error } = await supabase.from("shifts").delete().eq("id", id);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error("Error deleting shift:", error);
      return { error: error as PostgrestError | Error };
    }
  },
};
