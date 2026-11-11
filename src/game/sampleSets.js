// Fixed sample sets (brief, "Testing"): all three types, in Uzbek and Russian. Used by the tests and
// offered to teachers as a ready set to try the platform. 10 questions each: 7 Oddiy, 1 Direktor,
// 2 Sandiqcha (D11: the answer of a sandiqcha question is the object in the box).
//
// DRAFT TEXT: the owner approves the wording in both languages before release (fixlist F9).
// The Russian set says the same things in natural Russian; it is not a word-for-word translation.
// Facts checked 2026-11-11: hummingbirds fly backwards and feed on nectar; "algorithm" comes from
// al-Khwarizmi's name; Baikal is the deepest lake (about 1,640 m); Jupiter is the largest planet;
// each chess player starts with 8 pawns; Amir Temur was born in 1336; the giraffe is the tallest
// land animal and has a dark blue-black tongue; Navoi's "Khamsa" is five dastans.

export const SAMPLE_SETS = {
  uz: {
    id: "sample-uz",
    title: "Namuna to'plam",
    lang: "uz",
    questions: [
      { id: "s-uz-1", type: "oddiy", text: "Bu qush orqaga ucha oladi. U gullarning shirasi bilan oziqlanadi. Bu qanday qush?", answer: "Kolibri" },
      { id: "s-uz-2", type: "oddiy", text: "Qaysi matematik atama al-Xorazmiy nomidan kelib chiqqan?", answer: "Algoritm" },
      { id: "s-uz-3", type: "oddiy", text: "Yer yuzidagi eng chuqur ko'l qaysi?", answer: "Baykal ko'li" },
      { id: "s-uz-4", type: "oddiy", text: "Quyosh tizimidagi eng katta sayyora qaysi?", answer: "Yupiter" },
      { id: "s-uz-5", type: "oddiy", text: "Shaxmat partiyasi boshida har bir o'yinchida nechta piyoda bo'ladi?", answer: "8 ta" },
      { id: "s-uz-6", type: "oddiy", text: "Amir Temur qaysi yili tug'ilgan?", answer: "1336-yilda" },
      { id: "s-uz-7", type: "oddiy", text: "Bu hayvonning tili to'q ko'k rangda. U quruqlikdagi eng baland bo'yli hayvon. Bu qaysi hayvon?", answer: "Jirafa" },
      { id: "s-uz-8", type: "direktor", text: "Alisher Navoiyning beshta dostondan iborat asari qanday nomlanadi?", answer: "Xamsa" },
      { id: "s-uz-9", type: "sandiqcha", text: "Kal o'g'rilar bir uyga tushishdi. Ular hamma narsani olib ketishdi, faqat bitta buyumni qoldirishdi. O'sha buyum shu qutida.", answer: "Taroq" },
      { id: "s-uz-10", type: "sandiqcha", text: "Uning boshi bor, lekin miyasi yo'q. U faqat bir marta ishlaydi va yonib tugaydi. U shu qutida.", answer: "Gugurt cho'pi" },
    ],
  },
  ru: {
    id: "sample-ru",
    title: "Пример набора",
    lang: "ru",
    questions: [
      { id: "s-ru-1", type: "oddiy", text: "Эта птица умеет летать задом наперёд и питается нектаром цветов. Что это за птица?", answer: "Колибри" },
      { id: "s-ru-2", type: "oddiy", text: "Какой математический термин произошёл от имени учёного аль-Хорезми?", answer: "Алгоритм" },
      { id: "s-ru-3", type: "oddiy", text: "Какое озеро на Земле самое глубокое?", answer: "Байкал" },
      { id: "s-ru-4", type: "oddiy", text: "Какая планета Солнечной системы самая большая?", answer: "Юпитер" },
      { id: "s-ru-5", type: "oddiy", text: "Сколько пешек у каждого игрока в начале шахматной партии?", answer: "Восемь" },
      { id: "s-ru-6", type: "oddiy", text: "В каком году родился Амир Темур?", answer: "В 1336 году" },
      { id: "s-ru-7", type: "oddiy", text: "У этого животного тёмно-синий язык, и это самое высокое животное на суше. Кто это?", answer: "Жираф" },
      { id: "s-ru-8", type: "direktor", text: "Как называется собрание пяти поэм-дастанов Алишера Навои?", answer: "«Хамса»" },
      { id: "s-ru-9", type: "sandiqcha", text: "Лысые грабители вынесли из дома всё, кроме одной вещи. Эта вещь — в ящике.", answer: "Расчёска" },
      { id: "s-ru-10", type: "sandiqcha", text: "У неё есть головка, но нет мозгов. Она работает один раз и сгорает. Она — в ящике.", answer: "Спичка" },
    ],
  },
};
