import { useState } from 'react';
import { motion } from 'motion/react';
import { Scale, FileText, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export function RegulatoryComplianceDashboard() {
  const { language } = useLanguage();

  const documents = [
    { id: 1, type: 'Trade License', status: 'Valid', expiry: '2026-12-31', risk: 'Low' },
    { id: 2, type: 'RTA Permit', status: 'Valid', expiry: '2026-06-30', risk: 'Low' },
    { id: 3, type: 'Data Protection Audit', status: 'Pending', expiry: '2026-03-15', risk: 'Medium' },
    { id: 4, type: 'Tax Filing (VAT)', status: 'Due Soon', expiry: '2026-02-28', risk: 'High' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1800px] mx-auto">
      <h1 className="text-3xl font-bold flex items-center gap-3">
        <Scale className="w-8 h-8 text-primary" />
        {language === 'ar' ? 'الامتثال التنظيمي' : 'Regulatory Compliance'}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 bg-green-50 border border-green-200 rounded-xl dark:bg-green-900/20 dark:border-green-900">
           <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-bold text-green-700">Compliance Score</span>
           </div>
           <div className="text-3xl font-bold text-green-800">98/100</div>
        </div>
        <div className="p-6 bg-red-50 border border-red-200 rounded-xl dark:bg-red-900/20 dark:border-red-900">
           <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span className="font-bold text-red-700">Critical Actions</span>
           </div>
           <div className="text-3xl font-bold text-red-800">2</div>
        </div>
        <div className="p-6 bg-blue-50 border border-blue-200 rounded-xl dark:bg-blue-900/20 dark:border-blue-900">
           <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span className="font-bold text-blue-700">Documents Managed</span>
           </div>
           <div className="text-3xl font-bold text-blue-800">1,245</div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
         <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold">Upcoming Expirations & Deadlines</h3>
         </div>
         <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
               <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Document</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expiry Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk Level</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
               {documents.map((doc) => (
                  <tr key={doc.id}>
                     <td className="px-6 py-4 font-medium">{doc.type}</td>
                     <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                           doc.status === 'Valid' ? 'bg-green-100 text-green-800' :
                           doc.status === 'Due Soon' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>{doc.status}</span>
                     </td>
                     <td className="px-6 py-4 text-gray-500">{doc.expiry}</td>
                     <td className="px-6 py-4">{doc.risk}</td>
                     <td className="px-6 py-4"><button className="text-blue-600 hover:underline">Review</button></td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>
    </div>
  );
}
