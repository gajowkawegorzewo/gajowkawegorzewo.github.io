#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');

const alts = {
  'zdjecie_001.jpg': 'Gajówka i Apartamenty Leśniewo — agroturystyka na Mazurach, leśniczówka z 1880 roku',
  'zdjecie_002.jpg': 'Taras Gajówki — zabytkowa leśniczówka w lesie koło Węgorzewa na Mazurach',
  'zdjecie_003.jpg': 'Gajówka Leśniewo — elewacja leśniczówki z oryginalnymi napisami, Mazury',
  'zdjecie_004.jpg': 'Gajówka dla 12 osób — zabytkowa leśniczówka z cegły, noclegi na Mazurach koło Mamerek',
  'zdjecie_005.jpg': 'Wnętrze Gajówki — salon z kominkiem i drewnianymi schodami, agroturystyka Węgorzewo',
  'zdjecie_006.jpg': 'Pokój w Gajówce — drewniane belki, ciepły klimat, nocleg w lesie na Mazurach',
  'zdjecie_007.jpg': 'Sypialnia Gajówka Leśniewo — komfortowy nocleg dla grup na Mazurach',
  'zdjecie_008.jpg': 'Łazienka Gajówka — pełne wyposażenie, agroturystyka Węgorzewo Mazury',
  'zdjecie_009.jpg': 'Kuchnia Gajówka — pełne wyposażenie, nocleg dla rodzin i grup, Mazury',
  'zdjecie_010.jpg': 'Gajówka z zewnątrz — leśniczówka w lesie, domek dla 12 osób blisko Mamerek',
  'zdjecie_011.jpg': 'Wilcza Polana — apartament boho z trójkątnymi oknami dachowymi, Leśniewo Mazury',
  'zdjecie_012.jpg': 'Wilcza Polana — jasne wnętrze z drewnianym sufitem, apartament Mazury Węgorzewo',
  'zdjecie_013.jpg': 'Sypialnia Wilcza Polana — otwarty antresol, komfortowy nocleg dla 6 osób',
  'zdjecie_014.jpg': 'Łazienka Wilcza Polana — nowoczesny design, apartament Mazury koło Sztynortu',
  'zdjecie_015.jpg': 'Taras Wilcza Polana — huśtawka, prywatny wjazd, apartament w lesie na Mazurach',
  'zdjecie_016.jpg': 'Salon Wilcza Polana — ciepłe drewno, Netflix, apartament dla par i rodzin',
  'zdjecie_017.jpg': 'Widok z tarasu Wilcza Polana — otaczający las, cisza, Leśniewo k. Węgorzewa',
  'zdjecie_018.jpg': 'Sen Gajowego — rustykalny apartament slow life, kominek elektryczny, Mazury',
  'zdjecie_019.jpg': 'Wnętrze Sen Gajowego — drewniane belki, taras z huśtawką na linie',
  'zdjecie_020.jpg': 'Sypialnia Sen Gajowego — otwarte poddasze, komfortowy nocleg dla par, Mazury',
  'zdjecie_021.jpg': 'Kuchnia Sen Gajowego — pełne wyposażenie, apartament w lesie Leśniewo',
  'zdjecie_022.jpg': 'Łazienka Sen Gajowego — apartament agroturystyczny Węgorzewo Mazury',
  'zdjecie_023.jpg': 'Taras Sen Gajowego — prywatny, z huśtawką, las dookoła, Mazury',
  'zdjecie_024.jpg': 'Sen Gajowego widok — apartament noclegowy 2 km od Mamerek na Mazurach',
  'zdjecie_025.jpg': 'Basen sezonowy Gajówka — 4,3×2,5 m, kąpiel w lesie, agroturystyka Mazury',
  'zdjecie_026.jpg': 'Leon — kot Gajówki, agroturystyka pet-friendly Leśniewo Mazury',
  'zdjecie_027.jpg': 'Balia z kinem Gajówka — opalana drewnem, wieczór filmowy pod gwiazdami, Mazury',
  'zdjecie_028.jpg': 'Ogród Gajówki — ognisko, trawnik, nocleg w lesie Leśniewo k. Węgorzewa',
  'zdjecie_029.jpg': 'Gajówka zimą — leśniczówka z 1880 w śniegu, sauna i balia całoroczne',
  'zdjecie_030.jpg': 'Balia Gajówka — gorąca balia opalana drewnem z ekranem projekcyjnym, Mazury',
  'zdjecie_031.jpg': 'Sauna beczkowa Gajówka — fińska sauna w lesie, 150 zł sesja, Mazury',
  'zdjecie_032.jpg': 'Chałka Gajówki — wypiekana ręcznie, zamów przy rezerwacji, Leśniewo Mazury',
  'zdjecie_033.jpg': 'Wilcza Polana sypialnia — detale wnętrza boho, apartament Mazury',
  'zdjecie_034.jpg': 'Wilcza Polana — widok z tarasu na las, apartament Mazury Węgorzewo',
  'zdjecie_035.jpg': 'Kuchnia Wilcza Polana — wyposażona, apartament w lesie na Mazurach',
  'zdjecie_036.jpg': 'Wilcza Polana balkon — huśtawka ogrodowa, apartament Leśniewo',
  'zdjecie_037.jpg': 'Wilcza Polana okna — duże trójkątne okna dachowe, naturalne światło',
  'zdjecie_038.jpg': 'Wilcza Polana nocleg — apartament dla 6 osób, 2 km od Mamerek Mazury',
  'zdjecie_039.jpg': 'Wilcza Polana detal — boho wystrój, drewno i zieleń, Mazury',
  'zdjecie_040.jpg': 'Wilcza Polana strefa dzienna — Netflix, komfort, apartament Węgorzewo',
  'zdjecie_041.jpg': 'Wilcza Polana w lesie — prywatne otoczenie, nocleg Leśniewo Mazury',
  'zdjecie_042.jpg': 'Wilcza Polana łazienka — nowoczesna, apartament blisko Sztynortu',
  'zdjecie_043.jpg': 'Wilcza Polana aneks — wyposażona kuchnia, apartament Mazury',
  'zdjecie_044.jpg': 'Sen Gajowego — wnętrze z łapaczem snów, slow life na Mazurach',
  'zdjecie_045.jpg': 'Sen Gajowego kominek — elektryczny, rustykalny klimat, Leśniewo',
  'zdjecie_046.jpg': 'Sen Gajowego pokój — drewniane belki, ciepłe kolory, nocleg Mazury',
  'zdjecie_047.jpg': 'Sen Gajowego kuchnia — pełne wyposażenie, apartament agroturystyczny',
  'zdjecie_048.jpg': 'Sen Gajowego taras — huśtawka na linie, prywatny, las dookoła',
  'zdjecie_049.jpg': 'Sen Gajowego nocleg — apartament 2 km od Mamerek, Węgorzewo Mazury',
  'zdjecie_050.jpg': 'Sen Gajowego widok — las Mazury, apartament dla par i rodzin',
  'zdjecie_051.jpg': 'Balia z kinem Gajówka nocą — kino pod gwiazdami, wieczór w lesie',
  'zdjecie_052.jpg': 'Sauna beczkowa Gajówka — relaks po całym dniu, las dookoła Mazury',
  'zdjecie_053.png': 'Chleb z karmelizowaną cebulką Gajówki — ręcznie wyrabiany, zamów przy rezerwacji',
  'zdjecie_054.jpg': 'Pierogi ruskie Gajówka — lepione ręcznie, domowe smaki, Leśniewo Mazury',
  'zdjecie_055.png': 'Jajka od Pani Pierogowej — świeże z zagrody, Gajówka Leśniewo',
  'lesne_01.jpg': 'Leśne pogaduchy — apartament noclegowy Leśniewo, noclegi na Mazurach',
  'lesne_02.jpg': 'Leśne pogaduchy wnętrze — otwarte poddasze, kominek, apartament Mazury',
  'lesne_03.jpg': 'Leśne pogaduchy sypialnia — antresol, komfortowy nocleg Węgorzewo',
  'lesne_04.jpg': 'Leśne pogaduchy kuchnia — pełne wyposażenie, apartament w lesie',
  'lesne_05.jpg': 'Leśne pogaduchy łazienka — apartament blisko Mamerek, Mazury',
  'lesne_06.jpg': 'Leśne pogaduchy salon — ciepły klimat, Netflix, Leśniewo',
  'lesne_07.jpg': 'Leśne pogaduchy widok — las dookoła, apartament agroturystyczny Mazury',
  'lesne_08.jpg': 'Leśne pogaduchy nocleg — dla rodzin i par, 2 km od Mamerek',
  'lesne_09.jpg': 'Leśne pogaduchy taras — cisza lasu, apartament Leśniewo k. Węgorzewa',
  'lesne_10.jpg': 'Leśne pogaduchy aneks — wyposażona kuchnia, nocleg Mazury',
  'lesne_11.jpg': 'Leśne pogaduchy detal — komfortowy apartament w lesie na Mazurach',
  'lesne_12.jpg': 'Leśne pogaduchy — widok z okna, mazurski las, Leśniewo 13',
  'lesne_13.jpg': 'Leśne pogaduchy apartament — 6+2 osoby, cały rok, Mazury Węgorzewo',
};

const filepath = process.argv[2];
let html = fs.readFileSync(filepath, 'utf8');
let changed = 0;

html = html.replace(/<img([^>]*)alt=""([^>]*)>/g, (tag, pre, post) => {
  const srcM = tag.match(/src="[^"]*\/([^"/]+)"/);
  if (!srcM) return tag;
  const fname = srcM[1];
  if (alts[fname]) {
    changed++;
    return tag.replace('alt=""', `alt="${alts[fname]}"`);
  }
  return tag;
});

fs.writeFileSync(filepath, html, 'utf8');
const remaining = (html.match(/alt=""/g)||[]).length;
console.log(`OK changed=${changed} remaining_empty=${remaining}`);
