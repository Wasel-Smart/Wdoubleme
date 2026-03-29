/**
 * WhatsApp Integration for Wasel | واصل
 * Real WhatsApp Business API integration for all communications
 */

// WhatsApp Business Number (Jordan)
const WASEL_WHATSAPP = '+962790000000'; // Replace with actual Wasel WhatsApp Business number

/**
 * Send WhatsApp message via web.whatsapp.com or wa.me
 * Works on both mobile and desktop
 */
export function sendWhatsAppMessage(phoneNumber: string, message: string) {
  const encodedMessage = encodeURIComponent(message);
  const url = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}?text=${encodedMessage}`;
  window.open(url, '_blank');
}

/**
 * Notify driver via WhatsApp when ride is booked
 */
export function notifyDriverRideBooked(params: {
  driverPhone: string;
  driverName: string;
  passengerName: string;
  from: string;
  to: string;
  date: string;
  time: string;
  seats: number;
  price: number;
  lang: 'en' | 'ar';
}) {
  const { driverPhone, driverName, passengerName, from, to, date, time, seats, price, lang } = params;

  const messageEn = `🚗 *New Ride Booking on Wasel!*

Hello ${driverName}! 👋

*Booking Details:*
📍 From: ${from}
📍 To: ${to}
📅 Date: ${date}
⏰ Time: ${time}
👥 Seats: ${seats}
💰 Price: JOD ${price}

*Passenger:* ${passengerName}

Please confirm this booking in the Wasel app.

_Wasel | واصل - Your Mobility Companion_`;

  const messageAr = `🚗 *حجز رحلة جديد على واصل!*

مرحباً ${driverName}! 👋

*تفاصيل الحجز:*
📍 من: ${from}
📍 إلى: ${to}
📅 التاريخ: ${date}
⏰ الوقت: ${time}
👥 المقاعد: ${seats}
💰 السعر: ${price} دينار

*الراكب:* ${passengerName}

الرجاء تأكيد هذا الحجز في تطبيق واصل.

_Wasel | واصل - شريكك الذكي بالتنقل_`;

  sendWhatsAppMessage(driverPhone, lang === 'ar' ? messageAr : messageEn);
}

/**
 * Notify passenger via WhatsApp when booking is confirmed
 */
export function notifyPassengerBookingConfirmed(params: {
  passengerPhone: string;
  passengerName: string;
  driverName: string;
  driverPhone: string;
  from: string;
  to: string;
  date: string;
  time: string;
  seats: number;
  price: number;
  lang: 'en' | 'ar';
}) {
  const { passengerPhone, passengerName, driverName, driverPhone, from, to, date, time, seats, price, lang } = params;

  const messageEn = `✅ *Your Ride is Confirmed!*

Hello ${passengerName}! 👋

*Trip Details:*
📍 From: ${from}
📍 To: ${to}
📅 Date: ${date}
⏰ Time: ${time}
👥 Seats: ${seats}
💰 Total: JOD ${price}

*Driver:* ${driverName}
📞 Contact: ${driverPhone}

Have a safe trip! 🚗

_Wasel | واصل - Your Mobility Companion_`;

  const messageAr = `✅ *تم تأكيد رحلتك!*

مرحباً ${passengerName}! 👋

*تفاصيل الرحلة:*
📍 من: ${from}
📍 إلى: ${to}
📅 التاريخ: ${date}
⏰ الوقت: ${time}
👥 المقاعد: ${seats}
💰 الإجمالي: ${price} دينار

*السائق:* ${driverName}
📞 التواصل: ${driverPhone}

رحلة آمنة! 🚗

_Wasel | واصل - شريكك الذكي بالتنقل_`;

  sendWhatsAppMessage(passengerPhone, lang === 'ar' ? messageAr : messageEn);
}

/**
 * Notify sender when package is picked up
 */
export function notifyPackagePickedUp(params: {
  senderPhone: string;
  senderName: string;
  travelerName: string;
  travelerPhone: string;
  from: string;
  to: string;
  packageId: string;
  trackingCode: string;
  lang: 'en' | 'ar';
}) {
  const { senderPhone, senderName, travelerName, travelerPhone, from, to, packageId, trackingCode, lang } = params;

  const messageEn = `📦 *Package Picked Up!*

Hello ${senderName}! 👋

Your package has been picked up by ${travelerName}.

*Package Details:*
📦 ID: ${packageId}
🔢 Tracking Code: ${trackingCode}
📍 From: ${from}
📍 To: ${to}

*Traveler:* ${travelerName}
📞 Contact: ${travelerPhone}

Track your package in real-time on the Wasel app.

_Wasel | واصل - Your Mobility Companion_`;

  const messageAr = `📦 *تم استلام الطرد!*

مرحباً ${senderName}! 👋

تم استلام طردك بواسطة ${travelerName}.

*تفاصيل الطرد:*
📦 الرقم: ${packageId}
🔢 كود التتبع: ${trackingCode}
📍 من: ${from}
📍 إلى: ${to}

*المسافر:* ${travelerName}
📞 التواصل: ${travelerPhone}

تتبع طردك في الوقت الفعلي على تطبيق واصل.

