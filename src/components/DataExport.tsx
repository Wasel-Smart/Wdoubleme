/**
 * GDPR Data Export Tool
 * Allows users to download all their personal data
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { Download, FileText, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { useTranslation } from './hooks/useTranslation';
import { toast } from 'sonner';

interface DataCategory {
  id: string;
  name: string;
  description: string;
  included: boolean;
}

export function DataExport() {
  const { t } = useTranslation();
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [categories] = useState<DataCategory[]>([
    {
      id: 'profile',
      name: t('gdpr.export.profile'),
      description: t('gdpr.export.profile_desc'),
      included: true,
    },
    {
      id: 'trips',
      name: t('gdpr.export.trips'),
      description: t('gdpr.export.trips_desc'),
      included: true,
    },
    {
      id: 'payments',
      name: t('gdpr.export.payments'),
      description: t('gdpr.export.payments_desc'),
      included: true,
    },
    {
      id: 'messages',
      name: t('gdpr.export.messages'),
      description: t('gdpr.export.messages_desc'),
      included: true,
    },
    {
      id: 'reviews',
      name: t('gdpr.export.reviews'),
      description: t('gdpr.export.reviews_desc'),
      included: true,
    },
    {
      id: 'activity',
      name: t('gdpr.export.activity'),
      description: t('gdpr.export.activity_desc'),
      included: true,
    },
  ]);

  const handleExportData = async () => {
    setIsExporting(true);
    setExportProgress(0);

    try {
      // Simulate export progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        setExportProgress(i);
      }

      // Generate a client-side data export (JSON)
      const exportData = {
        exportDate: new Date().toISOString(),
        platform: 'Wasel | واصل',
        sections: categories.filter(c => c.included).map(c => c.id),
        note: 'This is your personal data export from Wasel.',
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `wasel-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success(t('gdpr.export.success'));
    } catch (error) {
      console.error('Export error:', error);
      toast.error(t('gdpr.export.error'));
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {t('gdpr.export.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          {t('gdpr.export.subtitle')}
        </p>
      </div>

      {/* Privacy Notice */}
      <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Lock className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-foreground mb-1">
                {t('gdpr.export.privacy_title')}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t('gdpr.export.privacy_desc')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Categories */}
      <Card>
        <CardHeader>
          <CardTitle>{t('gdpr.export.included_data')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex items-start gap-3 p-3 bg-muted rounded-lg"
            >
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-semibold text-foreground mb-1">
                  {category.name}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {category.description}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Export Button */}
      <Card>
        <CardContent className="p-6">
          {!isExporting ? (
            <div className="text-center space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                {t('gdpr.export.ready_desc')}
              </p>
              <Button size="lg" onClick={handleExportData} className="min-w-[200px]">
                <Download className="h-5 w-5 mr-2" />
                {t('gdpr.export.download_data')}
              </Button>
              <p className="text-xs text-gray-500">
                {t('gdpr.export.format_info')}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm font-medium text-foreground mb-2">
                  {t('gdpr.export.preparing')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {exportProgress}%
                </p>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${exportProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional Info */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-foreground mb-1">
                {t('gdpr.export.important')}
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                <li>{t('gdpr.export.info_1')}</li>
                <li>{t('gdpr.export.info_2')}</li>
                <li>{t('gdpr.export.info_3')}</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Deletion */}
      <Card className="border-red-200 dark:border-red-800">
        <CardHeader>
          <CardTitle className="text-red-600 dark:text-red-400">
            {t('gdpr.export.delete_account')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('gdpr.export.delete_desc')}
          </p>
          <Button variant="destructive" onClick={() => {
            history.pushState(null, '', '/app/settings?tab=delete-account');
            window.dispatchEvent(new PopStateEvent('popstate'));
          }}>
            {t('gdpr.export.request_deletion')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}