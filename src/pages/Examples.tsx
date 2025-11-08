import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

interface Example {
  id: string;
  category: string;
  before: {
    sphere: string;
    product: string;
    audience: string;
    problems: string;
  };
  after: {
    preview: string;
    fullText: string;
  };
}

const examples: Example[] = [
  {
    id: "1",
    category: "Продажи • Остеопатия",
    before: {
      sphere: "Остеопатия, работа с опорно-двигательным аппаратом",
      product: "Консультация остеопата с диагностикой и лечением, 60 минут",
      audience: "Люди 30-50 лет с болями в спине, шее, головными болями",
      problems: "Хроническая боль, ограничение подвижности, зависимость от обезболивающих"
    },
    after: {
      preview: "ГЛАВНЫЙ ХУК: Болит спина? Вы точно уверены, что проблема именно в спине?\n\nЗнаете, что объединяет 90% людей с болью в пояснице? Они лечат НЕ ТО.\n\nВы массажируете спину — а проблема в стопах.\nПьёте таблетки — а причина в напряжении черепа.\nДелаете упражнения — а всё дело в старой травме копчика...",
      fullText: `ГЛАВНЫЙ ХУК: Болит спина? Вы точно уверены, что проблема именно в спине?

Знаете, что объединяет 90% людей с болью в пояснице? Они лечат НЕ ТО.

Вы массажируете спину — а проблема в стопах.
Пьёте таблетки — а причина в напряжении черепа.
Делаете упражнения — а всё дело в старой травме копчика.

Тело — это единая система. И остеопат видит то, что не видят другие врачи.

Я работаю с телом как с целостным механизмом. Не просто убираю боль — нахожу причину. Часто она совсем не там, где болит.

За 15 лет практики я помог сотням людей избавиться от хронической боли без таблеток и операций. Просто потому, что нашёл настоящую причину.

Если вы устали лечить симптомы и хотите решить проблему раз и навсегда — запишитесь на диагностику. Первая консультация — это всегда открытие.

Ссылка на запись в описании профиля. Боль — это сигнал. Давайте разберёмся, о чём он говорит.`
    }
  },
  {
    id: "2",
    category: "Виральность • Психология",
    before: {
      sphere: "Психология отношений, работа с созависимостью",
      product: "Онлайн-консультация психолога 90 минут",
      audience: "Женщины 25-45 лет в токсичных отношениях",
      problems: "Повторяющиеся токсичные отношения, низкая самооценка, страх одиночества"
    },
    after: {
      preview: "ГЛАВНЫЙ ХУК: Если вы всё время попадаете на одинаковых мужчин — проблема не в них\n\nЗнакомая ситуация?\n\nВы расстаётесь с очередным токсиком.\nКлянётесь, что больше никогда.\nВстречаете «нормального».\nИ через полгода понимаете — ОН ТАКОЙ ЖЕ...",
      fullText: `ГЛАВНЫЙ ХУК: Если вы всё время попадаете на одинаковых мужчин — проблема не в них

Знакомая ситуация?

Вы расстаётесь с очередным токсиком.
Клянётесь, что больше никогда.
Встречаете «нормального».
И через полгода понимаете — ОН ТАКОЙ ЖЕ.

Разные лица, но один и тот же сценарий. Почему?

Потому что вы неосознанно выбираете знакомую боль. Это не про невезение. Это про внутренние установки, которые формируются в детстве.

Ваше подсознание ищет то, что знакомо. Даже если это токсично.

Я 12 лет работаю с женщинами в созависимых отношениях. И знаю: разорвать этот цикл можно. Но сначала нужно увидеть свой паттерн.

На консультации мы разберём:
• Почему вы притягиваете именно таких мужчин
• Какие детские травмы влияют на выбор партнёра
• Как перестать повторять один и тот же сценарий

Если вы устали ходить по кругу — напишите мне в директ. Пора выйти из этого лабиринта.`
    }
  },
  {
    id: "3",
    category: "Длинные • Маркетинг",
    before: {
      sphere: "Таргетированная реклама для малого бизнеса",
      product: "Настройка и ведение рекламных кампаний в соцсетях",
      audience: "Владельцы малого бизнеса с оборотом до 5 млн/месяц",
      problems: "Низкая конверсия рекламы, слив бюджета, не понимают как настраивать"
    },
    after: {
      preview: "ЗАГОЛОВОК: Почему ваша реклама не работает (и как это исправить за неделю)\n\nВы тратите 100 тысяч в месяц на рекламу.\nПолучаете пару заявок.\nИ думаете: «Реклама не работает».\n\nА я вам скажу правду: реклама работает. Просто у вас неправильно всё настроено...",
      fullText: `ЗАГОЛОВОК: Почему ваша реклама не работает (и как это исправить за неделю)

ИДЕИ ДЛЯ ОБЛОЖКИ:
1. Разделённый экран: слева — красный крест и «100 000₽ слито», справа — зелёная галочка и «327 заявок»
2. График с падающей и растущей линиями на фоне интерфейса рекламного кабинета
3. Рука нажимает кнопку «Запустить рекламу» + надпись «Стоп! Сначала посмотри это»

---

СЦЕНАРИЙ:

Вы тратите 100 тысяч в месяц на рекламу.
Получаете пару заявок.
И думаете: «Реклама не работает».

А я вам скажу правду: реклама работает. Просто у вас неправильно всё настроено.

Привет! Я Алексей, 8 лет настраиваю таргет для малого бизнеса. И сегодня разберём главные ошибки, из-за которых сливается ваш бюджет.

[0:30] ОШИБКА №1: Вы не знаете свою аудиторию

Большинство запускают рекламу «на женщин 25-45». Это не аудитория. Это половина страны.

Нормальная настройка выглядит так:
• Женщины 28-38 лет
• Замужем, есть дети
• Интересуются здоровым питанием
• Живут в городах 500k+
• Подписаны на конкурентов

Чем точнее вы знаете клиента — тем дешевле заявка.

[2:00] ОШИБКА №2: Вы продаёте в лоб

Человек видит вашу рекламу первый раз. И вы сразу: «Купи! Закажи! Запишись!»

Так не работает.

Правильная воронка:
1. Прогреваете контентом
2. Даёте ценность бесплатно
3. Мягко ведёте к продаже

Например, не «Купите курс за 20 тысяч», а «Скачайте бесплатный чек-лист». А дальше уже продаёте.

[4:00] ОШИБКА №3: Вы не тестируете креативы

Один и тот же оффер с разными картинками может дать конверсию 0.5% и 3.5%. Разница в 7 раз!

Всегда тестируйте:
• Минимум 3 варианта изображений
• Минимум 2 варианта текста
• Разные форматы (карусель, видео, сторис)

[6:00] ОШИБКА №4: Вы не анализируете цифры

Большинство смотрят только на «потрачено» и «заявки».

А нужно смотреть:
• CTR (кликабельность)
• CPM (стоимость показов)
• CPC (стоимость клика)
• CR (конверсия в заявку)

Если CTR низкий — проблема в креативе.
Если CPC высокий — проблема в аудитории.
Если CR низкая — проблема на сайте.

[8:00] ОШИБКА №5: Вы не ретаргетитесь

90% людей не покупают с первого раза. Они посмотрели, ушли подумать — и забыли.

Ретаргетинг возвращает этих людей. Стоит копейки, конверсия — в разы выше.

[10:00] ЧТО ДЕЛАТЬ ДАЛЬШЕ

Если сейчас вы узнали себя хотя бы в одной ошибке — значит, есть куда расти.

Я помогаю малому бизнесу настроить рекламу так, чтобы она окупалась с первого месяца.

Что входит в мою работу:
• Полный аудит текущей рекламы
• Настройка аудиторий и кампаний
• Создание креативов
• Еженедельная аналитика и оптимизация

Не хотите больше сливать бюджет? Напишите мне в директ — разберём вашу ситуацию и составим план.

Ссылка в описании профиля. До связи!`
    }
  }
];

