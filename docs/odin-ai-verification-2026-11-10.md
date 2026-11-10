# Odin AI: реализация и проверка, 10 ноября 2026

## Результат и границы

Реализованы серверные права, периоды 100/5, атомарное списание, повтор запросов
и проверка бренда при скачивании защищённых стилей. Собраны оба Next.js приложения
и Odin CEP. Проверки выполнялись с вымышленными аккаунтами и без реальных платежей.

Production-код, production-миграции и балансы реальных пользователей НЕ менялись.
По SSH читались конфигурация/схема и данные для понимания существующего биллинга.
На сервере созданы только две отдельные тестовые MySQL БД, ограниченный тестовый
DB-пользователь и отдельный Redis, привязанный к loopback. Production-деплой,
backfill и массовая выдача реальным подписчикам ещё не выполнялись.

Полная приёмка внутри Adobe **не завершена**: отдельная тестовая панель запускается,
но Computer Use блокирует ввод в её дочернем процессе CEPHtmlEngine. Поэтому вход,
баланс, генерация на таймлайне и восстановление сессии внутри Adobe отмечены
NOT TESTED. HTTP-проверки реальных серверных обработчиков и unit-проверки состояния
панели не заменяют эти ручные сценарии.

## Принятые правила

| Состояние | Генерации | Обновление |
| --- | --- | --- |
| Активная месячная подписка, включая покупку со скидкой | 100 | Подтверждённое списание |
| Годовая подписка | 100 | Ежемесячно от даты покупки внутри оплаченного года |
| Lifetime | 100 | Ежемесячно от даты покупки |
| Seat | 100 каждому аккаунту | Период оплаченной подписки владельца |
| Любой зарегистрированный неоплаченный аккаунт / trial | 5 | Ежемесячно от регистрации |
| Отмена автопродления | Сохраняется оплаченный лимит | До конца оплаченного периода, затем trial |
| Полный возврат / chargeback | Сразу trial, лимит 5 | От даты регистрации |
| Явная административная блокировка доступа | 0 | До снятия блокировки |

Остаток не переносится. Расход платного периода не вычитает trial-генерации.
Если аккаунт уже потратил trial-генерации в текущем периоде регистрации, этот расход
сохраняется после возврата: покупка/возврат не перезапускает бесплатную квоту.
Для коротких месяцев дата ограничивается последним днём, затем восстанавливается:
31 января → 28/29 февраля → 31 марта. Используется исходная дата и время в UTC.
Sandbox-платежи не дают платную AI-квоту. Дополнительных покупок Odin-кредитов и
произвольного пополнения нет. Частичный возврат как пользовательская функция не
добавлялся; совместимость с историческими accounting-событиями сохранена.

## Что изменено

**Odin / `ione-premiere-basics`:**

- `db/ai-entitlements.mjs`: серверный расчёт платных и trial-периодов, лимитов и
  стабильного идентификатора периода. Неполные даты не заменяются выдуманными.
- `db/migrations/2026_11_10_001_ai_billing_periods.sql`: подтверждение платежа,
  исходная дата покупки, последний платёж/заказ, оплачено до, отзыв доступа.
  Исправление исторических возвратов/chargeback по подтверждённым продажам.
- `db/subscription-date.mjs`: отзыв/истечение/неподтверждённая оплата; ISO-даты
  PayPro без суффикса трактуются как UTC.
- `src/lib/cep-auth.ts`: реальная дата регистрации и version-2 `entitlements.ai`,
  отдельные права на библиотеку и генерации, поддержка Seats.
- `src/lib/odin-ai-billing.ts`, `src/lib/paypro-sales.ts`,
  `src/app/api/payment/route.ts`: подпись + проверка заказа через PayPro,
  подтверждённый период, старые/повторные события, отзыв после возврата/chargeback.
  Подтверждённый выигранный спор восстанавливает исходный период без новой квоты.
- `src/lib/odin-subscription-management.ts`: ручная подписка получает исходную
  дату и подтверждение; повтор административной операции не создаёт подписку снова.
