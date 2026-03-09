/**
 * Character names and emoji pools for Adventure and Cute modes. 100 names each, PL + EN.
 */
(function () {
  'use strict';
  window.Spacerek = window.Spacerek || {};
  window.Spacerek.characterData = {
    adventure: {
      names: {
        pl: [
          'Grom z Piwnicy', 'Strażnik Kanapy', 'Rycerz Od Śniadania', 'Pogromca Domowego Smoka', 'Łowca Okazji',
          'Złoty Błysk', 'Miecz i Ser', 'Władca Pierogów', 'Bohater Drugiego Planu', 'Płomień z Kuchni',
          'Wicher Spod Łóżka', 'Korzeń Złego', 'Cień Własny', 'Skarb Babci', 'Ognik w Garach',
          'Klinga Stępiona', 'Szpon Koci', 'Wędrowiec Bez Mapy', 'Strażnik Przedpokoju', 'Grom w Proszku',
          'Rycerz Błędny', 'Pogromca Much', 'Łowca Zniżek', 'Władca Balkonu', 'Bohater od Sznurowadła',
          'Pogromca Komarów', 'Strażnik Lodówki', 'Rycerz Bez Skazy', 'Władca Dykty', 'Łowca Promocji',
          'Miecznik od Rana', 'Tarcza z Tektury', 'Ognisty Zapał', 'Zimny Duch', 'Krwawy Nos',
          'Szpon Niedźwiedzia', 'Kieł Zająca', 'Róg Jednorożca', 'Pazur Koguta', 'Skrzydło Wróbla',
          'Bohater z Case\'a', 'Pogromca Nudy', 'Strażnik Ciastek', 'Władca Parapetu', 'Łowca Grzybów',
          'Rycerz od Kurzaju', 'Moczyk Pod Chmurką', 'Grom Bez Pioruna', 'Wicher z Suszarki', 'Cień Słońca',
          'Korzeń Marchewki', 'Płomień Zapałki', 'Błysk w Oku', 'Skarb z Bazaru', 'Ognik Świętego',
          'Strażnik Progu', 'Wędrowiec po Mleko', 'Rycerz Kanapowy', 'Pogromca Tłuszczu', 'Łowca Okazyjek',
          'Władca Klatki', 'Bohater Bez Kapitana', 'Miecz Przecinak', 'Tarcza Od Much', 'Szpon na Kotlety',
          'Grom Nad Zupą', 'Wicher w Żołądku', 'Cień Pod Stołem', 'Płomień Czysty', 'Złoty Ząb',
          'Rycerz Odkurzacz', 'Strażnik Nocny', 'Pogromca Ciemności', 'Łowca Snów', 'Władca Poduszki',
          'Bohater Jednodniowy', 'Miecz Słowny', 'Klinga Papierowa', 'Ognik Zapałki', 'Korzeń Problemów',
          'Wędrowiec Bez Celu', 'Strażnik Spokoju', 'Grom z Jasnego Nieba', 'Wicher Zmian', 'Skarb Pod Łóżkiem',
          'Rycerz Śpiący', 'Pogromca Alarmu', 'Łowca Wi-Fi', 'Władca Pilota', 'Bohater od Wypłaty',
          'Miecz Dwuosobowy', 'Tarcza Cierpliwości', 'Szpon Czasu', 'Płomień Młodości', 'Cień Wątpliwości',
          'Strażnik Tajemnic', 'Wędrowiec Wieczny', 'Grom Spokojny', 'Złoty Środek', 'Ognik Nadziei',
          'Rycerz Bez Konika', 'Pogromca Rutyny', 'Łowca Wspomnień', 'Władca Czekolady', 'Bohater od Zadań',
          'Korzeń Dobra', 'Wicher Północny', 'Miecz Prawdy', 'Skarb Serduszka', 'Cień Uśmiechu',
          'Strażnik Miodu', 'Płomień Ducha', 'Grom Uwagi', 'Rycerz Świetlik', 'Pogromca Nocy',
          'Łowca Gwiazd', 'Władca Herbaty', 'Bohater Codzienny', 'Ognik Radości', 'Złoty Róg',
          'Wędrowiec Dusz', 'Korzeń Siły', 'Wicher Odwagi', 'Miecz Sprawiedliwości', 'Skarb Cierpliwości',
          'Cień Nadziei', 'Strażnik Marzeń', 'Płomień Serca', 'Grom Decyzji', 'Rycerz Cichy',
          'Pogromca Wątpliwości', 'Łowca Szczęścia', 'Władca Uśmiechu', 'Bohater Zwykły'
        ],
        en: [
          'Thunder from the Basement', 'Couch Guardian', 'Knight of Breakfast', 'Domestic Dragon Slayer', 'Bargain Hunter',
          'Golden Blaze', 'Sword and Cheese', 'Lord of Pierogi', 'Hero of the Back Row', 'Kitchen Flame',
          'Gale Under the Bed', 'Root of Evil', 'Own Shadow', 'Grandma\'s Treasure', 'Ember in the Pot',
          'Blunt Blade', 'Cat Claw', 'Wanderer Without a Map', 'Hallway Guardian', 'Thunder in a Can',
          'Knight Errant', 'Fly Slayer', 'Discount Hunter', 'Lord of the Balcony', 'Shoelace Hero',
          'Mosquito Slayer', 'Fridge Guardian', 'Knight Without Stain', 'Lord of Plywood', 'Sale Hunter',
          'Sword Bearer at Dawn', 'Cardboard Shield', 'Fiery Zeal', 'Cold Spirit', 'Bloody Nose',
          'Bear Claw', 'Hare Fang', 'Unicorn Horn', 'Rooster Spur', 'Sparrow Wing',
          'Hero from the Case', 'Boredom Slayer', 'Cookie Guardian', 'Lord of the Windowsill', 'Mushroom Hunter',
          'Knight of the Wart', 'Power Under the Clouds', 'Thunder Without Lightning', 'Hairdryer Gale', 'Sun Shadow',
          'Carrot Root', 'Match Flame', 'Twinkle in the Eye', 'Flea Market Treasure', 'Saint Elmo\'s Fire',
          'Threshold Guardian', 'Wanderer for Milk', 'Couch Knight', 'Grease Slayer', 'Bargain Hunter Jr',
          'Lord of the Cage', 'Hero Without a Captain', 'Cleaver Sword', 'Fly Shield', 'Cutlet Claw',
          'Thunder Over Soup', 'Gale in the Belly', 'Shadow Under the Table', 'Clean Flame', 'Golden Tooth',
          'Vacuum Knight', 'Night Guardian', 'Darkness Slayer', 'Dream Hunter', 'Lord of the Pillow',
          'One-Day Hero', 'Word Sword', 'Paper Blade', 'Match Ember', 'Root of Problems',
          'Wanderer Without a Goal', 'Peace Guardian', 'Bolt from the Blue', 'Wind of Change', 'Treasure Under the Bed',
          'Sleeping Knight', 'Alarm Slayer', 'Wi-Fi Hunter', 'Lord of the Remote', 'Paycheck Hero',
          'Two-Handed Sword', 'Patience Shield', 'Claw of Time', 'Flame of Youth', 'Shadow of Doubt',
          'Guardian of Secrets', 'Eternal Wanderer', 'Quiet Thunder', 'Golden Mean', 'Ember of Hope',
          'Knight Without a Steed', 'Routine Slayer', 'Memory Hunter', 'Lord of Chocolate', 'Chore Hero',
          'Root of Good', 'Northern Gale', 'Sword of Truth', 'Treasure of the Heart', 'Shadow of a Smile',
          'Honey Guardian', 'Flame of Spirit', 'Thunder of Attention', 'Firefly Knight', 'Night Slayer',
          'Star Hunter', 'Lord of Tea', 'Everyday Hero', 'Ember of Joy', 'Golden Horn',
          'Soul Wanderer', 'Root of Strength', 'Gale of Courage', 'Sword of Justice', 'Treasure of Patience',
          'Shadow of Hope', 'Dream Guardian', 'Flame of the Heart', 'Thunder of Decision', 'Silent Knight',
          'Doubt Slayer', 'Happiness Hunter', 'Lord of Smiles', 'Ordinary Hero'
        ]
      },
      emojis: ['🧙', '🧝‍♂️', '🧝', '⚔️', '🛡️', '🏹', '🗡️', '🐉', '🦅', '👑', '🦇', '🐺']
    },
    cute: {
      names: {
        pl: [
          'Puszystek', 'Bystrzak', 'Łasuch', 'Mruczek', 'Pimpuś', 'Kłębuszek', 'Pędziwiatr', 'Słodziak',
          'Gucio', 'Pikuś', 'Maksio', 'Tofik', 'Bąbelek', 'Ciapcio', 'Fafik', 'Kuleczka', 'Mruczuś',
          'Złotko', 'Śpioch', 'Łobuziak', 'Pieszczoch', 'Gryzek', 'Pompon', 'Brzdąc', 'Fikuś',
          'Kicia', 'Puszek', 'Miodzio', 'Karmel', 'Ciasteczko', 'Groszek', 'Słoneczko', 'Błysk',
          'Niteczka', 'Koralik', 'Pestka', 'Fistaszek', 'Wafel', 'Muffinek', 'Kapturek', 'Bobo',
          'Laluś', 'Kiciuś', 'Piesiuś', 'Śpioszek', 'Przytulas', 'Milusiu', 'Pączuś', 'Chrupuś',
          'Bystrzyk', 'Łasiczek', 'Pędzelek', 'Kłębik', 'Pomponik', 'Ciapcia', 'Fafcio', 'Guciuch',
          'Pikus', 'Maksik', 'Toficzek', 'Słodziaczek', 'Pieszczoszek', 'Gryzus', 'Brzdącek', 'Fikusia',
          'Kiciusia', 'Puszeczek', 'Miodziuś', 'Karmelek', 'Groszeczek', 'Niteczek', 'Koraliczek', 'Pesteczka',
          'Wafelek', 'Muffineczek', 'Bobek', 'Lalusiek', 'Kiciusiek', 'Piesiusiek', 'Przytulasek', 'Pączusiek',
          'Chrupusiek', 'Bystrzyczek', 'Pędzelusiek', 'Pomponusiek', 'Ciapciusiek', 'Fafciusiek', 'Guciusiek', 'Pikusiek',
          'Maksiusiek', 'Tofiusiek', 'Słodziusiek', 'Pieszczusiek', 'Gryzusiek', 'Brzdącusiek', 'Fikusiek', 'Kiciusiek',
          'Puszusiek', 'Miodusiek', 'Karmelusiek', 'Słodycz'
        ],
        en: [
          'Fluffy', 'Snickers', 'Noodle', 'Waffles', 'Muffin', 'Pickles', 'Bubbles', 'Peanut',
          'Nugget', 'Pudding', 'Cookie', 'Honey', 'Cinnamon', 'Marshmallow', 'Mochi', 'Tater Tot',
          'Biscuit', 'Puffball', 'Whiskers', 'Pumpkin', 'Butterscotch', 'Sprinkles', 'Cupcake', 'Truffle',
          'Bean', 'Mittens', 'Sweetie', 'Caramel', 'Gummy', 'Jellybean', 'Sunny', 'Spark',
          'Twinkle', 'Bead', 'Pea', 'Hood', 'Boo', 'Cuddles', 'Kitty', 'Puppy',
          'Goldie', 'Snoozy', 'Snuggles', 'Donut', 'Crunchy', 'Purr', 'Bright', 'Nibbles',
          'Brush', 'Fluff', 'Pom', 'Bubble', 'Spot', 'Fuzzy', 'Nug', 'Pud',
          'Cook', 'Cinna', 'Marsh', 'Tater', 'Puff', 'Whisk', 'Butter', 'Sprinkle',
          'Jelly', 'Cuddle', 'Kit', 'Pup', 'Gold', 'Snooze', 'Snuggle', 'Sweet',
          'Crunch', 'Nibble', 'Bub', 'Spotty', 'Fuzz', 'Nuggy', 'Puddy', 'Cinn',
          'Moch', 'Whisker', 'Beanie', 'Mitten', 'Caramello', 'Gummie', 'Sparkle', 'Twink',
          'Beadie', 'Muffie', 'Boo Boo', 'Cuddly', 'Kitten', 'Goldilocks', 'Snoozer', 'Snuggly',
          'Sweetheart', 'Cruncher', 'Purrball', 'Brighty'
        ]
      },
      emojis: ['🐰', '🐱', '🐻', '🦊', '🐶', '🐹', '🐿️', '🦄', '🐸', '🌸', '⭐', '🌈']
    }
  };
})();
