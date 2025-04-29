import { createClient } from "../utils/supabase/client";
import { type Company } from "../types";
import { PostgrestError } from "@supabase/supabase-js";

// Define proper return types for service functions
type ServiceResponse<T> = {
  data: T | null;
  error: PostgrestError | Error | null;
};

/**
 * Service for managing companies in the database
 */
export const companyService = {
  /**
   * Fetch all companies for a user
   */
  async getUserCompanies(userId: string): Promise<ServiceResponse<Company[]>> {
    try {
      const supabase = await createClient();

      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .eq("user_id", userId)
        .order("name", { ascending: true });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("Error fetching companies:", error);
      return { data: null, error: error as PostgrestError | Error };
    }
  },

  /**
   * Add a new company
   */
  async addCompany(
    company: Omit<Company, "id" | "created_at">
  ): Promise<ServiceResponse<Company>> {
    try {
      const supabase = await createClient();

      // Log the company data being sent to help debug
      console.log(
        "Attempting to add company with data:",
        JSON.stringify(company)
      );

      const { data, error } = await supabase
        .from("companies")
        .insert([company])
        .select();

      if (error) {
        console.error("Supabase error details:", error);
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);
        console.error("Error details:", error.details);
        console.error("Error hint:", error.hint);

        // Check for database constraint violation errors
        if (error.code === "23505") {
          return {
            data: null,
            error: new Error(`A company with this name already exists.`),
          };
        }

        // Check for permission errors
        if (error.code === "42501") {
          return {
            data: null,
            error: new Error(`You don't have permission to add a company.`),
          };
        }

        throw error;
      }

      if (!data || data.length === 0) {
        console.error("No data returned after insert");
        return {
          data: null,
          error: new Error("Failed to create company - no data returned"),
        };
      }

      // The insert operation returns an array, but we only inserted one company
      // so we need to return the first item in the array
      return { data: data[0], error: null };
    } catch (error) {
      // Improve error logging
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      const errorObject =
        error instanceof Error ? error : { message: "Unknown error structure" };
      console.error("Error adding company:", errorMessage, errorObject);
      return { data: null, error: error as PostgrestError | Error };
    }
  },

  /**
   * Update an existing company
   */
  async updateCompany(
    id: string,
    companyData: Partial<Company>
  ): Promise<ServiceResponse<Company>> {
    try {
      const supabase = await createClient();

      const { data, error } = await supabase
        .from("companies")
        .update(companyData)
        .eq("id", id)
        .select();

      if (error) throw error;
      // The update operation returns an array, but we only updated one company
      // so we need to return the first item in the array
      return { data: data?.[0] || null, error: null };
    } catch (error) {
      console.error("Error updating company:", error);
      return { data: null, error: error as PostgrestError | Error };
    }
  },

  /**
   * Delete a company
   */
  async deleteCompany(
    id: string
  ): Promise<{ error: PostgrestError | Error | null }> {
    try {
      const supabase = await createClient();

      const { error } = await supabase.from("companies").delete().eq("id", id);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error("Error deleting company:", error);
      return { error: error as PostgrestError | Error };
    }
  },
};