- `scripts/backfill-ai-billing.mjs`: preview по умолчанию; запись только с
  `--apply`. Сверяет исходные даты и последний заказ, читает все ответы до записи,
  не перезаписывает более новые платежи/отзывы, не печатает API-секреты.
- `tests/cep/fixtures/{odin,load-source}.mjs`, `ai-periods.test.mjs`,
  `ai-entitlements.test.mjs`, `ai-billing.test.mjs`, `ai-backfill.test.mjs`,
  `package.json`; старые fixtures в `affiliates`, `cinecom`, `subscriptions`
  дополнены новыми колонками. Реальные миграции применяются в тестовой PostgreSQL.
- `CEP_ODIN.md` и этот отчёт.

**Motionflow / соседний `next-app`:**

- `lib/odin-ai.ts`, `lib/generations.ts`: фиксированный серверный endpoint Odin,
  строгая проверка version-2 allocation, квота по аккаунту/периоду вместо UTC-месяца.
- `lib/odin-ai-context.ts`, `lib/odin-ai-operations.ts`: блокировка аккаунта до
  обращения к провайдеру; подготовка расхода; повторная авторизация перед commit;
  успешный ответ и расход фиксируются одной транзакцией. Повтор того же ID,
  содержимого, инструмента и периода возвращает результат без нового списания.
  Параллельная операция возвращает 409 до платного обращения к провайдеру.
- `db/migrations/2026_11_10_odin_ai_period_usage.sql`: новый ledger и cache операций.
  Старый `odin_ai_generations` сохранён. Новый ledger пуст: при внедрении каждый
  действующий подписчик начинает со 100 без вычитания старого календарного расхода.
- `lib/auth/resolve-captions-user.ts`, `app/(main)/api/captions/route.ts`:
  проверка конкретного бренда до выдачи защищённого файла; недействительный Bearer
  не заменяется сессией другого аккаунта из cookies.
- `app/(main)/api/generations/{captions,chapters,caption-highlights}/route.ts`:
  защита операции и отмена. Silence Remover использует Captions.
- `lib/captions-chapters-receipt.ts`: Redis-claim привязан к аккаунту/операции;
  повтор собственной неуспешной операции не теряет бесплатный Chapters follow-up.
- `scripts/lib/odin-ai-test-runtime.mjs`, `test-odin-ai.mjs`,
  `test-odin-ai-integration.mjs`, `odin-ai-test-server.mjs`,
  `test-odin-ai-http.mjs`, обновлён fixture `test-generation-cost.mjs`;
  `docs/odin-ai-generations.md`.

**CEP / соседний `CEP/motionflow-omni`:**

- `brands.config.ts`: Odin отображает только серверные tier/limit, включая 0 и 5.
- `src/js/api/credits.ts`, `src/js/hooks/use-generations-balance.ts`: дата сброса,
  trial-баланс, обновление при фокусе/расходе, очистка при ошибке/выходе и защита
  от позднего ответа предыдущего аккаунта.
- `src/js/components/{ai-tools-list,ai-tools-panel}.tsx`,
  `src/js/ui/odin/OdinAiToolsPanel.tsx`: отображение даты обновления.
- `packages/omni/src/ai/{operation-id,transcribe,chapters,caption-highlights}.ts`:
  идентификаторы операций; они не дают прав и не задают лимит.
- `scripts/cli.mjs`, `vite.config.ts`, `scripts/test-cli.mjs`: обычная сборка
  больше не превращается в бесконечный watch; build использует production mode.
- `scripts/prepare-odin-ai-test-extension.mjs`: отдельная тестовая копия сборки
  с localhost API, отдельным bundle ID и хранилищем, без замены production-панели.
- `scripts/test-odin-ai.mjs`, `scripts/test-generations-balance.mjs`.

Пользовательские изменения в email/preview-sales, partner-страницах, viral titles,
Gal/Spunkram UI, MOGRT/User Design и других заранее изменённых файлах сохранены.
В Chapters и receipt изменения добавлялись поверх существующей реализации.
Коммиты и push не выполнялись. Автоматические изменения tsconfig от тестовых
сборок убраны; build-каталоги исключены локально через `.git/info/exclude`.

