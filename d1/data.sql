-- بيانات KBI الحالية (المشتركون + سجل العمليات)
-- الاستيراد: npm run cf:d1-data-remote  (أو cf:d1-data-local للمعاينة المحلية)
-- تُنفَّذ بعد d1/schema.sql فقط
-- التواريخ بصيغة ISO +00:00 لتتوافق مع محوّل PrismaD1

INSERT INTO `Member` ("id", "name", "birth", "height", "weight", "phone", "type", "start", "end", "createdAt", "updatedAt") VALUES ('cmvc9r4a30005nluw0xo4hxaz', 'يوسف علي', '2011-10-31T00:00:00.000+00:00', 164, 52, '07503192672', 'general', '2026-10-02T00:00:00.000+00:00', '2026-11-02T00:00:00.000+00:00', '2026-10-17T10:43:58.443+00:00', '2026-10-17T10:43:58.443+00:00');
INSERT INTO `Member` ("id", "name", "birth", "height", "weight", "phone", "type", "start", "end", "createdAt", "updatedAt") VALUES ('cmvc9uysb0007nluw7t86sjct', 'فهد امجد', NULL, 162, 61, '0700000000', 'general', '2026-09-20T00:00:00.000+00:00', '2026-10-21T00:00:00.000+00:00', '2026-10-17T10:46:57.947+00:00', '2026-10-17T10:46:57.947+00:00');
INSERT INTO `Member` ("id", "name", "birth", "height", "weight", "phone", "type", "start", "end", "createdAt", "updatedAt") VALUES ('cmvc9vrys0009nluw81evs57z', 'يونس اسعد', NULL, 172, 53, '07666666666', 'general', '2026-10-17T00:00:00.000+00:00', '2026-11-16T00:00:00.000+00:00', '2026-10-17T10:47:35.764+00:00', '2026-10-17T10:47:35.764+00:00');

