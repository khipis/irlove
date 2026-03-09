/**
 * Scary / threatening two-part names for Adventure mode monsters. PL + EN. 100 each.
 */
(function () {
  'use strict';
  window.Spacerek = window.Spacerek || {};
  window.Spacerek.decorationNames = window.Spacerek.decorationNames || {};
  window.Spacerek.decorationNames.monsters = {
    pl: [
      'Czarna Ręka', 'Trupia Głowa', 'Kościany Szpon', 'Krwawa Paszcza', 'Mroczny Cień', 'Zimowy Trup',
      'Żelazna Szczęka', 'Cmentarny Straż', 'Nocny Łowca', 'Płomienna Zguba', 'Błotny Stwór', 'Stalowy Kłyk',
      'Czarny Język', 'Żebrak Śmierci', 'Lodowa Zmora', 'Pajęczy Jad', 'Górski Zew', 'Pustynny Szkielet',
      'Zgniły Oddech', 'Szepczący Cień', 'Krwiożerczy Pazur', 'Moczygęba', 'Złomowy Łeb', 'Gardłosz',
      'Mglarz', 'Kłaków', 'Łapiduch', 'Nocnik', 'Zębacz', 'Paskudnik', 'Zgnilec', 'Widmo Nocy',
      'Szpon Zimy', 'Oko Pustki', 'Róg Zagłady', 'Skóra z Głębin', 'Kieł Ciemności', 'Pięść Grobu',
      'Stopy Zgnilizny', 'Serce z Lodu', 'Krew Bagna', 'Kości Przeklętych', 'Łapa Mroku', 'Ogon Jadu',
      'Grzywa Burzy', 'Skrzydło Upadku', 'Brzuch Głodu', 'Plecy z Kamienia', 'Głowa Węża', 'Oko Sępa',
      'Pazur Smoka', 'Ząb Wilka', 'Ręka Trupa', 'Noga Cienia', 'Ucho Nocy', 'Nos Krwi',
      'Język Ognia', 'Gardło Pustki', 'Żebro Złomu', 'Krk Kostuchy', 'Bark Stracha', 'Kolano Szpona',
      'Łokieć Żelaza', 'Palec Śmierci', 'Pięta Zmory', 'Skroń Mocy', 'Czoło Gromu', 'Szyja Zimna',
      'Biodro Ciemności', 'Usta Błota', 'Włosy Popiołu', 'Paznokieć Jadu', 'Kość Przeznaczenia',
      'Żyła Trucizny', 'Mózg Nocy', 'Płuco Zgniłe', 'Wątroba Głazu', 'Śledziona Cienia', 'Nerka Lodu',
      'Serce Złomu', 'Żołądek Głodu', 'Kiszka Błota', 'Skóra Łuski', 'Mięsień Stali', 'Krew Cienia',
      'Łza Demona', 'Ślina Węża', 'Pot Trupa', 'Oddech Smoka', 'Głos Pustki', 'Śmiech Zmory',
      'Płacz Nocy', 'Jęk Grobu', 'Szmer Bagna', 'Szum Wichru', 'Grzechot Kości', 'Zgrzyt Zębów',
      'Chrzęst Łuski', 'Tętno Ciemności', 'Bicie Serca Lodu', 'Tchnienie Zguby', 'Cień Przekleństwa',
      'Blask Zagłady', 'Błysk Szpona', 'Odblask Krwi', 'Mgła Cmentarna', 'Opary Bagna', 'Dym Ognia',
      'Para Lodu', 'Zapach Zgnilizny', 'Woń Trupa', 'Aura Strachu', 'Pole Grozy', 'Krąg Śmierci'
    ],
    en: [
      'Shadow Maw', 'Bone Crusher', 'Dark Whisper', 'Blood Thorn', 'Night Stalker', 'Soul Reaper',
      'Doom Fang', 'Gore Horn', 'Death Grip', 'Frost Bite', 'Venom Tooth', 'Skull Crusher',
      'Dread Wing', 'Black Fang', 'Rot Gut', 'Gore Tooth', 'Ash Spawn', 'Bone Grinder',
      'Dark Shade', 'Flesh Ripper', 'Grave Walker', 'Iron Jaw', 'Plague Bearer', 'Soul Thirst',
      'Night Hunter', 'Flame Ruin', 'Mud Creature', 'Steel Jaw', 'Cemetery Guard', 'Spider Venom',
      'Mountain Call', 'Desert Skeleton', 'Rotten Breath', 'Whispering Shade', 'Blood Claw', 'Iron Scrap',
      'Throat Slasher', 'Mist Walker', 'Fang Bite', 'Grave Digger', 'Night Lurker', 'Foul Mouth',
      'Rot Belly', 'Ghost of Night', 'Winter Claw', 'Void Eye', 'Doom Horn', 'Deep Skin',
      'Darkness Fang', 'Grave Fist', 'Rot Feet', 'Ice Heart', 'Swamp Blood', 'Cursed Bones',
      'Shadow Paw', 'Venom Tail', 'Storm Mane', 'Fall Wing', 'Hunger Belly', 'Stone Back',
      'Serpent Head', 'Vulture Eye', 'Dragon Claw', 'Wolf Tooth', 'Corpse Hand', 'Shadow Leg',
      'Night Ear', 'Blood Nose', 'Fire Tongue', 'Void Throat', 'Scrap Rib', 'Reaper Neck',
      'Fear Shoulder', 'Claw Knee', 'Iron Elbow', 'Death Finger', 'Nightmare Heel', 'Power Temple',
      'Thunder Brow', 'Cold Neck', 'Darkness Hip', 'Mud Mouth', 'Ash Hair', 'Venom Nail',
      'Destiny Bone', 'Poison Vein', 'Night Brain', 'Rotten Lung', 'Stone Liver', 'Shadow Spleen',
      'Ice Kidney', 'Scrap Heart', 'Hunger Stomach', 'Swamp Gut', 'Scale Skin', 'Steel Muscle',
      'Shadow Blood', 'Demon Tear', 'Serpent Spit', 'Corpse Sweat', 'Dragon Breath', 'Void Voice',
      'Nightmare Laugh', 'Night Cry', 'Grave Moan', 'Swamp Murmur', 'Storm Roar', 'Bone Rattle',
      'Tooth Grind', 'Scale Rustle', 'Darkness Pulse', 'Ice Heartbeat', 'Ruin Breath', 'Curse Shadow',
      'Ruin Glow', 'Claw Flash', 'Blood Sheen', 'Graveyard Mist', 'Swamp Fumes', 'Fire Smoke',
      'Ice Steam', 'Rot Stench', 'Corpse Scent', 'Fear Aura', 'Terror Field', 'Death Circle'
    ]
  };
})();