## Исправленные проблемы

1. Квота календарного месяца и нулевая квота для зарегистрированных free-аккаунтов.
2. Chargeback ранее мог оставлять `active`; теперь платный доступ отзывается.
3. Даты/права из неподтверждённого или повторного события могли менять доступ.
4. Старое списание не было связано с сохранением результата: теперь они атомарны.
5. На реальном MySQL конкурентный `INSERT IGNORE` приводил к deadlock при
   последующем UPDATE. Заменён на no-op duplicate UPDATE с эксклюзивной блокировкой.
6. Подписка одного бренда могла разрешать защищённый стиль другого бренда.
7. Поздний ответ баланса мог попасть в сменившийся аккаунт; ошибка оставляла старый баланс.
8. Неуспешный Chapters follow-up мог потратить одноразовый receipt без результата.
9. Обычная panel build зависала в watch; ручная подписка не имела AI billing anchor.
10. Backfill теперь проверяет последний заказ, включая исторические возвраты,
    и восстанавливает исходную покупку вместо первой имеющейся записи о продлении.

## Результаты автоматических сценариев

| Сценарий | Результат / доказательство |
| --- | --- |
| Регистрация, вход, реальная сессия, CSRF и device consent/token/profile | PASS — HTTP |
| 100 платному владельцу, отдельные 100 Seat, 5 unpaid/expired/admin без подписки | PASS — account + MySQL + HTTP |
| Дисконтированный подтверждённый платёж даёт полные 100 | PASS — webhook |
| Первоначальный платёж, продление, повтор/старое событие | PASS — webhook + periods |
| Подтверждённый переход monthly → annual | PASS — webhook + profile |
| Annual/Lifetime ежемесячно, дни 29/30/31, отсутствие переноса | PASS — periods + ledger |
| Отмена сохраняет оплаченный доступ; истечение, возврат, chargeback → trial | PASS — account + HTTP |
| Администратор выдаёт ручную подписку; повтор не дублирует | PASS — real management + browser UI |
| Выигранный chargeback восстанавливает тот же период | PASS — webhook |
| Неверная подпись / неподтверждённая лицензия / сбой провайдера не дают 100 | PASS — webhook |
| Исторические refund/chargeback/pending не становятся платными при backfill | PASS — backfill |
| Достаточно / ровно весь остаток / недостаточно / ноль | PASS — real SQL + HTTP |
| 120 параллельных списаний paid и 25 trial не уходят в минус | PASS — реальные pooled MySQL connections |
| Одновременные генерации не запускают второго платного provider work | PASS — account lock, второй ответ 409 |
| Тот же operation ID не списывает дважды; другое содержимое даёт conflict | PASS — MySQL + HTTP |
| Error / timeout / 429 / отмена не списывают; повтор после ошибки возможен | PASS — operation + HTTP |
| Ошибка записи cache после успешного провайдера откатывает расход | PASS — реальный MySQL trigger/transaction |
| Refund во время генерации отзывается до commit, trial-расход не задет | PASS — PostgreSQL + MySQL |
| Captions → Chapters: signed receipt, Redis claim, бесплатный follow-up | PASS — HTTP + отдельный реальный Redis |
| Ошибка Chapters и повтор с тем же operation ID | PASS — HTTP |
| Недействительный/отозванный/истёкший token, подмена identity/limit | PASS — auth + HTTP |
| Чужой бренд и чужая author subscription не разрешают protected download | PASS — actual permissions + route |
| Обычный аккаунт не вызывает admin credits и fixture admin | PASS — реальные admin handlers / HTTP |
| Смена аккаунта, поздний ответ, focus, ноль/ошибка очищают баланс | PASS — unit реального balance hook |
| Существующие costs, author extra credits, usage, shared auth, SDK, startup/update | PASS — смежные регрессии |
| Реальный PayPro checkout/списание/доставка production-IPN | NOT TESTED — реальные платежи запрещены |
| Частичный возврат | NOT TESTED как продуктовая функция — не поддерживается |

