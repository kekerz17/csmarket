import { useLanguage, type Language } from './context/LanguageContext';

type Dict = Record<string, string>;

const ru: Dict = {
  'header.login': 'Войти через Steam',
  'header.profile': 'Профиль',
  'header.logout': 'Выйти из аккаунта',
  'header.admin': 'Админ',
  'footer.tagline': 'Girgich Store — предметы из личного инвентаря Steam',
  'footer.holdNote': 'Выдача автоматическая, трейд-холд зависит от настроек вашего аккаунта Steam',

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
    'Нет — это витрина личного инвентаря продавца, предметы для продажи выбирает только он сам. Функции продажи скинов других пользователей на сайте нет.',
  'faq.q10': 'Куда обращаться, если возникла проблема?',
  'faq.a10': 'Напишите на lev2009177@gmail.com — этот адрес также указан в подвале сайта.',
};

const en: Dict = {
  'header.login': 'Log in with Steam',
  'header.profile': 'Profile',
  'header.logout': 'Log out',
  'header.admin': 'Admin',
  'footer.tagline': 'Girgich Store — items from a personal Steam inventory',
  'footer.holdNote': "Delivery is automatic; trade hold depends on your Steam account's settings",

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
    "No — this is a storefront for the seller's personal inventory; only they choose which items are for sale. There's no feature for other users to sell skins on the site.",
  'faq.q10': 'Where do I go if I run into a problem?',
  'faq.a10': 'Email lev2009177@gmail.com — this address is also listed in the site footer.',
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