_Wasel | واصل - شريكك الذكي بالتنقل_`;

  sendWhatsAppMessage(senderPhone, lang === 'ar' ? messageAr : messageEn);
}

/**
 * Notify receiver when package is delivered
 */
export function notifyPackageDelivered(params: {
  receiverPhone: string;
  receiverName: string;
  senderName: string;
  packageId: string;
  trackingCode: string;
  deliveryAddress: string;
  lang: 'en' | 'ar';
}) {
  const { receiverPhone, receiverName, senderName, packageId, trackingCode, deliveryAddress, lang } = params;

  const messageEn = `✅ *Package Delivered!*

Hello ${receiverName}! 👋

Your package from ${senderName} has been delivered!

*Package Details:*
📦 ID: ${packageId}
🔢 Tracking Code: ${trackingCode}
📍 Delivered to: ${deliveryAddress}

Please confirm receipt in the Wasel app by scanning the QR code.

_Wasel | واصل - Your Mobility Companion_`;

  const messageAr = `✅ *تم توصيل الطرد!*

مرحباً ${receiverName}! 👋

تم توصيل طردك من ${senderName}!

*تفاصيل الطرد:*
📦 الرقم: ${packageId}
🔢 كود التتبع: ${trackingCode}
📍 تم التوصيل إلى: ${deliveryAddress}

الرجاء تأكيد الاستلام في تطبيق واصل عبر مسح رمز QR.

_Wasel | واصل - شريكك الذكي بالتنقل_`;

  sendWhatsAppMessage(receiverPhone, lang === 'ar' ? messageAr : messageEn);
}

/**
 * Send trip reminder 1 hour before departure
 */
export function sendTripReminder(params: {
  phone: string;
  name: string;
  from: string;
  to: string;
  time: string;
  meetingPoint: string;
  lang: 'en' | 'ar';
}) {
  const { phone, name, from, to, time, meetingPoint, lang } = params;

  const messageEn = `⏰ *Trip Reminder - 1 Hour Away!*

Hello ${name}! 👋

Your ride is departing soon:

📍 From: ${from}
📍 To: ${to}
⏰ Time: ${time}
📍 Meeting Point: ${meetingPoint}

Please be ready 10 minutes early.

_Wasel | واصل - Your Mobility Companion_`;

  const messageAr = `⏰ *تذكير بالرحلة - باقي ساعة!*

مرحباً ${name}! 👋

رحلتك ستنطلق قريباً:

📍 من: ${from}
📍 إلى: ${to}
⏰ الوقت: ${time}
📍 نقطة الالتقاء: ${meetingPoint}

الرجاء التواجد قبل 10 دقائق.

_Wasel | واصل - شريكك الذكي بالتنقل_`;

  sendWhatsAppMessage(phone, lang === 'ar' ? messageAr : messageEn);
}

/**
 * Contact Wasel Support via WhatsApp
 */
export function contactWaselSupport(message: string, lang: 'en' | 'ar') {
  const greeting = lang === 'ar' 
    ? 'مرحباً، أحتاج مساعدة في: ' 
    : 'Hello, I need help with: ';
  
  sendWhatsAppMessage(WASEL_WHATSAPP, greeting + message);
}

/**
 * Share ride via WhatsApp
 */
export function shareRideViaWhatsApp(params: {
  from: string;
  to: string;
  date: string;
  time: string;
  price: number;
  availableSeats: number;
  driverName: string;
  lang: 'en' | 'ar';
}) {
  const { from, to, date, time, price, availableSeats, driverName, lang } = params;

  const messageEn = `🚗 *Ride Available on Wasel!*

*Route:* ${from} → ${to}
📅 Date: ${date}
⏰ Time: ${time}
💰 Price: JOD ${price}/seat
👥 Available Seats: ${availableSeats}
👤 Driver: ${driverName}

Book now on Wasel app!
https://wasel.jo

_Wasel | واصل - Your Mobility Companion_`;

  const messageAr = `🚗 *رحلة متاحة على واصل!*

*المسار:* ${from} ← ${to}
📅 التاريخ: ${date}
⏰ الوقت: ${time}
💰 السعر: ${price} دينار/مقعد
👥 المقاعد المتاحة: ${availableSeats}
👤 السائق: ${driverName}

احجز الآن على تطبيق واصل!
https://wasel.jo

_Wasel | واصل - شريكك الذكي بالتنقل_`;

  // This will open WhatsApp to share with any contact
  const encoded = encodeURIComponent(lang === 'ar' ? messageAr : messageEn);
  window.open(`https://wa.me/?text=${encoded}`, '_blank');
}

/**
 * Request driver to call via WhatsApp
 */
export function requestDriverCall(driverPhone: string, passengerName: string, lang: 'en' | 'ar') {
  const messageEn = `📞 *Call Request*

Hello! This is ${passengerName}. I have a booking with you on Wasel. Could you please call me?

Thank you!`;

  const messageAr = `📞 *طلب اتصال*

مرحباً! أنا ${passengerName}. لدي حجز معك على واصل. هل يمكنك الاتصال بي من فضلك؟

شكراً!`;

  sendWhatsAppMessage(driverPhone, lang === 'ar' ? messageAr : messageEn);
}