Итог последних запусков: Odin **86**, Motionflow auth/integration **20**, HTTP
**12**, Motionflow costs/admin/usage **26**, CEP auth/AI/CLI **40**, CEP balance
**3**, CEP adjacent **26**, SDK **52**: **265 PASS, 0 FAIL**.
Это число отдельных test cases в выбранных наборах, не число ручных сценариев.

Подменяются внешние PayPro/Replicate/хранилище и транспорт cookie Next в standalone
HTTP-стенде. Бизнес-логика аккаунтов, webhooks, прав, SQL-расхода и receipt реальная.
HTTP-стенд использует PostgreSQL 17, MySQL 8 и Redis. Unit-тесты аккаунтов используют
PostgreSQL-совместимый PGlite с настоящими миграциями. Стенд не поднимает весь Next
маркетплейс: он загружает настоящие обработчики приложения.

## Сборки и Adobe

| Проверка | Результат |
| --- | --- |
| Odin `npm run build` (Next 16.3.7), включая TypeScript | PASS |
| Motionflow `npm run build` (Next 16.4.5), включая TypeScript | PASS |
| Odin CEP `npm run build -- --author=odin` (SDK + host + panel) | PASS |
| Установка отдельной панели и её запуск в After Effects 2025 | PASS |
| Вход каждым аккаунтом и баланс внутри Adobe | NOT TESTED — ограничение Computer Use CEPHtmlEngine |
| Списание при реальной операции на таймлайне, проверка результата MOGRT/AEP | NOT TESTED |
| Закрытие/повторное открытие, рестарт Adobe и восстановление сессии | NOT TESTED |
| Premiere Pro | NOT TESTED — существующий несохранённый проект не трогался |

Build предупреждает о размере CEP chunks и `metadataBase` в Motionflow.
При prerender общих страниц пустой тестовой БД Motionflow также логирует отсутствие
несвязанных marketplace-таблиц; эти страницы имеют fallback, build завершён exit 0.
Это не проверка наполненного storefront. Защищённое тестовое скачивание возвращает
placeholder, который не является рабочим MOGRT. Реальные provider responses и
финальное применение на таймлайне требуют отдельной staging-проверки.

## Стенд и аккаунты

Артефакты: `C:\Users\nipap\.codex\artifacts\odin-ai-2026-11-10`.
Сайт стенда: `http://127.0.0.1:13900/`. Все аккаунты используют пароль
`OdinFixture!2026`; это только вымышленные локальные тестовые данные.

| Email | Роль / состояние после сброса fixtures | Лимит / остаток |
| --- | --- | --- |
| trial@odin-test.invalid | registered, без подписки | 5 / 5 |
| paid@odin-test.invalid | active monthly | 100 / 100 |
| seat@odin-test.invalid | Seat владельца paid | 100 / 100 |
| expired@odin-test.invalid | истёкшая подписка | 5 / 5 |
| zero@odin-test.invalid | active, всё потрачено | 100 / 0 |
| enough@odin-test.invalid | active, достаточно для операции | 100 / 10 |
| insufficient@odin-test.invalid | active, недостаточно для cost=2 | 100 / 1 |
| admin@odin-test.invalid | администратор, без подписки | 5 / 5 |

HTTP suite дополнительно создаёт `new-<random>@odin-test.invalid` реальным signup
action. Последний перезапуск стенда восстановил исходные восемь аккаунтов.
`fixture-accounts-ready.json` содержит фактический серверный snapshot после сброса.

Browser UI: вход администратором и выдача trial-аккаунту ручной подписки выполнены;
`ui-admin-after-grant.json` подтверждает limit/remaining 100. Затем fixtures сброшены
для следующей ручной проверки.

Изолированная Adobe-панель:
`C:\Users\nipap\AppData\Roaming\Adobe\CEP\extensions\odin-ai-test-20261110`,
меню **Odin Pro AI Test**, bundle `com.odinpro.cep.ai-test`, отдельное хранилище.
Production extension не заменялось. Тестовая копия не предназначена для публикации.

## Повторный запуск на этой машине