INSERT INTO `Log` ("id", "action", "actor", "target", "details", "createdAt") VALUES ('cmvc5od6n000mnlxrmm4d93i5', 'LOGIN', 'BKR', NULL, 'remember=true', '2026-10-17T08:49:51.551+00:00');
INSERT INTO `Log` ("id", "action", "actor", "target", "details", "createdAt") VALUES ('cmvc5op2z000nnlxrtnz0azct', 'LOGIN', 'BKR', NULL, 'remember=true', '2026-10-17T08:50:06.972+00:00');
INSERT INTO `Log` ("id", "action", "actor", "target", "details", "createdAt") VALUES ('cmvc5p0gx000onlxrezs61k15', 'LOGIN', 'BKR', NULL, NULL, '2026-10-17T08:50:21.730+00:00');
INSERT INTO `Log` ("id", "action", "actor", "target", "details", "createdAt") VALUES ('cmvc5pksd000pnlxrc9d1n71j', 'LOGIN', 'Jihad', NULL, 'remember=true', '2026-10-17T08:50:48.061+00:00');
INSERT INTO `Log` ("id", "action", "actor", "target", "details", "createdAt") VALUES ('cmvc5tcfs000qnlxr5ddzi31d', 'LOGIN', 'BKR', NULL, 'remember=true', '2026-10-17T08:53:43.864+00:00');
INSERT INTO `Log` ("id", "action", "actor", "target", "details", "createdAt") VALUES ('cmvc61ecr000rnlxrsi1g977g', 'LOGIN', 'BKR', NULL, 'remember=true', '2026-10-17T08:59:59.595+00:00');
INSERT INTO `Log` ("id", "action", "actor", "target", "details", "createdAt") VALUES ('cmvc6260l000snlxrvkd3rrjx', 'LOGIN', 'Jihad', NULL, 'remember=true', '2026-10-17T09:00:35.445+00:00');
INSERT INTO `Log` ("id", "action", "actor", "target", "details", "createdAt") VALUES ('cmvc62iru000unlxr542gmswk', 'CREATE', 'Jihad', 'اختبار الجلسة', 'عام — 30 يوم', '2026-10-17T09:00:51.979+00:00');
INSERT INTO `Log` ("id", "action", "actor", "target", "details", "createdAt") VALUES ('cmvc62tax000vnlxrd32bbpne', 'DELETE', 'Jihad', 'اختبار الجلسة', NULL, '2026-10-17T09:01:05.626+00:00');
INSERT INTO `Log` ("id", "action", "actor", "target", "details", "createdAt") VALUES ('cmvc651wo000wnlxrv47rly33', 'LOGIN', 'BKR', NULL, 'remember=true', '2026-10-17T09:02:50.088+00:00');
INSERT INTO `Log` ("id", "action", "actor", "target", "details", "createdAt") VALUES ('cmvc66in2000xnlxrc8wjoqrf', 'LOGIN', 'BKR', NULL, 'remember=true', '2026-10-17T09:03:58.430+00:00');
INSERT INTO `Log` ("id", "action", "actor", "target", "details", "createdAt") VALUES ('cmvc68fjt000znlxr4m7r79uc', 'CREATE', 'BKR', 'سالم محمد', 'عام — 30 يوم', '2026-10-17T09:05:27.738+00:00');
INSERT INTO `Log` ("id", "action", "actor", "target", "details", "createdAt") VALUES ('cmvc693ll0010nlxrixjrk7zk', 'EXTEND', 'BKR', 'سالم محمد', '+30 يوم ← 2026-12-16', '2026-10-17T09:05:58.905+00:00');
INSERT INTO `Log` ("id", "action", "actor", "target", "details", "createdAt") VALUES ('cmvc69lp40011nlxr2wyh01im', 'EXTEND', 'BKR', 'سالم محمد', '+14 يوم ← 2026-12-30', '2026-10-17T09:06:22.361+00:00');
INSERT INTO `Log` ("id", "action", "actor", "target", "details", "createdAt") VALUES ('cmvc6a01k0012nlxrfj05xjn6', 'UPDATE', 'BKR', 'سالم محمد', NULL, '2026-10-17T09:06:40.952+00:00');
INSERT INTO `Log` ("id", "action", "actor", "target", "details", "createdAt") VALUES ('cmvc6kuiu0013nlxrj4wwmxi4', 'DELETE', 'BKR', 'سالم محمد', NULL, '2026-10-17T09:15:07.014+00:00');
INSERT INTO `Log` ("id", "action", "actor", "target", "details", "createdAt") VALUES ('cmvc6m4u80015nlxrodlgi5ss', 'CREATE', 'BKR', 'يوسف علي', 'عام — 30 يوم', '2026-10-17T09:16:07.040+00:00');
INSERT INTO `Log` ("id", "action", "actor", "target", "details", "createdAt") VALUES ('cmvc6mg5q0016nlxrh36mfoxy', 'LOGIN', 'BKR', NULL, 'remember=true', '2026-10-17T09:16:21.710+00:00');
INSERT INTO `Log` ("id", "action", "actor", "target", "details", "createdAt") VALUES ('cmvc6nt3o001dnlxriuhdv416', 'DELETE', 'BKR', 'يوسف علي', 'نوع: عام', '2026-10-17T09:17:25.141+00:00');
INSERT INTO `Log` ("id", "action", "actor", "target", "details", "createdAt") VALUES ('cmvc6w8r2001lnlxr6zrspnd2', 'CREATE', 'BKR', 'احمد علي', 'عام — 30 يوم', '2026-10-17T09:23:58.670+00:00');
INSERT INTO `Log` ("id", "action", "actor", "target", "details", "createdAt") VALUES ('cmvc6wlf8001mnlxrvqi829wj', 'UPDATE', 'BKR', 'احمد علي', NULL, '2026-10-17T09:24:15.092+00:00');
INSERT INTO `Log` ("id", "action", "actor", "target", "details", "createdAt") VALUES ('cmvc77s5b001nnlxrnbhlcalf', 'LOGIN', 'BKR', NULL, 'remember=true', '2026-10-17T09:32:57.024+00:00');
INSERT INTO `Log` ("id", "action", "actor", "target", "details", "createdAt") VALUES ('cmvc7akv3001onlxrb5g4gx73', 'DELETE', 'BKR', 'احمد علي', NULL, '2026-10-17T09:35:07.551+00:00');
INSERT INTO `Log` ("id", "action", "actor", "target", "details", "createdAt") VALUES ('cmvc7ar3f001qnlxr7tfovoxh', 'CREATE', 'BKR', 'تتتتت', 'عام — 30 يوم', '2026-10-17T09:35:15.627+00:00');
INSERT INTO `Log` ("id", "action", "actor", "target", "details", "createdAt") VALUES ('cmvc7cf7c001rnlxryjbbdstl', 'DELETE', 'BKR', 'تتتتت', NULL, '2026-10-17T09:36:33.528+00:00');
INSERT INTO `Log` ("id", "action", "actor", "target", "details", "createdAt") VALUES ('cmvc7d7wl001snlxrvsd9vt7m', 'LOGIN', 'BKR', NULL, 'remember=true', '2026-10-17T09:37:10.725+00:00');
INSERT INTO `Log` ("id", "action", "actor", "target", "details", "createdAt") VALUES ('cmvc7de1n001unlxrky5kur8c', 'CREATE', 'BKR', 'علي', 'عام — 30 يوم', '2026-10-17T09:37:18.683+00:00');
INSERT INTO `Log` ("id", "action", "actor", "target", "details", "createdAt") VALUES ('cmvc7dkol001vnlxre1nv3gt9', 'DELETE', 'BKR', 'علي', NULL, '2026-10-17T09:37:27.286+00:00');
INSERT INTO `Log` ("id", "action", "actor", "target", "details", "createdAt") VALUES ('cmvc7futn001wnlxram4xszyl', 'LOGIN', 'BKR', NULL, 'remember=true', '2026-10-17T09:39:13.739+00:00');
INSERT INTO `Log` ("id", "action", "actor", "target", "details", "createdAt") VALUES ('cmvc7ijla001ynlxr9a542qyd', 'CREATE', 'BKR', 'علي محمد', 'خاص — 30 يوم', '2026-10-17T09:41:19.150+00:00');
INSERT INTO `Log` ("id", "action", "actor", "target", "details", "createdAt") VALUES ('cmvc7ivel001znlxr5wh2r26t', 'UPDATE', 'BKR', 'علي محمد', NULL, '2026-10-17T09:41:34.461+00:00');
INSERT INTO `Log` ("id", "action", "actor", "target", "details", "createdAt") VALUES ('cmvc7janb0020nlxrvqty6qne', 'UPDATE', 'BKR', 'علي محمد', NULL, '2026-10-17T09:41:54.216+00:00');
INSERT INTO `Log` ("id", "action", "actor", "target", "details", "createdAt") VALUES ('cmvc7ov4s0021nlxrvgqcka0n', 'UPDATE', 'BKR', 'علي محمد', NULL, '2026-10-17T09:46:14.044+00:00');
INSERT INTO `Log` ("id", "action", "actor", "target", "details", "createdAt") VALUES ('cmvc7ozzr0022nlxr2jeyszm8', 'LOGIN', 'BKR', NULL, 'remember=true', '2026-10-17T09:46:20.343+00:00');
INSERT INTO `Log` ("id", "action", "actor", "target", "details", "createdAt") VALUES ('cmvc7p3s10023nlxrjarqny8c', 'UPDATE', 'BKR', 'علي محمد', NULL, '2026-10-17T09:46:25.250+00:00');
INSERT INTO `Log` ("id", "action", "actor", "target", "details", "createdAt") VALUES ('cmvc7z6ai0024nlxrerwr4nz9', 'DELETE', 'BKR', 'علي محمد', NULL, '2026-10-17T09:54:15.067+00:00');
INSERT INTO `Log` ("id", "action", "actor", "target", "details", "createdAt") VALUES ('cmvc7zr8k0026nlxrq0grx6iy', 'CREATE', 'BKR', 'test', 'عام — 30 يوم', '2026-10-17T09:54:42.212+00:00');
INSERT INTO `Log` ("id", "action", "actor", "target", "details", "createdAt") VALUES ('cmvc800gy0027nlxr7oztvc02', 'UPDATE', 'BKR', 'test', NULL, '2026-10-17T09:54:54.179+00:00');
INSERT INTO `Log` ("id", "action", "actor", "target", "details", "createdAt") VALUES ('cmvc80e7b0028nlxrbr3gx5xv', 'UPDATE', 'BKR', 'test', NULL, '2026-10-17T09:55:11.976+00:00');
INSERT INTO `Log` ("id", "action", "actor", "target", "details", "createdAt") VALUES ('cmvc8jkuw0029nlxrrlemsyer', 'LOGIN', 'BKR', NULL, 'remember=true', '2026-10-17T10:10:07.064+00:00');
INSERT INTO `Log` ("id", "action", "actor", "target", "details", "createdAt") VALUES ('cmvc8zma9002anlxr7fo19rei', 'DELETE', 'BKR', 'test', NULL, '2026-10-17T10:22:35.409+00:00');
INSERT INTO `Log` ("id", "action", "actor", "target", "details", "createdAt") VALUES ('cmvc8zt18002cnlxr4bo4sfge', 'CREATE', 'BKR', 'kkkkkkkkkk', 'عام — 30 يوم', '2026-10-17T10:22:44.156+00:00');
INSERT INTO `Log` ("id", "action", "actor", "target", "details", "createdAt") VALUES ('cmvc902vu002dnlxr0jfh4v3j', 'UPDATE', 'BKR', 'kkkkkkkkkk', NULL, '2026-10-17T10:22:56.922+00:00');
INSERT INTO `Log` ("id", "action", "actor", "target", "details", "createdAt") VALUES ('cmvc91l0o002enlxrznx5b7i5', 'LOGIN', 'BKR', NULL, 'remember=true', '2026-10-17T10:24:07.081+00:00');
INSERT INTO `Log` ("id", "action", "actor", "target", "details", "createdAt") VALUES ('cmvc9ly4x0000nluwpgchv944', 'LOGIN', 'BKR', NULL, 'remember=true', '2026-10-17T10:39:57.201+00:00');
INSERT INTO `Log` ("id", "action", "actor", "target", "details", "createdAt") VALUES ('cmvc9ouvb0001nluwipnmjlgh', 'DELETE', 'BKR', 'kkkkkkkkkk', NULL, '2026-10-17T10:42:12.935+00:00');
INSERT INTO `Log` ("id", "action", "actor", "target", "details", "createdAt") VALUES ('cmvc9pg7a0002nluwuw6e4lcg', 'DELETE', 'BKR', 'تجربة — 30 يوم كامل', NULL, '2026-10-17T10:42:40.583+00:00');
INSERT INTO `Log` ("id", "action", "actor", "target", "details", "createdAt") VALUES ('cmvc9pje20003nluwh146vz1h', 'DELETE', 'BKR', 'تجربة — آخر أيام', NULL, '2026-10-17T10:42:44.714+00:00');
INSERT INTO `Log` ("id", "action", "actor", "target", "details", "createdAt") VALUES ('cmvc9pmce0004nluwppjczj70', 'DELETE', 'BKR', 'تجربة — نصف المدة', NULL, '2026-10-17T10:42:48.542+00:00');
INSERT INTO `Log` ("id", "action", "actor", "target", "details", "createdAt") VALUES ('cmvc9r4a40006nluw1v6gj9v6', 'CREATE', 'BKR', 'يوسف علي', 'عام — 31 يوم', '2026-10-17T10:43:58.445+00:00');
INSERT INTO `Log` ("id", "action", "actor", "target", "details", "createdAt") VALUES ('cmvc9uysc0008nluwmolemlnp', 'CREATE', 'BKR', 'فهد امجد', 'عام — 31 يوم', '2026-10-17T10:46:57.948+00:00');
INSERT INTO `Log` ("id", "action", "actor", "target", "details", "createdAt") VALUES ('cmvc9vryu000anluw7rizptu2', 'CREATE', 'BKR', 'يونس اسعد', 'عام — 30 يوم', '2026-10-17T10:47:35.766+00:00');
