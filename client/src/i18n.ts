import { useLanguage, type Language } from './context/LanguageContext';

type Dict = Record<string, string>;

const ru: Dict = {
  'header.login': 'Войти через Steam',
  'header.profile': 'Профиль',
  'header.logout': 'Выйти из аккаунта',
  'header.admin': 'Админ',
  'footer.holdNote': 'Выдача автоматическая, трейд-холд зависит от настроек вашего аккаунта Steam',

  'recentSales.title': 'Последние сделки',
  'recentSales.totalSold': 'Всего продано скинов:',

  'cart.addToCart': 'В корзину',
  'cart.inCart': 'В корзине',
  'cart.title': 'Корзина',
  'cart.empty': 'Корзина пуста.',
  'cart.browse': 'Перейти к предметам',
  'cart.remove': 'Убрать',
  'cart.total': 'Итого',
  'cart.checkout': 'Купить всё за {price}',
  'cart.checkingOut': 'Оформляем...',
  'cart.itemFailed': 'Не удалось купить: {name} — {reason}',
  'cart.someFailed': 'Часть предметов купить не удалось, они остались в корзине.',
  'cart.allDone': 'Все предметы куплены! Смотрите статус в профиле.',

  'home.heroTitle': 'Скины CS2 по лучшим ценам',
  'home.heroSubtitle': 'Мгновенная автоматическая выдача трейд-оффером, оплата криптовалютой.',
  'home.categoryPrefix': 'Категория:',
  'home.noItems': 'Нет предметов по заданным условиям.',
  'home.sort.default': 'По умолчанию',
  'home.sort.price_asc': 'Цена: по возрастанию',
  'home.sort.price_desc': 'Цена: по убыванию',
  'home.sort.discount': 'Сначала скидки',

  'filters.search': 'Поиск по названию...',
  'filters.minPrice': 'Цена от',
  'filters.maxPrice': 'Цена до',

  'sidebar.categories': 'Категории',
  'sidebar.all': 'Все категории',

  'category.Rifle': 'Винтовки',
  'category.Sniper Rifle': 'Снайперские винтовки',
  'category.Pistol': 'Пистолеты',
  'category.SMG': 'Пистолеты-пулемёты',
  'category.Shotgun': 'Дробовики',
  'category.Machinegun': 'Пулемёты',
  'category.Knife': 'Ножи',
  'category.Gloves': 'Перчатки',
  'category.Sticker': 'Стикеры',
  'category.Container': 'Кейсы',
  'category.Agent': 'Агенты',
  'category.Collectible': 'Коллекционные',
  'category.Graffiti': 'Граффити',
  'category.Music Kit': 'Наборы музыки',
  'category.Patch': 'Патчи',
  'category.Key': 'Ключи',

  'item.backToAll': '← Ко всем предметам',
  'item.similar': 'Похожие предметы',
  'item.stickers': 'Наклейки',
  'item.payUsdt': 'оплата криптовалютой',
  'item.cryptoBadge': 'Крипто',
  'item.discountFromMarket': '-{pct}% от рынка',
  'item.demoFloatTitle': 'Демо-значение: бот ещё не подключен, реальный float не запрошен у Steam',
  'item.demoFloatLabel': '(демо, не реальные данные)',
  'item.demoFloatShort': '(демо)',
  'item.demoFloatTitleShort': 'Демо-значение: реальный float ещё не запрошен у Steam',

  'buy.loginToBuy': 'Войти через Steam, чтобы купить',
  'buy.setTradeUrl': 'Укажите trade-ссылку в профиле',
  'buy.topUp': 'Недостаточно баланса — пополнить',
  'buy.buying': 'Покупаем...',
  'buy.buyFor': 'Купить за {price}',
  'buy.genericError': 'Не удалось купить предмет',

  'profile.loading': 'Загрузка...',
  'profile.logout': 'Выйти',
  'profile.steamId': 'SteamID: {id}',
  'profile.balance': 'Баланс',
  'profile.creatingInvoice': 'Создаём счёт...',
  'profile.depositButton': 'Пополнить баланс',
  'profile.depositNote':
    'Сумма всегда в USD — пополнение и баланс не зависят от выбранной валюты отображения.',
  'profile.depositError': 'Не удалось создать депозит',
  'profile.findTradeUrl': 'Найти ссылку',
  'profile.tradeUrlTitle': 'Steam Trade URL',
  'profile.tradeUrlDesc':
    'Нужна для автоматической выдачи скинов. Найти можно на steamcommunity.com в настройках инвентаря → «Обмен».',
  'profile.tradeHoldWarning':
    'Для мгновенной выдачи у вас должен быть включён Steam Guard Mobile Authenticator минимум 7 дней — иначе Steam наложит trade hold на полученный предмет.',
  'profile.save': 'Сохранить',
  'profile.saved': 'Сохранено',
  'profile.saveError': 'Не удалось сохранить',
  'profile.myOrders': 'История покупок',
  'profile.noOrders': 'Пока нет ни одной покупки.',

  'order.status.PAID': 'Оплачено',
  'order.status.AWAITING_MANUAL_FULFILLMENT': 'Продавец готовит трейд',
  'order.status.TRADE_SENT': 'Трейд отправлен',
  'order.status.COMPLETED': 'Завершено',
  'order.status.FAILED': 'Ошибка (деньги возвращены)',

  'orderPage.back': '← На главную',
  'orderPage.title': 'Заказ #{id}',
  'orderPage.done': 'Готово',
  'orderPage.failedLabel': 'Ошибка',
  'orderPage.failureSuffix': '. Средства автоматически возвращены на ваш баланс.',
  'orderPage.awaitingNote':
    'Продавец отправляет трейд-офферы вручную — это может занять некоторое время. Проверьте уведомления в Steam чуть позже.',

  'deposit.back': '← В профиль',
  'deposit.caption': 'пополнение баланса криптовалютой',
  'deposit.status.PENDING': 'Ожидание оплаты',
  'deposit.status.COMPLETED': 'Зачислено на баланс',
  'deposit.status.FAILED': 'Оплата не прошла',
  'deposit.status.EXPIRED': 'Счёт истёк',

  'faq.title': 'Часто задаваемые вопросы',
  'faq.subtitle': 'Если ответа на ваш вопрос тут нет — свяжитесь с продавцом напрямую.',
  'faq.q1': 'Как купить скин?',
  'faq.a1':
    'Войдите через Steam (кнопка в шапке сайта), укажите в профиле свою Steam Trade URL, пополните баланс криптовалютой и нажмите «Купить» на нужном предмете. Сумма спишется с баланса, а скин отправится вам трейд-оффером в Steam.',
  'faq.q2': 'Нужна ли отдельная регистрация и пароль?',
  'faq.a2': 'Нет. Вход только через ваш Steam-аккаунт — отдельного логина и пароля для сайта не существует.',
  'faq.q3': 'Как пополнить баланс?',
  'faq.a3':
    'В разделе «Профиль» введите сумму и оплатите удобной криптовалютой через платёжный сервис NOWPayments. Баланс зачисляется автоматически, как только сеть подтвердит платёж — обычно несколько минут.',
  'faq.q4': 'Что такое Trade URL и зачем он нужен?',
  'faq.a4':
    'Это ссылка, по которой Steam понимает, кому отправлять обмен предметами. Найти её можно в Steam → Инвентарь → настройки → «Обмен». Без указанной Trade URL сайт не сможет отправить вам купленный скин.',
  'faq.q5': 'Как быстро я получу скин после покупки?',
  'faq.a5':
    'Обычно в течение нескольких минут после оплаты — выдача автоматическая. Если продавец в моменте обрабатывает заказы вручную, это может занять чуть дольше; актуальный статус всегда виден на странице заказа в профиле.',
  'faq.q6': 'Почему у меня trade hold и предмет не пришёл сразу?',
  'faq.a6':
    'Это ограничение самого Steam, а не сайта: если мобильный аутентификатор Steam Guard включён у вас меньше 7 дней (или вы недавно меняли пароль/email), Steam автоматически задерживает входящие обмены на несколько дней. Просто подождите — предмет придёт в ваш инвентарь сам, как только hold истечёт.',
  'faq.q7': 'Что будет, если сделка не пройдёт?',
  'faq.a7':
    'Если трейд-оффер не был принят (истёк, отклонён и т.п.), деньги автоматически возвращаются на ваш баланс на сайте — без обращения в поддержку. После этого можно сразу попробовать купить снова.',
  'faq.q8': 'Можно ли вывести деньги с баланса обратно?',
  'faq.a8':
    'Автоматического вывода баланса обратно в криптовалюту пока нет. Если это нужно — напишите в поддержку, вопрос решается вручную.',
  'faq.q9': 'Могу ли я продать свои скины через этот сайт?',
  'faq.a9':
    'Да, в разделе «Продать». Вы увидите предложенную сумму по каждому предмету (это процент от рыночной цены — комиссия за скупку) ещё до входа, а после подтверждения отправляете предмет по указанной trade-ссылке. Деньги зачисляются на баланс не сразу, а после того как владелец сайта вручную подтвердит получение предмета — это связано с тем, что Steam может задерживать входящие трейды (trade hold) на несколько дней, и раньше этого срока нельзя быть уверенным, что предмет действительно получен.',
  'faq.q10': 'Куда обращаться, если возникла проблема?',
  'faq.a10': 'Напишите на lev2009177@gmail.com — этот адрес также указан в подвале сайта.',

  'sell.title': 'Продать скины',
  'sell.intro':
    'Мы выкупаем ваши скины по выгодной цене. Точную сумму за каждый предмет вы видите ниже перед продажей. Деньги зачисляются на баланс сайта после того, как мы получим и проверим предмет — обычно это занимает несколько дней из-за trade hold Steam.',
  'sell.minPrice': 'Принимаем предметы дороже {price}.',
  'sell.loginToSell': 'Войдите через Steam, чтобы увидеть свой инвентарь',
  'sell.loadingInventory': 'Загружаем ваш инвентарь Steam...',
  'sell.inventoryError':
    'Не удалось получить инвентарь Steam. Либо он не публичный, либо Steam сейчас временно ограничивает запросы — попробуйте через минуту.',
  'sell.retry': 'Попробовать снова',
  'sell.emptyInventory': 'В вашем инвентаре нет предметов, доступных для продажи.',
  'sell.marketPrice': 'Рынок',
  'sell.notSellable': 'Слишком низкая цена',
  'sell.sellFor': 'Продать за {price}',
  'sell.confirmTitle': 'Отправьте предмет по этой ссылке',
  'sell.confirmName': 'Предмет',
  'sell.confirmPayout': 'Вы получите',
  'sell.confirmWarning':
    'Отправьте {name} трейд-оффером по ссылке выше. Как только отправите — нажмите кнопку ниже. Деньги зачислятся после того, как мы проверим получение предмета (может занять несколько дней).',
  'sell.markSent': 'Я отправил(а) трейд',
  'sell.markingSent': 'Отмечаем...',
  'sell.myOffers': 'Мои заявки на продажу',
  'sell.status.PENDING_TRANSFER': 'Ждём отправку',
  'sell.status.AWAITING_CONFIRMATION': 'Ждём подтверждения получения',
  'sell.status.COMPLETED': 'Оплачено',
  'sell.status.REJECTED': 'Отклонено',
  'sell.error.generic': 'Не удалось выполнить действие',
  'header.sell': 'Продать',
  'header.buy': 'Купить',
  'header.referral': 'Реферальная программа',
  'footer.privacy': 'Политика конфиденциальности',

  'referral.title': 'Приглашайте друзей и зарабатывайте',
  'referral.intro':
    'Вы получаете {percent}% от суммы, которую приглашённые вами пользователи заработали, продав нам свои скины. Деньги начисляются на ваш баланс сразу после подтверждения их продажи.',
  'referral.rule': 'Пожалуйста, не используйте реферальную ссылку в платной рекламе — при явных злоупотреблениях начисления могут быть отменены.',
  'referral.loginPrompt': 'Войдите через Steam, чтобы получить свою реферальную ссылку',
  'referral.yourLink': 'Ваша реферальная ссылка',
  'referral.copy': 'Скопировать',
  'referral.copied': 'Скопировано',
  'referral.statEarned': 'Всего заработано',
  'referral.statEarnedHint': 'Начните зарабатывать уже сегодня',
  'referral.statPercent': 'Ваш процент',
  'referral.statPercentHint': 'От суммы продаж приглашённых',
  'referral.statInvited': 'Приглашено пользователей',
  'referral.statInvitedHint': 'Поделитесь ссылкой с друзьями',
  'referral.tableTitle': 'Приглашённые пользователи',
  'referral.colSteamId': 'Пользователь',
  'referral.colJoined': 'Дата регистрации',
  'referral.colEarned': 'Заработано',
  'referral.empty': 'Пока никого не пригласили — поделитесь ссылкой выше.',

  'privacy.pageTitle': 'Политика конфиденциальности',
  'privacy.intro':
    'Girgich Store — личный магазин скинов CS2. Ниже честно и простыми словами описано, какие данные мы собираем и что с ними делаем. Мы не юридическая фирма, но стараемся быть максимально прозрачными в том, что реально происходит на сайте.',
  'privacy.title1': 'Какие данные мы собираем',
  'privacy.body1':
    'При входе через Steam мы получаем ваш SteamID, отображаемое имя и аватар — это всё, что даёт Steam при авторизации. Дополнительно вы сами указываете в профиле свою Steam Trade URL. Мы также храним историю ваших покупок и заявок на продажу (какой предмет, по какой цене, статус) и текущий баланс на сайте.',
  'privacy.title2': 'Зачем нам эти данные',
  'privacy.body2':
    'Чтобы узнавать вас при входе, списывать и начислять баланс, отправлять купленные скины трейд-оффером именно вам, а выкупленные у вас скины принимать на нужный аккаунт. Больше ни для чего эти данные не используются — ни для рекламы, ни для аналитики поведения.',
  'privacy.title3': 'Платежи',
  'privacy.body3':
    'Приём и вывод криптовалюты технически обрабатывает сторонний платёжный сервис NOWPayments — при пополнении баланса вы вводите данные платежа на его стороне, а не на нашей. Мы получаем от него только подтверждение, что платёж прошёл, и сумму — реквизиты вашего кошелька или карты нам не передаются и не хранятся у нас.',
  'privacy.title4': 'Кому мы передаём данные',
  'privacy.body4':
    'Steam — для входа на сайт. NOWPayments — для обработки платежей. Внутренние уведомления о новых заказах (имя, ссылка на ваш Steam-профиль, сумма) приходят владельцу сайта в Telegram — это уведомление только для владельца, не публикуется и никому больше не передаётся. Мы не продаём и не передаём данные пользователей никаким другим третьим лицам, не показываем рекламу и не используем аналитические трекеры вроде Google Analytics.',
  'privacy.title5': 'Cookie и локальное хранилище браузера',
  'privacy.body5':
    'Мы используем cookie и localStorage только для того, чтобы помнить, что вы вошли в аккаунт (без этого пришлось бы логиниться заново на каждой странице), а также чтобы запомнить выбранный язык и валюту отображения цен. Отдельно на сайте показан примерный счётчик посетителей онлайн — он использует случайный анонимный идентификатор в localStorage, никак не привязанный к вашему аккаунту или личности.',
  'privacy.title6': 'Хранение и удаление данных',
  'privacy.body6':
    'Данные аккаунта хранятся, пока существует ваш профиль на сайте. Если хотите удалить свои данные или узнать, что именно о вас хранится — напишите нам, обработаем запрос вручную. Обратите внимание: сами предметы и трейд-офферы в Steam находятся вне нашего контроля и регулируются правилами самого Steam.',
  'privacy.title7': 'Связь с нами',
  'privacy.body7': 'По любым вопросам о персональных данных пишите на lev2009177@gmail.com — этот же адрес указан в подвале сайта.',
};