Установлены зависимости трёх checkout и `tests/cep`. Для unit-тестов:

```powershell
Set-Location C:\Users\nipap\Documents\motionflow\ione-premiere-basics
npm test --prefix tests/cep

Set-Location C:\Users\nipap\Documents\motionflow\next-app
$env:ODIN_AI_TEST_ENV='C:\Users\nipap\.codex\artifacts\odin-ai-2026-11-10\.env.test'
node --experimental-strip-types --test scripts/test-odin-ai.mjs scripts/test-odin-ai-integration.mjs
node --test scripts/test-generation-cost.mjs scripts/test-author-generation-credits.mjs scripts/test-ai-usage.mjs

Set-Location C:\Users\nipap\Documents\motionflow\CEP\motionflow-omni
node --import tsx --test scripts/test-odin-ai.mjs scripts/test-generations-balance.mjs scripts/test-shared-auth-session.mjs scripts/test-device-session.mjs scripts/test-interpret-device-auth-poll.mjs scripts/test-spunkram-ai-access.mjs scripts/test-cli.mjs
node --import tsx --test scripts/test-brand-startup.mjs scripts/test-extension-updates.mjs scripts/test-caption-single-operation.mjs scripts/test-brand-host-isolation.mjs
npm test --workspace motionflow-omni
npm run build -- --author=odin
```

MySQL использует SSH forward `127.0.0.1:13316 → motionflow:127.0.0.1:3306`.
Redis: `127.0.0.1:13379 → motionflow:127.0.0.1:16379`, отдельный процесс без
persistence в `/root/codex-odin-ai-test-20261110/redis`. При необходимости открыть
оба forward в отдельном терминале (порты должны быть свободны):

```powershell
ssh -N -L 127.0.0.1:13316:127.0.0.1:3306 -L 127.0.0.1:13379:127.0.0.1:16379 motionflow
```

`.env.test` указывает на `codex_odin_ai_test_20261110`; `.env.ui.test` — на отдельную
`codex_odin_ai_test_20261110_ui`. Файлы содержат тестовый DB-пароль, не коммитить.
Проверки отказываются работать с production DB/host. Нельзя направлять интеграционные
тесты на UI DB: они очищают свои таблицы перед сценариями.

Локальный PostgreSQL cluster: каталог артефактов `pgdata`, порт 13932,
роль `odin_test`, DB `codex_odin_ai_test_20261110`. При остановленном cluster:

```powershell
& 'C:\Program Files\PostgreSQL\17\bin\pg_ctl.exe' -D 'C:\Users\nipap\.codex\artifacts\odin-ai-2026-11-10\pgdata' -l 'C:\Users\nipap\.codex\artifacts\odin-ai-2026-11-10\postgres.log' -o '-h 127.0.0.1 -p 13932' start
```

HTTP-стенд запускать из Motionflow, только один процесс на 13900. Каждый старт
сбрасывает исключительно выделенную PostgreSQL test schema и UI MySQL ledger:

```powershell
Set-Location C:\Users\nipap\Documents\motionflow\next-app
$env:ODIN_AI_TEST_ENV='C:\Users\nipap\.codex\artifacts\odin-ai-2026-11-10\.env.ui.test'
$env:ODIN_PG_TEST_PASSWORD_FILE='C:\Users\nipap\.codex\artifacts\odin-ai-2026-11-10\pg-password.txt'
node --experimental-strip-types scripts/odin-ai-test-server.mjs
```

Из второго терминала: `node --test scripts/test-odin-ai-http.mjs`.
Повторять HTTP suite после перезапуска стенда, так как сценарии меняют fixtures.
Для панели после build из CEP checkout:

```powershell
node scripts/prepare-odin-ai-test-extension.mjs C:\Users\nipap\AppData\Roaming\Adobe\CEP\extensions\odin-ai-test-20261110
```

