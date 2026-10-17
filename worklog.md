# Worklog

---
Task ID: 1
Agent: Main Agent (Z.ai)
Task: بناء موقع ويب كامل لإدارة نادي ملاكمة KBI (تسجيل دخول، إدارة مشتركين، اشتراكات، سجل عمليات، عربي/إنجليزي)

Work Log:
- حمّلت مهارة fullstack-dev وهيّأت البيئة (Next.js 16 + Tailwind 4 + shadcn/ui + Prisma/SQLite)
- عالجت شعار KBI المرفوع (JPG على أسود) → PNG شفاف: public/kbi-mark.png (علامة مائية 1200px)، public/kbi-logo-sm.png، src/app/icon.png (سكربت: scripts/process_logo.py)
- حمّلت خط Cairo (عربي+لاتيني، وزن متغير 400-900) واستضفته محليًا في public/fonts مع @font-face وunicode-range
- مخطط Prisma: Member (name, birth, height, weight, phone, type عام/خاص, start, end) + Log (action, actor, target, details) — db:push نجح
- المصادقة: توكن HMAC-SHA256 في كوكي httpOnly (kbi_session)، حسابان BKR وJihad (يقبلان أي حالة أحرف) بكلمة سر موحدة SHA-256، «تذكرني» = 30 يوم وإلا جلسة يوم واحد
- مسارات API محمية بالكوكي: /api/auth/{login,logout,me}، /api/members (GET/POST/DELETE?ids=)، /api/members/[id] (GET/PATCH/DELETE)، /api/members/[id]/extend (POST {days})، /api/logs
- التطبيق SPA على المسار / فقط (قيود معاينة البيئة) مع توجيه هاش: #/ للرئيسية و #/member/{id} لصفحة المشترك
- واجهة تسجيل الدخول: شعار كخلفية مائية، تذكرني، زر Ar/En، إظهار كلمة السر، اهتزاز عند الخطأ
- الرئيسية: شريط إدارة ثابت (إضافة، سجل، حذف، لغة، خروج + بحث + إحصائيات الإجمالي/نشط/منتهي)، فلاتر حالة ونوع، بطاقات طولية: الاسم + نوع الاشتراك + خط مستطيل مقطّع (12 قطعة) بعدد الأيام المتبقية في المنتصف (ذهبي نشط/برتقالي قارب الانتهاء ≤5 أيام/أحمر منتهي)
- وضع الحذف المتعدد: تحديد بالضغط + شريط عائم + تأكيد نهائي
- صفحة المشترك: كل البيانات + خط الأيام كبير + النسب + من/إلى + أزرار: تعديل، تمديد (قوالب 7/14/30/60/90 + مخصص مع معاينة التاريخ الجديد)، واتساب/اتصال/رسالة (تحويل 07xx→+964 تلقائيًا) + حذف
- لوحة السجل (Sheet): العمليات ملوّنة بأيقونات مع الفاعل والتفاصيل والوقت النسبي
- i18n كامل عربي/إنجليزي مع RTL/LTR ومحفوظ في localStorage، خط Cairo، ثيم أسود/ذهبي
- الإصلاحات أثناء الفحص: خطأ ترجمة مفاتيح السجل (actExtend→actEXTEND)، خطأا ESLint set-state-in-effect
- اختبار شامل بالمتصفح (agent-browser): دخول خاطئ/صحيح، إضافة، تعديل، تمديد +60 يومًا، حذف متعدد، بحث، فلترة، تبديل اللغة، موبايل 390px، دخول الكابتنين — لا أخطاء كونسول ولا خادم
- نظّفت البيانات التجريبية من القاعدة (0 مشتركين، 0 سجلات) وجاهزة للاستخدام الحقيقي

Stage Summary:
- الموقع يعمل بالكامل وتم التحقق منه بالمتصفح — الصفحة الوحيدة المرئية: / (SPA بتوجيه هاش)
- الحسابات: BKR وJihad بكلمة السر الموحدة المحددة من المستخدم
- ملفات رئيسية: prisma/schema.prisma، src/lib/{auth,members,i18n,server}.ts، src/components/{kbi-app,days-bar,lang,member-form-dialog,extend-dialog,confirm-dialog,logs-sheet}.tsx، src/components/views/{login-view,dashboard-view,member-view}.tsx، 7 مسارات API
- جاهز للرفع على Cloudflare لاحقًا (كود REST قياسي بدون اعتماديات خاصة بالمنصة؛ D1/OpenNext خطوة تالية منفصلة)
