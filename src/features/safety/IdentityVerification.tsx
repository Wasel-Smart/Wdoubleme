import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Upload, CheckCircle, AlertCircle, Camera, FileText } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { useLanguage } from '../../contexts/LanguageContext';
import { rtl } from '../../utils/rtl';

interface VerificationDocument {
  type: 'national_id' | 'passport' | 'driver_license' | 'vehicle_registration';
  status: 'pending' | 'verified' | 'rejected' | 'not_uploaded';
  uploadedAt?: string;
  verifiedAt?: string;
  expiryDate?: string;
}

export function IdentityVerification() {
  const { t, language, dir } = useLanguage();

  const [documents, setDocuments] = useState<VerificationDocument[]>([
    { type: 'national_id', status: 'not_uploaded' },
    { type: 'driver_license', status: 'not_uploaded' },
    { type: 'vehicle_registration', status: 'not_uploaded' },
  ]);

  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const [verificationScore, setVerificationScore] = useState(0);

  const documentLabels = {
    national_id:
      language === 'ar' ? 'البطاقة الشخصية / جواز السفر' : 'National ID / Passport',
    driver_license: language === 'ar' ? 'رخصة القيادة' : 'Driver License',
    vehicle_registration: language === 'ar' ? 'رخصة السيارة' : 'Vehicle Registration',
  };

  const getStatusBadge = (status: VerificationDocument['status']) => {
    switch (status) {
      case 'verified':
        return (
          <Badge className="bg-green-500">
            <CheckCircle className={`h-3 w-3 ${rtl.mr(1)}`} />
            {language === 'ar' ? 'موثّق' : 'Verified'}
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="secondary">
            {language === 'ar' ? 'قيد المراجعة' : 'Pending'}
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive">
            <AlertCircle className={`h-3 w-3 ${rtl.mr(1)}`} />
            {language === 'ar' ? 'مرفوض' : 'Rejected'}
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">{language === 'ar' ? 'غير مرفوع' : 'Not Uploaded'}</Badge>
        );
    }
  };

  const handleFileUpload = async (
    docType: VerificationDocument['type'],
    file: File
  ) => {
    setUploadingDoc(docType);

    // Simulate upload
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setDocuments((prev) =>
      prev.map((doc) =>
        doc.type === docType
          ? { ...doc, status: 'pending', uploadedAt: new Date().toISOString() }
          : doc
      )
    );

    setUploadingDoc(null);

    // Calculate verification score
    const verifiedCount = documents.filter((d) => d.status === 'verified').length + 1;
    setVerificationScore((verifiedCount / documents.length) * 100);
  };

  const calculateTrustScore = () => {
    const verifiedDocs = documents.filter((d) => d.status === 'verified').length;
    const pendingDocs = documents.filter((d) => d.status === 'pending').length;
    return (verifiedDocs * 30 + pendingDocs * 10);
  };

  const trustScore = calculateTrustScore();

  return (
    <div className={rtl.container()} dir={dir}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">
              {language === 'ar' ? 'التحقق من الهوية' : 'Identity Verification'}
            </h1>
          </div>
          <p className="text-muted-foreground">
            {language === 'ar'
              ? 'ارفع وثائقك عشان تزيد من مصداقيتك وتبني ثقة الركاب'
              : 'Upload your documents to increase your credibility and build passenger trust'}
          </p>
        </div>

        {/* Trust Score */}
        <Card className="p-6 mb-6 bg-gradient-to-r from-primary/10 to-primary/5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold mb-1">
                {language === 'ar' ? 'درجة الثقة' : 'Trust Score'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {language === 'ar'
                  ? 'وثّق كل المستندات عشان توصل 100%'
                  : 'Verify all documents to reach 100%'}
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-primary">{trustScore}%</div>
              <div className="text-xs text-muted-foreground">
                {documents.filter((d) => d.status === 'verified').length} / {documents.length}{' '}
                {language === 'ar' ? 'موثّق' : 'verified'}
              </div>
            </div>
          </div>
          <Progress value={trustScore} className="h-2" />
        </Card>

        {/* Benefits Banner */}
        <Card className="p-6 mb-6 border-primary">
          <h3 className="font-semibold mb-3">
            {language === 'ar' ? '🎁 مميزات التوثيق' : '🎁 Verification Benefits'}
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <div className="text-2xl mb-1">✅</div>
              <div className="text-sm font-medium">
                {language === 'ar' ? 'شارة موثّق' : 'Verified Badge'}
              </div>
              <div className="text-xs text-muted-foreground">
                {language === 'ar' ? 'تظهر في بروفايلك' : 'Shows on your profile'}
              </div>
            </div>
            <div>
              <div className="text-2xl mb-1">📈</div>
              <div className="text-sm font-medium">
                {language === 'ar' ? '+40% حجوزات' : '+40% Bookings'}
              </div>
              <div className="text-xs text-muted-foreground">
                {language === 'ar' ? 'الركاب يفضلون الموثّقين' : 'Passengers prefer verified'}
              </div>
            </div>
            <div>
              <div className="text-2xl mb-1">🛡️</div>
              <div className="text-sm font-medium">
                {language === 'ar' ? 'تأمين مجاني' : 'Free Insurance'}
              </div>
              <div className="text-xs text-muted-foreground">
                {language === 'ar' ? 'تغطية حتى 1000 دينار' : 'Coverage up to JOD 1,000'}
              </div>
            </div>
          </div>
        </Card>

        {/* Document Upload Cards */}
        <div className="space-y-4">
          {documents.map((doc) => (
            <Card key={doc.type} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{documentLabels[doc.type]}</h3>
                    <p className="text-sm text-muted-foreground">
                      {language === 'ar'
                        ? 'صورة واضحة، كل التفاصيل ظاهرة'
                        : 'Clear photo, all details visible'}
                    </p>
                  </div>
                </div>
                {getStatusBadge(doc.status)}
              </div>

              {doc.status === 'not_uploaded' && (
                <div>
                  <input
                    type="file"
                    id={`upload-${doc.type}`}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(doc.type, file);
                    }}
                  />
                  <Button
                    onClick={() => document.getElementById(`upload-${doc.type}`)?.click()}
                    disabled={uploadingDoc === doc.type}
                    className="w-full"
                  >
                    <Upload className={`h-4 w-4 ${rtl.mr(2)}`} />
                    {uploadingDoc === doc.type
                      ? language === 'ar'
                        ? 'جاري الرفع...'
                        : 'Uploading...'
                      : language === 'ar'
                        ? 'ارفع الوثيقة'
                        : 'Upload Document'}
                  </Button>
                </div>
              )}

              {doc.status === 'pending' && (
                <div className="p-4 bg-yellow-500/10 rounded-lg">
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">
                    ⏳{' '}
                    {language === 'ar'
                      ? 'جاري المراجعة... عادةً ياخذ 24-48 ساعة'
                      : 'Under review... Usually takes 24-48 hours'}
                  </p>
                </div>
              )}

              {doc.status === 'verified' && (
                <div className="p-4 bg-green-500/10 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <p className="text-sm text-green-600 dark:text-green-400">
                      {language === 'ar'
                        ? '✅ تم التوثيق بنجاح'
                        : '✅ Successfully verified'}
                    </p>
                  </div>
                  {doc.verifiedAt && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(doc.verifiedAt).toLocaleDateString(
                        language === 'ar' ? 'ar-JO' : 'en-US'
                      )}
                    </p>
                  )}
                </div>
              )}

              {doc.status === 'rejected' && (
                <div className="space-y-3">
                  <div className="p-4 bg-red-500/10 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400">
                      ❌{' '}
                      {language === 'ar'
                        ? 'تم رفض الوثيقة. الرجاء رفعها مرة أخرى بصورة أوضح.'
                        : 'Document rejected. Please upload again with a clearer photo.'}
                    </p>
                  </div>
                  <input
                    type="file"
                    id={`reupload-${doc.type}`}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(doc.type, file);
                    }}
                  />
                  <Button
                    variant="outline"
                    onClick={() =>
                      document.getElementById(`reupload-${doc.type}`)?.click()
                    }
                    className="w-full"
                  >
                    <Upload className={`h-4 w-4 ${rtl.mr(2)}`} />
                    {language === 'ar' ? 'ارفع مرة أخرى' : 'Upload Again'}
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Help Section */}
        <Card className="p-6 mt-6 bg-muted/50">
          <h3 className="font-semibold mb-3">
            {language === 'ar' ? 'نصائح للتصوير' : 'Photography Tips'}
          </h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span>📸</span>
              <span>
                {language === 'ar'
                  ? 'اتأكد إن الإضاءة زينة والصورة واضحة'
                  : 'Ensure good lighting and clear photo'}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span>✋</span>
              <span>
                {language === 'ar'
                  ? 'ما تغطي أي جزء من الوثيقة بإصبعك'
                  : "Don't cover any part with your finger"}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span>⚠️</span>
              <span>
                {language === 'ar'
                  ? 'اتأكد إن الوثيقة سارية وما منتهية'
                  : 'Ensure document is valid and not expired'}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span>🔒</span>
              <span>
                {language === 'ar'
                  ? 'معلوماتك آمنة ومشفرة 100%'
                  : 'Your information is 100% secure and encrypted'}
              </span>
            </li>
          </ul>
        </Card>
      </motion.div>
    </div>
  );
}