Для повторной сборки Next держать connection env направленными на тестовые БД.
Odin: `HOST_URL=127.0.0.1`, `HOST_PORT=13932`, `HOST_NAME=odin_test`,
`HOST_DB=codex_odin_ai_test_20261110`, `HOST_PASS` читать из `pg-password.txt`.
Motionflow: переменные `DB_*` читать из `.env.test` без вывода пароля.
В обоих checkout установить `$env:NEXT_DIST_DIR='.next-odin-ai-test'` и выполнить
`npm run build`. Эти команды собирают frontend и backend вместе, не деплоят.

## Логи и скриншоты

В каталоге артефактов:

- `odin-tests-final.log` — последний полный набор сайта.
- `motionflow-ai-final.log`, `motionflow-regression-final2.log` — MySQL/auth и смежные проверки.
- `http-e2e-final.log` — 12 реальных HTTP-сценариев.
- `cep-tests-final3.log`, `cep-balance-tests.log`, `cep-adjacent-tests.log`, `sdk-tests.log`.
- `odin-next-build.log`, `motionflow-next-build.log`, `odin-panel-build.log`.
- `test-server-ready.log` — текущий сброшенный стенд; `test-server-final.log`
  включает ожидаемые ошибки имитируемого провайдера, это не падения тестов.
- `fixture-accounts-ready.json`, `ui-admin-after-grant.json`.

![Тестовая панель в After Effects](C:/Users/nipap/.codex/artifacts/odin-ai-2026-11-10/adobe-test-panel.png)

Абсолютные файлы скриншотов: `C:\Users\nipap\.codex\artifacts\odin-ai-2026-11-10\adobe-test-panel.png`
и `admin-fixture.png`. Скриншот показывает запуск панели; он не доказывает вход/генерацию.

## Внедрение и оставшиеся проверки

1. Согласовать production deploy отдельно. До него никаких реальных начислений не было.
2. Снять backup обеих БД. Применить PostgreSQL/MySQL миграции штатным способом.
3. Запустить preview backfill в Odin deployment env, разобраться с любым missing/
   mismatched provider data, затем выполнить `--apply`. Он может пропустить строку,
   если во время чтения пришёл новый платёж/отзыв; повторить preview/apply после сверки.
4. Внедрить Odin account/webhook, Motionflow metering/brand checks и CEP в этом порядке.
   При рассинхронизации контракта AI временно откажет, а не выдаст выдуманный лимит.
5. Не переносить старый usage в новый ledger: это обеспечивает согласованную выдачу
   полных 100 действующим подписчикам и 5 зарегистрированным аккаунтам.
6. На staging пройти ручной Adobe checklist ниже. Реальное списание PayPro не нужно
   для повторения локальных тестов; live billing-проверка требует отдельного разрешения.

Ручной checklist:

- [ ] Открыть **Odin Pro AI Test** в пустом проекте AE / Premiere.
- [ ] Войти каждым из восьми fixture аккаунтов; сверить Tools с `/test/state`.
- [ ] Trial: 5; paid/Seat: 100; zero: 0; enough: 10; insufficient: 1.
- [ ] Выполнить Captions cost=1 и >5 минут cost=2; сравнить API, MySQL и UI.
- [ ] Проверить zero/insufficient без provider-запуска и повторного списания.
- [ ] Captions + Chapters: только один расход; ошибка Chapters допускает повтор.
- [ ] Админом изменить подписку/остаток; сфокусировать панель и сверить баланс.
- [ ] Отменить renewal, затем expire/refund/chargeback; сверить права и trial-баланс.
- [ ] Выйти и войти другим аккаунтом: старый баланс/стили не сохраняются.
- [ ] Закрыть/открыть панель, затем перезапустить пустой Adobe-проект: сессия и баланс актуальны.
- [ ] Применить действительный staging MOGRT/AEP: placeholder тестового storage для этого не подходит.

Операционные ограничения: успешные ответы сохраняются для idempotent replay и
могут содержать transcript; автоматического retention job пока нет. Повтор с новым
operation ID считается новой генерацией. Отдельный checkout/live provider и
полный storefront UI не покрываются standalone HTTP-стендом. Не откатывать защиту
бренда и исправление chargeback ради восстановления старого AI-контракта; при
необходимости rollback сначала временно отключить AI-трафик.
