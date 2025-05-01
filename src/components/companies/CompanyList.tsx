"use client";

import React from "react";
import { type Company } from "@/types";
import Button from "../ui/Button";

interface CompanyListProps {
  companies: Company[];
  onEdit: (company: Company) => void;
  onDelete: (companyId: string) => void;
}

const CompanyList = ({ companies, onEdit, onDelete }: CompanyListProps) => {
  const handleDeleteClick = (id: string, name: string) => {
    if (
      confirm(
        `「${name}」を削除してもよろしいですか？この操作は元に戻せません。`
      )
    ) {
      onDelete(id);
    }
  };

  return (
    <div className="mt-4 bg-white p-4 rounded-lg shadow-sm border">
      <h2 className="text-xl font-semibold mb-4">登録済みの会社</h2>
      {companies.length === 0 ? (
        <p className="text-gray-500 italic py-4">
          まだ会社が登録されていません。
        </p>
      ) : (
        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  会社名
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  時給
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {companies.map((company) => (
                <tr key={company.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium">
                    {company.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    ¥{company.hourly_wage.toFixed(0)}/時間
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex space-x-2 justify-end">
                      <Button
                        onClick={() => onEdit(company)}
                        className="px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600"
                      >
                        編集
                      </Button>
                      <Button
                        onClick={() =>
                          handleDeleteClick(company.id, company.name)
                        }
                        className="px-3 py-1 text-xs bg-red-500 hover:bg-red-600"
                      >
                        削除
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CompanyList;