const en: Dict = {
  'header.login': 'Log in with Steam',
  'header.profile': 'Profile',
  'header.logout': 'Log out',
  'header.admin': 'Admin',
  'footer.holdNote': "Delivery is automatic; trade hold depends on your Steam account's settings",

  'recentSales.title': 'Recent sales',
  'recentSales.totalSold': 'Total items sold:',

  'cart.addToCart': 'Add to cart',
  'cart.inCart': 'In cart',
  'cart.title': 'Cart',
  'cart.empty': 'Your cart is empty.',
  'cart.browse': 'Browse items',
  'cart.remove': 'Remove',
  'cart.total': 'Total',
  'cart.checkout': 'Buy all for {price}',
  'cart.checkingOut': 'Processing...',
  'cart.itemFailed': "Couldn't buy: {name} — {reason}",
  'cart.someFailed': "Some items couldn't be bought and remain in your cart.",
  'cart.allDone': 'All items purchased! Check their status in your profile.',

  'home.heroTitle': 'CS2 skins at the best prices',
  'home.heroSubtitle': 'Instant automatic delivery via trade offer, payment in crypto.',
  'home.categoryPrefix': 'Category:',
  'home.noItems': 'No items match the current filters.',
  'home.sort.default': 'Default',
  'home.sort.price_asc': 'Price: low to high',
  'home.sort.price_desc': 'Price: high to low',
  'home.sort.discount': 'Biggest discount first',

  'filters.search': 'Search by name...',
  'filters.minPrice': 'Min price',
  'filters.maxPrice': 'Max price',

  'sidebar.categories': 'Categories',
  'sidebar.all': 'All categories',

  'category.Rifle': 'Rifles',
  'category.Sniper Rifle': 'Sniper Rifles',
  'category.Pistol': 'Pistols',
  'category.SMG': 'SMGs',
  'category.Shotgun': 'Shotguns',
  'category.Machinegun': 'Machineguns',
  'category.Knife': 'Knives',
  'category.Gloves': 'Gloves',
  'category.Sticker': 'Stickers',
  'category.Container': 'Cases',
  'category.Agent': 'Agents',
  'category.Collectible': 'Collectibles',
  'category.Graffiti': 'Graffiti',
  'category.Music Kit': 'Music Kits',
  'category.Patch': 'Patches',
  'category.Key': 'Keys',

  'item.backToAll': '← All items',
  'item.similar': 'Similar items',
  'item.stickers': 'Stickers',
  'item.payUsdt': 'payment in crypto',
  'item.cryptoBadge': 'Crypto',
  'item.discountFromMarket': '-{pct}% off market',
  'item.demoFloatTitle': "Demo value: bot isn't connected yet, real float hasn't been requested from Steam",
  'item.demoFloatLabel': '(demo, not real data)',
  'item.demoFloatShort': '(demo)',
  'item.demoFloatTitleShort': "Demo value: real float hasn't been requested from Steam yet",

  'buy.loginToBuy': 'Log in with Steam to buy',
  'buy.setTradeUrl': 'Add your trade URL in your profile',
  'buy.topUp': 'Insufficient balance — top up',
  'buy.buying': 'Buying...',
  'buy.buyFor': 'Buy for {price}',
  'buy.genericError': 'Failed to purchase item',

  'profile.loading': 'Loading...',
  'profile.logout': 'Log out',
  'profile.steamId': 'SteamID: {id}',
  'profile.balance': 'Balance',
  'profile.creatingInvoice': 'Creating invoice...',
  'profile.depositButton': 'Top up balance',
  'profile.depositNote': "The amount is always in USD — deposits and balance don't depend on the display currency you've selected.",
  'profile.depositError': 'Failed to create deposit',
  'profile.findTradeUrl': 'Find my link',
  'profile.tradeUrlTitle': 'Steam Trade URL',
  'profile.tradeUrlDesc':
    'Needed for automatic skin delivery. You can find it on steamcommunity.com under inventory settings → "Trade Offers".',
  'profile.tradeHoldWarning':
    'For instant delivery, Steam Guard Mobile Authenticator must have been enabled for at least 7 days — otherwise Steam will place a trade hold on the item you receive.',
  'profile.save': 'Save',
  'profile.saved': 'Saved',
  'profile.saveError': 'Failed to save',
  'profile.myOrders': 'Purchase history',
  'profile.noOrders': "You haven't made any purchases yet.",

  'order.status.PAID': 'Paid',
  'order.status.AWAITING_MANUAL_FULFILLMENT': 'Seller is preparing the trade',
  'order.status.TRADE_SENT': 'Trade sent',
  'order.status.COMPLETED': 'Completed',
  'order.status.FAILED': 'Failed (funds refunded)',

  'orderPage.back': '← Back to home',
  'orderPage.title': 'Order #{id}',
  'orderPage.done': 'Done',
  'orderPage.failedLabel': 'Failed',
  'orderPage.failureSuffix': '. Funds have been automatically refunded to your balance.',
  'orderPage.awaitingNote':
    'The seller sends trade offers manually — this may take a little while. Check your Steam notifications shortly.',

  'deposit.back': '← Back to profile',
  'deposit.caption': 'balance top-up via crypto',
  'deposit.status.PENDING': 'Awaiting payment',
  'deposit.status.COMPLETED': 'Credited to balance',
  'deposit.status.FAILED': 'Payment failed',
  'deposit.status.EXPIRED': 'Invoice expired',

  'faq.title': 'Frequently Asked Questions',
  'faq.subtitle': "If you don't find your answer here, contact the seller directly.",
  'faq.q1': 'How do I buy a skin?',
  'faq.a1':
    'Log in with Steam (button in the site header), add your Steam Trade URL in your profile, top up your balance with crypto, and click "Buy" on the item you want. The amount is deducted from your balance and the skin is sent to you as a Steam trade offer.',
  'faq.q2': 'Do I need a separate registration and password?',
  'faq.a2': "No. You can only log in with your Steam account — there's no separate site login or password.",
  'faq.q3': 'How do I top up my balance?',
  'faq.a3':
    'On the "Profile" page, enter an amount and pay with whichever cryptocurrency is convenient through the NOWPayments payment service. Your balance is credited automatically as soon as the network confirms the payment — usually within a few minutes.',
  'faq.q4': 'What is a Trade URL and why do I need it?',
  'faq.a4':
    "It's the link Steam uses to know who to send item trades to. You can find it in Steam → Inventory → Settings → \"Trade Offers\". Without a Trade URL on file, the site can't send you the skin you bought.",
  'faq.q5': 'How quickly will I get the skin after buying it?',
  'faq.a5':
    'Usually within a few minutes of payment — delivery is automatic. If the seller is currently processing orders manually, it may take a little longer; the current status is always visible on the order page in your profile.',
  'faq.q6': "Why do I have a trade hold and the item didn't arrive right away?",
  'faq.a6':
    "This is a restriction from Steam itself, not the site: if Steam Guard Mobile Authenticator has been enabled on your account for less than 7 days (or you recently changed your password/email), Steam automatically holds incoming trades for a few days. Just wait — the item will arrive in your inventory on its own once the hold expires.",
  'faq.q7': "What happens if the trade doesn't go through?",
  'faq.a7':
    "If the trade offer isn't accepted (expired, declined, etc.), the money is automatically refunded to your balance on the site — no need to contact support. You can then try buying again right away.",
  'faq.q8': 'Can I withdraw money from my balance back out?',
  'faq.a8':
    "There's no automatic withdrawal of balance back to crypto yet. If you need this, contact support — it's handled manually.",
  'faq.q9': 'Can I sell my own skins through this site?',
  'faq.a9':
    'Yes, on the "Sell" page. You\'ll see the offered payout for each item (a percentage of market price — a buyback fee) before you even log in, and after confirming you send the item to the given trade URL. The money isn\'t credited to your balance right away — only after the site owner manually confirms the item arrived, since Steam can hold incoming trades for several days, and there\'s no way to be sure before that.',
  'faq.q10': 'Where do I go if I run into a problem?',
  'faq.a10': 'Email lev2009177@gmail.com — this address is also listed in the site footer.',

  'sell.title': 'Sell your skins',
  'sell.intro':
    "We buy your skins for a competitive price. You'll see the exact payout for each item below before selling. The money is credited to your site balance once we receive and verify the item — usually within a few days because of Steam's trade hold.",
  'sell.minPrice': 'We accept items above {price}.',
  'sell.loginToSell': 'Log in with Steam to see your inventory',
  'sell.loadingInventory': 'Loading your Steam inventory...',
  'sell.inventoryError':
    "Couldn't load your Steam inventory. Either it isn't public, or Steam is temporarily rate-limiting requests — try again in a minute.",
  'sell.retry': 'Try again',
  'sell.emptyInventory': 'No items in your inventory are eligible for sale.',
  'sell.marketPrice': 'Market',
  'sell.notSellable': 'Price too low',
  'sell.sellFor': 'Sell for {price}',
  'sell.confirmTitle': 'Send the item to this link',
  'sell.confirmName': 'Item',
  'sell.confirmPayout': "You'll receive",
  'sell.confirmWarning':
    "Send {name} as a trade offer to the link above. Once you've sent it, click the button below. The money will be credited after we confirm the item arrived (may take a few days).",
  'sell.markSent': "I've sent the trade",
  'sell.markingSent': 'Marking...',
  'sell.myOffers': 'My sell requests',
  'sell.status.PENDING_TRANSFER': 'Waiting for you to send it',
  'sell.status.AWAITING_CONFIRMATION': 'Waiting for us to confirm receipt',
  'sell.status.COMPLETED': 'Paid',
  'sell.status.REJECTED': 'Rejected',
  'sell.error.generic': "Couldn't complete that action",
  'header.sell': 'Sell',
  'header.buy': 'Buy',
  'header.referral': 'Referral Program',
  'footer.privacy': 'Privacy Policy',

  'referral.title': 'Invite friends and earn',
  'referral.intro':
    "You earn {percent}% of the amount users you've invited made by selling us their skins. The money is credited to your balance right after their sale is confirmed.",
  'referral.rule': "Please don't use your referral link in paid ads — earnings from clear abuse may be reversed.",
  'referral.loginPrompt': 'Log in with Steam to get your referral link',
  'referral.yourLink': 'Your referral link',
  'referral.copy': 'Copy',
  'referral.copied': 'Copied',
  'referral.statEarned': 'Total earned',
  'referral.statEarnedHint': 'Start earning today',
  'referral.statPercent': 'Your percentage',
  'referral.statPercentHint': "From your referrals' sales",
  'referral.statInvited': 'Users invited',
  'referral.statInvitedHint': 'Share your link with friends',
  'referral.tableTitle': 'Invited users',
  'referral.colSteamId': 'User',
  'referral.colJoined': 'Joined',
  'referral.colEarned': 'Earned',
  'referral.empty': "You haven't invited anyone yet — share the link above.",

  'privacy.pageTitle': 'Privacy Policy',
  'privacy.intro':
    "Girgich Store is a personal CS2 skin store. Below is a plain, honest description of what data we collect and what we do with it. We're not a law firm, but we try to be as transparent as possible about what actually happens on this site.",
  'privacy.title1': 'What data we collect',
  'privacy.body1':
    "When you log in with Steam, we receive your SteamID, display name, and avatar — that's everything Steam provides on login. You also add your own Steam Trade URL in your profile. We keep a history of your purchases and sell requests (item, price, status) and your current site balance.",
  'privacy.title2': 'Why we use this data',
  'privacy.body2':
    "To recognize you when you log in, debit and credit your balance, send purchased skins to you specifically as a trade offer, and receive skins you sell into the right account. We don't use this data for anything else — no advertising, no behavioral analytics.",
  'privacy.title3': 'Payments',
  'privacy.body3':
    "Crypto deposits and payments are technically handled by a third-party payment service, NOWPayments — when you top up your balance, you enter payment details on their side, not ours. We only receive confirmation that a payment went through, along with the amount; your wallet or card details are never sent to or stored by us.",
  'privacy.title4': 'Who we share data with',
  'privacy.body4':
    "Steam — to log you in. NOWPayments — to process payments. Internal notifications about new orders (your name, a link to your Steam profile, the amount) are sent to the site owner via Telegram — this is a notification for the owner only, never published or shared further. We don't sell or share user data with any other third party, don't show ads, and don't use analytics trackers like Google Analytics.",
  'privacy.title5': 'Cookies and browser local storage',
  'privacy.body5':
    "We use cookies and localStorage only to remember that you're logged in (otherwise you'd have to log in again on every page) and to remember your chosen language and display currency. The site also shows an approximate online-visitor count, which uses a random anonymous identifier in localStorage that isn't linked to your account or identity in any way.",
  'privacy.title6': 'Data retention and deletion',
  'privacy.body6':
    "Account data is kept for as long as your profile exists on the site. If you'd like your data deleted, or want to know exactly what we hold about you, email us and we'll handle the request manually. Note that the items and trade offers themselves live in Steam, outside our control, and are governed by Steam's own rules.",
  'privacy.title7': 'Contact us',
  'privacy.body7': 'For any questions about personal data, email lev2009177@gmail.com — the same address listed in the site footer.',
};

const dictionaries: Record<Language, Dict> = { ru, en };

export function translate(language: Language, key: string, vars?: Record<string, string | number>): string {
  let str = dictionaries[language][key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      str = str.replace(`{${k}}`, String(v));
    }
  }
  return str;
}

export function useT() {
  const { language } = useLanguage();
  return (key: string, vars?: Record<string, string | number>) => translate(language, key, vars);
}