const Examples = () => {
  const [selectedExample, setSelectedExample] = useState<Example | null>(null);
  const header = useScrollAnimation();
  const examples1 = useScrollAnimation();
  const examples2 = useScrollAnimation();
  const examples3 = useScrollAnimation();

  const exampleRefs = [examples1, examples2, examples3];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24">
        <section className="container mx-auto px-6 sm:px-12 lg:px-16 py-24">
          <div ref={header.ref} className={`text-center mb-20 scroll-fade-in ${header.isVisible ? 'visible' : ''}`}>
            <h1 className="text-5xl md:text-7xl font-medium mb-8 text-foreground tracking-tight leading-none">
              Реальные примеры
            </h1>
            <p className="text-xl md:text-2xl text-foreground/70 max-w-3xl mx-auto leading-tight">
              Смотри, что вводили пользователи и что получили в результате
            </p>
          </div>

          <div className="space-y-16 max-w-6xl mx-auto">
            {examples.map((example, index) => {
              const ref = exampleRefs[index];
              return (
                <div
                  key={example.id}
                  ref={ref.ref}
                  className={`scroll-fade-in ${ref.isVisible ? 'visible' : ''}`}
                >
                  <Card className="sketch-border card-hover overflow-hidden">
                    <CardContent className="p-0">
                      <div className="grid md:grid-cols-2 gap-0">
                        {/* Before Section */}
                        <div className="p-8 md:p-12 bg-muted/30">
                          <div className="mb-6">
                            <span className="text-xs font-medium text-muted-foreground tracking-wider uppercase">
                              До • Что ввёл пользователь
                            </span>
                            <h3 className="text-xl font-medium mt-2 text-foreground">
                              {example.category}
                            </h3>
                          </div>
                          
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm font-medium text-foreground mb-1">Сфера:</p>
                              <p className="text-sm text-foreground/70">{example.before.sphere}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground mb-1">Продукт/услуга:</p>
                              <p className="text-sm text-foreground/70">{example.before.product}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground mb-1">ЦА:</p>
                              <p className="text-sm text-foreground/70">{example.before.audience}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground mb-1">Проблемы ЦА:</p>
                              <p className="text-sm text-foreground/70">{example.before.problems}</p>
                            </div>
                          </div>
                        </div>

                        {/* After Section */}
                        <div className="p-8 md:p-12 bg-background border-l-2 border-border">
                          <div className="mb-6">
                            <span className="text-xs font-medium text-muted-foreground tracking-wider uppercase">
                              После • Что получил в результате
                            </span>
                            <h3 className="text-xl font-medium mt-2 text-foreground">
                              Готовый сценарий
                            </h3>
                          </div>
                          
                          <div className="mb-6">
                            <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">
                              {example.after.preview}
                            </p>
                          </div>
                          
                          <Button 
                            onClick={() => setSelectedExample(example)}
                            className="w-full"
                          >
                            Прочитать полный текст
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-20">
            <Button 
              size="lg"
              onClick={() => window.location.href = '/'}
              className="text-lg px-8"
            >
              Создать свой сценарий
            </Button>
          </div>
        </section>
      </main>

      <Footer />

      {/* Full Text Dialog */}
      <Dialog open={!!selectedExample} onOpenChange={() => setSelectedExample(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-medium">
              {selectedExample?.category}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-6">
            <div className="bg-muted/50 p-6 rounded-none">
              <p className="whitespace-pre-wrap text-base leading-relaxed text-foreground">
                {selectedExample?.after.fullText}
              </p>
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={() => setSelectedExample(null)}>
                Закрыть
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Examples;
