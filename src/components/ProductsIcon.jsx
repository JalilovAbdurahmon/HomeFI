import React from "react";
import {
  Beef,
  Droplet,
  Leaf,
  ShoppingBag,
  Milk,
  Apple,
  Coffee,
  Sparkles,
  Cookie,
  Flame,
  Zap,
} from "lucide-react";

const ProductIcon = ({ name, className }) => {
  const productName = name?.toLowerCase() || "";
  const meatKeys = [
    "go'sht",
    "gosht",
    "mol",
    "kuy",
    "tovuq",
    "dumba",
    "kazi",
    "farsh",
    "tushonka",
    "o'q",
    "dum",
    "мясо",
    "говядина",
    "баранина",
    "курица",
    "фарш",
    "тушенка",
    "кази",
    "куй",
    "мясной",
    "meat",
    "beef",
    "lamb",
    "chicken",
    "minced",
    "steak",
  ];
  const liquidKeys = [
    "suv",
    "cola",
    "sharbat",
    "yog'",
    "pista",
    "paxta",
    "olivka",
    "uksus",
    "kompot",
    "kompot olcha",
    "kompot behi",
    "kompot o'rik",
    "kompot orik",
    "kompot olxori",
    "kompot olxo'ri",
    "napitka",
    "limon",
    "вода",
    "сок",
    "масло",
    "уксус",
    "компот",
    "напитка",
    "подсолнечное",
    "оливковое",
    "Консервированная кукуруза",
    "water",
    "juice",
    "oil",
    "vinegar",
    "drink",
    "beverage",
  ];
  const vegKeys = [
    "kartoshka",
    "piyoz",
    "sabzi",
    "karam",
    "sholgom",
    "lavlagi",
    "baqlajon",
    "pomidor",
    "bodring",
    "chesnok",
    "ziravor",
    "tuz",
    "ko'kat",
    "goroh",
    "mosh",
    "noxot",
    "guruch",
    "makaron",
    "grechka",
    "картошка",
    "лук",
    "морковь",
    "капуста",
    "свекла",
    "чеснок",
    "специи",
    "соль",
    "зелень",
    "рис",
    "горох",
    "potato",
    "onion",
    "carrot",
    "vegetable",
    "garlic",
    "spice",
    "salt",
    "rice",
    "pasta",
  ];
  const fruitKeys = [
    "olma",
    "banan",
    "uzum",
    "meva",
    "anor",
    "shaftoli",
    "o'rik",
    "olcha",
    "limon",
    "qovun",
    "tarvuz",
    "gilos",
    "bexi",
    "olxo'ri",
    "mandarin",
    "apelsin",
    "яблоко",
    "банан",
    "виноград",
    "фрукты",
    "гранат",
    "персик",
    "абрикос",
    "вишня",
    "лимон",
    "дыня",
    "арбуз",
    "черешня",
    "айва",
    "слива",
    "мандарин",
    "апельсин",
    "apple",
    "banana",
    "grape",
    "fruit",
    "pomegranate",
    "peach",
    "apricot",
    "cherry",
    "lemon",
    "melon",
    "watermelon",
    "quince",
    "plum",
    "mandarin",
    "orange",
  ];
  const dailyKeys = [
    "sut",
    "qatiq",
    "non",
    "kolbasa",
    "sir",
    "pishloq",
    "sosiska",
    "tuxum",
    "saryog",
    "saryog'",
    "margarin",
    "qaymoq",
    "tvorog",
    "smetana",
    "mayonez",
    "skushonka",
    "молоко",
    "кефир",
    "хлеб",
    "колбаса",
    "сыр",
    "сосиска",
    "яйцо",
    "масло",
    "маргарин",
    "сметана",
    "сгущенка",
    "milk",
    "bread",
    "cheese",
    "egg",
    "butter",
    "yogurt",
  ];
  const householdKeys = [
    "shampun",
    "milo",
    "sovun",
    "pasta",
    "britva",
    "azelit",
    "cif",
    "poroshok",
    "gel",
    "utyunok",
    "posuda",
    "yuvish",
    "шампунь",
    "мыло",
    "паста",
    "бритва",
    "порошок",
    "гель",
    "утюг",
    "инвентарь",
    "чистящее",
    "shampoo",
    "soap",
    "toothpaste",
    "razor",
    "powder",
    "gel",
    "iron",
    "cleaning",
  ];
  const sweetKeys = [
    "asal",
    "shakar",
    "magiz",
    "bodom",
    "pista",
    "jem",
    "djem",
    "shirinlik",
    "olma",
    "banan",
    "uzum",
    "anor",
    "мед",
    "сахар",
    "изюм",
    "миндаль",
    "джем",
    "варенье",
    "яблоко",
    "банан",
    "фрукты",
    "honey",
    "sugar",
    "raisin",
    "almond",
    "jam",
    "sweet",
    "fruit",
    "apple",
  ];
  const energyKeys = [
    "gugurt",
    "sham",
    "batareya",
    "svet",
    "lampochka",
    "спички",
    "свеча",
    "батарейка",
    "свет",
    "лампочка",
    "match",
    "candle",
    "battery",
    "light",
  ];

  const getIconData = () => {
    if (meatKeys.some((key) => productName.includes(key)))
      return { icon: <Beef size={20} />, color: "bg-[#fef2f2] text-[#ef4444]" };

    if (liquidKeys.some((key) => productName.includes(key)))
      return {
        icon: <Droplet size={20} />,
        color: "bg-[#eff6ff] text-[#3b82f6]",
      };

    if (vegKeys.some((key) => productName.includes(key)))
      return {
        icon: <Leaf size={20} />,
        color: "bg-[#ecfdf5] text-[#10b981]",
      };

    if (fruitKeys.some((key) => productName.includes(key)))
      return {
        icon: <Apple size={20} />,
        color: "bg-[#fff1f2] text-[#f43f5e]",
      };

    if (dailyKeys.some((key) => productName.includes(key)))
      return {
        icon: <Milk size={20} />,
        color: "bg-[#eef2ff] text-[#6366f1]",
      };

    if (householdKeys.some((key) => productName.includes(key)))
      return {
        icon: <Sparkles size={20} />,
        color: "bg-[#ecfeff] text-[#06b6d4]",
      };

    if (sweetKeys.some((key) => productName.includes(key)))
      return {
        icon: <Cookie size={20} />,
        color: "bg-[#fdf2f8] text-[#ec4899]",
      };

    if (energyKeys.some((key) => productName.includes(key)))
      return {
        icon: <Flame size={20} />,
        color: "bg-[#fff7ed] text-[#f97316]",
      };

    if (
      productName.includes("choy") ||
      productName.includes("kofe") ||
      productName.includes("чай") ||
      productName.includes("coffee")
    )
      return {
        icon: <Coffee size={20} />,
        color: "bg-[#fffbeb] text-[#b45309]",
      };

    // Hech narsa topilmasa:
    return {
      icon: <ShoppingBag size={20} />,
      color: "bg-[#f8fafc] text-[#64748b]",
    };
  };

  const { icon, color } = getIconData();

  return (
    <div
      className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center transition-all duration-300 ${color} ${className}`}
    >
      {icon}
    </div>
  );
};

export default ProductIcon;
