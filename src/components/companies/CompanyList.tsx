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
    <div className="p-3 sm:p-4">
      {companies.length === 0 ? (
        <p className="text-gray-500 italic py-3">
          まだ会社が登録されていません。
        </p>
      ) : (
        <>
          {/* Mobile view - card layout */}
          <div className="md:hidden space-y-3">
            {companies.map((company) => (
              <div key={company.id} className="border rounded p-3 bg-gray-50">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                  <h3 className="font-medium text-base mb-1 sm:mb-0">
                    {company.name}
                  </h3>
                  <div className="text-sm font-medium text-gray-700 mb-2 sm:mb-0">
                    ¥{company.hourly_wage.toFixed(0)}/時間
                  </div>
                </div>
                <div className="flex space-x-2 justify-end mt-2">
                  <Button
                    onClick={() => onEdit(company)}
                    size="sm"
                    className="px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600"
                  >
                    編集
                  </Button>
                  <Button
                    onClick={() => handleDeleteClick(company.id, company.name)}
                    size="sm"
                    className="px-3 py-1 text-xs bg-red-500 hover:bg-red-600"
                  >
                    削除
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop view - table layout */}
          <div className="hidden md:block">
            <div className="overflow-x-auto -mx-3 sm:-mx-4">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      会社名
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      時給
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {companies.map((company) => (
                    <tr key={company.id} className="hover:bg-gray-50">
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap font-medium">
                        {company.name}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-gray-600">
                        ¥{company.hourly_wage.toFixed(0)}/時間
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right">
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
          </div>
        </>
      )}
    </div>
  );
};

export default CompanyList;
